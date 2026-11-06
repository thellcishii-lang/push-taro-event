// app/api/events/[eventId]/exhibitor-me/route.ts
// 出店者画面用: ログイン中のユーザーが、このイベントのどの出店者（会社）かを返す。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { findExhibitorByAuthUid } from '@/lib/event-coupon';

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
