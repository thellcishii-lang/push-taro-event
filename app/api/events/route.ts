// app/api/events/route.ts
// 主催者向けイベント管理 API: 一覧取得と新規作成（自分のイベントだけ）。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { createEvent, listEventsByOwner } from '@/lib/event-store';
import { EventResetMode } from '@/lib/event';

export const dynamic = 'force-dynamic';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const events = await listEventsByOwner(uid);
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const startDate = typeof body.startDate === 'string' ? body.startDate : '';
  const endDate = typeof body.endDate === 'string' ? body.endDate : '';
  if (!name) {
    return NextResponse.json({ error: 'イベント名が必要です' }, { status: 400 });
  }
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    return NextResponse.json(
      { error: '開催期間は YYYY-MM-DD 形式で指定してください' },
      { status: 400 },
    );
  }

  try {
    const event = await createEvent({
      name,
      ownerUid: uid,
      startDate,
      endDate,
      resetMode: body.resetMode as EventResetMode | undefined,
      resetTime: body.resetTime as string | undefined,
      // 購読者上限は料金（契約枠）の軸なので主催者からは設定できない。
      // 既定値で作成し、変更は運営側API（/api/admin/events/[eventId]）でのみ行う。
      backupRetentionDays: body.backupRetentionDays as number | undefined,
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '作成に失敗しました' },
      { status: 400 },
    );
  }
}
