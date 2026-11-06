// lib/event-register.test.ts
import { describe, expect, it } from 'vitest';
import { evaluateRegistration, memberIdForPhone } from './event-register';

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
