import { describe, expect, it } from 'vitest';
import {
  EventConfig,
  MAX_CONCURRENT_EVENTS,
  canCreateAnotherEvent,
  canDeleteEvent,
  countConcurrentEvents,
  countsTowardConcurrentCap,
  isFinalizationDue,
  isResetDue,
  isValidResetTime,
  receivesCapsPropagation,
  resolveCreateStatus,
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

describe('同時イベント上限（MAX_CONCURRENT_EVENTS）', () => {
  const ev = (status: EventConfig['status']) => ({ status });

  it('上限は3', () => {
    expect(MAX_CONCURRENT_EVENTS).toBe(3);
  });

  it('終了したイベントは数えない', () => {
    expect(countsTowardConcurrentCap(ev('draft'))).toBe(true);
    expect(countsTowardConcurrentCap(ev('live'))).toBe(true);
    expect(countsTowardConcurrentCap(ev('ended'))).toBe(false);
    expect(
      countConcurrentEvents([ev('live'), ev('ended'), ev('draft'), ev('ended')]),
    ).toBe(2);
  });

  it('イベントが無ければ作成できる', () => {
    expect(canCreateAnotherEvent([])).toBe(true);
  });

  it('下書き＋開催中が上限未満なら作成できる（終了分は含めない）', () => {
    expect(
      canCreateAnotherEvent([ev('draft'), ev('live'), ev('ended'), ev('ended')]),
    ).toBe(true);
  });

  it('下書き＋開催中が上限に達したら作成できない', () => {
    expect(canCreateAnotherEvent([ev('draft'), ev('live'), ev('draft')])).toBe(
      false,
    );
    expect(
      canCreateAnotherEvent([ev('live'), ev('live'), ev('live'), ev('ended')]),
    ).toBe(false);
  });
});

describe('枠伝播の対象（receivesCapsPropagation）', () => {
  const ev = (status: EventConfig['status'], finalizedAt: string | null = null) => ({
    status,
    finalizedAt,
  });

  it('下書き・開催中は伝播対象', () => {
    expect(receivesCapsPropagation(ev('draft'))).toBe(true);
    expect(receivesCapsPropagation(ev('live'))).toBe(true);
  });

  it('終了したイベントは対象外（枠は履歴として触らない）', () => {
    expect(receivesCapsPropagation(ev('ended'))).toBe(false);
  });

  it('終了処理が完了したイベントはステータスによらず対象外', () => {
    expect(receivesCapsPropagation(ev('live', '2026-11-09T00:00:00.000Z'))).toBe(false);
    expect(receivesCapsPropagation(ev('draft', '2026-11-09T00:00:00.000Z'))).toBe(false);
  });
});

describe('作成時の状態指定（resolveCreateStatus）', () => {
  it('未指定は下書き', () => {
    expect(resolveCreateStatus(undefined)).toBe('draft');
    expect(resolveCreateStatus(null)).toBe('draft');
  });

  it('下書き・開催中はそのまま通す', () => {
    expect(resolveCreateStatus('draft')).toBe('draft');
    expect(resolveCreateStatus('live')).toBe('live');
  });

  it('終了や不正な値は例外（作成時には選べない）', () => {
    expect(() => resolveCreateStatus('ended')).toThrow();
    expect(() => resolveCreateStatus('published')).toThrow();
    expect(() => resolveCreateStatus(1)).toThrow();
    expect(() => resolveCreateStatus({})).toThrow();
  });
});

describe('削除できるイベント（canDeleteEvent）', () => {
  const ev = (status: EventConfig['status']) => ({ status });

  it('下書きと終了は削除できる', () => {
    expect(canDeleteEvent(ev('draft'))).toBe(true);
    expect(canDeleteEvent(ev('ended'))).toBe(true);
  });

  it('開催中は削除できない（先に終了させる運用）', () => {
    expect(canDeleteEvent(ev('live'))).toBe(false);
  });
});
