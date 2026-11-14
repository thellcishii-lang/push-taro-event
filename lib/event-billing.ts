// lib/event-billing.ts
// Push-taro EVENT の出店者課金システム（別料金オプション）。
// 町おこしの店舗課金（同じ基盤）からの移植に、EVENT 用の差分を加えたもの:
// - 課金形態を発行時に選べる（月額サブスク / 一括払い）
// - 掲載停止の対象は来場者向けクーポンカタログ（取得済みの消込は止めない）
// - イベント終了処理で、そのイベントのサブスクリプションを自動解約する
//
// 設計の柱:
// - データ元は Firestore のみ。このモジュールが課金の正を持つ。
// - 使うのは「主催者自身の Stripe」。主催者が自分の Stripe の
//   APIキー（シークレットキー）と Webhook シークレットを管理画面から
//   登録し、サーバー専用ドキュメント organizers/{contractId}/billing/stripe
//   にだけ保持する。キーの値は UI・API レスポンスに一切出さない。
// - Stripe の商品・価格は事前に作らない。出店者ごとの金額は主催者が決め、
//   決済のたびに金額を API で指定して Checkout セッションを作る。
// - 支払い状態は Stripe Webhook のローカル記録が正。Stripe API への
//   都度問い合わせには依存しない。
// - 未払い確定で掲載停止: 出店者ドキュメントの billingSuspended
//   （lib/event-coupon.ts 参照）を立て、来場者カタログから外す。
//   取得済みクーポンの消込には触れない。支払いが復旧したら自動で戻す。
// - このオプションは契約ごとに ON/OFF（organizers の
//   billingOptionEnabled）。OFF の契約では呼び出し側（API）が存在自体を
//   隠し、このモジュールの処理は動かない。
import Stripe from 'stripe';
import type { Firestore } from 'firebase-admin/firestore';
import { jstDateString } from './event';
import { getOrganizer, findOrganizerByOwnerUid, type Organizer } from './organizers';
import { listEventsByOwner } from './event-store';
import { setExhibitorBillingSuspended } from './event-coupon';
import { resolveAppOrigin } from './app-origin';

export const SHOP_BILLINGS_COLLECTION = 'shopBillings';
export const BILLING_PAYMENTS_COLLECTION = 'billingPayments';
const BILLING_SETTINGS_SUBCOLLECTION = 'billing';
const BILLING_SETTINGS_DOC_ID = 'stripe';

/** 課金形態。発行時に主催者が選ぶ。 */
export type ShopBillingType = 'subscription' | 'one-time';

/** 出店者ごとの課金状態。 */
export type ShopBillingStatus =
  | 'none' // プラン未作成（または Checkout 未完了）
  | 'active' // 支払い済み（月額サブスクが回っている）
  | 'paid' // 支払い済み（一括払い）
  | 'past_due' // 支払い失敗・Stripe のリトライ中
  | 'suspended' // 未払い確定・返金で掲載停止中
  | 'canceled'; // 解約済み

export interface ShopBilling {
  exhibitorId: string;
  /** 課金形態。旧レコード（フィールド自体が無い）は 'subscription' 扱い */
  billingType: ShopBillingType;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  /** 一括払いの支払い（PaymentIntent）の ID。返金の突合に使う */
  stripePaymentIntentId: string | null;
  /** 金額（円）。subscription では月額、one-time では一括の金額 */
  amount: number;
  status: ShopBillingStatus;
  /** 現在の課金期間の終了（ISO文字列）。不明なら null */
  currentPeriodEnd: string | null;
  /** 出店者に渡す支払いページ（Checkout）の URL。発行時のみ */
  checkoutUrl: string | null;
  checkoutSessionId: string | null;
  /** 主催者が解約操作をした記録。Webhook の deleted で誤停止しないため */
  canceledByAdmin: boolean;
  updatedAt: string;
}

export interface BillingPaymentRecord {
  /** ドキュメントID = Stripe イベントID（冪等キー） */
  id: string;
  exhibitorId: string;
  /** 金額（円） */
  amount: number;
  status: 'paid' | 'failed';
  /** 支払いが完了した日時（ISO）。失敗時は null */
  paidAt: string | null;
  /** イベント発生日時（ISO） */
  occurredAt: string;
  stripeEventId: string;
  stripeInvoiceId: string | null;
}

/** サーバー専用ドキュメントに保持する Stripe 設定（値は外に出さない）。 */
export interface StripeBillingSettings {
  secretKey: string;
  webhookSecret: string;
}

/** 設定の「保存済みかどうか」だけを表す状態（値は含まない）。 */
export interface StripeBillingSettingsState {
  secretKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
}

// ─── 純粋関数: 設定入力の検証 ───

export function isValidStripeSecretKey(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    /^(sk|rk)_(test|live)_[A-Za-z0-9]{16,}$/.test(value.trim())
  );
}

export function isValidStripeWebhookSecret(value: unknown): boolean {
  return typeof value === 'string' && /^whsec_[A-Za-z0-9]{16,}$/.test(value.trim());
}

