import { describe, expect, it } from 'vitest';
import {
  countConsecutiveFailures,
  summarizeTickHealth,
  type TickRun,
} from './tick-runs';

function run(at: string, ok: boolean): TickRun {
  return {
    id: at,
    at,
    ok,
    durationMs: 100,
    eventsProcessed: 0,
    campaignsSent: 0,
    errorsCount: 0,
    error: null,
  };
}

const NOW = new Date('2026-11-07T12:00:00Z');

describe('countConsecutiveFailures', () => {
  it('直近からの連続失敗を数える', () => {
    expect(
      countConsecutiveFailures([run('a', false), run('b', false), run('c', true)]),
    ).toBe(2);
    expect(countConsecutiveFailures([run('a', true), run('b', false)])).toBe(0);
    expect(countConsecutiveFailures([])).toBe(0);
  });
});

describe('summarizeTickHealth', () => {
  it('記録が無ければ null 系で返す', () => {
    const health = summarizeTickHealth([], NOW);
    expect(health.lastRunAt).toBeNull();
    expect(health.minutesSinceLastRun).toBeNull();
    expect(health.stalled).toBe(false);
  });
  it('45分を超えたら stalled', () => {
    const health = summarizeTickHealth([run('2026-11-07T11:14:00Z', true)], NOW);
    expect(health.minutesSinceLastRun).toBe(46);
    expect(health.stalled).toBe(true);
  });
  it('45分以内なら stalled ではない', () => {
    const health = summarizeTickHealth([run('2026-11-07T11:45:00Z', false)], NOW);
    expect(health.minutesSinceLastRun).toBe(15);
    expect(health.stalled).toBe(false);
    expect(health.consecutiveFailures).toBe(1);
    expect(health.lastOk).toBe(false);
  });
});
