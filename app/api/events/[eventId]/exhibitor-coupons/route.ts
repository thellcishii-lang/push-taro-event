// app/api/events/[eventId]/exhibitor-coupons/route.ts
// 出店者画面用: 自社のクーポンだけを返す（他社のクーポンは出さない）。
// タイトル・説明文は出店者の言語で返す（作成時の自動翻訳を使用）。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { findExhibitorByAuthUid, listCoupons } from '@/lib/event-coupon';
import { getEvent } from '@/lib/event-store';
import { pickLocalizedText } from '@/lib/i18n';

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
  const event = await getEvent(eventId);
  const coupons = (await listCoupons(eventId))
    .filter((coupon) => coupon.exhibitorId === exhibitor.id)
    .map((coupon) => ({
      ...coupon,
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
