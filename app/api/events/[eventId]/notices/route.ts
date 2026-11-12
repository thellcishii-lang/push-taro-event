// app/api/events/[eventId]/notices/route.ts
// 来場者本人の「お知らせ」一覧: 送信済みプッシュを読み返すための取得専用 API。
// 認証はクーポン取得と同じ作法: 電話番号認証（SMS）のトークンから memberId を
// 導き、購読者レコードがある来場者にだけ返す（未登録の電話番号では読めない）。
// 文面は本人の言語（購読者レコードの lang、無ければイベントのデフォルト）で
// 解決し、添付ファイル（宣伝 PDF / 画像）のリンク先もあわせて返す。
import { NextResponse } from 'next/server';
import { authAdmin, db } from '@/lib/firebase-admin';
import { EVENT_SUBCOLLECTIONS } from '@/lib/event';
import { memberIdForPhone } from '@/lib/event-coupon';
import { getEvent } from '@/lib/event-store';
import { buildNotices, listCampaigns } from '@/lib/event-push';
import { isLocale, resolveLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '電話番号認証が必要です' }, { status: 401 });
  }
  let memberId: string;
  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
    if (typeof decoded.phone_number !== 'string' || !decoded.phone_number) {
      return NextResponse.json({ error: '電話番号認証が必要です' }, { status: 401 });
    }
    memberId = memberIdForPhone(decoded.phone_number);
  } catch {
    return NextResponse.json(
      { error: '電話番号認証の有効期限が切れています' },
      { status: 401 },
    );
  }

  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
  }

  const subscriberSnap = await db
    .collection('events')
    .doc(eventId)
    .collection(EVENT_SUBCOLLECTIONS.subscribers)
    .doc(memberId)
    .get();
  if (!subscriberSnap.exists) {
    return NextResponse.json(
      { error: 'このイベントに登録していません' },
      { status: 403 },
    );
  }

  // 表示言語: 画面の指定 > 購読者の言語 > イベントのデフォルト > 日本語
  const langParam = new URL(request.url).searchParams.get('lang');
  const locale = isLocale(langParam)
    ? langParam
    : resolveLocale(subscriberSnap.data()?.lang, event.defaultLocale);

  const campaigns = await listCampaigns(eventId);
  const notices = buildNotices(campaigns, locale, event.defaultLocale);
  return NextResponse.json({ notices });
}
