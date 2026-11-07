// app/api/cron/event-tick/route.ts
// Push-taro EVENT の15分間隔スケジューラ。
// 外部のスケジューラ（Cloud Scheduler 等）から15分ごとに叩く前提。
//
// 役割は「いま処理すべきイベントを拾って、そのイベント単独で処理する」ことだけ:
// - 終了処理（電話番号消去）が最優先
// - 次に予約配信（到期した campaign の実行。リセットより前に送る）
// - 最後に日次リセット（設定時刻を過ぎていて今日分が未実施のイベント）
// 配信・リセット・終了処理は互いに独立したステップとして実行し、
// 1つの失敗が他を止めない。
//
// イベントごとに try/catch し、1イベントの失敗が他イベントの処理を止めない。
import { NextResponse } from 'next/server';
import { isValidCronRequest } from '@/lib/cron-auth';
import { isFinalizationDue, isResetDue } from '@/lib/event';
import {
  executeEventFinalization,
  executeEventReset,
} from '@/lib/event-reset';
import { listLiveEvents, listUnfinalizedEvents } from '@/lib/event-store';
import {
  listReportsAwaitingEmail,
  sweepExpiredReportBackups,
} from '@/lib/event-report';
import { trySendFinalReportEmail } from '@/lib/event-report-send';
import { processDueCampaigns } from '@/lib/event-push';
import { recordTickRun, type TickRunInput } from '@/lib/tick-runs';
import { dispatchOperatorAlerts } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

/** 実行記録とアラート送信。監視系の失敗で tick 本体を止めないため、例外は握りつぶす。 */
async function recordAndAlert(stats: TickRunInput) {
  try {
    await recordTickRun(stats);
  } catch {
    // 記録の失敗は無視する（次回 tick で改めて記録される）
  }
  try {
    await dispatchOperatorAlerts(new Date());
  } catch {
    // アラートの失敗は無視する（状態が残るので次回 tick で送り直される）
  }
}

export async function GET(req: Request) {
  if (!isValidCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAtMs = Date.now();
  const now = new Date();
  const processed: Array<{
    eventId: string;
    kind: 'daily' | 'finalize';
    completed: boolean;
  }> = [];
  const campaignsSent: Array<{ eventId: string; sent: number }> = [];
  const errors: Array<{ eventId: string; message: string }> = [];

  try {
    // 候補は「開催中」と「未 finalized」をマージ（重複は id で排除）
    const byId = new Map<string, Awaited<ReturnType<typeof listLiveEvents>>[number]>();
    for (const event of await listLiveEvents()) byId.set(event.id, event);
    for (const event of await listUnfinalizedEvents()) {
      if (!byId.has(event.id)) byId.set(event.id, event);
    }

    for (const event of byId.values()) {
      try {
        if (isFinalizationDue(event, now)) {
          const result = await executeEventFinalization(event, now);
          processed.push({
            eventId: event.id,
            kind: 'finalize',
            completed: result.completed,
          });
        } else {
          // 予約配信はリセットより先に実行する（リセットで購読が消える前に届ける）
          if (event.status === 'live') {
            try {
              const sent = await processDueCampaigns(event.id, now);
              if (sent > 0) campaignsSent.push({ eventId: event.id, sent });
            } catch (error) {
              errors.push({
                eventId: event.id,
                message: `配信処理に失敗: ${error instanceof Error ? error.message : String(error)}`,
              });
            }
          }
          if (isResetDue(event, now)) {
            const result = await executeEventReset(event, now);
            processed.push({
              eventId: event.id,
              kind: 'daily',
              completed: result.completed,
            });
          }
        }
      } catch (error) {
        // 1イベントの失敗は記録だけして、他イベントの処理を続ける
        errors.push({
          eventId: event.id,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 最終レポートのメール再送スイープ:
    // 送信できなかったレポートは保存済みなので、成功するまで tick のたびに送り直す。
    const emailRetries: Array<{ eventId: string; sent: boolean }> = [];
    for (const report of await listReportsAwaitingEmail(10)) {
      try {
        const sent = await trySendFinalReportEmail(report);
        emailRetries.push({ eventId: report.eventId, sent });
      } catch {
        emailRetries.push({ eventId: report.eventId, sent: false });
      }
    }

    // 保持期限を過ぎた運営用バックアップの自動消去
    let expiredBackupsDeleted = 0;
    try {
      expiredBackupsDeleted = await sweepExpiredReportBackups(now);
    } catch {
      // バックアップ消去の失敗は記録に留め、本処理は止めない（次回 tick で再試行）
      errors.push({ eventId: '(backups)', message: 'バックアップ自動消去に失敗' });
    }

    await recordAndAlert({
      ok: true,
      durationMs: Date.now() - startedAtMs,
      eventsProcessed: processed.length,
      campaignsSent: campaignsSent.reduce((sum, c) => sum + c.sent, 0),
      errorsCount: errors.length,
    });

    return NextResponse.json({
      ok: true,
      processed,
      campaignsSent,
      errors,
      emailRetries,
      expiredBackupsDeleted,
    });
  } catch (error) {
    await recordAndAlert({
      ok: false,
      durationMs: Date.now() - startedAtMs,
      eventsProcessed: processed.length,
      campaignsSent: campaignsSent.reduce((sum, c) => sum + c.sent, 0),
      errorsCount: errors.length,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        processed,
        errors,
      },
      { status: 500 },
    );
  }
}
