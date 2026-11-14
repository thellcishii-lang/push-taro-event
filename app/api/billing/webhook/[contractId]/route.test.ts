// app/api/billing/webhook/[contractId]/route.test.ts
// 出店者課金の Stripe Webhook 受信: 契約なし・オプション OFF は 404、
// Stripe 未設定は 400、署名検証は生ボディに対して契約のシークレットで
// 行い、失敗は 400、検証できたら効果を反映して 200 を返すことを検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getOrganizer: vi.fn(),
  getStripeBillingSettings: vi.fn(),
  verifyStripeWebhookEvent: vi.fn(),
  applyStripeWebhookEffect: vi.fn(),
}));

vi.mock('@/lib/organizers', () => ({
  getOrganizer: mocks.getOrganizer,
}));

vi.mock('@/lib/firebase-admin', () => ({
  db: {},
}));

vi.mock('@/lib/event-billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-billing')>();
  return {
    ...actual,
    getStripeBillingSettings: mocks.getStripeBillingSettings,
    verifyStripeWebhookEvent: mocks.verifyStripeWebhookEvent,
    applyStripeWebhookEffect: mocks.applyStripeWebhookEffect,
  };
});

const { POST } = await import('./route');

const RAW_BODY = '{"id":"evt_1","type":"invoice.paid"}';

function request(signature: string | null = 'sig_ok') {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (signature) headers.set('stripe-signature', signature);
  return new Request('http://localhost/api/billing/webhook/contract-1', {
    method: 'POST',
    headers,
    body: RAW_BODY,
  });
}

function params(contractId = 'contract-1') {
  return { params: Promise.resolve({ contractId }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getOrganizer.mockResolvedValue({
    contractId: 'contract-1',
    ownerUid: 'owner-1',
    billingOptionEnabled: true,
  });
  mocks.getStripeBillingSettings.mockResolvedValue({
    secretKey: 'sk_live_abcdefghijklmnop',
    webhookSecret: 'whsec_abcdefghijklmnop',
  });
  mocks.verifyStripeWebhookEvent.mockReturnValue({
    id: 'evt_1',
    type: 'invoice.paid',
    created: 1_762_000_000,
    data: { object: { id: 'in_1' } },
  });
  mocks.applyStripeWebhookEffect.mockResolvedValue({ applied: true, duplicate: false });
});

describe('POST /api/billing/webhook/[contractId]', () => {
  it('契約が無ければ 404', async () => {
    mocks.getOrganizer.mockResolvedValue(null);
    const res = await POST(request(), params());
    expect(res.status).toBe(404);
  });

  it('オプション OFF の契約は 404', async () => {
    mocks.getOrganizer.mockResolvedValue({
      contractId: 'contract-1',
      ownerUid: 'owner-1',
      billingOptionEnabled: false,
    });
    const res = await POST(request(), params());
    expect(res.status).toBe(404);
    expect(mocks.verifyStripeWebhookEvent).not.toHaveBeenCalled();
  });

  it('Stripe 未設定の契約は 400', async () => {
    mocks.getStripeBillingSettings.mockResolvedValue(null);
    const res = await POST(request(), params());
    expect(res.status).toBe(400);
  });

  it('署名ヘッダーが無ければ 400', async () => {
    const res = await POST(request(null), params());
    expect(res.status).toBe(400);
  });

  it('署名検証に失敗したら 400 で効果は反映しない', async () => {
    mocks.verifyStripeWebhookEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });
    const res = await POST(request(), params());
    expect(res.status).toBe(400);
    expect(mocks.applyStripeWebhookEffect).not.toHaveBeenCalled();
  });

  it('署名検証は契約のキー・シークレットと生ボディで行う', async () => {
    const res = await POST(request(), params());
    expect(res.status).toBe(200);
    expect(mocks.verifyStripeWebhookEvent).toHaveBeenCalledWith(
      'sk_live_abcdefghijklmnop',
      'whsec_abcdefghijklmnop',
      RAW_BODY,
      'sig_ok',
    );
  });

  it('検証できたら効果を反映して received:true を返す', async () => {
    const res = await POST(request(), params());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ received: true, applied: true, duplicate: false });
    expect(mocks.applyStripeWebhookEffect).toHaveBeenCalledWith(
      expect.anything(),
      'contract-1',
      expect.objectContaining({ id: 'evt_1', type: 'invoice.paid' }),
    );
  });
});
