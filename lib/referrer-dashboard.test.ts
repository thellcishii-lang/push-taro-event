import { afterEach, describe, expect, it } from 'vitest';
import { getReferrerDashboardPath, getReferrerDashboardUrl } from './referrer-dashboard';

describe('referrer dashboard links', () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalBaseUrl;
  });

  it.each([
    ['pro', '/pro-shop/dashboard'],
    ['affiliate', '/affiliate/dashboard'],
    ['affilishop', '/affilishop/dashboard'],
    ['agency', '/agency/dashboard'],
  ])('maps %s to its own dashboard', (referrerType, expectedPath) => {
    expect(getReferrerDashboardPath(referrerType)).toBe(expectedPath);
  });

  it('does not provide a dashboard for an unsupported role', () => {
    expect(getReferrerDashboardPath('shop')).toBeNull();
  });

  it('builds a URL without a duplicate slash', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://push-taro.example/';
    expect(getReferrerDashboardUrl('pro')).toBe('https://push-taro.example/pro-shop/dashboard');
  });
});