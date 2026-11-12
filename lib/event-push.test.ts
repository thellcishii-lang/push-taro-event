// lib/event-push.test.ts
import { describe, expect, it } from 'vitest';
import { localeTopic } from './event';
import {
  EventCampaign,
  buildNotices,
  isCampaignDue,
  isFifteenMinuteSlot,
  jstDateTimeString,
  localizedCampaignTexts,
  parseCampaignAttachment,
  readCampaignAttachment,
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

describe('parseCampaignAttachment', () => {
  const owner = 'owner1';
  const pdf = {
    url: 'https://example.com/flyer.pdf?token=abc',
    type: 'pdf',
    storagePath: 'organizers/owner1/events/ev1/campaign-files/abc.pdf',
  };
  const image = {
    url: 'https://example.com/photo.png?token=abc',
    type: 'image',
    storagePath: 'organizers/owner1/events/ev1/campaign-files/def.png',
  };

  it('未指定は添付なしとして受け付ける', () => {
    expect(parseCampaignAttachment('ev1', owner, null)).toEqual({ ok: true, attachment: null });
    expect(parseCampaignAttachment('ev1', owner, undefined)).toEqual({
      ok: true,
      attachment: null,
    });
  });
  it('PDF と画像の添付を受け付ける', () => {
    expect(parseCampaignAttachment('ev1', owner, pdf)).toEqual({ ok: true, attachment: pdf });
    expect(parseCampaignAttachment('ev1', owner, image)).toEqual({ ok: true, attachment: image });
    expect(
      parseCampaignAttachment('ev1', owner, {
        ...image,
        storagePath: 'organizers/owner1/events/ev1/campaign-files/ghi.JPG',
      }).ok,
    ).toBe(true);
  });
  it('他イベントや別ディレクトリのパスは受け付けない', () => {
    expect(
      parseCampaignAttachment('ev1', owner, {
        ...pdf,
        storagePath: 'organizers/owner1/events/ev2/campaign-files/abc.pdf',
      }).ok,
    ).toBe(false);
    expect(
      parseCampaignAttachment('ev1', owner, {
        ...pdf,
        storagePath: 'organizers/owner1/events/ev1/info-pdfs/abc.pdf',
      }).ok,
    ).toBe(false);
    expect(
      parseCampaignAttachment('ev1', owner, {
        ...pdf,
        storagePath: 'organizers/owner1/events/ev1/campaign-files/sub/abc.pdf',
      }).ok,
    ).toBe(false);
    expect(
      parseCampaignAttachment('ev1', owner, {
        ...pdf,
        storagePath: 'organizers/owner1/events/ev1/campaign-files/../abc.pdf',
      }).ok,
    ).toBe(false);
  });
  it('他人の uid のパスや移行前の旧形式パスは登録では受け付けない', () => {
    expect(
      parseCampaignAttachment('ev1', owner, {
        ...pdf,
        storagePath: 'organizers/someone-else/events/ev1/campaign-files/abc.pdf',
      }).ok,
    ).toBe(false);
    expect(
      parseCampaignAttachment('ev1', owner, {
        ...pdf,
        storagePath: 'events/ev1/campaign-files/abc.pdf',
      }).ok,
    ).toBe(false);
  });
  it('種別と拡張子が一致しないものは受け付けない', () => {
    expect(parseCampaignAttachment('ev1', owner, { ...pdf, type: 'image' }).ok).toBe(false);
    expect(
      parseCampaignAttachment('ev1', owner, {
        ...image,
        storagePath: 'organizers/owner1/events/ev1/campaign-files/x.bmp',
      }).ok,
    ).toBe(false);
    expect(parseCampaignAttachment('ev1', owner, { ...pdf, type: 'file' }).ok).toBe(false);
  });
  it('https でない URL や欠けた項目は受け付けない', () => {
    expect(parseCampaignAttachment('ev1', owner, { ...pdf, url: 'http://example.com/x.pdf' }).ok).toBe(false);
    expect(parseCampaignAttachment('ev1', owner, { type: 'pdf', storagePath: pdf.storagePath }).ok).toBe(false);
    expect(parseCampaignAttachment('ev1', owner, 'not-an-object').ok).toBe(false);
  });
});

describe('readCampaignAttachment', () => {
  it('不正な値は添付なしに倒す', () => {
    expect(readCampaignAttachment('ev1', { url: 'x' })).toBeNull();
    expect(readCampaignAttachment('ev1', null)).toBeNull();
  });
  it('現行形式と移行前の旧形式のどちらも読み取れる', () => {
    expect(
      readCampaignAttachment('ev1', {
        url: 'https://example.com/a.pdf',
        type: 'pdf',
        storagePath: 'organizers/owner1/events/ev1/campaign-files/a.pdf',
      }),
    ).toEqual({
      url: 'https://example.com/a.pdf',
      type: 'pdf',
      storagePath: 'organizers/owner1/events/ev1/campaign-files/a.pdf',
    });
    expect(
      readCampaignAttachment('ev1', {
        url: 'https://example.com/a.pdf',
        type: 'pdf',
        storagePath: 'events/ev1/campaign-files/a.pdf',
      }),
    ).toEqual({
      url: 'https://example.com/a.pdf',
      type: 'pdf',
      storagePath: 'events/ev1/campaign-files/a.pdf',
    });
  });
  it('他イベントのパスは読み取らない', () => {
    expect(
      readCampaignAttachment('ev1', {
        url: 'https://example.com/a.pdf',
        type: 'pdf',
        storagePath: 'organizers/owner1/events/ev2/campaign-files/a.pdf',
      }),
    ).toBeNull();
  });
});

describe('buildNotices', () => {
  const makeCampaign = (overrides: Partial<EventCampaign>): EventCampaign => ({
    id: 'c1',
    title: 'お知らせ',
    body: '本文です',
    titleI18n: { ja: 'お知らせ', en: 'Notice' },
    bodyI18n: { ja: '本文です', en: 'Body text' },
    kind: 'instant',
    status: 'sent',
    scheduledAt: null,
    sentAt: '2026-11-07T01:00:00.000Z',
    sentCount: 3,
    error: null,
    sendingStartedAt: null,
    attachment: null,
    createdAt: '2026-11-07T01:00:00.000Z',
    ...overrides,
  });

  it('送信済みだけを新しい順に返す', () => {
    const notices = buildNotices(
      [
        makeCampaign({ id: 'old', sentAt: '2026-11-06T01:00:00.000Z' }),
        makeCampaign({ id: 'draft', status: 'scheduled', sentAt: null }),
        makeCampaign({ id: 'failed', status: 'failed', sentAt: null }),
        makeCampaign({ id: 'new', sentAt: '2026-11-07T05:00:00.000Z' }),
      ],
      'ja',
    );
    expect(notices.map((n) => n.id)).toEqual(['new', 'old']);
  });
  it('本人の言語で文面を解決し、無ければ原文に落とす', () => {
    const notices = buildNotices([makeCampaign({})], 'en', 'ja');
    expect(notices[0].title).toBe('Notice');
    expect(notices[0].body).toBe('Body text');
    const koNotices = buildNotices(
      [makeCampaign({ titleI18n: {}, bodyI18n: {} })],
      'ko',
      'en',
    );
    expect(koNotices[0].title).toBe('お知らせ');
  });
  it('上限件数で切り、添付を引き継ぐ', () => {
    const attachment = {
      url: 'https://example.com/a.pdf',
      type: 'pdf' as const,
      storagePath: 'organizers/owner1/events/ev1/campaign-files/a.pdf',
    };
    const notices = buildNotices(
      [
        makeCampaign({ id: 'a', sentAt: '2026-11-07T01:00:00.000Z', attachment }),
        makeCampaign({ id: 'b', sentAt: '2026-11-07T02:00:00.000Z' }),
        makeCampaign({ id: 'c', sentAt: '2026-11-07T03:00:00.000Z' }),
      ],
      'ja',
      undefined,
      2,
    );
    expect(notices.map((n) => n.id)).toEqual(['c', 'b']);
    const withAttachment = buildNotices([makeCampaign({ attachment })], 'ja');
    expect(withAttachment[0].attachment).toEqual(attachment);
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
