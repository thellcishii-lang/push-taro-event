// lib/event-coupon.test.ts
import { describe, expect, it } from 'vitest';
import {
  EventClaim,
  EventCoupon,
  claimIdFor,
  evaluateRedemption,
  filterCoupons,
  memberIdForPhone,
} from './event-coupon';

const couponA: EventCoupon = {
  id: 'coupon-a',
  exhibitorId: 'exhibitor-a',
  exhibitorName: '株式会社アルファ',
  title: 'ドリンク1杯無料',
  description: 'ブースで使える',
  keywords: ['飲み物', '無料'],
  active: true,
};
const couponB: EventCoupon = {
  id: 'coupon-b',
  exhibitorId: 'exhibitor-b',
  exhibitorName: 'ベータ商会',
  title: 'ノベルティ進呈',
  description: '',
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

describe('ID生成', () => {
  it('memberIdForPhone は決定的で電話番号そのものを含まない', () => {
    expect(memberIdForPhone('+819012345678')).toBe(memberIdForPhone('+819012345678'));
    expect(memberIdForPhone('+819012345678')).not.toContain('9012345678');
  });
  it('claimId は memberId と couponId の組み合わせ', () => {
    expect(claimIdFor('m1', 'c1')).toBe('m1_c1');
  });
});
