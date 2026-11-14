// lib/event-billing-apply.test.ts
// 出店者課金の副作用まわり: Webhook 効果の反映（対象特定・冪等・
// 掲載停止の切り替え）、Checkout 発行、イベント終了時の自動解約
// （対象はそのイベントの月額サブスクだけ・ベストエフォート）を
// フェイク Firestore とモック Stripe で検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Firestore } from 'firebase-admin/firestore';

const mocks = vi.hoisted(() => ({
  getOrganizer: vi.fn(),
  findOrganizerByOwnerUid: vi.fn(),
  listEventsByOwner: vi.fn(),
  setExhibitorBillingSuspended: vi.fn(),
  stripeCustomersCreate: vi.fn(),
  stripeSessionsCreate: vi.fn(),
  stripeSubscriptionsCancel: vi.fn(),
}));

vi.mock('./organizers', () => ({
  getOrganizer: mocks.getOrganizer,
  findOrganizerByOwnerUid: mocks.findOrganizerByOwnerUid,
}));

vi.mock('./event-store', () => ({
  listEventsByOwner: mocks.listEventsByOwner,
}));

vi.mock('./event-coupon', () => ({
  setExhibitorBillingSuspended: mocks.setExhibitorBillingSuspended,
}));

vi.mock('stripe', () => {
  class FakeStripe {
    customers = { create: mocks.stripeCustomersCreate };
    checkout = { sessions: { create: mocks.stripeSessionsCreate } };
    subscriptions = { cancel: mocks.stripeSubscriptionsCancel };
    webhooks = { constructEvent: vi.fn() };
  }
  return { default: FakeStripe };
});

const {
  applyStripeWebhookEffect,
  cancelEventSubscriptionsForFinalization,
  getShopBilling,
  saveStripeBillingSettings,
  startShopBilling,
} = await import('./event-billing');
type StripeWebhookEventLike = import('./event-billing').StripeWebhookEventLike;

// ---- フェイク Firestore（参照チェーンつき） ----
interface DocEntry {
  data: Record<string, unknown>;
}

function createFakeDb(seed: Record<string, Record<string, unknown>> = {}) {
  const store = new Map<string, DocEntry>(
    Object.entries(seed).map(([path, data]) => [path, { data: { ...data } }]),
  );

  function docRef(path: string): {
    id: string;
    path: string;
    get: () => Promise<{ exists: boolean; id: string; data: () => Record<string, unknown> | undefined }>;
    set: (data: Record<string, unknown>, opts?: { merge?: boolean }) => Promise<void>;
    create: (data: Record<string, unknown>) => Promise<void>;
    collection: (name: string) => ReturnType<typeof collectionRef>;
  } {
    const id = path.split('/').pop() ?? path;
    return {
      id,
      path,
      get: async () => {
        const entry = store.get(path);
        return {
          exists: Boolean(entry),
          id,
          data: () => (entry ? { ...entry.data } : undefined),
        };
      },
      set: async (data, opts) => {
        const existing = store.get(path)?.data ?? {};
        store.set(path, {
          data: opts?.merge ? { ...existing, ...data } : { ...data },
        });
      },
      create: async (data) => {
        if (store.has(path)) {
          const error = new Error('already exists') as Error & { code?: number };
          error.code = 6;
          throw error;
        }
        store.set(path, { data: { ...data } });
      },
      collection: (name: string) => collectionRef(`${path}/${name}`),
    };
  }

  function collectionRef(path: string): {
    doc: (id: string) => ReturnType<typeof docRef>;
    get: () => Promise<{ docs: { id: string; data: () => Record<string, unknown> }[] }>;
    where: (
      field: string,
      op: string,
      value: unknown,
    ) => {
      limit: (n: number) => { get: () => Promise<{ docs: { id: string; data: () => Record<string, unknown> }[] }> };
      get: () => Promise<{ docs: { id: string; data: () => Record<string, unknown> }[] }>;
    };
    orderBy: () => { limit: (n: number) => { get: () => Promise<{ docs: { id: string; data: () => Record<string, unknown> }[] }> } };
  } {
    const query = async (
      predicate: (data: Record<string, unknown>) => boolean = () => true,
      limitCount?: number,
    ) => {
      const prefix = `${path}/`;
      const docs: { id: string; data: () => Record<string, unknown> }[] = [];
      for (const [docPath, entry] of store) {
        if (!docPath.startsWith(prefix)) continue;
        const rest = docPath.slice(prefix.length);
        if (rest.includes('/')) continue;
        if (!predicate(entry.data)) continue;
        docs.push({ id: rest, data: () => ({ ...entry.data }) });
      }
      return { docs: limitCount ? docs.slice(0, limitCount) : docs };
    };
    return {
      doc: (id: string) => docRef(`${path}/${id}`),
      get: () => query(),
      where: (field, _op, value) => ({
        limit: (n: number) => ({
          get: () => query((data) => data[field] === value, n),
        }),
        get: () => query((data) => data[field] === value),
      }),
      orderBy: () => ({
        limit: (n: number) => ({ get: () => query(() => true, n) }),
      }),
    };
  }

  const db = {
    collection: (name: string) => collectionRef(name),
  };
  return { db: db as unknown as Firestore, store };
}

