// lib/event-coupon.ts
// Push-taro EVENT のクーポン基盤（events/{eventId} 配下）。
//
// - exhibitors/{exhibitorId}: 出店者（会社）。ログインはイベント専用の
//   アクセスコード方式（lib/exhibitor-access.ts）。ドキュメントにメール
//   アドレスとコードのハッシュ（accessCode フィールド）を持ち、Firebase
//   Auth のアカウントは作らない（Auth は主催者だけ）。
// - coupons/{couponId}: クーポン。必ず所有する出店者（exhibitorId）を持ち、
//   検索・一覧用に出店者名とキーワードを保持する。イベント全体で最大100件。
// - claims/{memberId}_{couponId}: 来場者の取得記録（電話番号キー）。
// - redemptions/{claimId}: 消込記録。
//
// 消込の鉄則: 出店者は自社クーポンしか消込できない。この判定は画面ではなく
// サーバー側（evaluateRedemption / redeemClaim）で必ず行う。
// 主催者（イベント所有者）は管理画面側の消込として全クーポンを消込できる。
import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';
import { EVENT_SUBCOLLECTIONS, MAX_COUPONS_PER_EVENT } from './event';
import { getEvent } from './event-store';
import { normalizeLocale, parseLocalizedTexts, pickLocalizedText, resolveLocale, type Locale } from './i18n';
import { translateText } from './translate';
import { uiText } from './ui-text';

// exhibitors / coupons はリセット・終了削除の対象外（個人情報を含まない台帳）。
// 削除対象は EVENT_SUBCOLLECTIONS の4つ（subscribers/members/claims/redemptions）。
export const EVENT_EXHIBITORS_COLLECTION = 'exhibitors';
export const EVENT_COUPONS_COLLECTION = 'coupons';

export interface EventExhibitor {
  id: string;
  name: string;
  /** 消込ログイン用メールアドレス。旧ドキュメント（Auth 方式時代）は null */
  email: string | null;
  /** アクセスコード（画面表記「パスワード」）が発行済みかどうか。
   * ハッシュ自体は API に出さない。 */
  hasAccessCode: boolean;
  /** 表示言語（個人の選択）。未設定ならイベントのデフォルト言語 */
  lang: Locale;
  /**
   * 出店者課金オプションの未払い確定による掲載停止フラグ。
   * ドキュメントのトップレベル項目 `billingSuspended` で管理する
   * （lib/event-billing.ts が Webhook 経由で立て下げする）。
   * 未設定（undefined）の旧ドキュメントは停止でない扱い。
   * 停止中でも出店者ログイン・取得済みクーポンの消込は止めない。
   * 止まるのは来場者カタログへの掲載だけ。
   */
  billingSuspended: boolean;
}

function mapExhibitor(
  id: string,
  data: Record<string, unknown>,
): EventExhibitor {
  return {
    id,
    name: String(data.name ?? ''),
    email:
      typeof data.email === 'string' && data.email ? data.email : null,
    hasAccessCode:
      typeof data.accessCode === 'string' && data.accessCode.length > 0,
    lang: normalizeLocale(data.lang),
    billingSuspended: data.billingSuspended === true,
  };
}

export interface EventCoupon {
  id: string;
  exhibitorId: string;
  exhibitorName: string;
  title: string;
  description: string;
  /** タイトルの言語別マップ（作成時に自動翻訳） */
  titleI18n: Partial<Record<Locale, string>>;
  /** 説明文の言語別マップ（同上） */
  descriptionI18n: Partial<Record<Locale, string>>;
  keywords: string[];
  active: boolean;
}

export interface EventClaim {
  id: string;
  memberId: string;
  couponId: string;
  exhibitorId: string;
  status: 'claimed' | 'redeemed';
}

// PR #4（event-register）の memberIdForPhone と同一式。
// 両PRのマージ後に共通化する。
export function memberIdForPhone(phoneE164: string): string {
  return createHash('sha256').update(phoneE164.trim()).digest('hex');
}

export function claimIdFor(memberId: string, couponId: string): string {
  return `${memberId}_${couponId}`;
}

