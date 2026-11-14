// app/api/events/[eventId]/shop-billings/[exhibitorId]/cancel/route.test.ts
// 月額課金の解約 API: イベントの主催者だけが解約できること、一括払いは
// 解約操作が無いこと（400）、オプション OFF は 404 を検証する。
// lib は結果オブジェクト（ok / status / error）を返す契約。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireEventOwner: vi.fn(),
  findEnabledBillingOrganizer: vi.fn(),
  cancelShopBilling: vi.fn(),
}));

vi.mock('@/lib/event-auth', () => ({
  requireEventOwner: mocks.requireEventOwner,
}));

vi.mock('@/lib/firebase-admin', () => ({
  db: {},
}));

vi.mock('@/lib/event-billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-billing')>();
  return {
    ...actual,
    findEnabledBillingOrganizer: mocks.findEnabledBillingOrganizer,
    cancelShopBilling: mocks.cancelShopBilling,
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

function request() {
  return new Request(
    'http://localhost/api/events/event-1/shop-billings/shop-1/cancel',
    { method: 'POST', headers: { Authorization: 'Bearer token' } },
  );
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
  mocks.cancelShopBilling.mockResolvedValue({
    ok: true,
    billing: { exhibitorId: 'shop-1', status: 'canceled' },
  });
});

describe('POST .../shop-billings/[exhibitorId]/cancel', () => {
  it('未ログインはガードの 401 が返る', async () => {
    mocks.requireEventOwner.mockResolvedValue(guardError(401));
    const res = await POST(request(), params());
    expect(res.status).toBe(401);
  });

  it('オプション OFF の契約は 404', async () => {
    mocks.findEnabledBillingOrganizer.mockResolvedValue(null);
    const res = await POST(request(), params());
    expect(res.status).toBe(404);
    expect(mocks.cancelShopBilling).not.toHaveBeenCalled();
  });

  it('解約できたら更新後の課金を返す', async () => {
    const res = await POST(request(), params());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.billing.status).toBe('canceled');
    expect(mocks.cancelShopBilling).toHaveBeenCalledWith(
      expect.anything(),
      'contract-1',
      'event-1',
      'shop-1',
    );
  });

  it('一括払いは解約できない（400 がそのまま伝わる）', async () => {
    mocks.cancelShopBilling.mockResolvedValue({
      ok: false,
      status: 400,
      error: '一括払いの課金は解約できません。返金はStripeの管理画面で行ってください',
    });
    const res = await POST(request(), params());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('一括払い');
  });

  it('課金が無ければ lib の 404 が伝わる', async () => {
    mocks.cancelShopBilling.mockResolvedValue({
      ok: false,
      status: 404,
      error: '課金が見つかりません',
    });
    const res = await POST(request(), params());
    expect(res.status).toBe(404);
  });
});
