// 初回パスワード変更の完了通知（本人用）。
// クライアント側で Firebase Auth のパスワード変更が成功した後に呼び、
// 契約者レコードの mustChangePassword フラグを下ろす。
// このエンドポイント自体はパスワード変更ゲートの対象にしない
// （ゲートを解除するために必要なので）。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { clearMustChangePassword, findOrganizerByOwnerUid } from '@/lib/organizers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const organizer = await findOrganizerByOwnerUid(uid);
  if (!organizer) {
    return NextResponse.json(
      { error: '契約者レコードが見つかりません' },
      { status: 404 },
    );
  }
  if (organizer.mustChangePassword) {
    await clearMustChangePassword(organizer.contractId);
  }
  return NextResponse.json({ ok: true });
}
