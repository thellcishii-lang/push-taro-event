import { PRO_REFERRAL_RATE } from './constants';

export type ProReferralPlan = 'a' | 'b';

export const PRO_REFERRAL_PLAN_LABELS: Record<ProReferralPlan, string> = {
  a: 'Aプラン',
  b: 'Bプラン',
};

export const PRO_REFERRAL_PLAN_RATES: Record<ProReferralPlan, number> = {
  a: PRO_REFERRAL_RATE,
  b: 0.2,
};

export const PRO_REFERRAL_PLAN_B_MAX_ACTIVE = 2;

export function isProReferralPlan(value: unknown): value is ProReferralPlan {
  return value === 'a' || value === 'b';
}

export function getProReferralRate(
  referralPlan: unknown,
  referredPlan: string
): number {
  if (!isProReferralPlan(referralPlan)) return 0;
  if (referralPlan === 'b' && referredPlan !== 'pro') return 0;
  return PRO_REFERRAL_PLAN_RATES[referralPlan];
}

export function hasProReferralPlanBCapacity(
  relations: Array<{ status?: string; slotReleasedAt?: unknown; proReferralPlan?: string }>
): boolean {
  const occupied = relations.filter(
    (relation) =>
      ['active', 'pending'].includes(relation.status || '') &&
      relation.proReferralPlan === 'b' &&
      !relation.slotReleasedAt
  ).length;
  return occupied < PRO_REFERRAL_PLAN_B_MAX_ACTIVE;
}
