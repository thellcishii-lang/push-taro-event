import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldValue, Firestore } from 'firebase-admin/firestore';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  set: vi.fn(),
  add: vi.fn(),
  usage: {} as Record<string, unknown>,
  shop: {} as Record<string, unknown>,
  receipts: new Map<string, FirebaseFirestore.DocumentData>(),
  shopIds: ['shop'],
  failCommit: false,
  queue: Promise.resolve() as Promise<unknown>,
}));

vi.mock('./firebase-admin', () => ({
  authAdmin: {},
  db: {
    runTransaction: (callback: (transaction: unknown) => Promise<unknown>) => {
      const run = mocks.queue.then(async () => {
        const writes: Array<{ kind: string; ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData }> = [];
        const result = await callback({
          get: async (ref: FirebaseFirestore.DocumentReference) => {
            if (writes.length) throw new Error('Firestore reads must precede writes');
            const data = ref.path.startsWith('pos_api_logs/') ? mocks.receipts.get(ref.path)
              : ref.path.startsWith('subscriptions/') ? { shopIds: mocks.shopIds, couponUsage: { shop: mocks.usage } }
                : mocks.shop;
            return { exists: !!data, data: () => data };
          },
          update: (ref: FirebaseFirestore.DocumentReference, data: FirebaseFirestore.DocumentData) => writes.push({ kind: 'update', ref, data }),
          set: (ref: FirebaseFirestore.DocumentReference, data: FirebaseFirestore.DocumentData) => writes.push({ kind: 'set', ref, data }),
        });
        if (mocks.failCommit && writes.length) throw new Error('commit failed');
        for (const { kind, ref, data } of writes) {
          if (kind === 'update') {
            mocks.update(data);
            const next = { ...mocks.usage };
            for (const [path, value] of Object.entries(data)) {
              const field = path.replace('couponUsage.shop.', '');
              if (value instanceof FieldValue && value.isEqual(FieldValue.serverTimestamp())) next[field] = new Date();
              else if (field === 'totalVisits') next[field] = Number(next[field] || 0) + 1;
              else next[field] = value;
            }
            mocks.usage = next;
          } else if (ref.path.startsWith('pos_api_logs/')) {
            mocks.set(ref, data);
            mocks.receipts.set(ref.path, data);
          } else {
            mocks.add(data);
          }
        }
        return result;
      });
      mocks.queue = run.catch(() => undefined);
      return run;
    },
    collection: (name: string) => new Firestore({ projectId: 'coupon-tests' }).collection(name),
  },
}));

import { DEFAULT_USAGE, redeemCouponCore, RedeemCouponParams } from './redeem-coupon-core';

function params(couponType: string, usage: Record<string, unknown> = {}): RedeemCouponParams {
  mocks.usage = { ...DEFAULT_USAGE, ...usage };
  const usageRef = new Firestore({ projectId: 'coupon-tests' }).doc('subscriptions/token');
  const input: RedeemCouponParams = {
    shopId: 'shop', token: 'token', couponType, couponId: 'scheduled-1', scannedBy: 'owner',
    usageRef,
    usageData: { couponUsage: { shop: mocks.usage } },
    shopData: {
      coupon: { enabled: true }, normalCoupon: { enabled: true, couponId: 'normal-1' },
      loyaltyCoupon: { enabled: true },
      proCoupons: {
        stepUp: { enabled: true, campaignId: 'step-1', steps: [{ title: 'Step one' }, { title: 'Step two' }] },
        repeat: { enabled: true, campaignId: 'repeat-1' },
        birthday: { enabled: true }, dormant: { enabled: true },
      },
      scheduledCoupons: [{ id: 'scheduled-1' }],
    },
  };
  mocks.shop = input.shopData;
  return input;
}