/** クーポン検索（会社名・タイトル・説明・キーワードに部分一致、大文字小文字を無視）。 */
export function filterCoupons(coupons: EventCoupon[], query: string): EventCoupon[] {
  const q = query.trim().toLowerCase();
  if (!q) return coupons;
  return coupons.filter((coupon) => {
    const haystack = [
      coupon.title,
      coupon.description,
      coupon.exhibitorName,
      ...coupon.keywords,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export type RedemptionActor =
  | { type: 'organizer' }
  | { type: 'exhibitor'; exhibitorId: string };

export type RedemptionDecision =
  | { allowed: true }
  | { allowed: false; reason: 'not-owner' | 'already-redeemed' | 'coupon-inactive' };

/**
 * 消込可否の判定（純粋関数）。
 * - 出店者は自社クーポンのみ。主催者は全クーポン可。
 * - 消込済みの取得記録は二度消しできない。
 */
export function evaluateRedemption(
  actor: RedemptionActor,
  coupon: Pick<EventCoupon, 'exhibitorId' | 'active'>,
  claim: Pick<EventClaim, 'status'>,
): RedemptionDecision {
  if (actor.type === 'exhibitor' && actor.exhibitorId !== coupon.exhibitorId) {
    return { allowed: false, reason: 'not-owner' };
  }
  if (!coupon.active) return { allowed: false, reason: 'coupon-inactive' };
  if (claim.status === 'redeemed') return { allowed: false, reason: 'already-redeemed' };
  return { allowed: true };
}

function eventRef(eventId: string) {
  return db.collection('events').doc(eventId);
}

function exhibitorsRef(eventId: string) {
  return eventRef(eventId).collection(EVENT_EXHIBITORS_COLLECTION);
}

function couponsRef(eventId: string) {
  return eventRef(eventId).collection(EVENT_COUPONS_COLLECTION);
}

// ─── 出店者 ───

/** 出店者の表示言語（個人の選択）を保存する。 */
export async function updateExhibitorLanguage(
  eventId: string,
  exhibitorId: string,
  lang: Locale,
): Promise<void> {
  await eventRef(eventId)
    .collection(EVENT_EXHIBITORS_COLLECTION)
    .doc(exhibitorId)
    .update({ lang });
}

/**
 * 出店者の掲載停止フラグを立て下げする（出店者課金オプション専用。
 * 呼び出しは lib/event-billing.ts の Webhook 適用と終了時処理だけ）。
 */
export async function setExhibitorBillingSuspended(
  eventId: string,
  exhibitorId: string,
  suspended: boolean,
): Promise<void> {
  await eventRef(eventId)
    .collection(EVENT_EXHIBITORS_COLLECTION)
    .doc(exhibitorId)
    .update({ billingSuspended: suspended });
}

/**
 * 来場者カタログの可視判定（純粋関数・テスト対象）:
 * 掲載停止中（billingSuspended）の出店者のクーポンは来場者に渡さない。
 * 取得済みクーポン（claims）の表示・消込はここでは扱わない（止めない）。
 */
export function visibleCatalogCoupons(
  coupons: EventCoupon[],
  exhibitors: Array<Pick<EventExhibitor, 'id' | 'billingSuspended'>>,
): EventCoupon[] {
  const suspendedIds = new Set(
    exhibitors.filter((e) => e.billingSuspended).map((e) => e.id),
  );
  if (suspendedIds.size === 0) return coupons;
  return coupons.filter((coupon) => !suspendedIds.has(coupon.exhibitorId));
}

export async function createExhibitor(
  eventId: string,
  input: { name: string; email?: string | null; lang?: Locale },
): Promise<EventExhibitor> {
  const name = input.name.trim();
  if (!name) throw new Error('出店者名が必要です');
  const event = await getEvent(eventId);
  const ref = exhibitorsRef(eventId).doc();
  const email = input.email?.trim().toLowerCase() || null;
  const exhibitor: EventExhibitor = {
    id: ref.id,
    name,
    email,
    hasAccessCode: false,
    lang: resolveLocale(input.lang, event?.defaultLocale),
    billingSuspended: false,
  };
  // hasAccessCode はドキュメントの accessCode フィールドから導く表示用の値で、
  // 保存するのは実フィールド（email / lang）だけ。
  const { hasAccessCode: _displayOnly, ...stored } = exhibitor;
  await ref.set({ ...stored, createdAt: FieldValue.serverTimestamp() });
  return exhibitor;
}

export async function listExhibitors(eventId: string): Promise<EventExhibitor[]> {
  const snap = await exhibitorsRef(eventId).get();
  return snap.docs.map((doc) => mapExhibitor(doc.id, doc.data()));
}

export async function getExhibitor(
  eventId: string,
  exhibitorId: string,
): Promise<EventExhibitor | null> {
  const doc = await exhibitorsRef(eventId).doc(exhibitorId).get();
  if (!doc.exists) return null;
  return mapExhibitor(doc.id, doc.data()!);
}

// ─── クーポン ───

/** クーポン上限に達しているか（上限はイベント設定の契約枠）。 */
export function isCouponCapReached(couponCount: number, couponCap: number): boolean {
  return couponCount >= couponCap;
}

export async function createCoupon(
  eventId: string,
  input: {
    exhibitorId: string;
    title: string;
    description?: string;
    keywords?: string[];
  },
): Promise<EventCoupon> {
  const exhibitor = await getExhibitor(eventId, input.exhibitorId);
  if (!exhibitor) throw new Error('出店者が見つかりません');
  const title = input.title.trim();
  if (!title) throw new Error('クーポンのタイトルが必要です');

  const event = await getEvent(eventId);
  const couponCap = event?.couponCap ?? MAX_COUPONS_PER_EVENT;
  const countSnap = await couponsRef(eventId).count().get();
  if (isCouponCapReached(countSnap.data().count, couponCap)) {
    throw new Error(`クーポンはイベント全体で最大${couponCap}件までです`);
  }

  const ref = couponsRef(eventId).doc();
  const description = (input.description ?? '').trim();
  // 作成時に翻訳を揃える。失敗時は空マップで続行（原文表示にフォールバック）。
  const [titleI18n, descriptionI18n] = await Promise.all([
    translateText(title),
    translateText(description),
  ]);
  const coupon: EventCoupon = {
    id: ref.id,
    exhibitorId: exhibitor.id,
    exhibitorName: exhibitor.name,
    title,
    description,
    titleI18n,
    descriptionI18n,
    keywords: (input.keywords ?? []).map((k) => k.trim()).filter(Boolean),
    active: true,
  };
  await ref.set({ ...coupon, createdAt: FieldValue.serverTimestamp() });
  return coupon;
}

export async function listCoupons(eventId: string): Promise<EventCoupon[]> {
  const snap = await couponsRef(eventId).get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      exhibitorId: String(data.exhibitorId ?? ''),
      exhibitorName: String(data.exhibitorName ?? ''),
      title: String(data.title ?? ''),
      description: String(data.description ?? ''),
      titleI18n: parseLocalizedTexts(data.titleI18n),
      descriptionI18n: parseLocalizedTexts(data.descriptionI18n),
      keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
      active: data.active !== false,
    };
  });
}

export async function getCoupon(
  eventId: string,
  couponId: string,
): Promise<EventCoupon | null> {
  const doc = await couponsRef(eventId).doc(couponId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    exhibitorId: String(data.exhibitorId ?? ''),
    exhibitorName: String(data.exhibitorName ?? ''),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    titleI18n: parseLocalizedTexts(data.titleI18n),
    descriptionI18n: parseLocalizedTexts(data.descriptionI18n),
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
    active: data.active !== false,
  };
}

// ─── 取得 ───

export type ClaimResult =
  | { ok: true; claimId: string; alreadyClaimed: boolean }
  | { ok: false; status: number; error: string };

export async function claimCoupon(
  eventId: string,
  couponId: string,
  memberId: string,
): Promise<ClaimResult> {
  const event = await getEvent(eventId);
  if (!event) return { ok: false, status: 404, error: 'イベントが見つかりません' };

  const memberRef = eventRef(eventId)
    .collection(EVENT_SUBCOLLECTIONS.members)
    .doc(memberId);
  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) {
    return { ok: false, status: 403, error: '先にイベントへ登録してください' };
  }

  const coupon = await getCoupon(eventId, couponId);
  if (!coupon || !coupon.active) {
    return { ok: false, status: 404, error: 'クーポンが見つかりません' };
  }

  const claimId = claimIdFor(memberId, couponId);
  const claimRef = eventRef(eventId)
    .collection(EVENT_SUBCOLLECTIONS.claims)
    .doc(claimId);
  const claimSnap = await claimRef.get();
  if (claimSnap.exists) {
    // 取得済みは冪等に成功として返す（再取得で二重に持たせない）
    return { ok: true, claimId, alreadyClaimed: true };
  }

  await claimRef.set({
    memberId,
    couponId,
    exhibitorId: coupon.exhibitorId,
    status: 'claimed',
    claimedAt: FieldValue.serverTimestamp(),
  });
  return { ok: true, claimId, alreadyClaimed: false };
}

