// app/api/events/[eventId]/shop-billings/[exhibitorId]/route.test.ts
// 出店者課金の発行 API: イベントの主催者だけが、課金形態（月額 / 一括）
// を選んで発行できること、既存の有効な課金がある間は二重発行しない
// こと、オプション OFF は 404 を検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireEventOwner: vi.fn(),
  getExhibitor: vi.fn(),
  findEnabledBillingOrganizer: vi.fn(),
  getShopBilling: vi.fn(),
  startShopBilling: vi.fn(),
}));

vi.mock('@/lib/event-auth', () => ({
  requireEventOwner: mocks.requireEventOwner,
}));

vi.mock('@/lib/event-coupon', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-coupon')>();
  return { ...actual, getExhibitor: mocks.getExhibitor };
});

vi.mock('@/lib/firebase-admin', () => ({
  db: {},
}));

vi.mock('@/lib/event-billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-billing')>();
  return {
    ...actual,
    findEnabledBillingOrganizer: mocks.findEnabledBillingOrganizer,
    getShopBilling: mocks.getShopBilling,
    startShopBilling: mocks.startShopBilling,
  };
});

const { POST } = await import('./route');

function guardError(status: number) {
  return {
    error: new Response(JSON.stringify({ error: '権限がありません' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  };
}

function request(body: unknown) {
  return new Request('http://localhost/api/events/event-1/shop-billings/shop-1', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer token',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function params() {
  return { params: Promise.resolve({ eventId: 'event-1', exhibitorId: 'shop-1' }) };
}

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
  mocks.getExhibitor.mockResolvedValue({
    id: 'shop-1',
    name: '出店者A',
    email: 'a@example.com',
    billingSuspended: false,
  });
  mocks.getShopBilling.mockResolvedValue(null);
  mocks.startShopBilling.mockResolvedValue({
    ok: true,
    billing: { exhibitorId: 'shop-1', status: 'none' },
    checkoutUrl: 'https://checkout.stripe.com/pay/cs_1',
  });
});

describe('POST /api/events/[eventId]/shop-billings/[exhibitorId]', () => {
  it('オプション OFF の契約は 404', async () => {
    mocks.findEnabledBillingOrganizer.mockResolvedValue(null);
    const res = await POST(request({ amount: 3000 }), params());
    expect(res.status).toBe(404);
    expect(mocks.startShopBilling).not.toHaveBeenCalled();
  });

  it('主催者でなければガードの 403 が返る', async () => {
    mocks.requireEventOwner.mockResolvedValue(guardError(403));
    const res = await POST(request({ amount: 3000 }), params());
    expect(res.status).toBe(403);
    expect(mocks.startShopBilling).not.toHaveBeenCalled();
  });

  it('金額が不正なら 400', async () => {
    const res = await POST(request({ amount: 10 }), params());
    expect(res.status).toBe(400);
    expect(mocks.startShopBilling).not.toHaveBeenCalled();
  });

  it('課金形態が不正なら 400', async () => {
    const res = await POST(request({ amount: 3000, billingType: 'yearly' }), params());
    expect(res.status).toBe(400);
    expect(mocks.startShopBilling).not.toHaveBeenCalled();
  });

  it('出店者がいなければ 404', async () => {
    mocks.getExhibitor.mockResolvedValue(null);
    const res = await POST(request({ amount: 3000 }), params());
    expect(res.status).toBe(404);
  });

  it('形態未指定は月額サブスクとして発行し Checkout URL を返す', async () => {
    const res = await POST(request({ amount: 3000 }), params());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_1');
    expect(mocks.startShopBilling).toHaveBeenCalledWith(expect.anything(), {
      contractId: 'contract-1',
      eventId: 'event-1',
      exhibitorId: 'shop-1',
      exhibitorName: '出店者A',
      amount: 3000,
      billingType: 'subscription',
    });
  });

  it('一括払いとして発行できる', async () => {
    const res = await POST(request({ amount: 12000, billingType: 'one-time' }), params());
    expect(res.status).toBe(200);
    expect(mocks.startShopBilling).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ amount: 12000, billingType: 'one-time' }),
    );
  });

  it('有効な月額サブスクがある間は 409', async () => {
    mocks.getShopBilling.mockResolvedValue({
      exhibitorId: 'shop-1',
      billingType: 'subscription',
      status: 'active',
      stripeSubscriptionId: 'sub_1',
    });
    const res = await POST(request({ amount: 3000 }), params());
    expect(res.status).toBe(409);
    expect(mocks.startShopBilling).not.toHaveBeenCalled();
  });

  it('支払い済みの一括課金がある間は 409', async () => {
    mocks.getShopBilling.mockResolvedValue({
      exhibitorId: 'shop-1',
      billingType: 'one-time',
      status: 'paid',
      stripeSubscriptionId: null,
    });
    const res = await POST(request({ amount: 3000, billingType: 'one-time' }), params());
    expect(res.status).toBe(409);
    expect(mocks.startShopBilling).not.toHaveBeenCalled();
  });

  it('解約済みなら再発行できる', async () => {
    mocks.getShopBilling.mockResolvedValue({
      exhibitorId: 'shop-1',
      billingType: 'subscription',
      status: 'canceled',
      stripeSubscriptionId: 'sub_old',
    });
    const res = await POST(request({ amount: 5000 }), params());
    expect(res.status).toBe(200);
    expect(mocks.startShopBilling).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ amount: 5000, billingType: 'subscription' }),
    );
  });

  it('Stripe 未設定などの lib の失敗は status と内容が伝わる', async () => {
    mocks.startShopBilling.mockResolvedValue({
      ok: false,
      status: 400,
      error: 'Stripe設定が未完了です。先にAPIキーとWebhookシークレットを保存してください',
    });
    const res = await POST(request({ amount: 3000 }), params());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Stripe設定が未完了');
  });

  it('予期しない例外は 502', async () => {
    mocks.startShopBilling.mockRejectedValue(new Error('network down'));
    const res = await POST(request({ amount: 3000 }), params());
    expect(res.status).toBe(502);
  });
});
