import { describe, expect, it } from 'vitest';
import { canCombineWithLastCoupon } from './coupon-combination';

describe('canCombineWithLastCoupon', () => {
  const now = new Date('2026-10-01T03:00:00.000Z');

  it('allows a coupon when there is no redemption today', () => {
    expect(canCombineWithLastCoupon(null, false, false, now)).toBe(true);
    expect(canCombineWithLastCoupon(new Date('2026-09-30T14:59:59.000Z'), false, false, now)).toBe(true);
  });

  it('requires both the previous and current coupons to allow same-day use', () => {
    const lastUsedAt = new Date('2026-10-01T02:00:00.000Z');

    expect(canCombineWithLastCoupon(lastUsedAt, true, true, now)).toBe(true);
    expect(canCombineWithLastCoupon(lastUsedAt, false, true, now)).toBe(false);
    expect(canCombineWithLastCoupon(lastUsedAt, true, false, now)).toBe(false);
    expect(canCombineWithLastCoupon(lastUsedAt, undefined, true, now)).toBe(false);
  });
});