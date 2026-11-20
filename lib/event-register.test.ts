// lib/event-register.test.ts
import { describe, expect, it } from 'vitest';
import {
  evaluateRegistration,
  isCurrentSubscriber,
  memberIdForPhone,
  registrationScopeStartDate,
} from './event-register';

const baseEvent = {
  status: 'live' as const,
  startDate: '2026-11-07',
  endDate: '2026-11-09',
  subscriberCap: 50_000,
};

describe('memberIdForPhone', () => {
  it('同じ電話番号からは同じIDが得られる', () => {
    expect(memberIdForPhone('+819012345678')).toBe(memberIdForPhone('+819012345678'));
  });
  it('異なる電話番号では異なるIDになる', () => {
    expect(memberIdForPhone('+819012345678')).not.toBe(memberIdForPhone('+819087654321'));
  });
  it('電話番号そのものはIDに含まれない', () => {
    expect(memberIdForPhone('+819012345678')).not.toContain('9012345678');
  });
});

describe('evaluateRegistration', () => {
  it('開催期間内の live イベントは登録できる', () => {
    expect(evaluateRegistration(baseEvent, '2026-11-08', 100, false)).toEqual({ allowed: true });
  });
  it('初日と最終日も登録できる', () => {
    expect(evaluateRegistration(baseEvent, '2026-11-07', 0, false)).toEqual({ allowed: true });
    expect(evaluateRegistration(baseEvent, '2026-11-09', 0, false)).toEqual({ allowed: true });
  });
  it('下書き状態では登録できない', () => {
    expect(evaluateRegistration({ ...baseEvent, status: 'draft' }, '2026-11-08', 0, false))
      .toEqual({ allowed: false, reason: 'not-live' });
  });
  it('開催前は登録できない', () => {
    expect(evaluateRegistration(baseEvent, '2026-11-06', 0, false))
      .toEqual({ allowed: false, reason: 'before-period' });
  });
  it('終了後は登録できない', () => {
    expect(evaluateRegistration(baseEvent, '2026-11-10', 0, false))
      .toEqual({ allowed: false, reason: 'after-period' });
  });
  it('上限に達したら新規登録はできない', () => {
    expect(evaluateRegistration(baseEvent, '2026-11-08', 50_000, false))
      .toEqual({ allowed: false, reason: 'cap-reached' });
  });
  it('上限に達していても登録済みの人の再登録（トークン更新）は通す', () => {
    expect(evaluateRegistration(baseEvent, '2026-11-08', 50_000, true)).toEqual({ allowed: true });
  });
});

describe('registrationScopeStartDate', () => {
  it('リセット時刻 0:00 では常に今日が範囲の開始日', () => {
    const event = { resetTime: '00:00' };
    expect(registrationScopeStartDate(event, new Date('2026-11-08T00:30:00+09:00'))).toBe('2026-11-08');
    expect(registrationScopeStartDate(event, new Date('2026-11-08T23:59:00+09:00'))).toBe('2026-11-08');
  });
  it('リセット時刻より前は昨日から、過ぎたら今日から範囲が始まる', () => {
    const event = { resetTime: '04:00' };
    expect(registrationScopeStartDate(event, new Date('2026-11-08T02:00:00+09:00'))).toBe('2026-11-07');
    expect(registrationScopeStartDate(event, new Date('2026-11-08T04:00:00+09:00'))).toBe('2026-11-08');
    expect(registrationScopeStartDate(event, new Date('2026-11-08T05:00:00+09:00'))).toBe('2026-11-08');
  });
  it('月をまたいでも昨日を正しく返す', () => {
    const event = { resetTime: '04:00' };
    expect(registrationScopeStartDate(event, new Date('2026-12-01T02:00:00+09:00'))).toBe('2026-11-30');
  });
});

describe('isCurrentSubscriber', () => {
  it('レコードが無ければ未登録', () => {
    expect(isCurrentSubscriber(undefined, { resetTime: '00:00' }, new Date('2026-11-08T10:00:00+09:00'))).toBe(false);
  });
  it('今日登録したレコードは現行', () => {
    expect(
      isCurrentSubscriber({ registeredDate: '2026-11-08' }, { resetTime: '00:00' }, new Date('2026-11-08T10:00:00+09:00')),
    ).toBe(true);
  });
  it('昨日のレコードは、リセット時刻を過ぎたら前範囲の残存として弾く', () => {
    expect(
      isCurrentSubscriber({ registeredDate: '2026-11-07' }, { resetTime: '00:00' }, new Date('2026-11-08T00:30:00+09:00')),
    ).toBe(false);
  });
  it('リセット時刻が 4:00 なら、昨夜の登録は未明でもまだ現行範囲内', () => {
    expect(
      isCurrentSubscriber({ registeredDate: '2026-11-07' }, { resetTime: '04:00' }, new Date('2026-11-08T02:00:00+09:00')),
    ).toBe(true);
  });
  it('リセット時刻が 4:00 で一昨日のレコードは範囲外', () => {
    expect(
      isCurrentSubscriber({ registeredDate: '2026-11-06' }, { resetTime: '04:00' }, new Date('2026-11-08T02:00:00+09:00')),
    ).toBe(false);
  });
  it('registeredDate を持たない旧レコードは存在をもって現行とみなす', () => {
    expect(
      isCurrentSubscriber({ fcmToken: 'token' }, { resetTime: '00:00' }, new Date('2026-11-08T10:00:00+09:00')),
    ).toBe(true);
  });
});
