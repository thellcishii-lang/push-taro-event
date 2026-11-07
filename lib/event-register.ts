// lib/event-register.ts
// Push-taro EVENT の来場者登録（events/{eventId} 配下への配置）。
//
// - 本人確認は Firebase Phone Auth（SMS認証）。電話番号がその人の識別キーになる
//   （再登録によるクーポンの二重取得を防ぐため）。
// - members/{memberId}: 電話番号を含む本人確認レコード。memberId は電話番号の
//   SHA-256 ハッシュで、電話番号そのものをドキュメントIDにしない。
//   方式B（keep-phones）では日次リセットでも残り、イベント終了時に消去される。
// - subscribers/{memberId}: プッシュ購読（FCMトークン）。1電話番号につき1購読とし、
//   再登録はトークンの更新として扱う。日次リセットで両方式とも消去される。
import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db, messaging } from './firebase-admin';
import { EVENT_SUBCOLLECTIONS, EventConfig, jstDateString } from './event';
import { normalizeLocale } from './i18n';
import { getEvent } from './event-store';

export function memberIdForPhone(phoneE164: string): string {
  return createHash('sha256').update(phoneE164.trim()).digest('hex');
}

export type RegistrationRejection =
  | 'not-live'
  | 'before-period'
  | 'after-period'
  | 'cap-reached';

export type RegistrationDecision =
  | { allowed: true }
  | { allowed: false; reason: RegistrationRejection };

/**
 * 登録可否の判定（純粋関数）。
 * - 状態が live で、開催期間内（JST の今日が startDate〜endDate）のときだけ登録できる。
 * - 購読者上限は「新規登録」にだけ効く。登録済みの人の再登録（トークン更新）は
 *   上限に達していても通す（枠は既に確保されているため）。
 */
export function evaluateRegistration(
  event: Pick<EventConfig, 'status' | 'startDate' | 'endDate' | 'subscriberCap'>,
  today: string,
  subscriberCount: number,
  alreadyRegistered: boolean,
): RegistrationDecision {
  if (event.status !== 'live') return { allowed: false, reason: 'not-live' };
  if (today < event.startDate) return { allowed: false, reason: 'before-period' };
  if (today > event.endDate) return { allowed: false, reason: 'after-period' };
  if (!alreadyRegistered && subscriberCount >= event.subscriberCap) {
    return { allowed: false, reason: 'cap-reached' };
  }
  return { allowed: true };
}

const REJECTION_RESPONSES: Record<
  RegistrationRejection,
  { status: number; error: string }
> = {
  'not-live': { status: 403, error: 'このイベントは現在登録を受け付けていません' },
  'before-period': { status: 403, error: 'このイベントはまだ開催前です' },
  'after-period': { status: 403, error: 'このイベントは終了しました' },
  'cap-reached': { status: 409, error: '登録上限に達しました' },
};

export type RegisterVisitorResult =
  | { ok: true; memberId: string }
  | { ok: false; status: number; error: string };

function eventRef(eventId: string) {
  return db.collection('events').doc(eventId);
}

export async function registerEventVisitor(
  eventId: string,
  input: { phoneE164: string; fcmToken: string; lang?: string; now?: Date },
): Promise<RegisterVisitorResult> {
  const event = await getEvent(eventId);
  if (!event) {
    return { ok: false, status: 404, error: 'イベントが見つかりません' };
  }

  const now = input.now ?? new Date();
  const today = jstDateString(now);
  const memberId = memberIdForPhone(input.phoneE164);
  const subscribersRef = eventRef(eventId).collection(EVENT_SUBCOLLECTIONS.subscribers);
  const membersRef = eventRef(eventId).collection(EVENT_SUBCOLLECTIONS.members);
  const subscriberRef = subscribersRef.doc(memberId);
  const memberRef = membersRef.doc(memberId);

  const [subscriberSnap, memberSnap] = await Promise.all([
    subscriberRef.get(),
    memberRef.get(),
  ]);
  const alreadyRegistered = subscriberSnap.exists;

  let subscriberCount = 0;
  if (!alreadyRegistered) {
    const countSnap = await subscribersRef.count().get();
    subscriberCount = countSnap.data().count;
  }

  const decision = evaluateRegistration(event, today, subscriberCount, alreadyRegistered);
  if (!decision.allowed) {
    const response = REJECTION_RESPONSES[decision.reason];
    return { ok: false, status: response.status, error: response.error };
  }

  const batch = db.batch();
  if (!memberSnap.exists) {
    batch.set(memberRef, {
      phone: input.phoneE164,
      createdAt: FieldValue.serverTimestamp(),
      lastRegisteredAt: FieldValue.serverTimestamp(),
    });
  } else {
    batch.update(memberRef, { lastRegisteredAt: FieldValue.serverTimestamp() });
  }
  batch.set(subscriberRef, {
    memberId,
    fcmToken: input.fcmToken,
    // 言語は個人の選択を優先し、無ければイベントのデフォルト言語で登録する
    lang: normalizeLocale(input.lang, event.defaultLocale),
    registeredDate: today,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  // 一斉配信は FCM トピック宛て（本家と同じ方式）。失敗しても登録自体は成立させる。
  try {
    await messaging.subscribeToTopic([input.fcmToken], `event_${eventId}_users`);
  } catch (error) {
    console.warn('[EVENT] FCMトピック登録をスキップ:', error);
  }

  return { ok: true, memberId };
}
