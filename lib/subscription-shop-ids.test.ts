import { describe, expect, it } from 'vitest';
import { isShopIdArray, normalizeShopIds } from './subscription-shop-ids';

const shop = 'A1b2C3d4E5f6G7h8I9j0';
const other = 'Z9y8X7w6V5u4T3s2R1q0';

describe('subscription shop ID normalization', () => {
  it('recovers all direct shop ID values, deduplicating and ignoring token keys', () => {
    expect(normalizeShopIds({ 0: shop, 1: other, shopId: shop, token: other, TOKEN: shop }))
      .toEqual([shop, other]);
    expect(normalizeShopIds({ token: shop })).toEqual([]);
  });

  it('does not interpret FCM tokens, metadata or nested objects as shop IDs', () => {
    expect(normalizeShopIds({
      token: 'long:fcm-token', invalid: 'short', nested: { 0: shop },
      long: `${shop}extra`, number: 123, null: null,
    })).toEqual([]);
  });

  it.each([undefined, null, 123, true, shop])('normalizes scalar %s to an empty array', (value) => {
    expect(normalizeShopIds(value)).toEqual([]);
    expect(isShopIdArray(value)).toBe(false);
  });

  it('preserves legacy string IDs in arrays but never returns non-string entries', () => {
    expect(normalizeShopIds(['legacy-shop', shop, shop, 0, { token: shop }, null]))
      .toEqual(['legacy-shop', shop]);
    expect(isShopIdArray(['legacy-shop'])).toBe(true);
    expect(isShopIdArray([])).toBe(true);
    expect(isShopIdArray([shop, {}])).toBe(false);
  });
});
