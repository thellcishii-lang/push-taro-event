// app/api/events/[eventId]/exhibitor-coupons/route.ts
// 出店者画面用: 自社のクーポンだけを返す（他社のクーポンは出さない）。
// タイトル・説明文は出店者の言語で返す（作成時の自動翻訳を使用）。
// 取得・消込件数も付ける（効果測定用）。件数は自社の取得記録だけから数える。
import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/event-auth';
import { countClaimsByExhibitor, getExhibitor, listCoupons } from '@/lib/event-coupon';
import { getEvent } from '@/lib/event-store';
import { pickLocalizedText } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const auth = await getRequestAuth(request);
  if (!auth) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  if (!auth.exhibitor || auth.exhibitor.eventId !== eventId) {
    return NextResponse.json(
      { error: 'このイベントの出店者として登録されていません' },
      { status: 403 },
    );
  }
  const exhibitor = await getExhibitor(eventId, auth.exhibitor.exhibitorId);
  if (!exhibitor) {
    return NextResponse.json(
      { error: 'このイベントの出店者として登録されていません' },
      { status: 403 },
    );
  }
  const event = await getEvent(eventId);
  const [allCoupons, counts] = await Promise.all([
    listCoupons(eventId),
    countClaimsByExhibitor(eventId, exhibitor.id),
  ]);
  const coupons = allCoupons
    .filter((coupon) => coupon.exhibitorId === exhibitor.id)
    .map((coupon) => ({
      ...coupon,
      claimedCount: counts.get(coupon.id)?.claimedCount ?? 0,
      redeemedCount: counts.get(coupon.id)?.redeemedCount ?? 0,
      title:
        pickLocalizedText(coupon.titleI18n, exhibitor.lang, event?.defaultLocale) ||
        coupon.title,
      description:
        pickLocalizedText(
          coupon.descriptionI18n,
          exhibitor.lang,
          event?.defaultLocale,
        ) || coupon.description,
    }));
  return NextResponse.json({ coupons });
}