function billingSeed(overrides: Record<string, unknown> = {}) {
  return {
    exhibitorId: 'shop-1',
    billingType: 'subscription',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1',
    stripePaymentIntentId: null,
    amount: 3000,
    status: 'active',
    currentPeriodEnd: null,
    checkoutUrl: null,
    checkoutSessionId: null,
    canceledByAdmin: false,
    updatedAt: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}

function stripeEvent(
  type: string,
  object: Record<string, unknown>,
  id = `evt_${type}_${Math.random().toString(36).slice(2, 8)}`,
): StripeWebhookEventLike {
  return { id, type, created: 1_762_000_000, data: { object } };
}

const BILLING_PATH = 'events/event-1/shopBillings/shop-1';
const SETTINGS_PATH = 'organizers/contract-1/billing/stripe';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.setExhibitorBillingSuspended.mockResolvedValue(undefined);
  mocks.getOrganizer.mockResolvedValue({ contractId: 'contract-1', ownerUid: 'owner-1' });
  mocks.listEventsByOwner.mockResolvedValue([{ id: 'event-1' }, { id: 'event-2' }]);
});

describe('applyStripeWebhookEffect: 一括払い', () => {
  it('checkout.session.completed（paid）で paid 化し支払いを記録、重複は冪等', async () => {
    const { db, store } = createFakeDb({
      [BILLING_PATH]: billingSeed({
        billingType: 'one-time',
        stripeSubscriptionId: null,
        status: 'none',
      }),
    });
    const event = stripeEvent('checkout.session.completed', {
      mode: 'payment',
      payment_status: 'paid',
      amount_total: 8000,
      payment_intent: 'pi_1',
      customer: 'cus_1',
      metadata: { eventId: 'event-1', exhibitorId: 'shop-1' },
    });

    const first = await applyStripeWebhookEffect(db, 'contract-1', event);
    expect(first.applied).toBe(true);
    expect(store.get(BILLING_PATH)?.data.status).toBe('paid');
    expect(store.get(BILLING_PATH)?.data.stripePaymentIntentId).toBe('pi_1');
    expect(store.get(`events/event-1/billingPayments/${event.id}`)?.data).toMatchObject({
      amount: 8000,
      status: 'paid',
    });
    expect(mocks.setExhibitorBillingSuspended).toHaveBeenCalledWith(
      'event-1',
      'shop-1',
      false,
    );

    const second = await applyStripeWebhookEffect(db, 'contract-1', event);
    expect(second).toEqual({ applied: false, duplicate: true });
    expect(mocks.setExhibitorBillingSuspended).toHaveBeenCalledTimes(1);
  });

  it('charge.refunded（全額）で PaymentIntent から対象を特定し掲載を止める', async () => {
    const { db, store } = createFakeDb({
      [BILLING_PATH]: billingSeed({
        billingType: 'one-time',
        stripeSubscriptionId: null,
        stripePaymentIntentId: 'pi_1',
        status: 'paid',
      }),
    });
    const event = stripeEvent('charge.refunded', {
      id: 'ch_1',
      payment_intent: 'pi_1',
      customer: 'cus_1',
      refunded: true,
      amount: 8000,
      amount_refunded: 8000,
    });
    const result = await applyStripeWebhookEffect(db, 'contract-1', event);
    expect(result).toEqual({ applied: true, duplicate: false });
    expect(store.get(BILLING_PATH)?.data.status).toBe('suspended');
    expect(mocks.setExhibitorBillingSuspended).toHaveBeenCalledWith(
      'event-1',
      'shop-1',
      true,
    );
  });

  it('charge.refunded が月額課金に一致しても止めない（一括限定）', async () => {
    const { db, store } = createFakeDb({
      [BILLING_PATH]: billingSeed({
        stripePaymentIntentId: 'pi_9',
        status: 'active',
      }),
    });
    const event = stripeEvent('charge.refunded', {
      id: 'ch_9',
      payment_intent: 'pi_9',
      customer: 'cus_1',
      refunded: true,
      amount: 3000,
      amount_refunded: 3000,
    });
    const result = await applyStripeWebhookEffect(db, 'contract-1', event);
    expect(result.applied).toBe(false);
    expect(store.get(BILLING_PATH)?.data.status).toBe('active');
    expect(mocks.setExhibitorBillingSuspended).not.toHaveBeenCalled();
  });
});

