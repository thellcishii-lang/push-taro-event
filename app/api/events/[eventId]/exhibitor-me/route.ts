// app/api/events/[eventId]/exhibitor-me/route.ts
// 出店者画面用: ログイン中のユーザーが、このイベントのどの出店者（会社）かを返す。
// PATCH は出店者本人の表示言語の変更。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { findExhibitorByAuthUid, updateExhibitorLanguage } from '@/lib/event-coupon';
import { isLocale } from '@/lib/i18n';

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
  return NextResponse.json({ exhibitor });
}

export async function PATCH(
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
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  if (!isLocale(body.lang)) {
    return NextResponse.json({ error: '対応していない言語です' }, { status: 400 });
  }
  await updateExhibitorLanguage(eventId, exhibitor.id, body.lang);
  return NextResponse.json({ exhibitor: { ...exhibitor, lang: body.lang } });
}
