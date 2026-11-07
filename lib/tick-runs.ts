// スケジューラ（event-tick）の実行記録と健全性の判定。
// 記録は tickRuns コレクションに1実行1件で残し、運営コンソールの
// 運用監視とアラート判定（連続失敗・長時間停止）がこれを読む。
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';

const TICK_RUNS_COLLECTION = 'tickRuns';

/** 15分間隔のスケジューラがこの分数を超えて止まっていたら「停止」とみなす。 */
export const TICK_STALL_MINUTES = 45;

export interface TickRun {
  id: string;
  /** 実行時刻（ISO） */
  at: string;
  /** tick 全体が例外なく完了したか（イベント単位の失敗は errorsCount に数える） */
  ok: boolean;
  durationMs: number;
  eventsProcessed: number;
  campaignsSent: number;
  errorsCount: number;
  error: string | null;
}

export interface TickRunInput {
  ok: boolean;
  durationMs: number;
  eventsProcessed: number;
  campaignsSent: number;
  errorsCount: number;
  error?: string | null;
}

export async function recordTickRun(input: TickRunInput): Promise<void> {
  await db.collection(TICK_RUNS_COLLECTION).add({
    at: FieldValue.serverTimestamp(),
    ok: input.ok,
    durationMs: input.durationMs,
    eventsProcessed: input.eventsProcessed,
    campaignsSent: input.campaignsSent,
    errorsCount: input.errorsCount,
    error: input.error ?? null,
  });
}

function toTickRun(doc: FirebaseFirestore.DocumentSnapshot): TickRun {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    at: d.at?.toDate?.().toISOString() ?? '',
    ok: d.ok === true,
    durationMs: typeof d.durationMs === 'number' ? d.durationMs : 0,
    eventsProcessed: typeof d.eventsProcessed === 'number' ? d.eventsProcessed : 0,
    campaignsSent: typeof d.campaignsSent === 'number' ? d.campaignsSent : 0,
    errorsCount: typeof d.errorsCount === 'number' ? d.errorsCount : 0,
    error: (d.error as string | null) ?? null,
  };
}

/** 新しい順に直近の実行記録を返す。 */
export async function listRecentTickRuns(limit: number = 10): Promise<TickRun[]> {
  const snap = await db
    .collection(TICK_RUNS_COLLECTION)
    .orderBy('at', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map(toTickRun);
}

/** 直近から連続している失敗の回数（純粋関数）。 */
export function countConsecutiveFailures(runs: TickRun[]): number {
  let count = 0;
  for (const run of runs) {
    if (run.ok) break;
    count += 1;
  }
  return count;
}

export interface TickHealth {
  lastRunAt: string | null;
  lastOk: boolean | null;
  consecutiveFailures: number;
  minutesSinceLastRun: number | null;
  /** 最終実行から TICK_STALL_MINUTES を超えている（記録が無い場合は false） */
  stalled: boolean;
}

export function summarizeTickHealth(runs: TickRun[], now: Date): TickHealth {
  const last = runs[0] ?? null;
  const minutes =
    last && last.at
      ? Math.max(0, Math.floor((now.getTime() - new Date(last.at).getTime()) / 60000))
      : null;
  return {
    lastRunAt: last?.at ?? null,
    lastOk: last ? last.ok : null,
    consecutiveFailures: countConsecutiveFailures(runs),
    minutesSinceLastRun: minutes,
    stalled: minutes !== null && minutes > TICK_STALL_MINUTES,
  };
}
