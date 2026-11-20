// app/api/events/[eventId]/registration-status/route.ts
// 来場者本人が現在のリセット範囲で登録済みかどうかを返す。
// 電話番号認証のトークンから本人を特定する（登録 API と同じ方式）。
// 来場者ページは、登録済みの端末で開き直したときに登録フローを
// 出し直さないためにこの状態を確認する。
import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import { getVisitorRegistrationStatus, memberIdForPhone } from '@/lib/event-register';

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

  const result = await getVisitorRegistrationStatus(eventId, memberId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ registered: result.registered });
}
