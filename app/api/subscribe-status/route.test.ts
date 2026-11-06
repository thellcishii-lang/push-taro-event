import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  subscription: {} as Record<string, unknown>,
  shop: {} as Record<string, unknown>,
  enforceRateLimit: vi.fn(),
  verifyCustomerSession: vi.fn(),
}));

vi.mock('../../../lib/firebase-admin', () => ({
  db: {
    collection: (name: string) => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => name === 'shops' ? mocks.shop : mocks.subscription,
        }),
      }),
    }),
  },
}));
vi.mock('../../../lib/rate-limit', () => ({ enforceRateLimit: mocks.enforceRateLimit }));
vi.mock('../../../lib/customer-session', () => ({
  verifyCustomerSession: mocks.verifyCustomerSession,
}));

import { GET } from './route';

const request = () => new Request('https://example.com/api/subscribe-status?shopId=shop&token=session');
const timestamp = (value: string) => ({ toDate: () => new Date(value) });

describe('coupon status after redemption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.verifyCustomerSession.mockReturnValue({ token: 'customer', shopId: 'shop' });
    mocks.subscription = { shopIds: ['shop'] };
    mocks.shop = {
      normalCoupon: { couponId: 'normal-1' },
      proCoupons: {
        stepUp: { enabled: true, campaignId: 'step-1' },
        repeat: { enabled: true, campaignId: 'repeat-1' },
      },
    };
  });

  it('returns the recorded state for every coupon type and prevents caching', async () => {
    const now = new Date();
    mocks.subscription.couponUsage = {
      shop: {
        firstCouponUsedAt: now,
        normalCouponUsedCouponId: 'normal-1',
        normalCouponUsedAt: timestamp('2026-10-24T03:00:00Z'),
        loyaltyCouponAvailable: false,
        stepUpCampaignId: 'step-1', stepUpIndex: 2,
        repeatCampaignId: 'repeat-1',
        repeatCouponUsedAt: { toDate: () => now },
        repeatCouponActiveUntil: timestamp('2099-01-01T00:00:00Z'),
        birthdayCouponUsedYear: String(now.getFullYear()),
        birthdayCouponUsedAt: timestamp('2026-10-24T04:00:00Z'),
        dormantCouponUsedAt: now,
        scheduledCouponUsedIds: ['scheduled-1'],
        scheduledCouponUsedAt: { 'scheduled-1': timestamp('2026-10-24T05:00:00Z') },
      },
    };
    const response = await GET(request());
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toMatchObject({
      firstCouponUsed: true, couponUsed: true, normalCouponUsed: true,
      loyaltyCouponAvailable: false, stepUpIndex: 2, repeatCouponUsed: true,
      repeatCouponActiveUntil: '2099-01-01T00:00:00.000Z',
      birthdayCouponUsed: true, dormantCouponUsed: true,
      scheduledCouponUsedIds: ['scheduled-1'],
      normalCouponUsedAt: '2026-10-24T03:00:00.000Z',
      birthdayCouponUsedAt: '2026-10-24T04:00:00.000Z',
      dormantCouponUsedAt: now.toISOString(),
      scheduledCouponUsedAt: { 'scheduled-1': '2026-10-24T05:00:00.000Z' },
    });
  });

  it('resets only the reissued campaign and keeps the used first coupon consumed', async () => {
    mocks.subscription.couponUsage = {
      shop: {
        firstCouponUsedAt: new Date(),
        normalCouponUsedCouponId: 'old-normal',
        stepUpCampaignId: 'old-step', stepUpIndex: 2,
        repeatCampaignId: 'old-repeat',
        repeatCouponActiveUntil: timestamp('2099-01-01T00:00:00Z'),
      },
    };
    expect(await (await GET(request())).json()).toMatchObject({
      firstCouponUsed: true, normalCouponUsed: false, stepUpIndex: 0,
      repeatCouponActiveUntil: null,
    });
  });

  it('preserves legacy first and normal coupon consumption', async () => {
    mocks.shop = {};
    mocks.subscription.couponUsage = {
      shop: { firstCouponUsedAt: new Date(), normalCouponUsedAt: new Date() },
    };
    expect(await (await GET(request())).json()).toMatchObject({
      firstCouponUsed: true, normalCouponUsed: true,
    });
  });

  it('allows ten minutes of 10-second polling plus screen re-entry', async () => {
    await GET(request());
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), expect.stringMatching(/^subscribe-status:[a-f0-9]{64}$/), 120, 600_000);
    const [, , limit, windowMs] = mocks.enforceRateLimit.mock.calls[0];
    expect(limit).toBeGreaterThan(windowMs / 10_000 + 1);
  });

  it('keeps the strict limit for unsigned tokens', async () => {
    mocks.verifyCustomerSession.mockReturnValue(null);
    await GET(request());
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), 'subscribe-status', 20, 600_000);
  });

  it('gives different verified customers separate polling budgets on the same Wi-Fi', async () => {
    await GET(request());
    mocks.verifyCustomerSession.mockReturnValue({ token: 'other-customer', shopId: 'shop' });
    await GET(request());
    expect(mocks.enforceRateLimit.mock.calls[0][1]).not.toBe(mocks.enforceRateLimit.mock.calls[1][1]);
  });

  it('still rejects excessive requests with a retry delay', async () => {
    mocks.enforceRateLimit.mockResolvedValue(30);
    const response = await GET(request());
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('30');
  });

  it('asks the client to reissue an expired session instead of treating it as an unknown customer', async () => {
    mocks.verifyCustomerSession.mockReturnValue(null);
    const response = await GET(new Request('https://example.com/api/subscribe-status?shopId=shop&token=payload.signature'));
    expect(response.status).toBe(401);
  });
});
