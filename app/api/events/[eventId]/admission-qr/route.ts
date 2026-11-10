// app/api/events/[eventId]/admission-qr/route.ts
// 来場者本人の入場用QR（外部発行）の状態取得・保存・削除。
// 認証はクーポン取得と同じ作法: 電話番号認証（SMS）のトークンから
// memberId を導き、本人の購読者レコードだけを読み書きする。
// イベント設定 admissionQrEnabled がオフの間は、保存・削除は 403、
// 状態取得にも保存済み内容を含めない（lib/event-admission-qr.ts）。
import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { memberIdForPhone } from '@/lib/event-coupon';
import {
  deleteAdmissionQr,
  firestoreAdmissionQrStore,
  getAdmissionQrState,
  saveAdmissionQr,
} from '@/lib/event-admission-qr';

export const dynamic = 'force-dynamic';

/** 電話番号認証トークンから memberId を引く。引けなければエラーレスポンスを返す。 */
async function memberIdFromRequest(
  request: Request,
): Promise<{ memberId: string } | { error: NextResponse }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: '電話番号認証が必要です' }, { status: 401 }),
    };
  }
  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
    if (typeof decoded.phone_number !== 'string' || !decoded.phone_number) {
      return {
        error: NextResponse.json({ error: '電話番号認証が必要です' }, { status: 401 }),
      };
    }
    return { memberId: memberIdForPhone(decoded.phone_number) };
  } catch {
    return {
      error: NextResponse.json(
        { error: '電話番号認証の有効期限が切れています' },
        { status: 401 },
      ),
    };
  }
}

async function rateLimited(request: Request): Promise<NextResponse | null> {
  const retryAfter = await enforceRateLimit(request, 'event-admission-qr', 30, 60 * 1000);
  if (retryAfter === null) return null;
  return NextResponse.json(
    { error: 'レート制限を超えました' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const auth = await memberIdFromRequest(request);
  if ('error' in auth) return auth.error;

  const result = await getAdmissionQrState(
    firestoreAdmissionQrStore,
    eventId,
    auth.memberId,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({
    enabled: result.enabled,
    stored: result.stored,
    content: result.content,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const limited = await rateLimited(request);
  if (limited) return limited;

  const { eventId } = await params;
  const auth = await memberIdFromRequest(request);
  if ('error' in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }

  const result = await saveAdmissionQr(
    firestoreAdmissionQrStore,
    eventId,
    auth.memberId,
    body.content,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const limited = await rateLimited(request);
  if (limited) return limited;

  const { eventId } = await params;
  const auth = await memberIdFromRequest(request);
  if ('error' in auth) return auth.error;

  const result = await deleteAdmissionQr(
    firestoreAdmissionQrStore,
    eventId,
    auth.memberId,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
