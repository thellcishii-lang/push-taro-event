// app/api/events/[eventId]/exhibitor-login/route.ts
// 出店者ログイン。メール＋パスワード（イベント専用アクセスコード）を照合し、
// 通ればそのイベント専用のカスタムトークンを返す。クライアントは
// signInWithCustomToken でセッション化する。出店者は Firebase Auth の
// アカウントを持たない（Auth は主催者だけ）ため、セッションは合成 uid
// `exhibitor:{eventId}:{exhibitorId}` とクレームでイベント配下に縛る
// （lib/exhibitor-access.ts、検証は lib/event-auth.ts の getRequestAuth）。
// 照合の成否で「そのメールが登録されているか」を漏らさないよう、
// エラーは汎用文で統一し、試行にはレート制限をかける。
import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import {
  authenticateExhibitor,
  exhibitorSessionUid,
  normalizeExhibitorEmail,
} from '@/lib/exhibitor-access';
import { getEvent } from '@/lib/event-store';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function emailBucket(email: string): string {
  return createHash('sha256').update(email).digest('hex').slice(0, 16);
}

function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: '試行回数が多すぎます。しばらく待ってから再度お試しください' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  const email = normalizeExhibitorEmail(
    typeof body.email === 'string' ? body.email : '',
  );
  const code =
    typeof body.password === 'string'
      ? body.password
      : typeof body.code === 'string'
        ? body.code
        : '';

  // コード総当たりへの備え: メール+IP 単位で厳しめに、IP 全体でも上限をかける。
  // enforceRateLimit のキーは scope と送信元 IP の組合せになる。
  const perEmail = await enforceRateLimit(
    request,
    `exhibitor-login:${eventId}:${emailBucket(email)}`,
    5,
    10 * 60 * 1000,
  );
  if (perEmail !== null) return tooManyRequests(perEmail);
  const perIp = await enforceRateLimit(
    request,
    `exhibitor-login:${eventId}`,
    30,
    10 * 60 * 1000,
  );
  if (perIp !== null) return tooManyRequests(perIp);

  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
  }

  const authed = await authenticateExhibitor({ eventId, email, code });
  if (!authed) {
    return NextResponse.json(
      { error: 'メールアドレスまたはパスワードが正しくありません' },
      { status: 401 },
    );
  }

  const customToken = await authAdmin.createCustomToken(
    exhibitorSessionUid(eventId, authed.exhibitorId),
    { eventId, exhibitorId: authed.exhibitorId, role: 'exhibitor' },
  );
  return NextResponse.json({
    customToken,
    exhibitor: { id: authed.exhibitorId, name: authed.name },
  });
}
