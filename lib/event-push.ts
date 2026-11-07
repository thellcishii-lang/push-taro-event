// lib/event-push.ts
// Push-taro EVENT のプッシュ配信と課金集計（events/{eventId}/campaigns）。
//
// - 配信は FCM トピック `event_{eventId}_users` 宛ての一斉送信。
//   登録時に来場者をトピック購読させているため、宛先のファンアウトは FCM 側が行う。
// - 課金の根拠は「送信時点の購読者数」。送信のたびに購読者数を数えて
//   campaign の sentCount に記録する（最終レポートの campaignSends が読む形式）。
// - 即時配信も予約配信も campaign レコードを介す。予約は15分刻みで、
//   15分スケジューラ（event-tick）が到期分を実行する。リセット処理とは分離し、
//   tick 内でも独立したステップとして実行する（干渉しない原則）。
import { FieldValue } from 'firebase-admin/firestore';
import { db, messaging } from './firebase-admin';
import {
  EVENT_SUBCOLLECTIONS,
  jstDateString,
  jstTimeString,
} from './event';

export const EVENT_CAMPAIGNS_COLLECTION = 'campaigns';

export type CampaignKind = 'instant' | 'scheduled';
export type CampaignStatus =
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled';

export interface EventCampaign {
  id: string;
  title: string;
  body: string;
  kind: CampaignKind;
  status: CampaignStatus;
  /** 予約時刻（JST 'YYYY-MM-DDTHH:MM'、15分刻み）。即時配信は作成時刻 */
  scheduledAt: string | null;
  sentAt: string | null;
  /** 送信時点の購読者数（課金の根拠） */
  sentCount: number | null;
  error: string | null;
  /** 送信処理を開始した時刻（滞留検知用。未送信なら null） */
  sendingStartedAt: string | null;
  createdAt: string;
}

const SCHEDULE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** JST の日時文字列 'YYYY-MM-DDTHH:MM'（分まで）。文字列比較で前後関係が一致する。 */
export function jstDateTimeString(date: Date): string {
  return `${jstDateString(date)}T${jstTimeString(date)}`;
}

/** 予約時刻が15分刻み（00/15/30/45分）かどうか。 */
export function isFifteenMinuteSlot(value: string): boolean {
  if (!SCHEDULE_PATTERN.test(value)) return false;
  const hour = Number(value.slice(11, 13));
  const minute = Number(value.slice(14, 16));
  if (hour > 23 || minute > 59) return false;
  return minute % 15 === 0;
}

/** 予約が到期しているか（純粋関数）。 */
export function isCampaignDue(
  campaign: Pick<EventCampaign, 'status' | 'scheduledAt'>,
  nowJstDateTime: string,
): boolean {
  return (
    campaign.status === 'scheduled' &&
    campaign.scheduledAt !== null &&
    campaign.scheduledAt <= nowJstDateTime
  );
}

function campaignsRef(eventId: string) {
  return db
    .collection('events')
    .doc(eventId)
    .collection(EVENT_CAMPAIGNS_COLLECTION);
}

function toCampaign(doc: FirebaseFirestore.DocumentSnapshot): EventCampaign {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    title: String(d.title ?? ''),
    body: String(d.body ?? ''),
    kind: d.kind === 'scheduled' ? 'scheduled' : 'instant',
    status: (d.status as CampaignStatus) ?? 'scheduled',
    scheduledAt: (d.scheduledAt as string | null) ?? null,
    sentAt: d.sentAt?.toDate?.().toISOString() ?? (d.sentAt as string | null) ?? null,
    sentCount: typeof d.sentCount === 'number' ? d.sentCount : null,
    error: (d.error as string | null) ?? null,
    sendingStartedAt: d.sendingStartedAt?.toDate?.().toISOString() ?? null,
    createdAt: d.createdAt?.toDate?.().toISOString() ?? '',
  };
}

