// 本家 → EVENT の契約者自動登録API（決済完了時に本家が呼ぶ）。
//
// 認証は HMAC 署名（lib/hmac.ts）:
// - X-Event-Key-Id: EVENT が発行したキーのID
// - X-Event-Timestamp: Unix秒
// - X-Event-Signature: HMAC-SHA256(secret, `${timestamp}.${rawBody}`) の hex
// パスワードを含むため、生の本文で署名を検証してから JSON を読む。
//
// 意味づけは create-or-update（lib/provisioning.ts）:
// - 未契約なら新規作成（email / password / companyName / startDate が必須）
// - 契約済みなら更新（プラン変更に伴う枠・会社情報の反映のみ。
//   パスワードは送られても無視し、認証情報は変更しない）
import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/hmac';
import { findActiveApiKey } from '@/lib/api-keys';
import { provisionOrganizer } from '@/lib/provisioning';

export const dynamic = 'force-dynamic';

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
  if (!contractId) return badRequest('contractId が必要です');

  // 必須チェックは作成/更新のモードで異なるため lib/provisioning.ts 側で行う。
  // ここでは型の正規化だけをして渡す。
  const result = await provisionOrganizer({
    contractId,
    email: typeof body.email === 'string' ? body.email.trim() : '',
    password: typeof body.password === 'string' ? body.password : undefined,
    companyName: typeof body.companyName === 'string' ? body.companyName.trim() : '',
    address: typeof body.address === 'string' ? body.address : undefined,
    phone: typeof body.phone === 'string' ? body.phone : undefined,
    startDate: typeof body.startDate === 'string' ? body.startDate : '',
    subscriberCap: typeof body.subscriberCap === 'number' ? body.subscriberCap : undefined,
    couponCap: typeof body.couponCap === 'number' ? body.couponCap : undefined,
    // 一時上げまわりの任意項目。型だけ通して、値の妥当性は
    // lib/provisioning.ts の無害化に任せる（不正値は無視される）。
    tempSubscriberCapUntil:
      typeof body.tempSubscriberCapUntil === 'string' || body.tempSubscriberCapUntil === null
        ? body.tempSubscriberCapUntil
        : undefined,
    restoredSubscriberCap:
      typeof body.restoredSubscriberCap === 'number' || body.restoredSubscriberCap === null
        ? body.restoredSubscriberCap
        : undefined,
    agencyCode: typeof body.agencyCode === 'string' ? body.agencyCode : null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }
  return NextResponse.json(
    { ok: true, status: result.status, ownerUid: result.ownerUid },
    { status: result.status === 'created' ? 201 : 200 },
  );
}
