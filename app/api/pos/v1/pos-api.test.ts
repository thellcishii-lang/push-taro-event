import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(), redeem: vi.fn(), get: vi.fn(),
}));
vi.mock('@/lib/firebase-admin', () => ({
  db: { collection: (name: string) => ({ doc: (id: string) => ({ path: `${name}/${id}`, get: mocks.get }) }) },
}));
vi.mock('@/lib/pos-api-auth', () => ({
  authenticatePosRequest: mocks.authenticate,
  isPosAuthError: (value: Record<string, unknown>) => 'error' in value,
}));
vi.mock('@/lib/redeem-coupon-core', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/redeem-coupon-core')>(),
  redeemCouponCore: mocks.redeem,
}));

import { POST as verify } from './verify/route';
import { POST as redeem } from './redeem/route';
import { GET as coupons } from './coupons/route';
import { RedeemError } from '@/lib/redeem-coupon-core';

const key = '550e8400-e29b-41d4-a716-446655440000';
function request(payload: unknown = { shopId: 'shop', couponType: 'first', token: 'customer' }, idempotencyKey: string | null = key) {
  return new Request('https://example.com/api/pos/v1/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
    body: JSON.stringify({ qrPayload: typeof payload === 'string' ? payload : JSON.stringify(payload) }),
  });
}

