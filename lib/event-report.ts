// lib/event-report.ts
// 削除前に必ず残す「数字」の集計と保存。
//
// 方針（消去より保全を優先）:
// - 日次リセット: 消す前にその時点の件数を dailyStats にスナップショットする。
// 保存に失敗したらリセット自体を中止する（呼び出し側で再試行）。
// - 終了処理: 最終レポートを event_reports（削除対象の外）に保存できた場合のみ削除に進む。
// - 電話番号そのものはレポートに含めない。残すのは件数と集計だけ。
import { FieldValue} from 'firebase-admin/firestore';
import { db} from './firebase-admin';
import {
EVENT_SUBCOLLECTIONS,
EventConfig,
EventSubcollection,
jstDateString,
} from './event';

export type SubcollectionCounts = Record<EventSubcollection, number>;

export interface EventDailyStat extends SubcollectionCounts {
/** JST 日付（'YYYY-MM-DD'）。リセット実行時点の件数スナップショット */
date: string;
}

export interface CampaignSend {
campaignId: string;
title: string;
sentCount: number;
sentAt: string;
}

export type ReportEmailStatus = 'pending' | 'sent' | 'failed' | 'no-recipient';

export interface EventFinalReport {
eventId: string;
eventName: string;
ownerUid: string;
periodStart: string;
periodEnd: string;
dailyStats: EventDailyStat[];
/** 終了処理の直前（削除前）の最終件数 */
finalCounts: SubcollectionCounts;
/** 配信ごとの送信通数（配信のメータリング基盤が記録する。未記録なら空） */
campaignSends: CampaignSend[];
emailStatus: ReportEmailStatus;
emailAttempts: number;
createdAt: string;
}

const REPORTS_COLLECTION = 'event_reports';
const REPORT_BACKUPS_COLLECTION = 'event_report_backups';
const DAILY_STATS_SUBCOLLECTION = 'dailyStats';
const CAMPAIGNS_SUBCOLLECTION = 'campaigns';

const ALL_SUBCOLLECTIONS = Object.values(EVENT_SUBCOLLECTIONS);

function eventDoc(eventId: string) {
return db.collection('events').doc(eventId);
}

async function countDocs(
ref: FirebaseFirestore.CollectionReference,
): Promise<number> {
const snap = await ref.count().get();
return snap.data().count;
}

async function countAllSubcollections(
eventId: string,
): Promise<SubcollectionCounts> {
const counts = {} as SubcollectionCounts;
for (const name of ALL_SUBCOLLECTIONS) {
counts[name] = await countDocs(eventDoc(eventId).collection(name));
}
return counts;
}

/**
* 日次スナップショット: いまの件数を events/{eventId}/dailyStats/{日付} に保存する。
* 方式Bで保持されるコレクションは累計値、毎日消えるコレクションはその日の値になる。
* 失敗したら例外を投げる（リセットを中止させるため）。
*/
export async function snapshotDailyStats(
event: EventConfig,
now: Date,
): Promise<EventDailyStat> {
const date = jstDateString(now);
const counts = await countAllSubcollections(event.id);
const stat: EventDailyStat = { date,...counts};
await eventDoc(event.id)
.collection(DAILY_STATS_SUBCOLLECTION)
.doc(date)
.set({...stat, recordedAt: FieldValue.serverTimestamp()}, { merge: true});
return stat;
}

export async function readDailyStats(
eventId: string,
): Promise<EventDailyStat[]> {
const snap = await eventDoc(eventId).collection(DAILY_STATS_SUBCOLLECTION).get();
return snap.docs
.map((doc) => {
const d = doc.data();
return {
date: d.date,
subscribers: d.subscribers?? 0,
members: d.members?? 0,
claims: d.claims?? 0,
redemptions: d.redemptions?? 0,
} as EventDailyStat;
})
.sort((a, b) => a.date.localeCompare(b.date));
}