export interface MemberClaimView {
  claimId: string;
  couponId: string;
  title: string;
  exhibitorName: string;
  status: 'claimed' | 'redeemed';
}

/** 来場者本人の取得済みクーポン一覧（クーポン情報を付けて返す）。
 * locale があればタイトルをその言語で返す（作成時の自動翻訳を使用）。 */
export async function listClaimsByMember(
  eventId: string,
  memberId: string,
  locale?: Locale,
): Promise<MemberClaimView[]> {
  const snap = await eventRef(eventId)
    .collection(EVENT_SUBCOLLECTIONS.claims)
    .where('memberId', '==', memberId)
    .get();
  const event = locale ? await getEvent(eventId) : null;
  const views: MemberClaimView[] = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    const coupon = await getCoupon(eventId, String(data.couponId ?? ''));
    views.push({
      claimId: doc.id,
      couponId: String(data.couponId ?? ''),
      title: coupon
        ? (locale
            ? pickLocalizedText(coupon.titleI18n, locale, event?.defaultLocale)
            : '') || coupon.title
        : locale
          ? uiText(locale, 'deletedCoupon')
          : '（削除されたクーポン）',
      exhibitorName: coupon?.exhibitorName ?? '',
      status: data.status === 'redeemed' ? 'redeemed' : 'claimed',
    });
  }
  return views;
}

