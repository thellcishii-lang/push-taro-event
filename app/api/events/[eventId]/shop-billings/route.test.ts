// app/api/events/[eventId]/shop-billings/route.test.ts
// 出店者課金の一覧 API: イベントの主催者だけが、出店者一覧・課金状態・
// 収支サマリ・支払い履歴を読めること、オプション OFF は 404 を検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireEventOwner: vi.fn(),
  listExhibitors: vi.fn(),
  findEnabledBillingOrganizer: vi.fn(),
  listShopBillings: vi.fn(),
  listBillingPayments: vi.fn(),
}));

vi.mock('@/lib/event-auth', () => ({
  requireEventOwner: mocks.requireEventOwner,
}));

vi.mock('@/lib/event-coupon', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-coupon')>();
  return { ...actual, listExhibitors: mocks.listExhibitors };
});

vi.mock('@/lib/firebase-admin', () => ({
  db: {},
}));

vi.mock('@/lib/event-billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-billing')>();
  return {
    ...actual,
    findEnabledBillingOrganizer: mocks.findEnabledBillingOrganizer,
    listShopBillings: mocks.listShopBillings,
    listBillingPayments: mocks.listBillingPayments,
  };
});

const { GET } = await import('./route');

function guardError(status: number) {
  return {
    error: new Response(JSON.stringify({ error: '権限がありません' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  };
}

function request() {
  return new Request('http://localhost/api/events/event-1/shop-billings', {
    headers: { Authorization: 'Bearer token' },
  });
}

function params() {
  return { params: Promise.resolve({ eventId: 'event-1' }) };
}

const NOW_ISO = new Date().toISOString();

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireEventOwner.mockResolvedValue({
    uid: 'owner-1',
    event: { id: 'event-1', ownerUid: 'owner-1' },
  });
  mocks.findEnabledBillingOrganizer.mockResolvedValue({
    contractId: 'contract-1',
    ownerUid: 'owner-1',
    billingOptionEnabled: true,
  });
  mocks.listExhibitors.mockResolvedValue([
    { id: 'shop-1', name: '出店者A', email: 'a@example.com', billingSuspended: false },
    { id: 'shop-2', name: '出店者B', email: 'b@example.com', billingSuspended: true },
  ]);
  mocks.listShopBillings.mockResolvedValue([
    {
      exhibitorId: 'shop-1',
      billingType: 'one-time',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: null,
      stripePaymentIntentId: 'pi_1',
      amount: 8000,
      status: 'paid',
      currentPeriodEnd: null,
      checkoutUrl: null,
      checkoutSessionId: null,
      canceledByAdmin: false,
      updatedAt: NOW_ISO,
    },
  ]);
  mocks.listBillingPayments.mockResolvedValue([
    {
      stripeEventId: 'evt_1',
      exhibitorId: 'shop-1',
      amount: 8000,
      status: 'paid',
      invoiceId: null,
      paidAt: NOW_ISO,
      occurredAt: NOW_ISO,
    },
  ]);
});

describe('GET /api/events/[eventId]/shop-billings', () => {
  it('未ログインはガードの 401 が返る', async () => {
    mocks.requireEventOwner.mockResolvedValue(guardError(401));
    const res = await GET(request(), params());
    expect(res.status).toBe(401);
  });

  it('他人のイベントはガードの 403 が返る', async () => {
    mocks.requireEventOwner.mockResolvedValue(guardError(403));
    const res = await GET(request(), params());
    expect(res.status).toBe(403);
  });

  it('オプション OFF の契約は 404', async () => {
    mocks.findEnabledBillingOrganizer.mockResolvedValue(null);
    const res = await GET(request(), params());
    expect(res.status).toBe(404);
    expect(mocks.listShopBillings).not.toHaveBeenCalled();
  });

  it('出店者一覧・課金状態・収支サマリ・履歴を返す', async () => {
    const res = await GET(request(), params());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.exhibitors).toEqual([
      { id: 'shop-1', name: '出店者A' },
      { id: 'shop-2', name: '出店者B' },
    ]);
    expect(body.billings).toHaveLength(1);
    expect(body.billings[0]).toMatchObject({
      exhibitorId: 'shop-1',
      status: 'paid',
      billingType: 'one-time',
      amount: 8000,
    });
    expect(body.summary.currentMonthTotal).toBe(8000);
    expect(body.payments).toHaveLength(1);
    expect(body.payments[0]).toMatchObject({ amount: 8000 });
  });
});
