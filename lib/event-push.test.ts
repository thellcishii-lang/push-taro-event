// lib/event-push.test.ts
import { describe, expect, it } from 'vitest';
import { localeTopic } from './event';
import {
  EventCampaign,
  isCampaignDue,
  isFifteenMinuteSlot,
  jstDateTimeString,
  localizedCampaignTexts,
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

describe('localeTopic', () => {
  it('言語別トピック名を組み立てる', () => {
    expect(localeTopic('ev1', 'ja')).toBe('event_ev1_users_ja');
    expect(localeTopic('ev1', 'ko')).toBe('event_ev1_users_ko');
  });
});

describe('localizedCampaignTexts', () => {
  const base = {
    title: 'お知らせ',
    body: '本文です',
    titleI18n: { ja: 'お知らせ', en: 'Notice' },
    bodyI18n: { ja: '本文です', en: 'Body text' },
  };
  it('4言語分を返し、ある言語はその文面を使う', () => {
    const texts = localizedCampaignTexts(base, 'ja');
    expect(texts.map((t) => t.locale)).toEqual(['ja', 'en', 'zh', 'ko']);
    expect(texts.find((t) => t.locale === 'en')?.title).toBe('Notice');
    expect(texts.find((t) => t.locale === 'ja')?.body).toBe('本文です');
  });
  it('無い言語はイベントのデフォルトへフォールバックする', () => {
    const texts = localizedCampaignTexts(base, 'en');
    expect(texts.find((t) => t.locale === 'zh')?.title).toBe('Notice');
    expect(texts.find((t) => t.locale === 'ko')?.body).toBe('Body text');
  });
  it('翻訳マップが空なら全言語で原文を使う', () => {
    const texts = localizedCampaignTexts(
      { title: 'お知らせ', body: '本文です', titleI18n: {}, bodyI18n: {} },
      'en',
    );
    for (const text of texts) {
      expect(text.title).toBe('お知らせ');
      expect(text.body).toBe('本文です');
    }
  });
});
