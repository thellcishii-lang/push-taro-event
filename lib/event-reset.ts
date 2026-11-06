// lib/event-reset.ts
// イベントの日次リセットと終了処理（電話番号消去）の実行処理。
//
// 干渉させないためのポイント:
// - 削除対象は events/{eventId} 配下のサブコレクションだけ。他イベントには一切触れない。
// - 削除は小さなバッチで刻み、1回の実行には上限（予算）を設ける。
//   予算を使い切ったら途中でも戻り、次の tick で「残り」から自然に再開される
//   （消えたドキュメントは二度と対象にならないため、状態を持たなくても再開可能で冪等）。
// - 完了の記録（lastResetDate / finalizedAt）は、全対象が空になってからだけ付ける。
import { db } from './firebase-admin';
import {
  EVENT_SUBCOLLECTIONS,
  EventConfig,
  EventResetMode,
  EventSubcollection,
  jstDateString,
} from './event';
import { updateEvent } from './event-store';
import { buildAndPersistFinalReport, snapshotDailyStats } from './event-report';
import { trySendFinalReportEmail } from './event-report-send';

export { EVENT_SUBCOLLECTIONS };
export type { EventSubcollection };

const ALL_SUBCOLLECTIONS: EventSubcollection[] = [
  EVENT_SUBCOLLECTIONS.subscribers,
  EVENT_SUBCOLLECTIONS.members,
  EVENT_SUBCOLLECTIONS.claims,
  EVENT_SUBCOLLECTIONS.redemptions,
];

/** リセット種別ごとに消すサブコレクションを決める（純粋関数・テスト対象） */
export function resetTargets(
  mode: EventResetMode,
  kind: 'daily' | 'finalize',
): EventSubcollection[] {
  if (kind === 'finalize') return [...ALL_SUBCOLLECTIONS];
  // 日次リセット
  if (mode === 'full-daily') return [...ALL_SUBCOLLECTIONS];
  // keep-phones: 電話番号と取得・消込記録は期間中保持し、購読だけ毎日リセット
  return [EVENT_SUBCOLLECTIONS.subscribers];
}

/** Firestore のバッチ上限（500）に対する安全側のチャンクサイズ。push-job.ts と同じ値。 */
const DELETE_CHUNK_SIZE = 450;

/** 1回の実行で消すドキュメント数の上限。超えた分は次の tick で続きを消す。 */
export const DEFAULT_DELETE_BUDGET = 20_000;

interface DrainResult {
  deleted: number;
  /** 予算を使い切り、まだ残っている可能性がある場合は true */
  exhausted: boolean;
}

/**
 * コレクションを先頭からチャンク削除する。
 * 削除済みのドキュメントは再び現れないため、途中終了しても次回は続きから進む。
 */
async function drainCollection(
  collectionRef: FirebaseFirestore.CollectionReference,
  budget: number,
): Promise<DrainResult> {
  let deleted = 0;
  while (deleted < budget) {
    const limit = Math.min(DELETE_CHUNK_SIZE, budget - deleted);
    const snap = await collectionRef.limit(limit).get();
    if (snap.empty) return { deleted, exhausted: false };
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.size;
    if (snap.size < limit) return { deleted, exhausted: false };
  }
  return { deleted, exhausted: true };
}

export interface EventResetResult {
  eventId: string;
  kind: 'daily' | 'finalize';
  /** 全対象を消し終えたかどうか。false の場合は次の tick で継続される */
  completed: boolean;
  deletedByCollection: Partial<Record<EventSubcollection, number>>;
}

async function executeClear(
  event: EventConfig,
  kind: 'daily' | 'finalize',
  budget: number,
): Promise<EventResetResult> {
  const targets = resetTargets(event.resetMode, kind);
  const deletedByCollection: EventResetResult['deletedByCollection'] = {};
  let remainingBudget = budget;
  let completed = true;

  for (const name of targets) {
    if (remainingBudget <= 0) {
      completed = false;
      break;
    }
    const ref = db
      .collection('events')
      .doc(event.id)
      .collection(name);
    const result = await drainCollection(ref, remainingBudget);
    deletedByCollection[name] = result.deleted;
    remainingBudget -= result.deleted;
    if (result.exhausted) completed = false;
  }

  return { eventId: event.id, kind, completed, deletedByCollection };
}

/**
 * 日次リセットを実行する。
 *
 * 消す前に必ず、その時点の件数を日次スナップショットとして保存する。
 * スナップショットに失敗したら例外となり、削除は一切実行されない
 * （呼び出し側が記録し、次の tick で再試行する。消去より保全を優先）。
 * 完了した場合のみ lastResetDate を今日に進める
 * （未完了なら isResetDue が true のまま残り、次の tick で継続される）。
 */
export async function executeEventReset(
  event: EventConfig,
  now: Date,
  budget: number = DEFAULT_DELETE_BUDGET,
): Promise<EventResetResult> {
  await snapshotDailyStats(event, now);
  const result = await executeClear(event, 'daily', budget);
  if (result.completed) {
    await updateEvent(event.id, { lastResetDate: jstDateString(now) });
  }
  return result;
}

/**
 * 終了処理を実行する。順序は厳密に「集計 → 保存 → 送信 → 削除」:
 * 1. 最終レポートを集計して event_reports に保存する。失敗したら例外となり削除しない。
 * 2. レポートのメール送信を試みる。失敗してもレポートは保存済みなので、
 *    tick の再送スイープと管理画面からの再送で何度でも送り直せる（削除はブロックしない）。
 * 3. 電話番号を含む全対象を削除する。消し終えた場合のみ finalizedAt と status='ended' を記録する。
 * （リセットより優先して呼ばれる前提）
 */
export async function executeEventFinalization(
  event: EventConfig,
  now: Date,
  budget: number = DEFAULT_DELETE_BUDGET,
): Promise<EventResetResult> {
  const report = await buildAndPersistFinalReport(event, now);
  await trySendFinalReportEmail(report);
  const result = await executeClear(event, 'finalize', budget);
  if (result.completed) {
    await updateEvent(event.id, {
      status: 'ended',
      finalizedAt: now.toISOString(),
    });
  }
  return result;
}
