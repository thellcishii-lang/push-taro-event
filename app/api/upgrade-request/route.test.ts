import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock('../../../lib/firebase-admin', () => ({
  authAdmin: { verifyIdToken: async () => ({ uid: 'owner' }) },
  db: {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => ({ ownerUid: 'owner', plan: 'light', email: 'shop@example.com' }),
          ref: { update: mocks.update },
        }),
      }),
    }),
  },
}));
vi.mock('../../../lib/mailer', () => ({ sendEmail: mocks.sendEmail }));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
  mocks.update.mockResolvedValue(undefined);
  mocks.sendEmail.mockResolvedValue({ success: true });
});

async function post(plan: 'standard' | 'pro') {
  const { POST } = plan === 'pro' ? await import('./pro/route') : await import('./route');
  return POST(new Request('https://push-taro.com/api/upgrade-request', {
    method: 'POST',
    headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shopId: 'shop-A',
      bankAccount: { accountNumber: '1234567', accountHolder: '\u30ab\u30ca' },
    }),
  }));
}

describe.each(['standard', 'pro'] as const)('%s payment configuration', (plan) => {
  it('does not mark a shop pending when the payment link is missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv(`NEXT_PUBLIC_SQUARE_LINK_${plan.toUpperCase()}`, '');
    expect((await post(plan)).status).toBe(500);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it('preserves the configured upgrade flow', async () => {
    vi.stubEnv(`NEXT_PUBLIC_SQUARE_LINK_${plan.toUpperCase()}`, `https://square.example/${plan}`);
    const response = await post(plan);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      paymentUrl: `https://square.example/${plan}?s=shop-A&upgrade=${plan}`,
    });
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      upgradeStatus: 'pending_payment', upgradeTargetPlan: plan,
    }));
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
  });
});
