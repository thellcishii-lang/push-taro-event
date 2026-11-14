// app/api/events/[eventId]/coupons/public/route.ts
// 来場者向けのクーポン一覧・検索。認証なしで閲覧できるが、
// 返すのは有効なクーポンの表示用項目だけ。?q= で会社名・キーワード検索。
// ?lang= があれば、タイトル・説明文をその言語で返す（作成時の自動翻訳を使用）。
// 出店者課金オプションで掲載停止中の出店者のクーポンは、サーバー側で
// 除外してから返す（クライアントに停止中クーポンを渡さない）。
import { NextResponse } from 'next/server';
import {
  filterCoupons,
  listCoupons,
  listExhibitors,
  visibleCatalogCoupons,
} from '@/lib/event-coupon';
import { getEvent } from '@/lib/event-store';
import { normalizeLocale, pickLocalizedText } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const event = await getEvent(eventId);
  const locale = normalizeLocale(searchParams.get('lang'), event?.defaultLocale);
  const [allCoupons, exhibitors] = await Promise.all([
    listCoupons(eventId),
    listExhibitors(eventId),
  ]);
  const active = visibleCatalogCoupons(allCoupons, exhibitors).filter(
    (coupon) => coupon.active,
  );
  const coupons = filterCoupons(active, query).map((coupon) => ({
    id: coupon.id,
    title:
      pickLocalizedText(coupon.titleI18n, locale, event?.defaultLocale) ||
      coupon.title,
    description:
      pickLocalizedText(coupon.descriptionI18n, locale, event?.defaultLocale) ||
      coupon.description,
    exhibitorName: coupon.exhibitorName,
    keywords: coupon.keywords,
  }));
  return NextResponse.json({ coupons });
}