describe('POS API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticate.mockResolvedValue({
      shopId: 'shop', terminalId: 'register-01',
      shopData: { posApi: { keyHash: 'hash' } },
    });
    mocks.get.mockResolvedValue({ exists: true, data: () => ({ shopIds: ['shop'] }) });
    mocks.redeem.mockResolvedValue({ couponTitle: 'Offer', usedAt: '2026-10-25T12:00:00Z', responseExtra: { loyaltyUnlocked: true } });
  });

  it('verifies without consuming and without requiring an idempotency key', async () => {
    const response = await verify(request(undefined, null));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ valid: true, couponTitle: 'Offer', couponType: 'first' });
    expect(mocks.redeem).toHaveBeenCalledWith(expect.objectContaining({ dryRun: true, posKeyHash: 'hash' }));
    expect(mocks.redeem.mock.calls[0][0].idempotency).toBeUndefined();
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('redeems with a canonical payload hash and returns the full recorded result on retry', async () => {
    const first = await redeem(request({ token: 'customer', couponType: 'STEP_UP', shopId: 'shop' }));
    expect(first.status).toBe(200);
    const input = mocks.redeem.mock.calls[0][0];
    expect(input).toMatchObject({ dryRun: false, couponType: 'step-up', scannedBy: 'pos:register-01' });
    expect(input.idempotency.ref.path).toBe(`pos_api_logs/shop_${key}`);
    expect(input.idempotency.payloadHash).toMatch(/^[0-9a-f]{64}$/);
    mocks.redeem.mockResolvedValue({ couponTitle: 'Offer', usedAt: '2026-10-25T12:00:00Z', responseExtra: { loyaltyUnlocked: true }, idempotent: true });
    const retry = await redeem(request({ shopId: 'shop', couponType: 'step-up', token: 'customer' }));
    expect(mocks.redeem.mock.calls[1][0].idempotency.payloadHash).toBe(input.idempotency.payloadHash);
    expect(await retry.json()).toMatchObject({ success: true, idempotent: true, loyaltyUnlocked: true });
  });

  it.each([null, 'not-a-uuid', 'path/injection'])('rejects an invalid idempotency key %s', async (value) => {
    expect((await redeem(request(undefined, value))).status).toBe(400);
    expect(mocks.redeem).not.toHaveBeenCalled();
  });

  it.each([null, [], {}, 'invalid-json', { shopId: 'shop', token: 'a/b', couponType: 'first' },
    { shopId: 'shop', token: 'customer', couponType: 'unknown' },
    { shopId: 'shop', token: 'customer', couponType: 'scheduled' }])('rejects invalid QR content %j', async (payload) => {
    expect((await verify(request(payload))).status).toBe(400);
    expect(mocks.redeem).not.toHaveBeenCalled();
  });

  it('accepts consecutive-login (streak) coupons issued by the customer app', async () => {
    const response = await verify(request({ shopId: 'shop', couponType: 'streak', token: 'customer' }, null));
    expect(response.status).toBe(200);
    expect(mocks.redeem).toHaveBeenCalledWith(expect.objectContaining({ couponType: 'streak', dryRun: true }));
  });

  it('rejects invalid request JSON with a 400 instead of 500', async () => {
    const response = await verify(new Request('https://example.com', { method: 'POST', body: '{' }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ valid: false });
  });

  it('rejects a QR code for a different shop', async () => {
    expect((await redeem(request({ shopId: 'other', token: 'customer', couponType: 'first' }))).status).toBe(403);
    expect(mocks.redeem).not.toHaveBeenCalled();
  });

  it('rejects unknown customers', async () => {
    mocks.get.mockResolvedValue({ exists: false });
    expect((await verify(request())).status).toBe(404);
  });

  it.each([
    ['COUPON_ALREADY_USED', 409], ['COUPON_NOT_COMBINABLE_TODAY', 409],
    ['COUPON_EXPIRED', 410], ['COUPON_DISABLED', 400], ['IDEMPOTENCY_CONFLICT', 409],
  ])('maps %s to the documented status in both endpoints', async (code, status) => {
    mocks.redeem.mockRejectedValue(new RedeemError(code, 'reason', code === 'IDEMPOTENCY_CONFLICT' ? 409 : 400));
    const checked = await verify(request());
    expect(checked.status).toBe(status);
    expect(await checked.json()).toMatchObject({ valid: false, code });
    expect((await redeem(request())).status).toBe(status);
  });

  it('returns authentication errors for all endpoints', async () => {
    mocks.authenticate.mockResolvedValue({ status: 401, error: 'invalid key' });
    expect((await verify(request())).status).toBe(401);
    expect((await redeem(request())).status).toBe(401);
    expect((await coupons(request())).status).toBe(401);
  });

  it('returns explicit server errors when authentication storage fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.authenticate.mockRejectedValue(new Error('database unavailable'));
      expect((await verify(request())).status).toBe(500);
      expect((await redeem(request())).status).toBe(500);
      expect((await coupons(request())).status).toBe(500);
      expect(log).toHaveBeenCalled();
    } finally { log.mockRestore(); }
  });

  it('filters expired master coupons at JST midnight and includes scheduled IDs', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-10-25T15:00:00Z'));
      mocks.authenticate.mockResolvedValue({
        shopId: 'shop', terminalId: null,
        shopData: {
          coupon: { enabled: true, expiresAt: '2026-10-25' },
          normalCoupon: { enabled: true, title: 'Valid', expiresAt: '2026-10-26' },
          loyaltyCoupon: { enabled: false },
          streakCoupon: { enabled: true, couponName: 'Streak' },
          proCoupons: {
            repeat: { enabled: true, expireType: 'date', expireDate: '2026-10-25' },
            birthday: { enabled: true },
            stepUp: { enabled: true, steps: [{ expireType: 'date', expireDate: '2026-10-25' }] },
          },
          scheduledCoupons: [
            { id: 'old', expiresAt: '2026-10-25T14:59:59Z' },
            { id: 'current', title: 'Scheduled', expiresAt: '2026-10-26T00:00:00Z' },
          ],
        },
      });
      const response = await coupons(request());
      expect(await response.json()).toEqual({ coupons: [
        { couponType: 'normal', title: 'Valid' },
        { couponType: 'birthday', title: '記念日・お誕生日クーポン' },
        { couponType: 'streak', title: 'Streak' },
        { couponType: 'scheduled', couponId: 'current', title: 'Scheduled' },
      ] });
    } finally { vi.useRealTimers(); }
  });
});
