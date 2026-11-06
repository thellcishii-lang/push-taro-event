import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  shops: [] as Array<{ id: string; data: FirebaseFirestore.DocumentData }>,
}));

vi.mock('@/lib/mailer', () => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/firebase-admin', () => {
  const query = (name: string, filters: Array<[string, unknown]> = []) => ({
    where: (field: string, _op: string, value: unknown) => query(name, [...filters, [field, value]]),
    get: async () => {
      const docs = name === 'shops'
        ? mocks.shops.filter((shop) => filters.every(([field, value]) => shop.data[field] === value))
        : [];
      return { empty: docs.length === 0, docs: docs.map((shop) => ({ id: shop.id, data: () => shop.data })) };
    },
    doc: (id: string) => ({
      get: async () => {
        const shop = mocks.shops.find((s) => s.id === id);
        return { id, exists: !!shop, data: () => shop?.data };
      },
    }),
  });
  return {
    authAdmin: { verifyIdToken: mocks.verify, getUser: async () => ({ customClaims: {} }) },
    db: { collection: (name: string) => query(name) },
  };
});

import { GET } from './route';

const request = () => new Request('https://example.com/api/pro-shop/dashboard', {
  headers: { Authorization: 'Bearer token' },
});

describe('PRO dashboard access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verify.mockResolvedValue({ uid: 'owner' });
  });

  it.each(['pro', 'PRO', 'Pro'])('allows the owner of a PRO shop (plan=%s)', async (plan) => {
    mocks.shops = [{ id: 'shop', data: { ownerUid: 'owner', plan, name: 'Shop' } }];
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect((await response.json()).shop).toMatchObject({ id: 'shop', name: 'Shop' });
  });

  it('picks the PRO shop when the owner also has a non-PRO shop', async () => {
    mocks.shops = [
      { id: 'light', data: { ownerUid: 'owner', plan: 'light' } },
      { id: 'pro', data: { ownerUid: 'owner', plan: 'pro' } },
    ];
    expect((await (await GET(request())).json()).shop.id).toBe('pro');
  });

  it('rejects owners without a PRO shop', async () => {
    mocks.shops = [{ id: 'shop', data: { ownerUid: 'owner', plan: 'standard' } }];
    expect((await GET(request())).status).toBe(403);
  });
});
