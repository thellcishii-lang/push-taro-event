// app/api/events/[eventId]/coupons/[couponId]/claim/route.ts
// 来場者のクーポン取得。電話番号認証（SMS）のトークンが必須で、
// 電話番号から導く memberId に紐づけて記録する（1人1回、再取得は冪等）。
import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { claimCoupon, memberIdForPhone } from '@/lib/event-coupon';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string; couponId: string }> },
) {
  const retryAfter = await enforceRateLimit(request, 'event-claim', 30, 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'レート制限を超えました' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const { eventId, couponId } = await params;

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

  const result = await claimCoupon(eventId, couponId, memberId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(
    { ok: true, claimId: result.claimId, alreadyClaimed: result.alreadyClaimed },
    { status: result.alreadyClaimed ? 200 : 201 },
  );
}
