// app/api/events/[eventId]/exhibitor-password/route.ts
// 出店者の「パスワードを忘れた」自己申請。登録メール宛てに新しいパスワード
// （アクセスコード）を自動送信する（旧コードは即失効）。
// 登録の有無を外部に漏らさないため、応答は常に同じ汎用文で 200 を返す。
import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  normalizeExhibitorEmail,
  requestExhibitorPasswordReset,
} from '@/lib/exhibitor-access';
import { getEvent } from '@/lib/event-store';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const GENERIC_MESSAGE =
  'ご入力のメールアドレスが登録されている場合、新しいパスワードを送信しました';

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

  // 再発行メールの連打（スパム化）防止。通常の申請は数回で足りる前提。
  const perEmail = await enforceRateLimit(
    request,
    `exhibitor-password-reset:${eventId}:${emailBucket(email)}`,
    3,
    15 * 60 * 1000,
  );
  if (perEmail !== null) return tooManyRequests(perEmail);
  const perIp = await enforceRateLimit(
    request,
    `exhibitor-password-reset:${eventId}`,
    20,
    15 * 60 * 1000,
  );
  if (perIp !== null) return tooManyRequests(perIp);

  let eventName: string | null = null;
  try {
    eventName = (await getEvent(eventId))?.name ?? null;
  } catch {
    eventName = null;
  }
  await requestExhibitorPasswordReset({ eventId, email, eventName });
  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