// ─── 件数集計 ───

export interface CouponClaimCounts {
  claimedCount: number;
  redeemedCount: number;
}

/** 取得記録をクーポンごとに集計する純粋関数。
 * claimedCount は取得総数、redeemedCount はそのうち消込済みの数。 */
export function tallyClaimsByCoupon(
  claims: Array<Pick<EventClaim, 'couponId' | 'status'>>,
): Map<string, CouponClaimCounts> {
  const tally = new Map<string, CouponClaimCounts>();
  for (const claim of claims) {
    const counts = tally.get(claim.couponId) ?? { claimedCount: 0, redeemedCount: 0 };
    counts.claimedCount += 1;
    if (claim.status === 'redeemed') counts.redeemedCount += 1;
    tally.set(claim.couponId, counts);
  }
  return tally;
}

/** 1出店者分の取得・消込件数をクーポンごとに返す（出店者画面の件数表示用）。
 * claims ドキュメントは exhibitorId を保持するので、その出店者の分だけを
 * 1クエリで読み、他社の記録には触れない。 */
export async function countClaimsByExhibitor(
  eventId: string,
  exhibitorId: string,
): Promise<Map<string, CouponClaimCounts>> {
  const snap = await eventRef(eventId)
    .collection(EVENT_SUBCOLLECTIONS.claims)
    .where('exhibitorId', '==', exhibitorId)
    .get();
  return tallyClaimsByCoupon(
    snap.docs.map((doc) => {
      const data = doc.data();
      return {
        couponId: String(data.couponId ?? ''),
        status: (data.status === 'redeemed' ? 'redeemed' : 'claimed') as EventClaim['status'],
      };
    }),
  );
}

// ─── 消込 ───

export type RedeemResult =
  | { ok: true; claimId: string }
  | { ok: false; status: number; error: string };

type RedemptionRejection = 'not-owner' | 'already-redeemed' | 'coupon-inactive';

const REDEMPTION_ERRORS: Record<
  RedemptionRejection,
  { status: number; error: string }
> = {
  'not-owner': { status: 403, error: '他社のクーポンは消込できません' },
  'already-redeemed': { status: 409, error: 'このクーポンは消込済みです' },
  'coupon-inactive': { status: 409, error: 'このクーポンは現在無効です' },
};

export async function redeemClaim(
  eventId: string,
  claimId: string,
  actor: RedemptionActor,
): Promise<RedeemResult> {
  const claimRef = eventRef(eventId)
    .collection(EVENT_SUBCOLLECTIONS.claims)
    .doc(claimId);
  const redemptionRef = eventRef(eventId)
    .collection(EVENT_SUBCOLLECTIONS.redemptions)
    .doc(claimId);

  return db.runTransaction(async (tx) => {
    const claimSnap = await tx.get(claimRef);
    if (!claimSnap.exists) {
      return { ok: false, status: 404, error: '取得記録が見つかりません' } as RedeemResult;
    }
    const claimData = claimSnap.data()!;
    const claim: EventClaim = {
      id: claimSnap.id,
      memberId: String(claimData.memberId ?? ''),
      couponId: String(claimData.couponId ?? ''),
      exhibitorId: String(claimData.exhibitorId ?? ''),
      status: claimData.status === 'redeemed' ? 'redeemed' : 'claimed',
    };

    const coupon = await getCoupon(eventId, claim.couponId);
    if (!coupon) {
      return { ok: false, status: 404, error: 'クーポンが見つかりません' } as RedeemResult;
    }

    const decision = evaluateRedemption(actor, coupon, claim);
    if (!decision.allowed) {
      const response = REDEMPTION_ERRORS[decision.reason];
      return { ok: false, status: response.status, error: response.error } as RedeemResult;
    }

    tx.update(claimRef, {
      status: 'redeemed',
      redeemedAt: FieldValue.serverTimestamp(),
      redeemedBy: actor.type === 'organizer' ? 'organizer' : actor.exhibitorId,
    });
    tx.set(redemptionRef, {
      claimId,
      couponId: claim.couponId,
      exhibitorId: coupon.exhibitorId,
      memberId: claim.memberId,
      redeemedBy: actor.type === 'organizer' ? 'organizer' : actor.exhibitorId,
      redeemedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true, claimId } as RedeemResult;
  });
}
