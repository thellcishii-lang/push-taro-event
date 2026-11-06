import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  docs: new Map<string, Record<string, unknown>>(),
  rateLimit: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  session: vi.fn(),
  transaction: vi.fn(),
  refresh: null as null | (() => void),
}));

vi.mock('@/lib/rate-limit', () => ({ enforceRateLimit: mocks.rateLimit }));
vi.mock('@/lib/customer-session', () => ({ verifyCustomerSession: mocks.session }));
vi.mock('@/lib/firebase-admin', () => {
  function ref(path: string) {
    const id = path.split('/').pop()!;
    return {
      id,
      path,
      get: async () => snapshot(path),
      set: async (data: Record<string, unknown>) => {
        mocks.docs.set(path, { ...mocks.docs.get(path), ...data });
      },
      update: async (data: Record<string, unknown>) => {
        mocks.docs.set(path, { ...mocks.docs.get(path), ...data });
      },
      delete: async () => { mocks.docs.delete(path); },
      collection: (name: string) => collection(`${path}/${name}`),
    };
  }
  function snapshot(path: string) {
    return {
      id: path.split('/').pop()!, ref: ref(path),
      exists: mocks.docs.has(path), data: () => mocks.docs.get(path),
    };
  }
  function collection(path: string) {
    let field: string;
    let value: unknown;
    const query = {
      doc: (id: string) => ref(`${path}/${id}`),
      where: (key: string, _operator: string, match: unknown) => {
        field = key;
        value = match;
        return query;
      },
      limit: () => query,
      get: async () => ({
        docs: [...mocks.docs.entries()]
          .filter(([key, data]) => key.startsWith(`${path}/`) && data[field] === value)
          .map(([key]) => snapshot(key)),
      }),
    };
    return query;
  }
  return {
    db: {
      collection,
      runTransaction: mocks.transaction.mockImplementation(async (callback) => {
        mocks.refresh?.();
        mocks.refresh = null;
        return callback({
          get: (document: ReturnType<typeof ref>) => document.get(),
          set: (document: ReturnType<typeof ref>, data: Record<string, unknown>) => document.set(data),
          update: (document: ReturnType<typeof ref>, data: Record<string, unknown>) => document.update(data),
          delete: (document: ReturnType<typeof ref>) => document.delete(),
        });
      }),
    },
    messaging: { subscribeToTopic: mocks.subscribe, unsubscribeFromTopic: mocks.unsubscribe },
    authAdmin: { verifyIdToken: vi.fn() },
  };
});

import { POST as subscribe } from './route';
import { POST as unsubscribe } from '../unsubscribe/route';

const shop = 'A1b2C3d4E5f6G7h8I9j0';
const other = 'Z9y8X7w6V5u4T3s2R1q0';
const third = 'C1c2C3c4C5c6C7c8C9c0';
const path = 'subscriptions/fcm-token';
const request = (body: Record<string, unknown>) => new Request('https://example.com/api/subscribe', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'fcm-token', shopId: shop, customerId: 'customer', ...body }),
});

