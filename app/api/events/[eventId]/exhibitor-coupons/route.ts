// app/api/events/[eventId]/exhibitor-coupons/route.ts
// 出店者画面用: 自社のクーポンだけを返す（他社のクーポンは出さない）。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { findExhibitorByAuthUid, listCoupons } from '@/lib/event-coupon';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const exhibitor = await findExhibitorByAuthUid(eventId, uid);
  if (!exhibitor) {
    return NextResponse.json(
      { error: 'このイベントの出店者として登録されていません' },
      { status: 403 },
    );
  }
  const coupons = (await listCoupons(eventId)).filter(
    (coupon) => coupon.exhibitorId === exhibitor.id,
  );
  return NextResponse.json({ coupons });
}