describe('applyStripeWebhookEffect: 月額サブスク', () => {
  it('unpaid への遷移で掲載を止める', async () => {
    const { db, store } = createFakeDb({ [BILLING_PATH]: billingSeed() });
    const event = stripeEvent('customer.subscription.updated', {
      id: 'sub_1',
      customer: 'cus_1',
      status: 'unpaid',
      metadata: { eventId: 'event-1', exhibitorId: 'shop-1' },
    });
    const result = await applyStripeWebhookEffect(db, 'contract-1', event);
    expect(result.applied).toBe(true);
    expect(store.get(BILLING_PATH)?.data.status).toBe('suspended');
    expect(mocks.setExhibitorBillingSuspended).toHaveBeenCalledWith(
      'event-1',
      'shop-1',
      true,
    );
  });

  it('管理人による解約（canceledByAdmin）では subscription.deleted で掲載を止めない', async () => {
    const { db } = createFakeDb({
      [BILLING_PATH]: billingSeed({ canceledByAdmin: true }),
    });
    const event = stripeEvent('customer.subscription.deleted', {
      id: 'sub_1',
      customer: 'cus_1',
      status: 'canceled',
      metadata: { eventId: 'event-1', exhibitorId: 'shop-1' },
    });
    const result = await applyStripeWebhookEffect(db, 'contract-1', event);
    expect(result.applied).toBe(true);
    expect(mocks.setExhibitorBillingSuspended).not.toHaveBeenCalled();
  });

  it('invoice.paid で復旧（掲載再開）する', async () => {
    const { db, store } = createFakeDb({
      [BILLING_PATH]: billingSeed({ status: 'suspended' }),
    });
    const event = stripeEvent('invoice.paid', {
      id: 'in_1',
      subscription: 'sub_1',
      customer: 'cus_1',
      amount_paid: 3000,
    });
    const result = await applyStripeWebhookEffect(db, 'contract-1', event);
    expect(result.applied).toBe(true);
    expect(store.get(BILLING_PATH)?.data.status).toBe('active');
    expect(mocks.setExhibitorBillingSuspended).toHaveBeenCalledWith(
      'event-1',
      'shop-1',
      false,
    );
  });
});

