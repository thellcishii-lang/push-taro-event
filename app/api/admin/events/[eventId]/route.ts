// app/api/admin/events/[eventId]/route.ts
// 運営側（customClaims.admin）専用: イベントの契約枠の変更。
// 購読者上限とクーポン上限は料金の軸（〜5万人／〜10万人、クーポン枠数）なので、
// 主催者向けAPIからは変更できず、契約時に運営側がここで設定する。
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { getEvent, updateEvent } from '@/lib/event-store';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '運営権限が必要です' }, { status: 403 });
  }

  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }

  const patch: { subscriberCap?: number; couponCap?: number } = {};
  for (const field of ['subscriberCap', 'couponCap'] as const) {
    const value = body[field];
    if (value !== undefined) {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
        return NextResponse.json(
          { error: `${field} は1以上の整数で指定してください` },
          { status: 400 },
        );
      }
      patch[field] = value;
    }
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: 'subscriberCap または couponCap が必要です' },
      { status: 400 },
    );
  }

  try {
    await updateEvent(eventId, patch);
    const updated = await getEvent(eventId);
    return NextResponse.json({ event: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新に失敗しました' },
      { status: 400 },
    );
  }
}
