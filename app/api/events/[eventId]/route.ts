// app/api/events/[eventId]/route.ts
// 主催者向けイベント管理 API: 取得・更新・削除（自分のイベントだけ）。
import { NextResponse } from 'next/server';
import {
  getUidFromRequest,
  passwordChangeBlock,
  requireEventOwner,
} from '@/lib/event-auth';
import {
  deleteEventCompletely,
  getEvent,
  updateEvent,
  UpdateEventInput,
} from '@/lib/event-store';
import { canDeleteEvent } from '@/lib/event';

export const dynamic = 'force-dynamic';

async function loadOwnedEvent(request: Request, eventId: string) {
  const uid = await getUidFromRequest(request);
  if (!uid) return { error: NextResponse.json({ error: '認証が必要です' }, { status: 401 }) };
  const event = await getEvent(eventId);
  if (!event) return { error: NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 }) };
  if (event.ownerUid !== uid) {
    return { error: NextResponse.json({ error: '権限がありません' }, { status: 403 }) };
  }
  return { event, uid };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const result = await loadOwnedEvent(request, eventId);
  if ('error' in result) return result.error;
  return NextResponse.json({ event: result.event });
}

const EDITABLE_FIELDS: Array<keyof UpdateEventInput> = [
  'name',
  'startDate',
  'endDate',
  'resetMode',
  'resetTime',
  'defaultLocale',
  'admissionQrEnabled',
  'links',
  // subscriberCap は含めない: 料金（契約枠）の軸のため、変更は運営側のみ
  // （/api/admin/events/[eventId]）。
  'backupRetentionDays',
  'status',
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const result = await loadOwnedEvent(request, eventId);
  if ('error' in result) return result.error;
  const event = result.event;

  // 初回パスワード変更が未完了の間は更新できない。
  const block = await passwordChangeBlock(result.uid);
  if (block) return block;

  if (event.finalizedAt) {
    return NextResponse.json(
      { error: '終了処理済みのイベントは変更できません' },
      { status: 409 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) patch[field] = body[field];
  }
  // status='ended' は終了処理（データ消去）経由でのみ遷移させる
  if (patch.status === 'ended') {
    return NextResponse.json(
      { error: '終了はスケジューラの終了処理でのみ行われます' },
      { status: 400 },
    );
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: '変更項目がありません' }, { status: 400 });
  }

  try {
    await updateEvent(eventId, patch as UpdateEventInput);
    const updated = await getEvent(eventId);
    return NextResponse.json({ event: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新に失敗しました' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  // 主催者本人の確認（認証・所有者・初回パスワード変更ゲートを含む）。
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;

  // 開催中は削除できない。先に終了させる運用
  // （終了はスケジューラの終了処理で遷移する）。
  if (!canDeleteEvent(guard.event)) {
    return NextResponse.json(
      {
        error:
          '開催中のイベントは削除できません。削除できるのは下書きと終了したイベントです',
      },
      { status: 409 },
    );
  }

  try {
    // イベント本体・全サブコレクション・Storage の案内 PDF を消す。
    // 最終レポート（event_reports / event_report_backups）は残る。
    await deleteEventCompletely(eventId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '削除に失敗しました',
      },
      { status: 500 },
    );
  }
}
