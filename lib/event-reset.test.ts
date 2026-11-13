import { describe, expect, it } from 'vitest';
import {
  EVENT_SUBCOLLECTIONS,
  groupSubscriberTokensByLocale,
  resetTargets,
} from './event-reset';

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

describe('groupSubscriberTokensByLocale', () => {
  it('トークンを言語ごとに分ける', () => {
    const byLocale = groupSubscriberTokensByLocale([
      { fcmToken: 'tok-ja-1', lang: 'ja' },
      { fcmToken: 'tok-en-1', lang: 'en' },
      { fcmToken: 'tok-ja-2', lang: 'ja' },
    ]);
    expect(byLocale.get('ja')).toEqual(['tok-ja-1', 'tok-ja-2']);
    expect(byLocale.get('en')).toEqual(['tok-en-1']);
    expect(byLocale.size).toBe(2);
  });

  it('トークンの無いドキュメントは対象外にする', () => {
    const byLocale = groupSubscriberTokensByLocale([
      { lang: 'ja' },
      { fcmToken: '', lang: 'ja' },
      { fcmToken: 123, lang: 'ja' },
      { fcmToken: 'tok-1', lang: 'ja' },
    ]);
    expect(byLocale.get('ja')).toEqual(['tok-1']);
    expect(byLocale.size).toBe(1);
  });

  it('言語が無い・不正なドキュメントは既定言語（ja）に寄せる', () => {
    const byLocale = groupSubscriberTokensByLocale([
      { fcmToken: 'tok-1' },
      { fcmToken: 'tok-2', lang: 'fr' },
    ]);
    expect(byLocale.get('ja')).toEqual(['tok-1', 'tok-2']);
  });

  it('空入力では空の Map を返す', () => {
    expect(groupSubscriberTokensByLocale([]).size).toBe(0);
  });
});
