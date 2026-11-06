import { describe, expect, it } from 'vitest';
import { EVENT_SUBCOLLECTIONS, resetTargets } from './event-reset';

describe('resetTargets', () => {
  it('方式A（full-daily）の日次リセットは全サブコレクションを消す', () => {
    expect(resetTargets('full-daily', 'daily')).toEqual([
      EVENT_SUBCOLLECTIONS.subscribers,
      EVENT_SUBCOLLECTIONS.members,
      EVENT_SUBCOLLECTIONS.claims,
      EVENT_SUBCOLLECTIONS.redemptions,
    ]);
  });

  it('方式B（keep-phones）の日次リセットは購読だけを消し、電話番号と記録は保持する', () => {
    expect(resetTargets('keep-phones', 'daily')).toEqual([
      EVENT_SUBCOLLECTIONS.subscribers,
    ]);
  });

  it('終了処理は方式によらず全サブコレクションを消す（電話番号消去）', () => {
    const all = [
      EVENT_SUBCOLLECTIONS.subscribers,
      EVENT_SUBCOLLECTIONS.members,
      EVENT_SUBCOLLECTIONS.claims,
      EVENT_SUBCOLLECTIONS.redemptions,
    ];
    expect(resetTargets('full-daily', 'finalize')).toEqual(all);
    expect(resetTargets('keep-phones', 'finalize')).toEqual(all);
  });
});
