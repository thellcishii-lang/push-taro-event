// ログイン中ユーザーの契約者情報（本人用）。
// 管理画面が初回パスワード変更ゲートの要否を判断するために使う。
// 契約者レコードが無いユーザー（運営アカウント等）は mustChangePassword: false。
// このエンドポイント自体はパスワード変更ゲートの対象にしない
// （ゲートを解除するために必要なので）。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { findOrganizerByOwnerUid, shouldBlockForPasswordChange } from '@/lib/organizers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const organizer = await findOrganizerByOwnerUid(uid);
  return NextResponse.json({
    hasOrganizerRecord: organizer !== null,
    mustChangePassword: shouldBlockForPasswordChange(organizer),
  });
}
