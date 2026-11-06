// app/api/events/[eventId]/coupons/public/route.ts
// 来場者向けのクーポン一覧・検索。認証なしで閲覧できるが、
// 返すのは有効なクーポンの表示用項目だけ。?q= で会社名・キーワード検索。
import { NextResponse } from 'next/server';
import { filterCoupons, listCoupons } from '@/lib/event-coupon';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const active = (await listCoupons(eventId)).filter((coupon) => coupon.active);
  const coupons = filterCoupons(active, query).map((coupon) => ({
    id: coupon.id,
    title: coupon.title,
    description: coupon.description,
    exhibitorName: coupon.exhibitorName,
    keywords: coupon.keywords,
  }));
  return NextResponse.json({ coupons });
}
