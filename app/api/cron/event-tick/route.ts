// app/api/cron/event-tick/route.ts
// Push-taro EVENT の15分間隔スケジューラ。
// 外部のスケジューラ（Cloud Scheduler 等）から15分ごとに叩く前提。
//
// 役割は「いま処理すべきイベントを拾って、そのイベント単独で処理する」ことだけ:
// - 終了処理（電話番号消去）が最優先
// - 次に日次リセット（設定時刻を過ぎていて今日分が未実施のイベント）
// 予約配信のジョブ処理も将来ここに載せるが、キューは分離する。
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

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isValidCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const processed: Array<{
    eventId: string;
    kind: 'daily' | 'finalize';
    completed: boolean;
  }> = [];
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
        } else if (isResetDue(event, now)) {
          const result = await executeEventReset(event, now);
          processed.push({
            eventId: event.id,
            kind: 'daily',
            completed: result.completed,
          });
        }
      } catch (error) {
        // 1イベントの失敗は記録だけして、他イベントの処理を続ける
        errors.push({
          eventId: event.id,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({ ok: true, processed, errors });
  } catch (error) {
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
