// 運用監視：異常の収集（コンソール表示用）と、重大アラートの運営メール送信。
//
// アラート方針（Ishii 決定）: 重大な異常だけ即時メール。同じ異常の連投を防ぐため、
// 異常キーごとにクールダウン（既定6時間）を system/alertState に記録する。
// 送信に失敗したら状態を更新しない（次の tick で送り直す）。
import { db} from './firebase-admin';
import { sendEmail} from './mailer';
import { jstDateString, type EventConfig} from './event';
import { listLiveEvents, listUnfinalizedEvents} from './event-store';
import { listCampaigns, type EventCampaign} from './event-push';
import { listReportsAwaitingEmail} from './event-report';
import {
countConsecutiveFailures,
listRecentTickRuns,
summarizeTickHealth,
type TickHealth,
type TickRun,
} from './tick-runs';

export const OPERATOR_ALERT_EMAIL = 'info@push-taro.com';
export const ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000;
export const CAMPAIGN_STUCK_MINUTES = 30;
const ALERT_STATE_DOC = 'alertState';

// ─── 異常の収集 ───

export interface CampaignIssue {
eventId: string;
eventName: string;
campaignId: string;
title: string;
error: string | null;
at: string | null;
}

export interface MonitoringSnapshot {
tick: TickHealth;
recentRuns: TickRun[];
failedCampaigns: CampaignIssue[];
stuckCampaigns: CampaignIssue[];
unfinalizedEvents: Array<{ eventId: string; name: string; endDate: string}>;
unsentReports: Array<{
eventId: string;
eventName: string;
emailStatus: string;
createdAt: string;
}>;
provisioningFailures24h: number;
}

/** 送信中（sending）のまま閾値を超えて残っている配信か（純粋関数）。 */
export function isCampaignStuck(
campaign: Pick<EventCampaign, 'status' | 'sendingStartedAt' | 'createdAt'>,
now: Date,
thresholdMinutes: number = CAMPAIGN_STUCK_MINUTES,
): boolean {
if (campaign.status!== 'sending') return false;
const since = campaign.sendingStartedAt?? campaign.createdAt;
if (!since) return false;
return now.getTime() - new Date(since).getTime() > thresholdMinutes * 60 * 1000;
}

async function candidateEvents(): Promise<EventConfig[]> {
const byId = new Map<string, EventConfig>();
for (const event of await listLiveEvents()) byId.set(event.id, event);
for (const event of await listUnfinalizedEvents()) {
if (!byId.has(event.id)) byId.set(event.id, event);
}
return [...byId.values()];
}

async function scanCampaignIssues(
events: EventConfig[],
now: Date,
): Promise<{ failed: CampaignIssue[]; stuck: CampaignIssue[]}> {
const failed: CampaignIssue[] = [];
const stuck: CampaignIssue[] = [];
for (const event of events) {
const campaigns = await listCampaigns(event.id);
for (const campaign of campaigns) {
if (campaign.status === 'failed') {
failed.push({
eventId: event.id,
eventName: event.name,
campaignId: campaign.id,
title: campaign.title,
error: campaign.error,
at: campaign.sentAt?? campaign.createdAt,
});
} else if (isCampaignStuck(campaign, now)) {
stuck.push({
eventId: event.id,
eventName: event.name,
campaignId: campaign.id,
title: campaign.title,
error: null,
at: campaign.sendingStartedAt?? campaign.createdAt,
});
}
}
}
return { failed, stuck};
}

export async function countRecentProvisioningFailures(now: Date): Promise<number> {
const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const snap = await db
.collection('provisioningLogs')
.where('result', '==', 'failed')
.where('at', '>', since)
.count()
.get();
return snap.data().count;
}