export type ParseBillingSettingsInputResult =
  | { ok: true; value: { secretKey?: string; webhookSecret?: string } }
  | { ok: false; error: string };

/**
 * Stripe 設定の保存入力を検証する。渡された項目だけを更新対象とし、
 * 未指定の項目は既存の値を維持する（片方だけの差し替えができる）。
 * 値は trim したものを保存する。どちらも無ければエラー。
 */
export function parseBillingSettingsInput(
  raw: unknown,
): ParseBillingSettingsInputResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'リクエスト形式が不正です' };
  }
  const source = raw as Record<string, unknown>;
  const value: { secretKey?: string; webhookSecret?: string } = {};
  if (source.secretKey !== undefined) {
    if (!isValidStripeSecretKey(source.secretKey)) {
      return {
        ok: false,
        error: 'APIキー（シークレットキー）の形式が不正です',
      };
    }
    value.secretKey = (source.secretKey as string).trim();
  }
  if (source.webhookSecret !== undefined) {
    if (!isValidStripeWebhookSecret(source.webhookSecret)) {
      return {
        ok: false,
        error: 'Webhookシークレットの形式が不正です（whsec_ で始まる値です）',
      };
    }
    value.webhookSecret = (source.webhookSecret as string).trim();
  }
  if (value.secretKey === undefined && value.webhookSecret === undefined) {
    return { ok: false, error: '保存する項目がありません' };
  }
  return { ok: true, value };
}

// ─── 純粋関数: 金額と課金形態の検証 ───

export const BILLING_AMOUNT_MIN = 50;
export const BILLING_AMOUNT_MAX = 10_000_000;

export type ParseBillingAmountResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

/** 出店者ごとの金額（円・整数）の入力検証。月額でも一括でも同じ範囲。 */
export function parseBillingAmount(raw: unknown): ParseBillingAmountResult {
  if (typeof raw !== 'number' || !Number.isInteger(raw)) {
    return { ok: false, error: '金額は円単位の整数で指定してください' };
  }
  if (raw < BILLING_AMOUNT_MIN || raw > BILLING_AMOUNT_MAX) {
    return {
      ok: false,
      error: `金額は${BILLING_AMOUNT_MIN}円から${BILLING_AMOUNT_MAX}円の間で指定してください`,
    };
  }
  return { ok: true, value: raw };
}

export type ParseBillingTypeResult =
  | { ok: true; value: ShopBillingType }
  | { ok: false; error: string };

/**
 * 課金形態の入力検証。未指定（undefined）は 'subscription'（従来形）。
 * それ以外の不正な値はエラーにする。
 */
export function parseBillingType(raw: unknown): ParseBillingTypeResult {
  if (raw === undefined || raw === 'subscription') {
    return { ok: true, value: 'subscription' };
  }
  if (raw === 'one-time') return { ok: true, value: 'one-time' };
  return {
    ok: false,
    error: '課金形態は subscription（月額）か one-time（一括）で指定してください',
  };
}

// ─── 純粋関数: JST の月キーと収支集計 ───

/** ISO文字列の属する JST の月キー（'YYYY-MM'）。解釈できなければ ''。 */
export function monthKeyJst(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return jstDateString(date).slice(0, 7);
}

