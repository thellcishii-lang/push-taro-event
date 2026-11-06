import { describe, expect, it } from 'vitest';
import { calculateAgencyProBaseReward, calculateRewardRate, isSuccessfulProPayment } from './reward-calculator';

describe('agency monthly PRO rewards', () => {
  it('calculates 30%, 36% and 45% on successive paid counts', () => {
    expect(calculateAgencyProBaseReward(0, 10000)).toBe(0);
    expect(calculateAgencyProBaseReward(100, 10000)).toBe(300000);
    expect(calculateAgencyProBaseReward(101, 10000)).toBe(303600);
    expect(calculateAgencyProBaseReward(200, 10000)).toBe(660000);
    expect(calculateAgencyProBaseReward(201, 10000)).toBe(664500);
    expect(calculateAgencyProBaseReward(300, 10000)).toBe(1110000);
  });

  it('calculates only the unprocessed portion when some payments were already paid', () => {
    expect(calculateAgencyProBaseReward(101, 10000) - calculateAgencyProBaseReward(100, 10000)).toBe(3600);
  });

  it('keeps LIGHT and STANDARD at 18 percent', async () => {
    expect(await calculateRewardRate({}, 'agency', 'light', 'agency')).toBe(0.18);
    expect(await calculateRewardRate({}, 'agency', 'standard', 'agency')).toBe(0.18);
  });

  it('applies the selected PRO referral plan only to relations created under that plan', async () => {
    expect(await calculateRewardRate({ proReferralPlan: 'b' }, 'pro', 'pro', 'shop', {
      createdAt: new Date(),
    })).toBe(0.1);
    expect(await calculateRewardRate({}, 'pro', 'pro', 'shop', {
      proReferralPlan: 'b',
    })).toBe(0.2);
    expect(await calculateRewardRate({}, 'pro', 'standard', 'shop', {
      proReferralPlan: 'b',
    })).toBe(0);
  });

  it('excludes failed payments and other plans from the PRO count', () => {
    expect(isSuccessfulProPayment({ result: 'success', plan: 'pro' }, 'light')).toBe(true);
    expect(isSuccessfulProPayment({ result: 'failed', plan: 'pro' }, 'pro')).toBe(false);
    expect(isSuccessfulProPayment({ result: 'success', plan: 'standard' }, 'pro')).toBe(false);
    expect(isSuccessfulProPayment({ result: 'success' }, 'pro')).toBe(true);
  });
});