describe('startShopBilling（Checkout 発行）', () => {
  it('一括: mode=payment で金額を指定し、payment_intent に metadata を載せる', async () => {
    const { db, store } = createFakeDb();
    mocks.stripeCustomersCreate.mockResolvedValue({ id: 'cus_new' });
    mocks.stripeSessionsCreate.mockResolvedValue({
      id: 'cs_1',
      url: 'https://checkout.stripe.com/pay/cs_1',
    });
    await saveStripeBillingSettings(db, 'contract-1', {
      secretKey: 'sk_live_abcdefghijklmnop',
      webhookSecret: 'whsec_abcdefghijklmnop',
    });

    const result = await startShopBilling(db, {
      contractId: 'contract-1',
      eventId: 'event-1',
      exhibitorId: 'shop-1',
      exhibitorName: '出店者A',
      amount: 8000,
      billingType: 'one-time',
    });
    if (!result.ok) throw new Error(`発行に失敗: ${result.error}`);
    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_1');
    const params = mocks.stripeSessionsCreate.mock.calls[0][0];
    expect(params.mode).toBe('payment');
    expect(params.line_items[0].price_data.unit_amount).toBe(8000);
    expect(params.line_items[0].price_data.recurring).toBeUndefined();
    expect(params.payment_intent_data.metadata).toMatchObject({
      eventId: 'event-1',
      exhibitorId: 'shop-1',
    });
    const billing = store.get(BILLING_PATH)?.data;
    expect(billing).toMatchObject({
      billingType: 'one-time',
      amount: 8000,
      status: 'none',
      stripePaymentIntentId: null,
    });
  });

  it('月額: mode=subscription で recurring を指定する', async () => {
    const { db, store } = createFakeDb();
    mocks.stripeCustomersCreate.mockResolvedValue({ id: 'cus_new' });
    mocks.stripeSessionsCreate.mockResolvedValue({
      id: 'cs_2',
      url: 'https://checkout.stripe.com/pay/cs_2',
    });
    await saveStripeBillingSettings(db, 'contract-1', {
      secretKey: 'sk_live_abcdefghijklmnop',
      webhookSecret: 'whsec_abcdefghijklmnop',
    });

    await startShopBilling(db, {
      contractId: 'contract-1',
      eventId: 'event-1',
      exhibitorId: 'shop-1',
      exhibitorName: '出店者A',
      amount: 3000,
      billingType: 'subscription',
    });
    const params = mocks.stripeSessionsCreate.mock.calls[0][0];
    expect(params.mode).toBe('subscription');
    expect(params.line_items[0].price_data.recurring).toEqual({ interval: 'month' });
    expect(params.subscription_data.metadata).toMatchObject({
      eventId: 'event-1',
      exhibitorId: 'shop-1',
    });
    expect(store.get(BILLING_PATH)?.data).toMatchObject({
      billingType: 'subscription',
      amount: 3000,
    });
  });
});

