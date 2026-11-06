// app/api/events/[eventId]/my-claims/route.ts
// 来場者本人の取得済みクーポン一覧。電話番号認証のトークンから本人を特定する。
import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import { listClaimsByMember, memberIdForPhone } from '@/lib/event-coupon';

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
    return NextResponse.json({ error: '電話番号認証の有効期限が切れています' }, { status: 401 });
  }

  const claims = await listClaimsByMember(eventId, memberId);
  return NextResponse.json({ claims });
}
