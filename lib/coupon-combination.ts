import { couponDay } from './coupon-day';

export function canCombineWithLastCoupon(
  lastUsedAt: Date | null,
  lastCouponCombinable: unknown,
  currentCouponCombinable: boolean,
  now = new Date(),
): boolean {
  if (!lastUsedAt || !Number.isFinite(lastUsedAt.getTime()) || couponDay(lastUsedAt) !== couponDay(now)) {
    return true;
  }

  return lastCouponCombinable === true && currentCouponCombinable;
}