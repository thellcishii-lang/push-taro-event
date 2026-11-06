import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const state = {
    admin: false,
    ownedShopIds: ['A'],
    docs: [] as Array<{ id: string; data: () => Record<string, unknown>; ref: { path: string } }>,
  };
  const updates: Array<{ path: string; data: Record<string, unknown> }> = [];
  const unsubscribeFromTopic = vi.fn();
  const verifyIdToken = vi.fn();
  const getUser = vi.fn();
  const commit = vi.fn();
  const collection = vi.fn((name: string) => {
    if (name === 'subscriptions') {
      return { where: () => ({ get: async () => ({ docs: state.docs }) }) };
    }
    return {
      where: () => ({ get: async () => ({ docs: state.ownedShopIds.map((id) => ({ id })) }) }),
      doc: (shopId: string) => ({
        collection: () => ({
          doc: () => ({
            path: `shops/${shopId}/token_chunks/chunk_1`,
            get: async () => ({ exists: true }),
          }),
        }),
      }),
    };
  });
  const db = {
    collection,
    batch: () => ({
      update: (ref: { path: string }, data: Record<string, unknown>) => updates.push({ path: ref.path, data }),
      commit,
    }),
  };
  return { state, updates, db, unsubscribeFromTopic, verifyIdToken, getUser, commit };
});

vi.mock('../../../lib/firebase-admin', () => ({
  db: mocks.db,
  messaging: { unsubscribeFromTopic: mocks.unsubscribeFromTopic },
  authAdmin: { verifyIdToken: mocks.verifyIdToken, getUser: mocks.getUser },
}));

import { POST } from './route';

function subscription(id: string, data: Record<string, unknown>) {
  return { id, data: () => data, ref: { path: `subscriptions/${id}` } };
}

function post(auth = true) {
  return POST(new Request('https://push-taro.com/api/cleanup', {
    method: 'POST',
    headers: auth ? { Authorization: 'Bearer token' } : {},
  }));
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  mocks.state.admin = false;
  mocks.state.ownedShopIds = ['A'];
  mocks.state.docs = [];
  mocks.updates.length = 0;
  mocks.unsubscribeFromTopic.mockResolvedValue({ failureCount: 0, successCount: 1, errors: [] });
  mocks.verifyIdToken.mockResolvedValue({ uid: 'owner-A' });
  mocks.getUser.mockImplementation(async () => ({ customClaims: { admin: mocks.state.admin } }));
  mocks.commit.mockResolvedValue(undefined);
});

describe('cleanup scope', () => {
  it('unsubscribes only owned topics and preserves other shops and history', async () => {
    const data = {
      token: 'token-AB', shopIds: ['A', 'B'],
      topics: ['shop_A_users', 'shop_B_users', 'other'],
      customerId: 'customer', couponUsage: { first: true },
    };
    mocks.state.docs = [subscription('token-AB', data)];
    const response = await post();
    expect(response.status).toBe(200);
    expect(mocks.unsubscribeFromTopic).toHaveBeenCalledExactlyOnceWith(['token-AB'], 'shop_A_users');
    expect(mocks.updates[0]).toMatchObject({
      path: 'subscriptions/token-AB', data: { shopIds: ['B'], topics: ['shop_B_users', 'other'] },
    });
    expect(mocks.updates[0].data).not.toHaveProperty('customerId');
    expect(mocks.updates[0].data).not.toHaveProperty('couponUsage');
    expect(mocks.updates.map(({ path }) => path)).not.toContain('shops/B/token_chunks/chunk_1');
    expect(data.couponUsage).toEqual({ first: true });
  });

  it.each([undefined, []])('derives missing topics from shopIds (%j)', async (topics) => {
    mocks.state.docs = [subscription('doc-token', { shopIds: ['A', 'B'], topics })];
    expect((await post()).status).toBe(200);
    expect(mocks.unsubscribeFromTopic).toHaveBeenCalledExactlyOnceWith(['doc-token'], 'shop_A_users');
    expect(mocks.updates[0].data).toMatchObject({ shopIds: ['B'], topics: [] });
  });

  it('deduplicates derived and stored topics', async () => {
    mocks.state.docs = [subscription('token', {
      shopIds: ['A'], topics: ['shop_A_users', 'shop_A_users'],
    })];
    expect((await post()).status).toBe(200);
    expect(mocks.unsubscribeFromTopic).toHaveBeenCalledTimes(1);
  });

  it('ignores subscriptions belonging only to other shops', async () => {
    mocks.state.docs = [subscription('token-B', { shopIds: ['B'], topics: ['shop_B_users'] })];
    const response = await post();
    expect(await response.json()).toMatchObject({ removed: 0 });
    expect(mocks.unsubscribeFromTopic).not.toHaveBeenCalled();
    expect(mocks.updates).toHaveLength(0);
  });

  it('lets administrators remove the union of all stored and derived topics', async () => {
    mocks.state.admin = true;
    mocks.state.docs = [subscription('token', {
      shopIds: ['A', 'B'], topics: ['shop_A_users', 'legacy'],
    })];
    expect((await post()).status).toBe(200);
    expect(mocks.unsubscribeFromTopic.mock.calls.map(([, topic]) => topic).sort())
      .toEqual(['legacy', 'shop_A_users', 'shop_B_users']);
    expect(mocks.updates[0].data).toMatchObject({ shopIds: [], topics: [] });
  });

  it('removes tokens only from their associated shop chunks', async () => {
    mocks.state.admin = true;
    mocks.state.docs = [
      subscription('token-A', { shopIds: ['A'] }),
      subscription('token-B', { shopIds: ['B'] }),
    ];
    expect((await post()).status).toBe(200);
    const chunks = mocks.updates.filter(({ path }) => path.includes('token_chunks'));
    expect(chunks).toHaveLength(2);
    expect(chunks[0].data.tokens).toEqual(expect.objectContaining({ elements: ['token-A'] }));
    expect(chunks[1].data.tokens).toEqual(expect.objectContaining({ elements: ['token-B'] }));
  });

  it.each(['rejected', 'partial'])('keeps DB subscriptions retryable when FCM fails (%s)', async (failure) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.state.docs = [subscription('token', { shopIds: ['A'] })];
    if (failure === 'rejected') {
      mocks.unsubscribeFromTopic.mockRejectedValue(new Error('FCM unavailable'));
    } else {
      mocks.unsubscribeFromTopic.mockResolvedValue({
        failureCount: 1, errors: [{ error: new Error('FCM failed') }],
      });
    }
    expect((await post()).status).toBe(500);
    expect(mocks.updates).toHaveLength(0);
    expect(mocks.commit).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    expect((await post(false)).status).toBe(401);
    expect(mocks.unsubscribeFromTopic).not.toHaveBeenCalled();
  });

  it('does nothing for an owner with no shops', async () => {
    mocks.state.ownedShopIds = [];
    expect(await (await post()).json()).toMatchObject({ removed: 0 });
    expect(mocks.unsubscribeFromTopic).not.toHaveBeenCalled();
  });
});
