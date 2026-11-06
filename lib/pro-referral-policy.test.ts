import { describe, expect, it } from 'vitest';
import {
  getProReferralRate,
  hasProReferralPlanBCapacity,
  isProReferralPlan,
} from './pro-referral-policy';

describe('PRO referral policy', () => {
  it('accepts only the two fixed plan choices', () => {
    expect(isProReferralPlan('a')).toBe(true);
    expect(isProReferralPlan('b')).toBe(true);
    expect(isProReferralPlan(null)).toBe(false);
    expect(isProReferralPlan('other')).toBe(false);
  });

  it('applies A to every referred plan and B only to PRO', () => {
    expect(getProReferralRate('a', 'light')).toBe(0.1);
    expect(getProReferralRate('a', 'pro')).toBe(0.1);
    expect(getProReferralRate('b', 'pro')).toBe(0.2);
    expect(getProReferralRate('b', 'standard')).toBe(0);
    expect(getProReferralRate(null, 'pro')).toBe(0);
  });

  it('frees B-plan capacity for canceled or released referrals', () => {
    expect(hasProReferralPlanBCapacity([
      { status: 'active', proReferralPlan: 'b' },
      { status: 'pending', proReferralPlan: 'b' },
    ])).toBe(false);
    expect(hasProReferralPlanBCapacity([
      { status: 'active', proReferralPlan: 'b' },
      { status: 'active', proReferralPlan: 'b', slotReleasedAt: new Date() },
    ])).toBe(true);
    expect(hasProReferralPlanBCapacity([
      { status: 'canceled', proReferralPlan: 'b' },
      { status: 'active', proReferralPlan: 'a' },
    ])).toBe(true);
  });
});
