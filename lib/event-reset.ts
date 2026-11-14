// lib/event-reset.ts
// イベントの日次リセットと終了処理（電話番号消去）の実行処理。
//
// 干渉させないためのポイント:
// - 削除対象は events/{eventId} 配下のサブコレクションだけ。他イベントには一切触れない。
// - 削除は小さなバッチで刻み、1回の実行には上限（予算）を設ける。
//   予算を使い切ったら途中でも戻り、次の tick で「残り」から自然に再開される
//   （消えたドキュメントは二度と対象にならないため、状態を持たなくても再開可能で冪等）。
// - 完了の記録（lastResetDate / finalizedAt）は、全対象が空になってからだけ付ける。
// - 購読者を消すときは、先にその端末トークンを言語別 FCM トピックから外す。
//   トピック購読は Firestore の外（FCM 側）にあるため、ドキュメントを消すだけでは
//   配信の宛先が残り、日次リセット後もプッシュが届き続けてしまう。
import { db, messaging } from './firebase-admin';
import {
  EVENT_SUBCOLLECTIONS,
  EventConfig,
  EventResetMode,
  EventSubcollection,
  jstDateString,
  localeTopic,
} from './event';
import { normalizeLocale, type Locale } from './i18n';
import { updateEvent } from './event-store';
import {
  buildAndPersistFinalReport,
  ensureReportBackup,
  snapshotDailyStats,
} from './event-report';
import { trySendFinalReportEmail } from './event-report-send';
import { findOrganizerByOwnerUid } from './organizers';
import { cancelEventSubscriptionsForFinalization } from './event-billing';

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

/**
 * 購読者ドキュメント群から、言語別トピック解除用のトークンを組み立てる（純関数）。
 * トークンを持たないドキュメントは対象外。言語は保存時に正規化されている前提で、
 * 念のため normalizeLocale で寄せる。
 */
export function groupSubscriberTokensByLocale(
  docs: Array<Record<string, unknown>>,
): Map<Locale, string[]> {
  const byLocale = new Map<Locale, string[]>();
  for (const data of docs) {
    const token = data.fcmToken;
    if (typeof token !== 'string' || token.length === 0) continue;
    const locale = normalizeLocale(data.lang);
    const list = byLocale.get(locale) ?? [];
    list.push(token);
    byLocale.set(locale, list);
  }
  return byLocale;
}

/**
 * 購読者コレクション専用のチャンク削除。
 * チャンクごとに「トピック解除 → ドキュメント削除」の順で処理する
 * （削除が先だとトークンを失い、二度と解除できなくなる）。
 * トピック解除はベストエフォート: 失敗しても削除は進める
 * （リセットが止まる方が困る。失敗はログに残す）。
 */
async function drainSubscribers(
  collectionRef: FirebaseFirestore.CollectionReference,
  eventId: string,
  budget: number,
): Promise<DrainResult> {
  let deleted = 0;
  while (deleted < budget) {
    const limit = Math.min(DELETE_CHUNK_SIZE, budget - deleted);
    const snap = await collectionRef.limit(limit).get();
    if (snap.empty) return { deleted, exhausted: false };
    const byLocale = groupSubscriberTokensByLocale(
      snap.docs.map((doc) => doc.data() as Record<string, unknown>),
    );
    for (const [locale, tokens] of byLocale) {
      try {
        await messaging.unsubscribeFromTopic(tokens, localeTopic(eventId, locale));
      } catch (error) {
        console.warn('[EVENT] FCMトピック解除をスキップ:', error);
      }
    }
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
  /**
   * 終了処理での出店者課金の自動解約の結果（終了処理のときだけ）。
   * オプション OFF・対象なしの場合は undefined。
   */
  billingAutoCancel?: { canceledCount: number; failedCount: number };
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
    const result =
      name === EVENT_SUBCOLLECTIONS.subscribers
        ? await drainSubscribers(ref, event.id, remainingBudget)
        : await drainCollection(ref, remainingBudget);
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
 * 終了処理を実行する。順序は厳密に「集計 → 保存 → バックアップ → 送信 → 削除」:
 * 1. 最終レポートを集計して event_reports に保存する。失敗したら例外となり削除しない。
 * 2. 運営用バックアップを削除対象の外に取る（保持日数はイベント＝契約ごとに設定、既定30日）。
 *    失敗したら例外となり削除しない。バックアップは期限を過ぎたら tick が自動消去する。
 * 3. レポートのメール送信を試みる。失敗してもレポートとバックアップは保存済みなので、
 *    tick の再送スイープと管理画面からの再送で何度でも送り直せる（削除はブロックしない）。
 * 4. 出店者課金オプションが有効なら、そのイベントの月額サブスクリプションを
 *    主催者の Stripe で自動解約する（ベストエフォート。失敗しても続行する）。
 * 5. 電話番号を含む全対象を削除する。消し終えた場合のみ finalizedAt と status='ended' を記録する。
 * （リセットより優先して呼ばれる前提）
 */
export async function executeEventFinalization(
  event: EventConfig,
  now: Date,
  budget: number = DEFAULT_DELETE_BUDGET,
): Promise<EventResetResult> {
  const report = await buildAndPersistFinalReport(event, now);
  await ensureReportBackup(report, event.backupRetentionDays, now);
  await trySendFinalReportEmail(report);

  // 出店者課金オプション: 削除の前に、そのイベントの有効な月額
  // サブスクリプションを主催者の Stripe で自動解約する（イベントの
  // 記録が消えた後も請求だけが残り続ける事故を防ぐ）。対象はこの
  // イベントの分だけ。ベストエフォート: 失敗しても終了処理自体は
  // 止めず、失敗件数を結果に残す。
  let billingAutoCancel: EventResetResult['billingAutoCancel'];
  try {
    const organizer = await findOrganizerByOwnerUid(event.ownerUid);
    if (organizer?.billingOptionEnabled) {
      const cancelResult = await cancelEventSubscriptionsForFinalization(
        db,
        organizer.contractId,
        event.id,
      );
      billingAutoCancel = {
        canceledCount: cancelResult.canceledCount,
        failedCount: cancelResult.failedCount,
      };
      if (cancelResult.errors.length > 0) {
        console.error(
          '[EVENT] 終了時の出店者課金の自動解約で失敗:',
          event.id,
          cancelResult.errors,
        );
      }
    }
  } catch (error) {
    console.error('[EVENT] 終了時の出店者課金の自動解約に失敗:', event.id, error);
  }

  const result = await executeClear(event, 'finalize', budget);
  if (result.completed) {
    await updateEvent(event.id, {
      status: 'ended',
      finalizedAt: now.toISOString(),
    });
  }
  return billingAutoCancel ? { ...result, billingAutoCancel } : result;
}
