// app/api/events/[eventId]/register/route.ts
// 来場者登録 API。Firebase Phone Auth（SMS認証）で本人確認した電話番号をキーに、
// events/{eventId} 配下へ members（本人確認）と subscribers（プッシュ購読）を保存する。
import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { registerEventVisitor } from '@/lib/event-register';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const retryAfter = await enforceRateLimit(request, 'event-register', 20, 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'レート制限を超えました' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const { eventId } = await params;

  // 電話番号認証（SMS）のトークンから電話番号を取り出す。本人確認が無い登録は受けない。
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '電話番号認証が必要です' }, { status: 401 });
  }
  let phoneE164: string;
  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
    if (typeof decoded.phone_number !== 'string' || !decoded.phone_number) {
      return NextResponse.json({ error: '電話番号認証が必要です' }, { status: 401 });
    }
    phoneE164 = decoded.phone_number;
  } catch {
    return NextResponse.json({ error: '電話番号認証の有効期限が切れています' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  const fcmToken = typeof body.fcmToken === 'string' ? body.fcmToken.trim() : '';
  if (!fcmToken || fcmToken.includes('/')) {
    return NextResponse.json({ error: '有効な fcmToken が必要です' }, { status: 400 });
  }

  const result = await registerEventVisitor(eventId, { phoneE164, fcmToken });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, memberId: result.memberId }, { status: 201 });
}