async function readCampaignSends(eventId: string): Promise<CampaignSend[]> {
const snap = await eventDoc(eventId).collection(CAMPAIGNS_SUBCOLLECTION).get();
return snap.docs
.map((doc) => {
const d = doc.data();
return {
campaignId: doc.id,
title: d.title?? '',
sentCount: d.sentCount?? 0,
sentAt: d.sentAt?.toDate?.().toISOString()?? d.sentAt?? '',
} as CampaignSend;
})
.sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

function reportDoc(eventId: string) {
return db.collection(REPORTS_COLLECTION).doc(eventId);
}

function toReport(data: FirebaseFirestore.DocumentData): EventFinalReport {
return {
eventId: data.eventId,
eventName: data.eventName,
ownerUid: data.ownerUid,
periodStart: data.periodStart,
periodEnd: data.periodEnd,
dailyStats: data.dailyStats?? [],
finalCounts: data.finalCounts,
campaignSends: data.campaignSends?? [],
emailStatus: data.emailStatus?? 'pending',
emailAttempts: data.emailAttempts?? 0,
createdAt: data.createdAt?.toDate?.().toISOString()?? data.createdAt?? '',
};
}

export async function getFinalReport(
eventId: string,
): Promise<EventFinalReport | null> {
const snap = await reportDoc(eventId).get();
return snap.exists? toReport(snap.data()!): null;
}

/**
* 最終レポートを集計して保存する。既に保存済みならそれを返す（冪等）。
* 失敗したら例外を投げる（終了処理＝削除を中止させるため）。
*/
export async function buildAndPersistFinalReport(
event: EventConfig,
now: Date,
): Promise<EventFinalReport> {
const existing = await getFinalReport(event.id);
if (existing) return existing;

// 終了日ぶんのスナップショットも残してから集計する
await snapshotDailyStats(event, now);
const [dailyStats, finalCounts, campaignSends] = await Promise.all([
readDailyStats(event.id),
countAllSubcollections(event.id),
readCampaignSends(event.id),
]);

const report: EventFinalReport = {
eventId: event.id,
eventName: event.name,
ownerUid: event.ownerUid,
periodStart: event.startDate,
periodEnd: event.endDate,
dailyStats,
finalCounts,
campaignSends,
emailStatus: 'pending',
emailAttempts: 0,
createdAt: now.toISOString(),
};
await reportDoc(event.id).set({
...report,
createdAt: FieldValue.serverTimestamp(),
});
return report;
}

/** メール再送スイープ用: 未送信・失敗のレポートを取得する */
export async function listReportsAwaitingEmail(
limit: number = 10,
): Promise<EventFinalReport[]> {
const snap = await db
.collection(REPORTS_COLLECTION)
.where('emailStatus', 'in', ['pending', 'failed'])
.limit(limit)
.get();
return snap.docs.map((doc) => toReport(doc.data()));
}

export async function updateReportEmailStatus(
eventId: string,
status: ReportEmailStatus,
): Promise<void> {
await reportDoc(eventId).update({
emailStatus: status,
emailAttempts: FieldValue.increment(1),
lastEmailAttemptAt: FieldValue.serverTimestamp(),
});
}

/** バックアップの自動消去期限を計算する（作成日時＋保持日数）。純粋関数・テスト対象。 */
export function backupExpiresAt(createdAtIso: string, retentionDays: number): string {
  const created = new Date(createdAtIso);
  return new Date(created.getTime() + retentionDays * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * 最終レポートの運営用バックアップを、削除対象の外（event_report_backups）に取る。
 * 主催者との契約・イベントデータのライフサイクルとは切り離し、運営側の保険とする
 * （メール紛失・課金トラブル時に、保持期間内なら運営が再送・確認できる）。
 * 中身は集計レポートのみで、電話番号は含まない。
 * 既にあれば何もしない（冪等）。失敗したら例外を投げる（終了処理＝削除を中止させるため）。
 */
export async function ensureReportBackup(
  report: EventFinalReport,
  retentionDays: number,
  now: Date,
): Promise<void> {
  const ref = db.collection(REPORT_BACKUPS_COLLECTION).doc(report.eventId);
  const existing = await ref.get();
  if (existing.exists) return;
  await ref.set({
    ...report,
    backedUpAt: FieldValue.serverTimestamp(),
    expiresAt: backupExpiresAt(now.toISOString(), retentionDays),
  });
}

/**
 * 保持期限を過ぎた運営用バックアップを消去する（tick から呼ばれる）。
 * 1回あたりの件数に上限を設け、残りは次回 tick で消す。
 */
export async function sweepExpiredReportBackups(
  now: Date,
  limit: number = 100,
): Promise<number> {
  const snap = await db
    .collection(REPORT_BACKUPS_COLLECTION)
    .where('expiresAt', '<=', now.toISOString())
    .limit(limit)
    .get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snap.size;
}

/** レポートのメール本文（HTML）を組み立てる。純粋関数・テスト対象。 */
export function formatFinalReportHtml(report: EventFinalReport): string {
const rows = report.dailyStats
.map(
(s) =>
`<tr><td>${s.date}</td><td>${s.subscribers}</td><td>${s.members}</td><td>${s.claims}</td><td>${s.redemptions}</td></tr>`,
)
.join('');
const totalSent = report.campaignSends.reduce((sum, c) => sum + c.sentCount, 0);
const campaignRows =
report.campaignSends.length > 0
? report.campaignSends
.map(
(c) =>
`<tr><td>${c.title || c.campaignId}</td><td>${c.sentCount}</td></tr>`,
)
.join('')
: '<tr><td colspan="2">記録された配信はありません</td></tr>';

return `
<h2>開催結果レポート：${report.eventName}</h2>
<p>開催期間：${report.periodStart} 〜 ${report.periodEnd}</p>
<h3>日別の件数</h3>
<table border="1" cellspacing="0" cellpadding="6">
<tr><th>日付</th><th>購読者数</th><th>登録者数（電話番号）</th><th>クーポン取得</th><th>クーポン消込</th></tr>
${rows}
</table>
<h3>最終件数（削除直前）</h3>
<ul>
<li>購読者数：${report.finalCounts.subscribers}</li>
<li>登録者数（電話番号）：${report.finalCounts.members}</li>
<li>クーポン取得：${report.finalCounts.claims}</li>
<li>クーポン消込：${report.finalCounts.redemptions}</li>
</ul>
<h3>配信通数（合計 ${totalSent} 通）</h3>
<table border="1" cellspacing="0" cellpadding="6">
<tr><th>配信</th><th>送信数</th></tr>
${campaignRows}
</table>
<p>※電話番号などの個人情報は、規約どおりイベント終了に伴い削除されました。本レポートには件数・集計のみを記載しています。</p>`;
}
