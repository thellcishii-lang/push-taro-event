export type ReferrerType = 'pro' | 'affiliate' | 'affilishop' | 'agency';

const DASHBOARD_PATHS: Record<ReferrerType, string> = {
  pro: '/pro-shop/dashboard',
  affiliate: '/affiliate/dashboard',
  affilishop: '/affilishop/dashboard',
  agency: '/agency/dashboard',
};

export function getReferrerDashboardPath(referrerType: string): string | null {
  return DASHBOARD_PATHS[referrerType as ReferrerType] || null;
}

export function getReferrerDashboardUrl(referrerType: string): string | null {
  const path = getReferrerDashboardPath(referrerType);
  if (!path) return null;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com').replace(/\/$/, '');
  return `${baseUrl}${path}`;
}