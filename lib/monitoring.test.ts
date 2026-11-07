import { describe, expect, it } from 'vitest';
import {
  buildAlertCandidates,
  isCampaignStuck,
  selectAlertsToSend,
  type AlertCandidate,
} from './monitoring';

const NOW = new Date('2026-11-07T12:00:00Z');

describe('isCampaignStuck', () => {
  const base = { status: 'sending' as const, createdAt: '2026-11-07T11:00:00Z' };
  it('送信開始から30分超で滞留', () => {
    expect(
      isCampaignStuck({ ...base, sendingStartedAt: '2026-11-07T11:29:00Z' }, NOW),
    ).toBe(true);
    expect(
      isCampaignStuck({ ...base, sendingStartedAt: '2026-11-07T11:45:00Z' }, NOW),
    ).toBe(false);
  });
  it('sendingStartedAt が無ければ createdAt で判定', () => {
    expect(isCampaignStuck({ ...base, sendingStartedAt: null }, NOW)).toBe(true);
  });
  it('sending 以外は滞留ではない', () => {
    expect(
      isCampaignStuck(
        { status: 'sent', sendingStartedAt: '2026-11-07T10:00:00Z', createdAt: '2026-11-07T10:00:00Z' },
        NOW,
      ),
    ).toBe(false);
  });
});

describe('buildAlertCandidates', () => {
  it('連続失敗3回からアラートになる', () => {
    const none = buildAlertCandidates({
      consecutiveTickFailures: 2,
      failed: [],
      stuck: [],
      provisioningFailures24h: 0,
      unsentReports: [],
      now: NOW,
    });
    expect(none).toHaveLength(0);
    const some = buildAlertCandidates({
      consecutiveTickFailures: 3,
      failed: [],
      stuck: [],
      provisioningFailures24h: 0,
      unsentReports: [],
      now: NOW,
    });
    expect(some.map((a) => a.key)).toContain('tick-failures');
  });
  it('未送信レポートは24時間を超えたものだけ', () => {
    const alerts = buildAlertCandidates({
      consecutiveTickFailures: 0,
      failed: [],
      stuck: [],
      provisioningFailures24h: 0,
      unsentReports: [
        { eventName: '新しい展示会', createdAt: '2026-11-07T06:00:00Z' },
        { eventName: '古い展示会', createdAt: '2026-11-06T06:00:00Z' },
      ],
      now: NOW,
    });
    const reportAlert = alerts.find((a) => a.key === 'reports-unsent');
    expect(reportAlert).toBeDefined();
    expect(reportAlert!.detail).toContain('古い展示会');
    expect(reportAlert!.detail).not.toContain('新しい展示会');
  });
});

describe('selectAlertsToSend', () => {
  const candidates: AlertCandidate[] = [
    { key: 'a', title: 'A', detail: '' },
    { key: 'b', title: 'B', detail: '' },
  ];
  it('クールダウン中は送らない', () => {
    const state = { a: '2026-11-07T11:00:00Z' }; // 1時間前 < 6時間
    expect(selectAlertsToSend(candidates, state, NOW).map((c) => c.key)).toEqual(['b']);
  });
  it('クールダウンを過ぎたら再送する', () => {
    const state = { a: '2026-11-07T05:00:00Z', b: '2026-11-07T05:30:00Z' }; // 7時間前・6時間半前
    expect(selectAlertsToSend(candidates, state, NOW)).toHaveLength(2);
  });
});