describe('coupon redemption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.receipts.clear();
    mocks.shopIds = ['shop'];
    mocks.failCommit = false;
    mocks.queue = Promise.resolve();
  });

  it.each([
    ['first', {}, 'firstCouponUsedAt'],
    ['loyalty', { loyaltyCouponAvailable: true }, 'loyaltyCouponAvailable'],
    ['step-up', {}, 'stepUpIndex'],
    ['repeat', {}, 'repeatCouponUsedAt'],
    ['birthday', { birthdayNotifiedYear: String(new Date().getFullYear()) }, 'birthdayCouponUsedYear'],
    ['dormant', { dormantNotifiedAt: new Date() }, 'dormantCouponUsedAt'],
    ['scheduled', {}, 'scheduledCouponUsedIds'],
  ])('records redemption and history for %s', async (type, usage, field) => {
    const result = await redeemCouponCore(params(type, usage));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      [`couponUsage.shop.${field}`]: expect.anything(),
    }));
    expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ couponType: type, userToken: 'token' }));
    expect(result.usedAt).toEqual(expect.any(String));
  });

  it('records a normal coupon ID in its transaction', async () => {
    await redeemCouponCore(params('normal'));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      'couponUsage.shop.normalCouponUsedCouponId': 'normal-1',
    }));
  });

  it.each([
    ['first', { firstCouponUsedAt: new Date() }],
    ['normal', { normalCouponUsedCouponId: 'normal-1' }],
    ['loyalty', { loyaltyCouponAvailable: false }],
    ['repeat', { repeatCouponUsedAt: new Date() }],
    ['birthday', { birthdayNotifiedYear: String(new Date().getFullYear()), birthdayCouponUsedYear: String(new Date().getFullYear()) }],
    ['dormant', { dormantNotifiedAt: new Date(), dormantCouponUsedAt: new Date() }],
    ['scheduled', { scheduledCouponUsedIds: ['scheduled-1'] }],
    ['step-up', { stepUpCampaignId: 'step-1', stepUpIndex: 2 }],
  ])('rejects reuse of %s without recording another visit or history', async (type, usage) => {
    await expect(redeemCouponCore(params(type, usage))).rejects.toThrow();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it('resets old step-up progress and persists the new campaign ID', async () => {
    const result = await redeemCouponCore(params('step-up', { stepUpCampaignId: 'old', stepUpIndex: 2 }));
    expect(result.couponTitle).toBe('Step one');
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      'couponUsage.shop.stepUpIndex': 1, 'couponUsage.shop.stepUpCampaignId': 'step-1',
    }));
  });

  it('continues to the next step within the same campaign', async () => {
    const result = await redeemCouponCore(params('step-up', { stepUpCampaignId: 'step-1', stepUpIndex: 1 }));
    expect(result.couponTitle).toBe('Step two');
    expect(result.responseExtra.allStepsCompleted).toBe(true);
  });

  it('persists the repeat campaign ID so the status API retains its active period', async () => {
    await redeemCouponCore(params('repeat'));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      'couponUsage.shop.repeatCampaignId': 'repeat-1',
    }));
  });

  it.each([
    ['birthday', { birthdayNotifiedYear: String(new Date().getFullYear()) }, 'birthdayCouponUsedAt'],
    ['scheduled', {}, 'scheduledCouponUsedAt.scheduled-1'],
  ])('records the consumption timestamp for next-day cleanup of %s', async (type, usage, field) => {
    await redeemCouponCore(params(type, usage));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      [`couponUsage.shop.${field}`]: expect.anything(),
    }));
  });

  it.each([
    ['first', {}],
    ['normal', {}],
    ['loyalty', { loyaltyCouponAvailable: true }],
    ['step-up', {}],
    ['repeat', {}],
    ['birthday', { birthdayNotifiedYear: String(new Date().getFullYear()) }],
    ['dormant', { dormantNotifiedAt: new Date() }],
    ['scheduled', {}],
  ])('validates %s for POS without writing usage, timestamps, loyalty counts, or history', async (type, usage) => {
    const input = params(type, usage);
    input.dryRun = true;
    input.scannedBy = 'pos:terminal-1';
    input.shopData.loyaltyCoupon.targetCount = 1;
    input.shopData.proCoupons.stepUp.steps[0].loyaltyCountable = true;
    input.shopData.proCoupons.repeat.loyaltyCountable = true;
    input.shopData.proCoupons.birthday.loyaltyCountable = true;
    input.shopData.proCoupons.dormant.loyaltyCountable = true;
    input.shopData.scheduledCoupons[0].loyaltyCountable = true;

    const result = await redeemCouponCore(input);

    expect(result.couponTitle).toEqual(expect.any(String));
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
    if (['normal', 'step-up', 'repeat', 'birthday', 'dormant', 'scheduled'].includes(type)) {
      expect(result.responseExtra.loyaltyUnlocked).toBe(true);
    }
  });

  it.each([
    ['birthday', { birthdayNotifiedYear: String(new Date().getFullYear()), birthdayCouponUsedYear: String(new Date().getFullYear()) }],
    ['scheduled', { scheduledCouponUsedIds: ['scheduled-1'] }],
  ])('still rejects used %s coupons during POS validation', async (type, usage) => {
    await expect(redeemCouponCore({ ...params(type, usage), dryRun: true })).rejects.toThrow();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it.each([
    ['birthday', { birthdayNotifiedYear: String(new Date().getFullYear()) }, 'birthdayCouponUsedAt'],
    ['scheduled', {}, 'scheduledCouponUsedAt.scheduled-1'],
  ])('preserves POS audit history and records the display timestamp when redeeming %s', async (type, usage, field) => {
    await redeemCouponCore({ ...params(type, usage), scannedBy: 'pos:terminal-1', dryRun: false });

    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      [`couponUsage.shop.${field}`]: expect.anything(),
    }));
    expect(mocks.add).toHaveBeenCalledTimes(1);
    expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({
      couponType: type, userToken: 'token', scannedBy: 'pos:terminal-1',
    }));
  });

  function withReceipt(input: RedeemCouponParams, hash = 'payload-hash', key = 'retry-key'): RedeemCouponParams {
    return { ...input, idempotency: {
      ref: new Firestore({ projectId: 'coupon-tests' }).doc(`pos_api_logs/${key}`),
      payloadHash: hash, terminalId: 'register-01',
    } };
  }

  it('commits concurrent retries exactly once and replays the full response', async () => {
    const input = withReceipt(params('normal'));
    input.shopData.loyaltyCoupon.targetCount = 1;
    const [first, retry] = await Promise.all([redeemCouponCore(input), redeemCouponCore(input)]);
    expect(first.responseExtra.loyaltyUnlocked).toBe(true);
    expect(retry).toEqual({ ...first, idempotent: true });
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.add).toHaveBeenCalledTimes(1);
    expect(mocks.receipts.size).toBe(1);
    expect(mocks.usage.totalVisits).toBe(1);
  });

  it('rejects reuse of the same receipt for a different payload', async () => {
    const input = withReceipt(params('first'));
    await redeemCouponCore(input);
    await expect(redeemCouponCore(withReceipt(input, 'different'))).rejects.toMatchObject({
      code: 'IDEMPOTENCY_CONFLICT', status: 409,
    });
    expect(mocks.add).toHaveBeenCalledTimes(1);
  });

  it('does not partially consume a coupon when the atomic commit fails', async () => {
    const input = withReceipt(params('first'));
    mocks.failCommit = true;
    await expect(redeemCouponCore(input)).rejects.toThrow('commit failed');
    expect(mocks.usage.firstCouponUsedAt).toBeNull();
    expect(mocks.add).not.toHaveBeenCalled();
    expect(mocks.receipts.size).toBe(0);
    mocks.failCommit = false;
    await redeemCouponCore(input);
    expect(mocks.add).toHaveBeenCalledTimes(1);
  });

  it('prevents simultaneous owner and POS consumption of the same first coupon', async () => {
    const input = params('first');
    const results = await Promise.allSettled([
      redeemCouponCore(input), redeemCouponCore(withReceipt(input)),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(mocks.add).toHaveBeenCalledTimes(1);
    expect(mocks.usage.totalVisits).toBe(1);
  });

  it('validates against current transaction data instead of a stale caller snapshot', async () => {
    const input = params('first');
    mocks.usage.firstCouponUsedAt = new Date();
    input.usageData = { couponUsage: { shop: { ...DEFAULT_USAGE } } };
    await expect(redeemCouponCore(input)).rejects.toMatchObject({ code: 'COUPON_ALREADY_USED' });
  });

  it('rejects a customer not registered to the shop', async () => {
    const input = params('first');
    mocks.shopIds = ['other-shop'];
    await expect(redeemCouponCore(input)).rejects.toMatchObject({ status: 403 });
  });

  it.each(['first', 'normal', 'loyalty', 'birthday', 'dormant'])('rejects disabled %s coupons', async (type) => {
    const input = params(type, { birthdayNotifiedYear: String(new Date().getFullYear()), dormantNotifiedAt: new Date(), loyaltyCouponAvailable: true });
    const config = type === 'first' ? input.shopData.coupon : type === 'normal' ? input.shopData.normalCoupon
      : type === 'loyalty' ? input.shopData.loyaltyCoupon : input.shopData.proCoupons[type];
    config.enabled = false;
    await expect(redeemCouponCore(input)).rejects.toMatchObject({ code: 'COUPON_DISABLED' });
  });

  it('rejects a key revoked between authentication and the transaction', async () => {
    const input = params('first');
    input.posKeyHash = 'key-hash';
    input.shopData.plan = 'pro';
    input.shopData.posApi = { keyHash: 'key-hash', revokedAt: new Date() };
    await expect(redeemCouponCore(input)).rejects.toMatchObject({ status: 401 });
  });

  it('uses Japanese midnight for date-based expiry', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-10-25T15:00:00Z'));
      const input = params('first');
      input.shopData.coupon.expiresAt = '2026-10-25';
      await expect(redeemCouponCore(input)).rejects.toMatchObject({ code: 'COUPON_EXPIRED' });
    } finally { vi.useRealTimers(); }
  });

  it('keeps normal visit counts without unlocking a disabled loyalty offer', async () => {
    const input = params('normal');
    delete input.shopData.loyaltyCoupon;
    await redeemCouponCore(input);
    expect(mocks.usage.normalCouponVisitCount).toBe(1);
    expect(mocks.usage.loyaltyCouponAvailable).toBe(false);
  });
});
