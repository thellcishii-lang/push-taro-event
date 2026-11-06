// app/api/events/[eventId]/exhibitors/route.ts
// 主催者向け: 出店者（会社）の一覧と登録。出店者はイベント所有者だけが管理する。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import { createExhibitor, listExhibitors } from '@/lib/event-coupon';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;
  const exhibitors = await listExhibitors(eventId);
  return NextResponse.json({ exhibitors });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  const name = typeof body.name === 'string' ? body.name : '';
  const authUid = typeof body.authUid === 'string' && body.authUid ? body.authUid : null;

  try {
    const exhibitor = await createExhibitor(eventId, { name, authUid });
    return NextResponse.json({ exhibitor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '登録に失敗しました' },
      { status: 400 },
    );
  }
}