describe('cancelEventSubscriptionsForFinalization（終了時の自動解約）', () => {
  function seedAll() {
    return createFakeDb({
      [SETTINGS_PATH]: {
        secretKey: 'sk_live_abcdefghijklmnop',
        webhookSecret: 'whsec_abcdefghijklmnop',
      },
      'events/event-1/shopBillings/shop-1': billingSeed({ status: 'active' }),
      'events/event-1/shopBillings/shop-2': billingSeed({
        exhibitorId: 'shop-2',
        status: 'past_due',
        stripeSubscriptionId: 'sub_2',
        stripeCustomerId: 'cus_2',
      }),
      'events/event-1/shopBillings/shop-3': billingSeed({
        exhibitorId: 'shop-3',
        billingType: 'one-time',
        status: 'paid',
        stripeSubscriptionId: null,
        stripePaymentIntentId: 'pi_3',
        stripeCustomerId: 'cus_3',
      }),
      'events/event-1/shopBillings/shop-4': billingSeed({
        exhibitorId: 'shop-4',
        status: 'canceled',
        stripeSubscriptionId: 'sub_4',
        stripeCustomerId: 'cus_4',
      }),
      // 他イベント分: 一覧に出てこない（イベント単位でしか読まない）
      'events/event-2/shopBillings/shop-9': billingSeed({
        exhibitorId: 'shop-9',
        stripeSubscriptionId: 'sub_9',
      }),
    });
  }

  it('対象イベントの有効な月額サブスクだけを解約し、一括・解約済み・他イベントには触らない', async () => {
    const { db, store } = seedAll();
    mocks.stripeSubscriptionsCancel.mockResolvedValue({ id: 'sub_x', status: 'canceled' });

    const result = await cancelEventSubscriptionsForFinalization(
      db,
      'contract-1',
      'event-1',
    );
    expect(result).toEqual({ canceledCount: 2, failedCount: 0, errors: [] });
    const canceledIds = mocks.stripeSubscriptionsCancel.mock.calls
      .map((call) => call[0])
      .sort();
    expect(canceledIds).toEqual(['sub_1', 'sub_2']);
    expect(store.get('events/event-1/shopBillings/shop-1')?.data).toMatchObject({
      status: 'canceled',
      canceledByAdmin: true,
    });
    // 一括払いの記録はそのまま
    expect(store.get('events/event-1/shopBillings/shop-3')?.data.status).toBe('paid');
    // 他イベントは未変更
    expect(store.get('events/event-2/shopBillings/shop-9')?.data.status).toBe('active');
  });

  it('一部が失敗しても続行し、失敗件数と内容を返す（ベストエフォート）', async () => {
    const { db, store } = seedAll();
    mocks.stripeSubscriptionsCancel.mockImplementation((id: string) => {
      if (id === 'sub_2') return Promise.reject(new Error('boom'));
      return Promise.resolve({ id, status: 'canceled' });
    });

    const result = await cancelEventSubscriptionsForFinalization(
      db,
      'contract-1',
      'event-1',
    );
    expect(result.canceledCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.errors[0]).toContain('shop-2');
    expect(store.get('events/event-1/shopBillings/shop-2')?.data.status).toBe('past_due');
  });

  it('Stripe 未設定なら対象はすべて失敗として数える（例外は投げない）', async () => {
    const { db } = createFakeDb({
      'events/event-1/shopBillings/shop-1': billingSeed({ status: 'active' }),
    });
    const result = await cancelEventSubscriptionsForFinalization(
      db,
      'contract-1',
      'event-1',
    );
    expect(result.canceledCount).toBe(0);
    expect(result.failedCount).toBe(1);
    expect(mocks.stripeSubscriptionsCancel).not.toHaveBeenCalled();
  });

  it('対象が無ければ何もしない', async () => {
    const { db } = createFakeDb({
      [SETTINGS_PATH]: {
        secretKey: 'sk_live_abcdefghijklmnop',
        webhookSecret: 'whsec_abcdefghijklmnop',
      },
    });
    const result = await cancelEventSubscriptionsForFinalization(
      db,
      'contract-1',
      'event-1',
    );
    expect(result).toEqual({ canceledCount: 0, failedCount: 0, errors: [] });
  });

  it('getShopBilling は旧 monthlyAmount 形式の金額も読める', async () => {
    const { db } = createFakeDb({
      [BILLING_PATH]: {
        exhibitorId: 'shop-1',
        stripeCustomerId: 'cus_1',
        stripeSubscriptionId: 'sub_1',
        monthlyAmount: 2500,
        status: 'active',
      },
    });
    const billing = await getShopBilling(db, 'event-1', 'shop-1');
    expect(billing?.billingType).toBe('subscription');
    expect(billing?.amount).toBe(2500);
  });
});