export async function collectMonitoringSnapshot(
now: Date = new Date(),
): Promise<MonitoringSnapshot> {
const runs = await listRecentTickRuns(10);
const events = await candidateEvents();
const { failed, stuck} = await scanCampaignIssues(events, now);
const overdueDate = jstDateString(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
const unfinalizedEvents = events
.filter((e) => e.finalizedAt === null && e.endDate < overdueDate)
.map((e) => ({ eventId: e.id, name: e.name, endDate: e.endDate}));
const reports = await listReportsAwaitingEmail(50);
return {
tick: summarizeTickHealth(runs, now),
recentRuns: runs,
failedCampaigns: failed,
stuckCampaigns: stuck,
unfinalizedEvents,
unsentReports: reports.map((r) => ({
eventId: r.eventId,
eventName: r.eventName,
emailStatus: r.emailStatus,
createdAt: r.createdAt,
})),
provisioningFailures24h: await countRecentProvisioningFailures(now),
};
}

// ─── アラート ───

export interface AlertCandidate {
key: string;
title: string;
detail: string;
}

export function buildAlertCandidates(input: {
consecutiveTickFailures: number;
failed: CampaignIssue[];
stuck: CampaignIssue[];
provisioningFailures24h: number;
unsentReports: Array<{ eventName: string; createdAt: string}>;
now: Date;
}): AlertCandidate[] {
const alerts: AlertCandidate[] = [];
if (input.consecutiveTickFailures >= 3) {
alerts.push({
key: 'tick-failures',
title: 'スケジューラ（event-tick）が連続で失敗しています',
detail: `連続失敗 ${input.consecutiveTickFailures} 回`,
});
}
for (const f of input.failed) {
alerts.push({
key: `campaign-failed:${f.eventId}:${f.campaignId}`,
title: `配信が失敗しました：${f.title}`,
detail: `${f.eventName} ／ ${f.error?? '理由不明'}`,
});
}
for (const s of input.stuck) {
alerts.push({
key: `campaign-stuck:${s.eventId}:${s.campaignId}`,
title: `配信処理が滞留しています：${s.title}`,
detail: `${s.eventName} ／ 送信開始 ${s.at?? '不明'}`,
});
}
if (input.provisioningFailures24h > 0) {
alerts.push({
key: 'provisioning-failed',
title: '契約者の自動登録に失敗がありました',
detail: `直近24時間で ${input.provisioningFailures24h} 件`,
});
}
const staleUnsent = input.unsentReports.filter(
(r) => input.now.getTime() - new Date(r.createdAt).getTime() > 24 * 60 * 60 * 1000,
);
if (staleUnsent.length > 0) {
alerts.push({
key: 'reports-unsent',
title: '最終レポートメールが未送信のままです（24時間超）',
detail: staleUnsent.map((r) => r.eventName).join('、'),
});
}
return alerts;
}

/** クールダウン中の異常を除く（純粋関数）。 */
export function selectAlertsToSend(
candidates: AlertCandidate[],
state: Record<string, string>,
now: Date,
cooldownMs: number = ALERT_COOLDOWN_MS,
): AlertCandidate[] {
return candidates.filter((candidate) => {
const last = state[candidate.key];
if (!last) return true;
return now.getTime() - new Date(last).getTime() >= cooldownMs;
});
}

async function readAlertState(): Promise<Record<string, string>> {
const snap = await db.collection('system').doc(ALERT_STATE_DOC).get();
const keys = snap.data()?.keys;
return keys && typeof keys === 'object'? (keys as Record<string, string>): {};
}

async function recordAlertsSent(keys: string[], now: Date): Promise<void> {
const patch: Record<string, string> = {};
for (const key of keys) patch[key] = now.toISOString();
await db
.collection('system')
.doc(ALERT_STATE_DOC)
.set({ keys: patch}, { merge: true});
}

function escapeHtml(value: string): string {
return value
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;');
}

/**
* 異常を集めて、クールダウンを除いた分を1通にまとめて運営へ送る。
* tick の最後に呼ばれる前提で、例外は呼び出し側で握る。
*/
export async function dispatchOperatorAlerts(now: Date = new Date()): Promise<void> {
const runs = await listRecentTickRuns(10);
const events = await candidateEvents();
const { failed, stuck} = await scanCampaignIssues(events, now);
const reports = await listReportsAwaitingEmail(50);
const candidates = buildAlertCandidates({
consecutiveTickFailures: countConsecutiveFailures(runs),
failed,
stuck,
provisioningFailures24h: await countRecentProvisioningFailures(now),
unsentReports: reports.map((r) => ({ eventName: r.eventName, createdAt: r.createdAt})),
now,
});
if (candidates.length === 0) return;

const state = await readAlertState();
const toSend = selectAlertsToSend(candidates, state, now);
if (toSend.length === 0) return;

const html = toSend
.map(
(a) =>
`<p><strong>${escapeHtml(a.title)}</strong><br>${escapeHtml(a.detail)}</p>`,
)
.join('\n');
const result = await sendEmail({
to: OPERATOR_ALERT_EMAIL,
subject: `運用アラート（${toSend.length}件）`,
html,
});
if (result.success) {
await recordAlertsSent(
toSend.map((a) => a.key),
now,
);
}
}

