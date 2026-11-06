import { describe, expect, it } from 'vitest';
import { couponDay } from './coupon-day';

describe('couponDay', () => {
  it('switches days at midnight in Japan', () => {
    expect(couponDay(new Date('2026-09-30T14:59:59Z'))).toBe('2026-09-30');
    expect(couponDay(new Date('2026-09-30T15:00:00Z'))).toBe('2026-10-01');
    expect(couponDay(new Date('2026-10-01T14:59:59Z'))).toBe('2026-10-01');
  });
});