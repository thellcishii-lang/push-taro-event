// lib/event-push.ts
// Push-taro EVENT のプッシュ配信と課金集計（events/{eventId}/campaigns）。
//
// - 配信は購読者の言語別 FCM トピック `event_{eventId}_users_{locale}` 宛て。
//   登録時に来場者を自分の言語のトピックへ購読させ、送信時は言語ごとに
//   その言語の文面（作成時に自動翻訳した titleI18n / bodyI18n）を送る。
//   宛先のファンアウトは FCM 側が行う。
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
  localeTopic,
} from './event';
import { getEvent } from './event-store';
import {
  parseLocalizedTexts,
  pickLocalizedText,
  SUPPORTED_LOCALES,
  type Locale,
} from './i18n';
import { translateText } from './translate';

export const EVENT_CAMPAIGNS_COLLECTION = 'campaigns';

export type CampaignKind = 'instant' | 'scheduled';
export type CampaignStatus =
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled';

/** 配信に添付できる宣伝ファイルの種別。 */
export type CampaignAttachmentType = 'pdf' | 'image';

/**
 * 配信の添付ファイル（宣伝内容の PDF / 画像）。
 * ファイル本体は Firebase Storage に置き、システムが生成したダウンロード URL を
 * リンク先として campaign に保持する（外部 URL の入力は受けない）。
 * 来場者はお知らせ一覧でこの URL を開く。
 */
export interface CampaignAttachment {
  /** 生成されたリンク先 URL（Storage のダウンロード URL） */
  url: string;
  type: CampaignAttachmentType;
  /** Storage パス（events/{eventId}/campaign-files/{fileName}） */
  storagePath: string;
}

/** 添付ファイルの置き場（Storage 上のディレクトリ名）。 */
export const CAMPAIGN_FILES_DIR = 'campaign-files';

/** 添付ファイルの容量上限（案内PDFと同じ 10MB）。 */
export const MAX_CAMPAIGN_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

/**
 * 添付情報の検証（純粋関数）。
 * 未指定（null / undefined）は「添付なし」として受け付ける。
 * Storage パスは自イベントの campaign-files 配下だけを許可し、
 * 種別と拡張子の対応もここで担保する（他人のファイルや任意パスへの
 * リンク化を防ぐ）。
 */
export function parseCampaignAttachment(
  eventId: string,
  raw: unknown,
): { ok: true; attachment: CampaignAttachment | null } | { ok: false; error: string } {
  if (raw === null || raw === undefined) return { ok: true, attachment: null };
  if (typeof raw !== 'object') {
    return { ok: false, error: '添付ファイルの形式が不正です' };
  }
  const record = raw as Record<string, unknown>;
  const url = record.url;
  const type = record.type;
  const storagePath = record.storagePath;
  if (typeof url !== 'string' || !url.startsWith('https://')) {
    return { ok: false, error: '添付ファイルのURLが不正です' };
  }
  if (type !== 'pdf' && type !== 'image') {
    return { ok: false, error: '添付ファイルの種別が不正です' };
  }
  const prefix = `events/${eventId}/${CAMPAIGN_FILES_DIR}/`;
  if (typeof storagePath !== 'string' || !storagePath.startsWith(prefix)) {
    return { ok: false, error: '添付ファイルの保存先が不正です' };
  }
  const fileName = storagePath.slice(prefix.length);
  if (!fileName || fileName.includes('/') || fileName.includes('..')) {
    return { ok: false, error: '添付ファイルの保存先が不正です' };
  }
  const lowerName = fileName.toLowerCase();
  if (type === 'pdf' && !lowerName.endsWith('.pdf')) {
    return { ok: false, error: '添付ファイルの種別と拡張子が一致しません' };
  }
  if (type === 'image' && !IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
    return { ok: false, error: '添付ファイルの種別と拡張子が一致しません' };
  }
  return { ok: true, attachment: { url, type, storagePath } };
}

/**
 * Firestore から読んだ添付情報を解釈する（防御的読み取り）。
 * 検証を通らない値は「添付なし」に倒す（移行前の campaign でも壊れない）。
 */
export function readCampaignAttachment(
  eventId: string,
  raw: unknown,
): CampaignAttachment | null {
  const parsed = parseCampaignAttachment(eventId, raw);
  return parsed.ok ? parsed.attachment : null;
}

