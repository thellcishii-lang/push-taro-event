import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verify: vi.fn(), get: vi.fn(), update: vi.fn(),
  shop: {} as FirebaseFirestore.DocumentData,
}));
vi.mock('@/lib/firebase-admin', () => ({
  authAdmin: { verifyIdToken: mocks.verify },
  db: { collection: () => ({ doc: (id: string) => ({ id, get: mocks.get, update: mocks.update }) }) },
}));
import { GET, POST, DELETE } from './route';
import { verifyPosApiKey } from '@/lib/pos-api-key';

const request = (method = 'GET', shopId = 'shop') => new Request(`https://example.com/api/pro-shop/pos-api-key?shopId=${shopId}`, {
  method, headers: { Authorization: 'Bearer owner-id-token' },
});

describe('PRO POS key management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verify.mockResolvedValue({ uid: 'owner' });
    mocks.shop = { plan: 'pro', ownerUid: 'owner' };
    mocks.get.mockImplementation(async () => ({ id: 'shop', exists: true, data: () => mocks.shop }));
    mocks.update.mockImplementation(async (patch: Record<string, unknown>) => {
      const posApi = { ...mocks.shop.posApi };
      for (const [field, value] of Object.entries(patch)) posApi[field.replace('posApi.', '')] = value;
      mocks.shop.posApi = posApi;
    });
  });

  it('issues a one-time key, exposes only metadata on GET, rotates, and revokes', async () => {
    const response = await POST(request('POST'));
    const issued = await response.json();
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(verifyPosApiKey(issued.key, mocks.shop.posApi.keyHash)).toBe(true);
    expect(mocks.update.mock.calls[0][0]).not.toHaveProperty('key');
    const metadata = await (await GET(request())).json();
    expect(metadata).toMatchObject({ hasKey: true, keyPrefix: issued.keyPrefix });
    expect(metadata.key).toBeUndefined();
    expect(metadata.keyHash).toBeUndefined();
    const rotated = await (await POST(request('POST'))).json();
    expect(rotated.key).not.toBe(issued.key);
    expect(verifyPosApiKey(issued.key, mocks.shop.posApi.keyHash)).toBe(false);
    expect((await DELETE(request('DELETE'))).status).toBe(200);
    expect((await (await GET(request())).json()).hasKey).toBe(false);
  });

  it.each([{ plan: 'pro', ownerUid: 'other' }, { plan: 'standard', ownerUid: 'owner' }])('prevents operating another or non-PRO shop', async (shop) => {
    mocks.shop = shop;
    for (const handler of [GET, POST, DELETE]) expect((await handler(request())).status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('accepts PRO shops whose plan is stored with different casing', async () => {
    mocks.shop = { plan: 'PRO', ownerUid: 'owner' };
    expect((await GET(request())).status).toBe(200);
  });

  it('requires a valid owner session', async () => {
    mocks.verify.mockRejectedValue(new Error('expired token'));
    expect((await POST(request('POST'))).status).toBe(401);
  });

  it('reports datastore errors explicitly', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.get.mockRejectedValue(new Error('unavailable'));
      expect((await GET(request())).status).toBe(500);
      expect(log).toHaveBeenCalled();
    } finally { log.mockRestore(); }
  });
});