describe('subscription array write guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.docs.clear();
    mocks.rateLimit.mockResolvedValue(null);
    mocks.session.mockReturnValue(null);
    mocks.subscribe.mockResolvedValue({ failureCount: 0 });
    mocks.unsubscribe.mockResolvedValue({ failureCount: 0 });
    mocks.refresh = null;
  });

  it.each([subscribe, unsubscribe])('rejects object/array inputs before any writes', async (handler) => {
    for (const body of [
      { shopId: { token: shop } }, { shopId: [shop] }, { token: { token: shop } },
      { token: ['fcm-token'] }, { token: '  ' }, { shopId: '  ' }, { shopId: 'a/b' },
    ]) {
      expect((await handler(request(body))).status).toBe(400);
    }
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.subscribe).not.toHaveBeenCalled();
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
    expect(mocks.docs.size).toBe(0);
  });

  it('creates new subscriptions with literal string arrays', async () => {
    expect((await subscribe(request({}))).status).toBe(200);
    expect(mocks.docs.get(path)).toMatchObject({ shopIds: [shop], unsubscribedShopIds: [] });
  });

  it('recovers existing maps and retains other shops and coupon data on subscribe', async () => {
    mocks.docs.set(path, {
      shopIds: { 0: other, token: third },
      unsubscribedShopIds: { 0: shop, 1: third },
      couponUsage: { used: true },
    });
    expect((await subscribe(request({}))).status).toBe(200);
    expect(mocks.docs.get(path)).toMatchObject({
      shopIds: [other, shop], unsubscribedShopIds: [third], couponUsage: { used: true },
    });
  });

  it('does not lose subscriptions written after the initial read', async () => {
    mocks.docs.set(path, { shopIds: [other], unsubscribedShopIds: [] });
    mocks.refresh = () => mocks.docs.set(path, { shopIds: [other, third], unsubscribedShopIds: [] });
    expect((await subscribe(request({}))).status).toBe(200);
    expect(mocks.docs.get(path)?.shopIds).toEqual([other, third, shop]);
  });

  it('normalizes both arrays during token migration and on the surviving old document', async () => {
    mocks.docs.set('subscriptions/old-token', {
      token: 'old-token', customerId: 'customer',
      shopIds: { 0: shop, 1: other }, unsubscribedShopIds: { 0: third },
      couponUsage: { used: true },
    });
    expect((await subscribe(request({}))).status).toBe(200);
    expect(mocks.docs.get(path)).toMatchObject({
      shopIds: [shop, other], unsubscribedShopIds: [third], couponUsage: { used: true },
    });
    expect(mocks.docs.get('subscriptions/old-token')).toMatchObject({
      shopIds: [other], unsubscribedShopIds: [third],
    });
  });

  it('normalizes maps on unsubscribe and preserves other shops and coupon history', async () => {
    mocks.docs.set(path, {
      shopIds: { 0: shop, 1: other }, unsubscribedShopIds: { 0: third, token: other },
      couponUsage: { used: true },
    });
    expect((await unsubscribe(request({}))).status).toBe(200);
    expect(mocks.docs.get(path)).toMatchObject({
      shopIds: [other], unsubscribedShopIds: [third, shop], couponUsage: { used: true },
    });
    expect(mocks.unsubscribe).toHaveBeenCalledWith(['fcm-token'], `shop_${shop}_users`);
  });

  it('keeps the document and coupon history when the last shop is removed', async () => {
    mocks.docs.set(path, { shopIds: [shop], couponUsage: { used: true } });
    expect((await unsubscribe(request({}))).status).toBe(200);
    expect(mocks.docs.get(path)).toMatchObject({
      shopIds: [], unsubscribedShopIds: [shop], topics: [], couponUsage: { used: true },
    });
  });

  it('does not remove another shop added during unsubscribe', async () => {
    mocks.docs.set(path, { shopIds: [shop], unsubscribedShopIds: [] });
    mocks.refresh = () => mocks.docs.set(path, { shopIds: [shop, other], unsubscribedShopIds: [third] });
    expect((await unsubscribe(request({}))).status).toBe(200);
    expect(mocks.docs.get(path)).toMatchObject({ shopIds: [other], unsubscribedShopIds: [third, shop] });
  });

  it('retains the existing rate-limit and shop/session authorization behavior', async () => {
    mocks.rateLimit.mockResolvedValue(10);
    expect((await subscribe(request({}))).status).toBe(429);
    expect((await unsubscribe(request({}))).status).toBe(429);
    mocks.rateLimit.mockResolvedValue(null);
    mocks.session.mockReturnValue({ token: 'fcm-token', shopId: other });
    expect((await unsubscribe(request({}))).status).toBe(403);
    mocks.session.mockReturnValue(null);
    mocks.docs.set(path, { shopIds: [other], unsubscribedShopIds: [] });
    expect((await unsubscribe(request({}))).status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
