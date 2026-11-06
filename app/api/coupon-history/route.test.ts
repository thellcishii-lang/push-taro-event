import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  where: vi.fn(),
  enforceRateLimit: vi.fn(),
  verifyCustomerSession: vi.fn(),
}));

vi.mock('../../../lib/firebase-admin', () => ({
  authAdmin: { verifyIdToken: vi.fn() },
  db: {
    collection: (name: string) => ({
      doc: () => name === 'subscriptions'
        ? { get: async () => ({ exists: true, data: () => ({ shopIds: ['shop'] }) }) }
        : { collection: () => ({ where: mocks.where }) },
    }),
  },
}));
vi.mock('../../../lib/rate-limit', () => ({ enforceRateLimit: mocks.enforceRateLimit }));
vi.mock('../../../lib/customer-session', () => ({ verifyCustomerSession: mocks.verifyCustomerSession }));

import { GET } from './route';

const request = () => new Request('https://example.com/api/coupon-history?shopId=shop&token=signed-session');

describe('customer coupon history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.verifyCustomerSession.mockReturnValue({ token: 'fcm-token', shopId: 'shop' });
    mocks.where.mockReturnValue({
      get: async () => ({
        docs: [
          { id: 'old', data: () => ({ couponTitle: 'Old', usedAt: { toDate: () => new Date('2026-01-01T00:00:00Z') } }) },
          { id: 'new', data: () => ({ couponTitle: 'New', usedAt: { toDate: () => new Date('2026-02-01T00:00:00Z') } }) },
        ],
      }),
    });
  });

  it('looks up redemption logs by the FCM token stored at redemption, not the session token', async () => {
    const response = await GET(request());
    expect(mocks.where).toHaveBeenCalledWith('userToken', '==', 'fcm-token');
    expect((await response.json()).histories.map((entry: { title: string }) => entry.title)).toEqual(['New', 'Old']);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('gives verified customers their own rate-limit budget', async () => {
    await GET(request());
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), expect.stringMatching(/^coupon-history:[a-f0-9]{64}$/), 60, 600_000);
  });

  it('keeps the strict shared limit for unsigned tokens', async () => {
    mocks.verifyCustomerSession.mockReturnValue(null);
    await GET(request());
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), 'coupon-history', 20, 600_000);
  });

  it('rejects an expired session so the client can reissue it', async () => {
    mocks.verifyCustomerSession.mockReturnValue(null);
    const response = await GET(new Request('https://example.com/api/coupon-history?shopId=shop&token=payload.signature'));
    expect(response.status).toBe(401);
    expect(mocks.where).not.toHaveBeenCalled();
  });
});
