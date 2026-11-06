// app/api/admin/events/[eventId]/route.ts
// 運営側（customClaims.admin）専用: イベントの購読者上限（契約枠）の変更。
// 購読者上限は料金の軸（〜5万人／〜10万人／〜20万人…）なので、
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

  if (typeof body.subscriberCap !== 'number') {
    return NextResponse.json({ error: 'subscriberCap が必要です' }, { status: 400 });
  }

  try {
    await updateEvent(eventId, { subscriberCap: body.subscriberCap });
    const updated = await getEvent(eventId);
    return NextResponse.json({ event: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新に失敗しました' },
      { status: 400 },
    );
  }
}