export interface EventCampaign {
  id: string;
  title: string;
  body: string;
  /** タイトルの言語別マップ（作成時に自動翻訳。原文の言語には原文が入る） */
  titleI18n: Partial<Record<Locale, string>>;
  /** 本文の言語別マップ（同上） */
  bodyI18n: Partial<Record<Locale, string>>;
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
  /** 宣伝ファイルの添付（任意）。無い配信は null */
  attachment: CampaignAttachment | null;
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

function toCampaign(
  eventId: string,
  doc: FirebaseFirestore.DocumentSnapshot,
): EventCampaign {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    title: String(d.title ?? ''),
    body: String(d.body ?? ''),
    titleI18n: parseLocalizedTexts(d.titleI18n),
    bodyI18n: parseLocalizedTexts(d.bodyI18n),
    kind: d.kind === 'scheduled' ? 'scheduled' : 'instant',
    status: (d.status as CampaignStatus) ?? 'scheduled',
    scheduledAt: (d.scheduledAt as string | null) ?? null,
    sentAt: d.sentAt?.toDate?.().toISOString() ?? (d.sentAt as string | null) ?? null,
    sentCount: typeof d.sentCount === 'number' ? d.sentCount : null,
    error: (d.error as string | null) ?? null,
    sendingStartedAt: d.sendingStartedAt?.toDate?.().toISOString() ?? null,
    attachment: readCampaignAttachment(eventId, d.attachment),
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
    /** 宣伝ファイルの添付（任意、未検証の値でもよい） */
    attachment?: unknown;
  },
): Promise<EventCampaign> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title) throw new Error('タイトルが必要です');
  if (!body) throw new Error('本文が必要です');
  const parsedAttachment = parseCampaignAttachment(eventId, input.attachment);
  if (!parsedAttachment.ok) throw new Error(parsedAttachment.error);
  // 作成時に翻訳を揃える（即時配信でも翻訳待ちを作らない）。失敗時は空マップで続行。
  const [titleI18n, bodyI18n] = await Promise.all([
    translateText(title),
    translateText(body),
  ]);
  const ref = campaignsRef(eventId).doc();
  await ref.set({
    title,
    body,
    titleI18n,
    bodyI18n,
    kind: input.kind,
    status: 'scheduled',
    scheduledAt: input.scheduledAt,
    sentAt: null,
    sentCount: null,
    error: null,
    attachment: parsedAttachment.attachment,
    createdAt: FieldValue.serverTimestamp(),
  });
  const created = await ref.get();
  return toCampaign(eventId, created);
}

export async function getCampaign(
  eventId: string,
  campaignId: string,
): Promise<EventCampaign | null> {
  const doc = await campaignsRef(eventId).doc(campaignId).get();
  return doc.exists ? toCampaign(eventId, doc) : null;
}

export async function listCampaigns(eventId: string): Promise<EventCampaign[]> {
  const snap = await campaignsRef(eventId).get();
  return snap.docs
    .map((doc) => toCampaign(eventId, doc))
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

export interface LocalizedCampaignText {
  locale: Locale;
  title: string;
  body: string;
}

/**
 * 送信に使う言語別の文面を組み立てる（純粋関数）。
 * 言語別マップに無い言語はイベントのデフォルト→日本語へフォールバックし、
 * それでも無ければ原文を使う（翻訳導入前の campaign でも壊れない）。
 */
export function localizedCampaignTexts(
  campaign: Pick<EventCampaign, 'title' | 'body' | 'titleI18n' | 'bodyI18n'>,
  eventDefault?: unknown,
): LocalizedCampaignText[] {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    title:
      pickLocalizedText(campaign.titleI18n, locale, eventDefault) ||
      campaign.title,
    body:
      pickLocalizedText(campaign.bodyI18n, locale, eventDefault) ||
      campaign.body,
  }));
}

/** 来場者画面の「お知らせ」に載せる配信の最大件数。 */
export const NOTICE_LIMIT = 30;

/** お知らせ1件分（来場者本人の言語に解決済みの文面＋添付）。 */
export interface EventNotice {
  id: string;
  title: string;
  body: string;
  sentAt: string | null;
  attachment: CampaignAttachment | null;
}

/**
 * 送信済み campaign をお知らせ表示用に整形する（純粋関数）。
 * 送信済みだけを sentAt の新しい順に並べ、上限件数まで返す。
 * 文面は本人の言語で解決し、無い言語はイベントのデフォルト→日本語→
 * 原文の順にフォールバックする（送信時の文面解決と同じ規則）。
 */
export function buildNotices(
  campaigns: EventCampaign[],
  locale: Locale,
  eventDefault?: unknown,
  limit: number = NOTICE_LIMIT,
): EventNotice[] {
  return campaigns
    .filter((campaign) => campaign.status === 'sent')
    .sort((a, b) =>
      (b.sentAt ?? b.createdAt).localeCompare(a.sentAt ?? a.createdAt),
    )
    .slice(0, Math.max(0, limit))
    .map((campaign) => ({
      id: campaign.id,
      title:
        pickLocalizedText(campaign.titleI18n, locale, eventDefault) ||
        campaign.title,
      body:
        pickLocalizedText(campaign.bodyI18n, locale, eventDefault) ||
        campaign.body,
      sentAt: campaign.sentAt,
      attachment: campaign.attachment,
    }));
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

    // 言語ごとに、その言語の文面をその言語のトピックへ送る。
    // 一部の言語だけ失敗しても、送れた言語があれば配信自体は成立とする。
    const event = await getEvent(eventId);
    const texts = localizedCampaignTexts(campaign, event?.defaultLocale);
    let delivered = 0;
    const failures: string[] = [];
    for (const text of texts) {
      try {
        await messaging.send({
          topic: localeTopic(eventId, text.locale),
          data: {
            title: text.title,
            body: text.body,
            icon: iconUrl,
            url: targetUrl,
            eventId,
          },
          apns: {
            payload: {
              aps: {
                alert: { title: text.title, body: text.body },
                sound: 'default',
                badge: 1,
                'content-available': 1,
              },
            },
          },
          android: {
            priority: 'high',
            notification: {
              title: text.title,
              body: text.body,
              icon: iconUrl,
              sound: 'default',
            },
          },
          webpush: {
            headers: { Urgency: 'high' },
            fcmOptions: { link: targetUrl },
          },
        });
        delivered++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${text.locale}: ${message}`);
      }
    }
    if (delivered === 0) {
      throw new Error(failures.join('; ') || '送信に失敗しました');
    }
    if (failures.length > 0) {
      console.error('[event-push] 一部の言語で送信に失敗:', failures);
    }

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
    .map((doc) => toCampaign(eventId, doc))
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
