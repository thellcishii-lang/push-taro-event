import { describe, expect, it } from 'vitest';
import {
  EventConfig,
  isFinalizationDue,
  isResetDue,
  isValidResetTime,
  jstDateString,
  jstTimeString,
} from './event';

const baseEvent: Pick<
  EventConfig,
  'startDate' | 'endDate' | 'resetTime' | 'lastResetDate' | 'status'
> = {
  startDate: '2026-11-07',
  endDate: '2026-11-08',
  resetTime: '00:00',
  lastResetDate: null,
  status: 'live',
};

// JST 2026-11-07 00:30 の Date（UTC では前日 15:30）
const jst = (isoUtc: string) => new Date(isoUtc);

describe('jstDateString / jstTimeString', () => {
  it('UTC 15:30 は JST 翌日 00:30 として扱う', () => {
    const d = jst('2026-11-06T15:30:00Z');
    expect(jstDateString(d)).toBe('2026-11-07');
    expect(jstTimeString(d)).toBe('00:30');
  });
});

describe('isValidResetTime', () => {
  it('正常系', () => {
    expect(isValidResetTime('00:00')).toBe(true);
    expect(isValidResetTime('04:30')).toBe(true);
    expect(isValidResetTime('23:59')).toBe(true);
  });
  it('異常系', () => {
    expect(isValidResetTime('24:00')).toBe(false);
    expect(isValidResetTime('9:00')).toBe(false);
    expect(isValidResetTime('00:60')).toBe(false);
  });
});

describe('isResetDue', () => {
  it('開催初日、設定時刻を過ぎていれば due', () => {
    expect(isResetDue(baseEvent, jst('2026-11-06T15:30:00Z'))).toBe(true);
  });

  it('設定時刻より前なら not due（夜間イベント想定: resetTime 04:00）', () => {
    const night = { ...baseEvent, resetTime: '04:00' };
    // JST 03:00
    expect(isResetDue(night, jst('2026-11-06T18:00:00Z'))).toBe(false);
    // JST 04:00 ちょうど
    expect(isResetDue(night, jst('2026-11-06T19:00:00Z'))).toBe(true);
  });

  it('今日分が実施済みなら not due（二重実行防止）', () => {
    const done = { ...baseEvent, lastResetDate: '2026-11-07' };
    expect(isResetDue(done, jst('2026-11-06T15:30:00Z'))).toBe(false);
  });

  it('開催期間外は not due', () => {
    // JST 2026-11-06（開始前）
    expect(isResetDue(baseEvent, jst('2026-11-05T15:30:00Z'))).toBe(false);
    // JST 2026-11-09（終了後）
    expect(isResetDue(baseEvent, jst('2026-11-08T15:30:00Z'))).toBe(false);
  });

  it('live でなければ not due', () => {
    expect(
      isResetDue({ ...baseEvent, status: 'draft' }, jst('2026-11-06T15:30:00Z')),
    ).toBe(false);
  });
});

describe('isFinalizationDue', () => {
  const fin = { endDate: '2026-11-08', finalizedAt: null as string | null };
  it('終了日の翌日以降で due', () => {
    // JST 2026-11-09
    expect(isFinalizationDue(fin, jst('2026-11-08T15:00:00Z'))).toBe(true);
  });
  it('終了日当日は not due', () => {
    // JST 2026-11-08
    expect(isFinalizationDue(fin, jst('2026-11-07T15:00:00Z'))).toBe(false);
  });
  it('finalized 済みなら not due', () => {
    expect(
      isFinalizationDue(
        { ...fin, finalizedAt: '2026-11-09T00:00:00.000Z' },
        jst('2026-11-08T15:00:00Z'),
      ),
    ).toBe(false);
  });
});