/** 基準日（JST）の今月と先月の月キー。 */
export function currentAndPreviousMonthKeys(now: Date): {
  current: string;
  previous: string;
} {
  const current = jstDateString(now).slice(0, 7);
  const [year, month] = current.split('-').map(Number);
  const prev = new Date(Date.UTC(year, month - 2, 1));
  const previous = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}`;
  return { current, previous };
}

export interface BillingMonthlySummary {
  currentMonthKey: string;
  currentMonthTotal: number;
  previousMonthKey: string;
  previousMonthTotal: number;
}

/**
 * 支払い記録から今月・先月（JST）の入金合計を出す。
 * 数えるのは支払い完了（paid）だけ。月は paidAt（無ければ occurredAt）
 * の JST 月で判定する。
 */
export function summarizePaymentsByMonth(
  payments: Array<
    Pick<BillingPaymentRecord, 'amount' | 'status' | 'paidAt' | 'occurredAt'>
  >,
  now: Date,
): BillingMonthlySummary {
  const { current, previous } = currentAndPreviousMonthKeys(now);
  let currentMonthTotal = 0;
  let previousMonthTotal = 0;
  for (const payment of payments) {
    if (payment.status !== 'paid') continue;
    const key = monthKeyJst(payment.paidAt ?? payment.occurredAt);
    if (key === current) currentMonthTotal += payment.amount;
    else if (key === previous) previousMonthTotal += payment.amount;
  }
  return {
    currentMonthKey: current,
    currentMonthTotal,
    previousMonthKey: previous,
    previousMonthTotal,
  };
}

// ─── 純粋関数: Stripe Webhook イベント → ローカルへの効果 ───

/**
 * Webhook イベントの最小構造（テスト容易性のため Stripe 型に依存しない）。
 * Stripe.Event は構造的にこれを満たす。
 */
export interface StripeWebhookEventLike {
  id: string;
  type: string;
  created?: number;
  data: { object: Record<string, unknown> };
}

export interface BillingPaymentDraft {
  amount: number;
  status: 'paid' | 'failed';
  invoiceId: string | null;
  paidAt: string | null;
}

export interface StripeWebhookEffect {
  subscriptionId: string | null;
  customerId: string | null;
  /** 一括払いの PaymentIntent ID（返金の突合用） */
  paymentIntentId: string | null;
  /** Checkout / サブスクリプションの metadata から得た所属（無ければ null） */
  metadataEventId: string | null;
  metadataExhibitorId: string | null;
  billingPatch: {
    status?: ShopBillingStatus;
    currentPeriodEnd?: string | null;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    stripePaymentIntentId?: string;
  };
  /** null = 掲載状態に触らない / true = 掲載停止 / false = 掲載に復旧 */
  suspend: boolean | null;
  payment: BillingPaymentDraft | null;
  /**
   * true の場合、この効果は一括払い（one-time）の課金レコードにだけ
   * 適用する（返金は月額サブスクの支払いには適用しない）。
   */
  oneTimeOnly: boolean;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

/** customer は文字列 ID のことも、展開されたオブジェクトのこともある。 */
function customerIdOf(value: unknown): string | null {
  if (typeof value === 'string') return value || null;
  const record = asRecord(value);
  return record ? stringOrNull(record.id) : null;
}

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function unixToIso(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return new Date(value * 1000).toISOString();
}

function metadataString(
  metadata: Record<string, unknown> | null,
  key: string,
): string | null {
  return metadata ? stringOrNull(metadata[key]) : null;
}

/** 請求書からサブスクリプションIDを引く（旧API形式と現行形式の両対応）。 */
function subscriptionIdFromInvoice(invoice: Record<string, unknown>): string | null {
  const direct = stringOrNull(invoice.subscription);
  if (direct) return direct;
  const parent = asRecord(invoice.parent);
  const details = parent ? asRecord(parent.subscription_details) : null;
  return details ? stringOrNull(details.subscription) : null;
}

function metadataFromInvoice(
  invoice: Record<string, unknown>,
): Record<string, unknown> | null {
  const parent = asRecord(invoice.parent);
  const details = parent ? asRecord(parent.subscription_details) : null;
  const fromDetails = details ? asRecord(details.metadata) : null;
  if (fromDetails) return fromDetails;
  return asRecord(invoice.metadata);
}

/** 請求書の対象期間の終わり（最初の明細の period.end）。 */
function periodEndFromInvoice(invoice: Record<string, unknown>): string | null {
  const lines = asRecord(invoice.lines);
  const data = lines && Array.isArray(lines.data) ? lines.data : [];
  for (const line of data) {
    const period = asRecord(asRecord(line)?.period);
    const iso = period ? unixToIso(period.end) : null;
    if (iso) return iso;
  }
  return null;
}

/** サブスクリプションの現在の期間終了（旧形式・現行形式の両対応）。 */
function periodEndFromSubscription(
  subscription: Record<string, unknown>,
): string | null {
  const direct = unixToIso(subscription.current_period_end);
  if (direct) return direct;
  const items = asRecord(subscription.items);
  const data = items && Array.isArray(items.data) ? items.data : [];
  for (const item of data) {
    const iso = unixToIso(asRecord(item)?.current_period_end);
    if (iso) return iso;
  }
  return null;
}

/**
 * Stripe のサブスクリプション状態 → ローカルの状態と掲載への効果。
 * - active / trialing: 支払いが回っている → active・掲載に復旧
 * - past_due: リトライ中 → past_due（まだ停止しない）
 * - unpaid: リトライ尽きて未払い確定 → suspended・掲載停止
 * - canceled / incomplete_expired: 終了 → canceled・掲載停止
 * - incomplete: 初回支払い未完了 → none（掲載には触らない）
 * - paused: 課金一時停止 → past_due 扱い（停止まではしない）
 * 未知の状態は null（何もしない）。
 */
export function shopBillingTransitionForSubscriptionStatus(
  stripeStatus: unknown,
): { status: ShopBillingStatus; suspend: boolean | null } | null {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return { status: 'active', suspend: false };
    case 'past_due':
    case 'paused':
      return { status: 'past_due', suspend: null };
    case 'unpaid':
      return { status: 'suspended', suspend: true };
    case 'canceled':
    case 'incomplete_expired':
      return { status: 'canceled', suspend: true };
    case 'incomplete':
      return { status: 'none', suspend: null };
    default:
      return null;
  }
}

/**
 * Webhook イベントを、ローカル記録への効果（課金レコードの更新・掲載の
 * 停止/復旧・支払い記録）に変換する。対象外のイベントは null。
 */
export function effectFromStripeEvent(
  event: StripeWebhookEventLike,
): StripeWebhookEffect | null {
  const object = asRecord(event.data?.object) ?? {};
  const occurredAt =
    unixToIso(event.created) ?? new Date().toISOString();

  switch (event.type) {
    case 'checkout.session.completed': {
      const metadata =
        asRecord(object.metadata) ??
        asRecord(asRecord(object.subscription_details)?.metadata);
      const customerId = customerIdOf(object.customer);
      if (object.mode === 'subscription') {
        const subscriptionId = stringOrNull(object.subscription);
        return {
          subscriptionId,
          customerId,
          paymentIntentId: null,
          metadataEventId: metadataString(metadata, 'eventId'),
          metadataExhibitorId: metadataString(metadata, 'exhibitorId'),
          billingPatch: {
            ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
            ...(customerId ? { stripeCustomerId: customerId } : {}),
          },
          suspend: null,
          payment: null,
          oneTimeOnly: false,
        };
      }
      if (object.mode === 'payment') {
        // 一括払い。支払いが確定（paid）していたら支払い済みにし、
        // 支払い記録も残す。未確定（非同期決済の保留など）は ID の
        // 紐づけだけを行い、状態は動かさない。
        const paymentIntentId = stringOrNull(object.payment_intent);
        const isPaid =
          object.payment_status === 'paid' ||
          object.payment_status === 'no_payment_required';
        return {
          subscriptionId: null,
          customerId,
          paymentIntentId,
          metadataEventId: metadataString(metadata, 'eventId'),
          metadataExhibitorId: metadataString(metadata, 'exhibitorId'),
          billingPatch: {
            ...(customerId ? { stripeCustomerId: customerId } : {}),
            ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
            ...(isPaid ? { status: 'paid' as ShopBillingStatus } : {}),
          },
          suspend: isPaid ? false : null,
          payment: isPaid
            ? {
                amount: numberOrZero(object.amount_total),
                status: 'paid',
                invoiceId: null,
                paidAt: occurredAt,
              }
            : null,
          oneTimeOnly: false,
        };
      }
      return null;
    }
    case 'charge.refunded': {
      // 全額返金だけを対象にする（部分返金では掲載を止めない）。
      // 返金で掲載を止めるのは一括払いだけ（適用側で形態を確認する）。
      if (object.refunded !== true) return null;
      const metadata = asRecord(object.metadata);
      return {
        subscriptionId: null,
        customerId: customerIdOf(object.customer),
        paymentIntentId: stringOrNull(object.payment_intent),
        metadataEventId: metadataString(metadata, 'eventId'),
        metadataExhibitorId: metadataString(metadata, 'exhibitorId'),
        billingPatch: { status: 'suspended' },
        suspend: true,
        payment: null,
        oneTimeOnly: true,
      };
    }
    case 'invoice.paid': {
      const metadata = metadataFromInvoice(object);
      return {
        subscriptionId: subscriptionIdFromInvoice(object),
        customerId: customerIdOf(object.customer),
        paymentIntentId: null,
        metadataEventId: metadataString(metadata, 'eventId'),
        metadataExhibitorId: metadataString(metadata, 'exhibitorId'),
        billingPatch: {
          status: 'active',
          currentPeriodEnd: periodEndFromInvoice(object),
        },
        suspend: false,
        payment: {
          amount: numberOrZero(object.amount_paid),
          status: 'paid',
          invoiceId: stringOrNull(object.id),
          paidAt:
            unixToIso(asRecord(object.status_transitions)?.paid_at) ??
            occurredAt,
        },
        oneTimeOnly: false,
      };
    }
    case 'invoice.payment_failed': {
      const metadata = metadataFromInvoice(object);
      return {
        subscriptionId: subscriptionIdFromInvoice(object),
        customerId: customerIdOf(object.customer),
        paymentIntentId: null,
        metadataEventId: metadataString(metadata, 'eventId'),
        metadataExhibitorId: metadataString(metadata, 'exhibitorId'),
        // Stripe のリトライを尊重し、この時点では停止しない。
        billingPatch: { status: 'past_due' },
        suspend: null,
        payment: {
          amount: numberOrZero(object.amount_due),
          status: 'failed',
          invoiceId: stringOrNull(object.id),
          paidAt: null,
        },
        oneTimeOnly: false,
      };
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const transition = shopBillingTransitionForSubscriptionStatus(object.status);
      if (!transition) return null;
      const metadata = asRecord(object.metadata);
      return {
        subscriptionId: stringOrNull(object.id),
        customerId: customerIdOf(object.customer),
        paymentIntentId: null,
        metadataEventId: metadataString(metadata, 'eventId'),
        metadataExhibitorId: metadataString(metadata, 'exhibitorId'),
        billingPatch: {
          status: transition.status,
          currentPeriodEnd: periodEndFromSubscription(object),
        },
        suspend: transition.suspend,
        payment: null,
        oneTimeOnly: false,
      };
    }
    case 'customer.subscription.deleted': {
      const metadata = asRecord(object.metadata);
      return {
        subscriptionId: stringOrNull(object.id),
        customerId: customerIdOf(object.customer),
        paymentIntentId: null,
        metadataEventId: metadataString(metadata, 'eventId'),
        metadataExhibitorId: metadataString(metadata, 'exhibitorId'),
        billingPatch: { status: 'canceled', currentPeriodEnd: null },
        suspend: true,
        payment: null,
        oneTimeOnly: false,
      };
    }
    default:
      return null;
  }
}

// ─── Stripe クライアント ───

/** 主催者の保存キーから Stripe クライアントを作る。 */
export function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey);
}

/**
 * Webhook の署名検証。生ボディと stripe-signature ヘッダで検証し、
 * 不正なら throw する（呼び出し側が 400 を返す）。
 */
export function verifyStripeWebhookEvent(
  secretKey: string,
  webhookSecret: string,
  rawBody: string,
  signature: string,
): Stripe.Event {
  return createStripeClient(secretKey).webhooks.constructEvent(
    rawBody,
    signature,
    webhookSecret,
  );
}

// ─── Firestore: Stripe 設定（サーバー専用） ───

function stripeSettingsRef(db: Firestore, contractId: string) {
  return db
    .collection('organizers')
    .doc(contractId)
    .collection(BILLING_SETTINGS_SUBCOLLECTION)
    .doc(BILLING_SETTINGS_DOC_ID);
}

/**
 * 保存済みの Stripe 設定を読む。キーと Webhook シークレットの両方が
 * 揃っていなければ null（未完了）。返す値はサーバー内でのみ使うこと。
 */
export async function getStripeBillingSettings(
  db: Firestore,
  contractId: string,
): Promise<StripeBillingSettings | null> {
  const snap = await stripeSettingsRef(db, contractId).get();
  if (!snap.exists) return null;
  const secretKey = snap.data()?.secretKey;
  const webhookSecret = snap.data()?.webhookSecret;
  if (typeof secretKey !== 'string' || !secretKey) return null;
  if (typeof webhookSecret !== 'string' || !webhookSecret) return null;
  return { secretKey, webhookSecret };
}

/** 設定の保存状態だけを読む（値は返さない）。 */
export async function getStripeBillingSettingsState(
  db: Firestore,
  contractId: string,
): Promise<StripeBillingSettingsState> {
  const snap = await stripeSettingsRef(db, contractId).get();
  const data = snap.data() ?? {};
  return {
    secretKeyConfigured:
      typeof data.secretKey === 'string' && data.secretKey.length > 0,
    webhookSecretConfigured:
      typeof data.webhookSecret === 'string' && data.webhookSecret.length > 0,
  };
}

/** 設定を保存する（渡された項目だけを上書き）。 */
export async function saveStripeBillingSettings(
  db: Firestore,
  contractId: string,
  patch: { secretKey?: string; webhookSecret?: string },
): Promise<void> {
  await stripeSettingsRef(db, contractId).set(
    { ...patch, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

// ─── Firestore: 出店者ごとの課金レコード ───

function shopBillingRef(db: Firestore, eventId: string, exhibitorId: string) {
  return db
    .collection('events')
    .doc(eventId)
    .collection(SHOP_BILLINGS_COLLECTION)
    .doc(exhibitorId);
}

function shopBillingsRef(db: Firestore, eventId: string) {
  return db.collection('events').doc(eventId).collection(SHOP_BILLINGS_COLLECTION);
}

function parseShopBillingStatus(value: unknown): ShopBillingStatus {
  return value === 'active' ||
    value === 'paid' ||
    value === 'past_due' ||
    value === 'suspended' ||
    value === 'canceled'
    ? value
    : 'none';
}

function toShopBilling(
  exhibitorId: string,
  data: FirebaseFirestore.DocumentData,
): ShopBilling {
  return {
    exhibitorId,
    billingType: data.billingType === 'one-time' ? 'one-time' : 'subscription',
    stripeCustomerId: stringOrNull(data.stripeCustomerId),
    stripeSubscriptionId: stringOrNull(data.stripeSubscriptionId),
    stripePaymentIntentId: stringOrNull(data.stripePaymentIntentId),
    amount:
      typeof data.amount === 'number'
        ? data.amount
        : typeof data.monthlyAmount === 'number'
          ? data.monthlyAmount
          : 0,
    status: parseShopBillingStatus(data.status),
    currentPeriodEnd: stringOrNull(data.currentPeriodEnd),
    checkoutUrl: stringOrNull(data.checkoutUrl),
    checkoutSessionId: stringOrNull(data.checkoutSessionId),
    canceledByAdmin: data.canceledByAdmin === true,
    updatedAt:
      typeof data.updatedAt === 'string'
        ? data.updatedAt
        : (data.updatedAt?.toDate?.().toISOString() ?? ''),
  };
}

export async function getShopBilling(
  db: Firestore,
  eventId: string,
  exhibitorId: string,
): Promise<ShopBilling | null> {
  const snap = await shopBillingRef(db, eventId, exhibitorId).get();
  if (!snap.exists) return null;
  return toShopBilling(exhibitorId, snap.data()!);
}

export async function listShopBillings(
  db: Firestore,
  eventId: string,
): Promise<ShopBilling[]> {
  const snap = await shopBillingsRef(db, eventId).get();
  return snap.docs.map((doc) => toShopBilling(doc.id, doc.data()));
}

async function writeShopBilling(
  db: Firestore,
  eventId: string,
  exhibitorId: string,
  fields: Record<string, unknown>,
): Promise<ShopBilling> {
  await shopBillingRef(db, eventId, exhibitorId).set(
    { ...fields, updatedAt: new Date().toISOString() },
    { merge: true },
  );
  const billing = await getShopBilling(db, eventId, exhibitorId);
  return billing!;
}

// ─── Firestore: 支払い記録 ───

export async function listBillingPayments(
  db: Firestore,
  eventId: string,
  limit = 50,
): Promise<BillingPaymentRecord[]> {
  const snap = await db
    .collection('events')
    .doc(eventId)
    .collection(BILLING_PAYMENTS_COLLECTION)
    .orderBy('occurredAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      exhibitorId: String(data.exhibitorId ?? ''),
      amount: typeof data.amount === 'number' ? data.amount : 0,
      status: data.status === 'failed' ? ('failed' as const) : ('paid' as const),
      paidAt: stringOrNull(data.paidAt),
      occurredAt: typeof data.occurredAt === 'string' ? data.occurredAt : '',
      stripeEventId: String(data.stripeEventId ?? doc.id),
      stripeInvoiceId: stringOrNull(data.stripeInvoiceId),
    };
  });
}

// ─── オプション有効な契約者の解決 ───

/**
 * ログイン中の主催者（ownerUid）から、出店者課金オプションが有効な
 * 契約者レコードを引く。契約者でない／オプション OFF なら null。
 * API 側は null のとき 404 にして機能の存在自体を隠す。
 */
export async function findEnabledBillingOrganizer(
  ownerUid: string,
): Promise<Organizer | null> {
  const organizer = await findOrganizerByOwnerUid(ownerUid);
  if (!organizer || !organizer.billingOptionEnabled) return null;
  return organizer;
}

// ─── 課金の開始（Checkout セッション発行） ───

export interface StartShopBillingInput {
  contractId: string;
  eventId: string;
  exhibitorId: string;
  exhibitorName: string;
  /** 金額（円）。subscription では月額 */
  amount: number;
  billingType: ShopBillingType;
}

export type StartShopBillingResult =
  | { ok: true; billing: ShopBilling; checkoutUrl: string }
  | { ok: false; status: number; error: string };

/**
 * 出店者の課金を始める: Stripe 顧客（無ければ作成）＋金額を直接指定して
 * Checkout セッションを発行し、出店者に渡す支払い URL を返す。
 * - subscription: subscription モード。サブスクリプション自体は出店者が
 *   Checkout で支払いを完了した時点で Stripe 側に作られ、Webhook で紐づく。
 * - one-time: payment モード。繰り返し請求はなく、完了時に Webhook で
 *   支払い済みになる。PaymentIntent にも metadata を付け、返金時の
 *   突合（charge.refunded → payment_intent）に使う。
 * 既存の Checkout 未完了セッションがある場合は新しいセッションを
 * 発行し直す（古い URL は失効する）。
 */
export async function startShopBilling(
  db: Firestore,
  input: StartShopBillingInput,
): Promise<StartShopBillingResult> {
  const settings = await getStripeBillingSettings(db, input.contractId);
  if (!settings) {
    return {
      ok: false,
      status: 400,
      error: 'Stripe設定が未完了です。先にAPIキーとWebhookシークレットを保存してください',
    };
  }
  const stripe = createStripeClient(settings.secretKey);
  const existing = await getShopBilling(db, input.eventId, input.exhibitorId);

  let customerId = existing?.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: input.exhibitorName,
      metadata: {
        contractId: input.contractId,
        eventId: input.eventId,
        exhibitorId: input.exhibitorId,
      },
    });
    customerId = customer.id;
  }

  const metadata = {
    contractId: input.contractId,
    eventId: input.eventId,
    exhibitorId: input.exhibitorId,
  };
  const origin = resolveAppOrigin();
  const successUrl = `${origin}/event-admin/${input.eventId}/billing?checkout=success`;
  const cancelUrl = `${origin}/event-admin/${input.eventId}/billing?checkout=canceled`;

  const session =
    input.billingType === 'subscription'
      ? await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: customerId,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: 'jpy',
                unit_amount: input.amount,
                recurring: { interval: 'month' },
                product_data: { name: 'Push-taro EVENT 出店者 月額料金' },
              },
            },
          ],
          metadata,
          subscription_data: { metadata },
          success_url: successUrl,
          cancel_url: cancelUrl,
        })
      : await stripe.checkout.sessions.create({
          mode: 'payment',
          customer: customerId,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: 'jpy',
                unit_amount: input.amount,
                product_data: { name: 'Push-taro EVENT 出店者 料金' },
              },
            },
          ],
          metadata,
          payment_intent_data: { metadata },
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
  if (!session.url) {
    return {
      ok: false,
      status: 502,
      error: '支払いページの発行に失敗しました',
    };
  }

  const billing = await writeShopBilling(db, input.eventId, input.exhibitorId, {
    billingType: input.billingType,
    amount: input.amount,
    stripeCustomerId: customerId,
    checkoutSessionId: session.id,
    checkoutUrl: session.url,
    // 一括の再発行では、旧い支払いの PaymentIntent を突合対象から外す
    // （返金の突合は新しい支払いが完了した時点で Webhook が付け直す）。
    ...(input.billingType === 'one-time' ? { stripePaymentIntentId: null } : {}),
    status:
      existing && existing.status !== 'canceled' ? existing.status : 'none',
    canceledByAdmin: false,
  });
  return { ok: true, billing, checkoutUrl: session.url };
}

// ─── 解約（月額サブスクのみ） ───

export type CancelShopBillingResult =
  | { ok: true; billing: ShopBilling }
  | { ok: false; status: number; error: string };

/**
 * 出店者の課金を解約する。先に canceledByAdmin を立ててから Stripe 側を
 * 止める（Webhook の customer.subscription.deleted が届いても、
 * 主催者の操作による解約では掲載停止にしないため）。
 * 主催者の解約では掲載は止めない（未払い確定による停止とは扱いが違う）。
 * 一括払いには解約操作はない（返金は Stripe 管理画面側の操作）。
 */
export async function cancelShopBilling(
  db: Firestore,
  contractId: string,
  eventId: string,
  exhibitorId: string,
): Promise<CancelShopBillingResult> {
  const existing = await getShopBilling(db, eventId, exhibitorId);
  if (!existing) {
    return { ok: false, status: 404, error: '課金が見つかりません' };
  }
  if (existing.billingType === 'one-time') {
    return {
      ok: false,
      status: 400,
      error: '一括払いの課金は解約できません。返金はStripeの管理画面で行ってください',
    };
  }
  await writeShopBilling(db, eventId, exhibitorId, { canceledByAdmin: true });

  if (existing.stripeSubscriptionId) {
    const settings = await getStripeBillingSettings(db, contractId);
    if (!settings) {
      return {
        ok: false,
        status: 400,
        error: 'Stripe設定が未完了です。先にAPIキーとWebhookシークレットを保存してください',
      };
    }
    try {
      await createStripeClient(settings.secretKey).subscriptions.cancel(
        existing.stripeSubscriptionId,
      );
    } catch (error) {
      // 既に Stripe 側で解約済みの場合は成功扱いにする。
      const code = (error as { code?: string })?.code;
      if (code !== 'resource_missing') {
        return {
          ok: false,
          status: 502,
          error: 'Stripe側の解約に失敗しました。時間をおいて再度お試しください',
        };
      }
    }
  }

  const billing = await writeShopBilling(db, eventId, exhibitorId, {
    status: 'canceled',
    checkoutUrl: null,
    checkoutSessionId: null,
  });
  return { ok: true, billing };
}

// ─── イベント終了時の自動解約 ───

/**
 * 終了処理で自動解約の対象になる課金を選ぶ（純粋関数・テスト対象）。
 * 対象は「そのイベントの・月額サブスクで・サブスクリプションが存在し・
 * まだ解約されていない」ものだけ。一括払いには何もしない。
 */
export function finalizationCancelTargets(
  billings: ShopBilling[],
): ShopBilling[] {
  return billings.filter(
    (billing) =>
      billing.billingType === 'subscription' &&
      billing.stripeSubscriptionId !== null &&
      billing.status !== 'canceled',
  );
}

export interface CancelEventSubscriptionsResult {
  canceledCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * イベント終了処理用: そのイベントの有効なサブスクリプションを、
 * 主催者の Stripe キーで全て解約する。対象はそのイベントの分だけ
 * （他イベントのサブスクリプションには触らない）。
 * ベストエフォート: 個別の失敗は errors に記録して続行する
 * （呼び出し側＝終了処理自体は止めない）。
 */
export async function cancelEventSubscriptionsForFinalization(
  db: Firestore,
  contractId: string,
  eventId: string,
): Promise<CancelEventSubscriptionsResult> {
  const billings = await listShopBillings(db, eventId);
  const targets = finalizationCancelTargets(billings);
  if (targets.length === 0) {
    return { canceledCount: 0, failedCount: 0, errors: [] };
  }
  const settings = await getStripeBillingSettings(db, contractId);
  if (!settings) {
    return {
      canceledCount: 0,
      failedCount: targets.length,
      errors: ['Stripe設定が未完了のため、自動解約できませんでした'],
    };
  }
  const stripe = createStripeClient(settings.secretKey);
  let canceledCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  for (const target of targets) {
    try {
      await stripe.subscriptions.cancel(target.stripeSubscriptionId!);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code !== 'resource_missing') {
        failedCount += 1;
        errors.push(
          `${target.exhibitorId}: ${error instanceof Error ? error.message : String(error)}`,
        );
        continue;
      }
      // 既に Stripe 側で解約済みなら成功扱い。
    }
    // 終了処理による解約は主催者側の操作として記録する
    // （後着の subscription.deleted で未払い扱いの停止にしない）。
    await writeShopBilling(db, eventId, target.exhibitorId, {
      status: 'canceled',
      canceledByAdmin: true,
      checkoutUrl: null,
      checkoutSessionId: null,
    });
    canceledCount += 1;
  }
  return { canceledCount, failedCount, errors };
}

// ─── Webhook の適用 ───

async function findShopBillingByStripeIds(
  db: Firestore,
  eventIds: string[],
  ids: {
    subscriptionId: string | null;
    customerId: string | null;
    paymentIntentId: string | null;
  },
  options: { skipCustomerMatch: boolean },
): Promise<{ eventId: string; billing: ShopBilling } | null> {
  const fields: Array<{
    field: 'stripeSubscriptionId' | 'stripePaymentIntentId' | 'stripeCustomerId';
    value: string | null;
  }> = [
    { field: 'stripeSubscriptionId', value: ids.subscriptionId },
    { field: 'stripePaymentIntentId', value: ids.paymentIntentId },
    ...(options.skipCustomerMatch
      ? []
      : [{ field: 'stripeCustomerId' as const, value: ids.customerId }]),
  ];
  for (const eventId of eventIds) {
    for (const { field, value } of fields) {
      if (!value) continue;
      const snap = await shopBillingsRef(db, eventId)
        .where(field, '==', value)
        .limit(1)
        .get();
      if (!snap.empty) {
        return { eventId, billing: toShopBilling(snap.docs[0].id, snap.docs[0].data()) };
      }
    }
  }
  return null;
}

function isAlreadyExistsError(error: unknown): boolean {
  const code = (error as { code?: unknown })?.code;
  return code === 6 || code === 'already-exists' || code === 'ALREADY_EXISTS';
}

export interface ApplyStripeWebhookResult {
  applied: boolean;
  duplicate: boolean;
}

/**
 * 署名検証済みの Webhook イベントをローカル記録へ反映する。
 * - 対象の特定: metadata の所属を優先し、無ければ契約者の全イベント
 *   から Stripe の顧客／サブスクリプション／PaymentIntent ID で引く。
 *   返金（oneTimeOnly）は顧客IDでの突合をしない（別の一括払いを
 *   誤って止めないため、PaymentIntent の突合だけを使う）。
 * - 冪等性: 支払い記録は Stripe イベントIDをドキュメントIDにして
 *   create するため、同じイベントの再送では二重に記録・適用しない。
 * - 主催者が解約操作をしたサブスクリプションの canceled では、
 *   掲載停止にしない（未払い確定による終了と区別する）。
 */
export async function applyStripeWebhookEffect(
  db: Firestore,
  contractId: string,
  event: StripeWebhookEventLike,
): Promise<ApplyStripeWebhookResult> {
  const effect = effectFromStripeEvent(event);
  if (!effect) return { applied: false, duplicate: false };
  const occurredAt = unixToIso(event.created) ?? new Date().toISOString();

  let target: { eventId: string; billing: ShopBilling } | null = null;
  if (effect.metadataEventId && effect.metadataExhibitorId) {
    const billing = await getShopBilling(
      db,
      effect.metadataEventId,
      effect.metadataExhibitorId,
    );
    if (billing) target = { eventId: effect.metadataEventId, billing };
  }
  if (!target) {
    const organizer = await getOrganizer(contractId);
    if (organizer?.ownerUid) {
      const events = await listEventsByOwner(organizer.ownerUid);
      const found = await findShopBillingByStripeIds(
        db,
        events.map((e) => e.id),
        {
          subscriptionId: effect.subscriptionId,
          customerId: effect.customerId,
          paymentIntentId: effect.paymentIntentId,
        },
        { skipCustomerMatch: effect.oneTimeOnly },
      );
      if (found) target = { eventId: found.eventId, billing: found.billing };
    }
  }
  if (!target) return { applied: false, duplicate: false };
  const { eventId, billing } = target;
  const exhibitorId = billing.exhibitorId;

  // 返金の掲載停止は一括払いの課金にだけ適用する
  // （月額サブスクの支払い返金では止めない）。
  if (effect.oneTimeOnly && billing.billingType !== 'one-time') {
    return { applied: false, duplicate: false };
  }

  if (effect.payment) {
    const ref = db
      .collection('events')
      .doc(eventId)
      .collection(BILLING_PAYMENTS_COLLECTION)
      .doc(event.id);
    try {
      await ref.create({
        exhibitorId,
        amount: effect.payment.amount,
        status: effect.payment.status,
        paidAt: effect.payment.paidAt,
        occurredAt,
        stripeEventId: event.id,
        stripeInvoiceId: effect.payment.invoiceId,
      });
    } catch (error) {
      if (isAlreadyExistsError(error)) {
        return { applied: false, duplicate: true };
      }
      throw error;
    }
  }

  let suspend = effect.suspend;
  if (effect.billingPatch.status === 'canceled' && billing.canceledByAdmin) {
    suspend = null;
  }

  await writeShopBilling(db, eventId, exhibitorId, {
    ...effect.billingPatch,
  });
  if (suspend !== null) {
    await setExhibitorBillingSuspended(eventId, exhibitorId, suspend);
  }
  return { applied: true, duplicate: false };
}
