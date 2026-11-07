// 本家 → EVENT の契約者自動登録API（決済完了時に本家が呼ぶ）。
//
// 認証は HMAC 署名（lib/hmac.ts）:
// - X-Event-Key-Id: EVENT が発行したキーのID
// - X-Event-Timestamp: Unix秒
// - X-Event-Signature: HMAC-SHA256(secret, `${timestamp}.${rawBody}`) の hex
// パスワードを含むため、生の本文で署名を検証してから JSON を読む。
import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/hmac';
import { findActiveApiKey } from '@/lib/api-keys';
import { provisionOrganizer } from '@/lib/provisioning';

export const dynamic = 'force-dynamic';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  const keyId = request.headers.get('x-event-key-id') ?? '';
  const timestamp = request.headers.get('x-event-timestamp') ?? '';
  const signature = request.headers.get('x-event-signature') ?? '';
  const rawBody = await request.text();

  const key = await findActiveApiKey(keyId);
  const verified =
    key !== null &&
    verifySignature({
      secret: key.secret,
      timestamp,
      rawBody,
      signature,
      nowSec: Math.floor(Date.now() / 1000),
    });
  if (!verified) {
    return NextResponse.json({ error: '署名検証に失敗しました' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return badRequest('リクエスト形式が不正です');
  }

  const contractId = typeof body.contractId === 'string' ? body.contractId.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : '';
  const startDate = typeof body.startDate === 'string' ? body.startDate : '';

  if (!contractId) return badRequest('contractId が必要です');
  if (!email || !email.includes('@')) return badRequest('有効な email が必要です');
  if (password.length < 6) return badRequest('password は6文字以上が必要です');
  if (!companyName) return badRequest('companyName が必要です');
  if (!DATE_PATTERN.test(startDate)) return badRequest('startDate は YYYY-MM-DD 形式で指定してください');

  const result = await provisionOrganizer({
    contractId,
    email,
    password,
    companyName,
    address: typeof body.address === 'string' ? body.address : undefined,
    phone: typeof body.phone === 'string' ? body.phone : undefined,
    startDate,
    subscriberCap: typeof body.subscriberCap === 'number' ? body.subscriberCap : undefined,
    couponCap: typeof body.couponCap === 'number' ? body.couponCap : undefined,
    agencyCode: typeof body.agencyCode === 'string' ? body.agencyCode : null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(
    { ok: true, status: result.status, ownerUid: result.ownerUid },
    { status: result.status === 'created' ? 201 : 200 },
  );
}
