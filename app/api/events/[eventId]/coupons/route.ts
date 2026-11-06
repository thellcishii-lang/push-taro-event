// app/api/events/[eventId]/coupons/route.ts
// 主催者向け: クーポンの一覧と登録（イベント全体で最大100件、出店者に紐づく）。
// 来場者向けの一覧・検索は来場者画面のPRで別途公開する。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import { createCoupon, listCoupons } from '@/lib/event-coupon';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;
  const coupons = await listCoupons(eventId);
  return NextResponse.json({ coupons });
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
  const exhibitorId = typeof body.exhibitorId === 'string' ? body.exhibitorId : '';
  const title = typeof body.title === 'string' ? body.title : '';
  if (!exhibitorId || !title) {
    return NextResponse.json(
      { error: 'exhibitorId と title が必要です' },
      { status: 400 },
    );
  }

  try {
    const coupon = await createCoupon(eventId, {
      exhibitorId,
      title,
      description: typeof body.description === 'string' ? body.description : undefined,
      keywords: Array.isArray(body.keywords)
        ? body.keywords.filter((k): k is string => typeof k === 'string')
        : undefined,
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '登録に失敗しました' },
      { status: 400 },
    );
  }
}
