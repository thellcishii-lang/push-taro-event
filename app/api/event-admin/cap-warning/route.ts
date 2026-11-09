// ログイン中主催者の「枠超過の警告」（一時上げのリバート予告）。
// 警告が無い場合は { warning: null } を返す。
// 管理画面のバナー（components/CapWarningBanner.tsx）が表示に使う。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { getCapWarningForOwner } from '@/lib/cap-warning';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const warning = await getCapWarningForOwner(uid);
  return NextResponse.json({ warning });
}
