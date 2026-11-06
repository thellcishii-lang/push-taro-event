import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  docs: new Map<string, Record<string, unknown>>(),
  audits: new Map<string, Record<string, unknown>>(),
  transaction: vi.fn(),
  pageSizes: [] as number[],
  failId: '',
  refresh: null as null | (() => void),
}));

vi.mock('@/lib/admin-auth', () => ({ verifyAdmin: mocks.admin }));
vi.mock('@/lib/firebase-admin', () => {
  function ref(path: string) {
    const store = path.startsWith('subscriptions/') ? mocks.docs : mocks.audits;
    const id = path.split('/').pop()!;
    return {
      id,
      path,
      collection: (name: string) => ({ doc: (key: string) => ref(`${path}/${name}/${key}`) }),
      set: async (data: Record<string, unknown>) => {
        store.set(path.startsWith('subscriptions/') ? id : path, { ...data });
      },
      update: async (data: Record<string, unknown>) => {
        const key = path.startsWith('subscriptions/') ? id : path;
        store.set(key, { ...store.get(key), ...data });
      },
    };
  }
  const snapshot = (id: string) => ({
    id, ref: ref(`subscriptions/${id}`), exists: mocks.docs.has(id),
    data: () => mocks.docs.get(id),
  });
  return {
    db: {
      collection: (name: string) => {
        let cursor = '';
        let limit = 0;
        const query = {
          doc: () => ref(`${name}/run-1`),
          orderBy: () => query,
          select: () => query,
          limit: (size: number) => { limit = size; return query; },
          startAfter: (id: string) => { cursor = id; return query; },
          get: async () => {
            const docs = [...mocks.docs.keys()].sort().filter((id) => id > cursor)
              .slice(0, limit).map(snapshot);
            mocks.pageSizes.push(docs.length);
            return { docs, empty: docs.length === 0 };
          },
        };
        return query;
      },
      runTransaction: mocks.transaction.mockImplementation(async (callback) => {
        mocks.refresh?.();
        mocks.refresh = null;
        const writes: (() => Promise<void>)[] = [];
        const result = await callback({
          get: async (document: ReturnType<typeof ref>) => {
            if (document.id === mocks.failId) throw new Error('injected read failure');
            return snapshot(document.id);
          },
          update: (document: ReturnType<typeof ref>, data: Record<string, unknown>) => {
            writes.push(() => document.update(data));
          },
          set: (document: ReturnType<typeof ref>, data: Record<string, unknown>) => {
            writes.push(() => document.set(data));
          },
        });
        for (const write of writes) await write();
        return result;
      }),
    },
  };
});

import { POST } from './route';

const shop = 'A1b2C3d4E5f6G7h8I9j0';
const other = 'Z9y8X7w6V5u4T3s2R1q0';
const request = (headers?: HeadersInit) => new Request('https://example.com/api/system-admin/repair-subscriptions', {
  method: 'POST', headers,
});

describe('subscription repair API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_SECRET', '');
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.admin.mockResolvedValue('admin-uid');
    mocks.docs.clear();
    mocks.audits.clear();
    mocks.pageSizes = [];
    mocks.failId = '';
    mocks.refresh = null;
  });

  it('repairs both maps, records exact before/after counts and preserves unrelated fields', async () => {
    mocks.docs.set('fcm-private-token', {
      shopIds: { 0: shop, token: other }, unsubscribedShopIds: { 0: other },
      couponUsage: { used: true }, customerId: 'customer',
    });
    mocks.docs.set('valid', { shopIds: [other], unsubscribedShopIds: [] });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true, scanned: 2, repaired: 1, needsReview: 0,
      before: { shopIds: 1, unsubscribedShopIds: 0, invalidFields: 2 },
      after: { shopIds: 2, unsubscribedShopIds: 1, invalidFields: 0 },
    });
    expect(mocks.docs.get('fcm-private-token')).toMatchObject({
      shopIds: [shop], unsubscribedShopIds: [other],
      couponUsage: { used: true }, customerId: 'customer',
    });
    const audit = [...mocks.audits.values()].find((item) => item.subscriptionId);
    expect(audit).toMatchObject({ subscriptionId: 'fcm-private-token', recovered: { shopIds: [shop] } });
    expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain('fcm-private-token');

    expect(await (await POST(request())).json()).toMatchObject({ repaired: 0, after: { invalidFields: 0 } });
  });

  it('replaces token-only maps and missing fields with arrays and flags unrecoverable values', async () => {
    mocks.docs.set('broken', { shopIds: { token: shop }, unsubscribedShopIds: 'invalid' });
    mocks.docs.set('missing', {});
    expect(await (await POST(request())).json()).toMatchObject({ repaired: 2, needsReview: 1 });
    expect(mocks.docs.get('broken')).toMatchObject({ shopIds: [], unsubscribedShopIds: [] });
    expect(mocks.docs.get('missing')).toMatchObject({ shopIds: [], unsubscribedShopIds: [] });
    expect(console.warn).toHaveBeenCalled();
  });

  it('scans beyond a page and never rewrites valid arrays', async () => {
    for (let i = 0; i < 205; i++) {
      mocks.docs.set(String(i).padStart(3, '0'), { shopIds: [shop], unsubscribedShopIds: [] });
    }
    mocks.docs.set('204', { shopIds: { 0: shop }, unsubscribedShopIds: [] });
    expect(await (await POST(request())).json()).toMatchObject({ scanned: 205, repaired: 1 });
    expect(mocks.pageSizes).toEqual([200, 5, 0]);
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.docs.get('000')).toEqual({ shopIds: [shop], unsubscribedShopIds: [] });
  });

  it('uses the transaction reread instead of overwriting concurrent subscriptions', async () => {
    mocks.docs.set('concurrent', { shopIds: { 0: shop }, unsubscribedShopIds: [] });
    mocks.refresh = () => mocks.docs.set('concurrent', { shopIds: [shop, other], unsubscribedShopIds: [] });
    expect(await (await POST(request())).json()).toMatchObject({ repaired: 0 });
    expect(mocks.docs.get('concurrent')?.shopIds).toEqual([shop, other]);
  });

  it('rejects unauthorized callers without accessing data; permits authenticated cron', async () => {
    mocks.admin.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(403);
    expect(mocks.audits.size).toBe(0);
    vi.stubEnv('CRON_SECRET', 'cron-secret');
    expect((await POST(request({ 'x-cron-secret': 'wrong' }))).status).toBe(403);
    expect((await POST(request({ authorization: 'Bearer cron-secret' }))).status).toBe(200);
  });

  it('does not report success on partial failure and persists completed repairs', async () => {
    mocks.docs.set('a', { shopIds: { 0: shop }, unsubscribedShopIds: [] });
    mocks.docs.set('b', { shopIds: { 0: shop }, unsubscribedShopIds: [] });
    mocks.failId = 'b';
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ repaired: 1, scanned: 1 });
    expect(mocks.docs.get('a')?.shopIds).toEqual([shop]);
    expect(mocks.audits.get('subscriptionRepairRuns/run-1')?.status).toBe('failed');
    expect(console.error).toHaveBeenCalled();
  });
});
