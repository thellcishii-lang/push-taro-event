import { describe, expect, it } from 'vitest';
import {
  EventFinalReport,
  backupExpiresAt,
  formatFinalReportHtml,
} from './event-report';

const report: EventFinalReport = {
  eventId: 'ev1',
  eventName: 'テスト展示会2026',
  ownerUid: 'owner1',
  periodStart: '2026-11-07',
  periodEnd: '2026-11-08',
  dailyStats: [
    { date: '2026-11-07', subscribers: 1200, members: 1200, claims: 300, redemptions: 210 },
    { date: '2026-11-08', subscribers: 2500, members: 2500, claims: 640, redemptions: 480 },
  ],
  finalCounts: { subscribers: 2500, members: 2500, claims: 640, redemptions: 480 },
  campaignSends: [
    { campaignId: 'c1', title: '開場のお知らせ', sentCount: 1200, sentAt: '2026-11-07T00:00:00.000Z' },
    { campaignId: 'c2', title: '午後の見どころ', sentCount: 2500, sentAt: '2026-11-08T03:00:00.000Z' },
  ],
  emailStatus: 'pending',
  emailAttempts: 0,
  createdAt: '2026-11-09T00:00:00.000Z',
};

describe('backupExpiresAt', () => {
  it('30日保持なら作成日時の30日後が期限になる（月またぎ）', () => {
    expect(backupExpiresAt('2026-11-09T00:00:00.000Z', 30)).toBe(
      '2026-12-09T00:00:00.000Z',
    );
  });
  it('保持日数は契約ごとに変えられる', () => {
    expect(backupExpiresAt('2026-11-09T00:00:00.000Z', 7)).toBe(
      '2026-11-16T00:00:00.000Z',
    );
  });
});

describe('formatFinalReportHtml', () => {
  it('イベント名・期間・日別件数・最終件数・配信合計を含む', () => {
    const html = formatFinalReportHtml(report);
    expect(html).toContain('テスト展示会2026');
    expect(html).toContain('2026-11-07');
    expect(html).toContain('2500');
    expect(html).toContain('3700'); // 配信合計 1200 + 2500
    expect(html).toContain('開場のお知らせ');
  });

  it('電話番号そのものは含まない（件数のみ）', () => {
    const html = formatFinalReportHtml(report);
    expect(html).not.toMatch(/0[789]0-\d{4}-\d{4}/);
    expect(html).toContain('個人情報は');
  });

  it('配信が無い場合はその旨を表示する', () => {
    const html = formatFinalReportHtml({ ...report, campaignSends: [] });
    expect(html).toContain('記録された配信はありません');
    expect(html).toContain('合計 0 通');
  });

  it('出店者課金の入金合計があれば表示する', () => {
    const html = formatFinalReportHtml({ ...report, billingTotalPaid: 12000 });
    expect(html).toContain('出店者課金の入金合計');
    expect(html).toContain('12,000');
  });

  it('課金合計が無ければ課金の行は出ない', () => {
    const html = formatFinalReportHtml(report);
    expect(html).not.toContain('出店者課金の入金合計');
  });
});
