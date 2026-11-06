// lib/event-push.test.ts
import { describe, expect, it } from 'vitest';
import {
  EventCampaign,
  isCampaignDue,
  isFifteenMinuteSlot,
  jstDateTimeString,
} from './event-push';

describe('isFifteenMinuteSlot', () => {
  it('15分刻みの時刻を受け付ける', () => {
    expect(isFifteenMinuteSlot('2026-11-07T10:00')).toBe(true);
    expect(isFifteenMinuteSlot('2026-11-07T10:15')).toBe(true);
    expect(isFifteenMinuteSlot('2026-11-07T10:30')).toBe(true);
    expect(isFifteenMinuteSlot('2026-11-07T23:45')).toBe(true);
  });
  it('刻み外の時刻は受け付けない', () => {
    expect(isFifteenMinuteSlot('2026-11-07T10:05')).toBe(false);
    expect(isFifteenMinuteSlot('2026-11-07T10:59')).toBe(false);
  });
  it('形式が違うものは受け付けない', () => {
    expect(isFifteenMinuteSlot('2026-11-07 10:00')).toBe(false);
    expect(isFifteenMinuteSlot('10:00')).toBe(false);
    expect(isFifteenMinuteSlot('2026-11-07T24:00')).toBe(false);
    expect(isFifteenMinuteSlot('')).toBe(false);
  });
});

describe('jstDateTimeString', () => {
  it('UTC の Date を JST の日時文字列にする', () => {
    // 2026-11-07T01:05:00Z は JST で同日 10:05
    expect(jstDateTimeString(new Date('2026-11-07T01:05:00Z'))).toBe('2026-11-07T10:05');
    // 日付またぎ: 2026-11-06T16:00:00Z は JST で翌日 01:00
    expect(jstDateTimeString(new Date('2026-11-06T16:00:00Z'))).toBe('2026-11-07T01:00');
  });
});

describe('isCampaignDue', () => {
  const base: Pick<EventCampaign, 'status' | 'scheduledAt'> = {
    status: 'scheduled',
    scheduledAt: '2026-11-07T10:15',
  };
  it('予約時刻を過ぎたら到期', () => {
    expect(isCampaignDue(base, '2026-11-07T10:15')).toBe(true);
    expect(isCampaignDue(base, '2026-11-07T10:30')).toBe(true);
  });
  it('予約時刻前は到期でない', () => {
    expect(isCampaignDue(base, '2026-11-07T10:00')).toBe(false);
  });
  it('送信済み・取り消し済みは到期でない', () => {
    expect(isCampaignDue({ ...base, status: 'sent' }, '2026-11-07T11:00')).toBe(false);
    expect(isCampaignDue({ ...base, status: 'cancelled' }, '2026-11-07T11:00')).toBe(false);
  });
});