export async function createCampaignRecord(
  eventId: string,
  input: {
    title: string;
    body: string;
    kind: CampaignKind;
    scheduledAt: string;
  },
): Promise<EventCampaign> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title) throw new Error('タイトルが必要です');
  if (!body) throw new Error('本文が必要です');
  const ref = campaignsRef(eventId).doc();
  await ref.set({
    title,
    body,
    kind: input.kind,
    status: 'scheduled',
    scheduledAt: input.scheduledAt,
    sentAt: null,
    sentCount: null,
    error: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  const created = await ref.get();
  return toCampaign(created);
}

export async function getCampaign(
  eventId: string,
  campaignId: string,
): Promise<EventCampaign | null> {
  const doc = await campaignsRef(eventId).doc(campaignId).get();
  return doc.exists ? toCampaign(doc) : null;
}

export async function listCampaigns(eventId: string): Promise<EventCampaign[]> {
  const snap = await campaignsRef(eventId).get();
  return snap.docs
    .map((doc) => toCampaign(doc))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function cancelCampaign(
  eventId: string,
  campaignId: string,
): Promise<EventCampaign> {
  const campaign = await getCampaign(eventId, campaignId);
  if (!campaign) throw new Error('配信が見つかりません');
  if (campaign.status !== 'scheduled') {
    throw new Error('予約済みの配信だけを取り消せます');
  }
  await campaignsRef(eventId).doc(campaignId).update({ status: 'cancelled' });
  return { ...campaign, status: 'cancelled' };
}

async function countSubscribers(eventId: string): Promise<number> {
  const snap = await db
    .collection('events')
    .doc(eventId)
    .collection(EVENT_SUBCOLLECTIONS.subscribers)
    .count()
    .get();
  return snap.data().count;
}

export type ExecuteCampaignResult =
  | { sent: true; sentCount: number }
  | { sent: false; reason: string };

/**
 * campaign を1件実行する。二重送信防止のため、送信開始はトランザクションで
 * 'scheduled' → 'sending' を確保してから行う。失敗しても例外は投げず、
 * campaign に status='failed' と理由を残す（tick の他処理を止めない）。
 */
export async function executeCampaign(
  eventId: string,
  campaignId: string,
): Promise<ExecuteCampaignResult> {
  const ref = campaignsRef(eventId).doc(campaignId);

  const claimed = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return false;
    if (snap.data()?.status !== 'scheduled') return false;
    tx.update(ref, { status: 'sending', sendingStartedAt: FieldValue.serverTimestamp() });
    return true;
  });
  if (!claimed) return { sent: false, reason: 'not-scheduled' };

  const campaign = await getCampaign(eventId, campaignId);
  if (!campaign) return { sent: false, reason: 'not-found' };

  try {
    const sentCount = await countSubscribers(eventId);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const targetUrl = new URL(`/e/${eventId}`, baseUrl).toString();
    const iconUrl = new URL('/icon-192x192.png', baseUrl).toString();

    await messaging.send({
      topic: `event_${eventId}_users`,
      data: {
        title: campaign.title,
        body: campaign.body,
        icon: iconUrl,
        url: targetUrl,
        eventId,
      },
      apns: {
        payload: {
          aps: {
            alert: { title: campaign.title, body: campaign.body },
            sound: 'default',
            badge: 1,
            'content-available': 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          title: campaign.title,
          body: campaign.body,
          icon: iconUrl,
          sound: 'default',
        },
      },
      webpush: {
        headers: { Urgency: 'high' },
        fcmOptions: { link: targetUrl },
      },
    });

    await ref.update({
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      sentCount,
      error: null,
    });
    return { sent: true, sentCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await ref.update({ status: 'failed', error: message }).catch(() => {});
    return { sent: false, reason: message };
  }
}

/**
 * 到期した予約配信を実行する（event-tick から呼ぶ）。
 * 1イベントあたり上限件数まで。1件の失敗が残りを止めない。
 */
export async function processDueCampaigns(
  eventId: string,
  now: Date,
  limit = 10,
): Promise<number> {
  const nowJst = jstDateTimeString(now);
  const snap = await campaignsRef(eventId).where('status', '==', 'scheduled').get();
  const due = snap.docs
    .map((doc) => toCampaign(doc))
    .filter((campaign) => isCampaignDue(campaign, nowJst))
    .sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''))
    .slice(0, limit);

  let sent = 0;
  for (const campaign of due) {
    try {
      const result = await executeCampaign(eventId, campaign.id);
      if (result.sent) sent += 1;
    } catch {
      // executeCampaign は例外を投げない設計だが、念のため1件で止めない
    }
  }
  return sent;
}
