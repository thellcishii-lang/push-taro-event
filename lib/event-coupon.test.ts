// lib/event-coupon.test.ts
import { describe, expect, it } from 'vitest';
import {
  EventClaim,
  EventCoupon,
  claimIdFor,
  evaluateRedemption,
  filterCoupons,
  isCouponCapReached,
  memberIdForPhone,
  tallyClaimsByCoupon,
} from './event-coupon';

const couponA: EventCoupon = {
  id: 'coupon-a',
  exhibitorId: 'exhibitor-a',
  exhibitorName: '株式会社アルファ',
  title: 'ドリンク1杯無料',
  description: 'ブースで使える',
  titleI18n: {},
  descriptionI18n: {},
  keywords: ['飲み物', '無料'],
  active: true,
};
const couponB: EventCoupon = {
  id: 'coupon-b',
  exhibitorId: 'exhibitor-b',
  exhibitorName: 'ベータ商会',
  title: 'ノベルティ進呈',
  description: '',
  titleI18n: {},
  descriptionI18n: {},
  keywords: ['グッズ'],
  active: true,
};
const claimedClaim: Pick<EventClaim, 'status'> = { status: 'claimed' };
const redeemedClaim: Pick<EventClaim, 'status'> = { status: 'redeemed' };

describe('evaluateRedemption（消込の権限）', () => {
  it('出店者は自社クーポンを消込できる', () => {
    expect(
      evaluateRedemption({ type: 'exhibitor', exhibitorId: 'exhibitor-a' }, couponA, claimedClaim),
    ).toEqual({ allowed: true });
  });
  it('出店者は他社のクーポンを消込できない', () => {
    expect(
      evaluateRedemption({ type: 'exhibitor', exhibitorId: 'exhibitor-b' }, couponA, claimedClaim),
    ).toEqual({ allowed: false, reason: 'not-owner' });
  });
  it('主催者はどの出店者のクーポンも消込できる', () => {
    expect(evaluateRedemption({ type: 'organizer' }, couponA, claimedClaim)).toEqual({ allowed: true });
    expect(evaluateRedemption({ type: 'organizer' }, couponB, claimedClaim)).toEqual({ allowed: true });
  });
  it('消込済みは二度消しできない（自社でも主催者でも）', () => {
    expect(
      evaluateRedemption({ type: 'exhibitor', exhibitorId: 'exhibitor-a' }, couponA, redeemedClaim),
    ).toEqual({ allowed: false, reason: 'already-redeemed' });
    expect(evaluateRedemption({ type: 'organizer' }, couponA, redeemedClaim)).toEqual({
      allowed: false,
      reason: 'already-redeemed',
    });
  });
  it('無効化されたクーポンは消込できない', () => {
    expect(
      evaluateRedemption(
        { type: 'exhibitor', exhibitorId: 'exhibitor-a' },
        { ...couponA, active: false },
        claimedClaim,
      ),
    ).toEqual({ allowed: false, reason: 'coupon-inactive' });
  });
  it('他社チェックが最優先（他社の消込済みを持ってきても not-owner）', () => {
    expect(
      evaluateRedemption({ type: 'exhibitor', exhibitorId: 'exhibitor-b' }, couponA, redeemedClaim),
    ).toEqual({ allowed: false, reason: 'not-owner' });
  });
});

describe('filterCoupons（検索）', () => {
  const all = [couponA, couponB];
  it('空のクエリは全件返す', () => {
    expect(filterCoupons(all, '')).toHaveLength(2);
    expect(filterCoupons(all, '  ')).toHaveLength(2);
  });
  it('会社名で検索できる', () => {
    expect(filterCoupons(all, 'ベータ').map((c) => c.id)).toEqual(['coupon-b']);
  });
  it('キーワードで検索できる', () => {
    expect(filterCoupons(all, '飲み物').map((c) => c.id)).toEqual(['coupon-a']);
  });
  it('タイトルで検索できる', () => {
    expect(filterCoupons(all, 'ノベルティ').map((c) => c.id)).toEqual(['coupon-b']);
  });
});

describe('isCouponCapReached（クーポン上限）', () => {
  it('上限未満は登録できる', () => {
    expect(isCouponCapReached(99, 100)).toBe(false);
    expect(isCouponCapReached(0, 100)).toBe(false);
  });
  it('上限に達したら登録できない', () => {
    expect(isCouponCapReached(100, 100)).toBe(true);
    expect(isCouponCapReached(101, 100)).toBe(true);
  });
  it('上限はイベントごとに変えられる前提で判定する', () => {
    expect(isCouponCapReached(100, 200)).toBe(false);
    expect(isCouponCapReached(200, 200)).toBe(true);
  });
});

describe('tallyClaimsByCoupon（取得・消込件数の集計）', () => {
  it('記録がなければ空の Map', () => {
    expect(tallyClaimsByCoupon([]).size).toBe(0);
  });
  it('クーポンごとに取得総数と消込数を数える', () => {
    const tally = tallyClaimsByCoupon([
      { couponId: 'coupon-a', status: 'claimed' },
      { couponId: 'coupon-a', status: 'redeemed' },
      { couponId: 'coupon-a', status: 'redeemed' },
      { couponId: 'coupon-b', status: 'claimed' },
    ]);
    expect(tally.get('coupon-a')).toEqual({ claimedCount: 3, redeemedCount: 2 });
    expect(tally.get('coupon-b')).toEqual({ claimedCount: 1, redeemedCount: 0 });
    expect(tally.get('coupon-c')).toBeUndefined();
  });
  it('全件消込済みなら取得数と消込数が一致する', () => {
    const tally = tallyClaimsByCoupon([
      { couponId: 'coupon-a', status: 'redeemed' },
      { couponId: 'coupon-a', status: 'redeemed' },
    ]);
    expect(tally.get('coupon-a')).toEqual({ claimedCount: 2, redeemedCount: 2 });
  });
});

describe('ID生成', () => {
  it('memberIdForPhone は決定的で電話番号そのものを含まない', () => {
    expect(memberIdForPhone('+819012345678')).toBe(memberIdForPhone('+819012345678'));
    expect(memberIdForPhone('+819012345678')).not.toContain('9012345678');
  });
  it('claimId は memberId と couponId の組み合わせ', () => {
    expect(claimIdFor('m1', 'c1')).toBe('m1_c1');
  });
});
