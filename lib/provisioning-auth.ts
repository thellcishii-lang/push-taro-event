// 本家 → EVENT の連携API共通の HMAC 署名検証。
//
// 方式は lib/hmac.ts の通り（Stripe の Webhook 署名と同型）:
// - X-Event-Key-Id: EVENT が発行したキーのID
// - X-Event-Timestamp: Unix秒
// - X-Event-Signature: HMAC-SHA256(secret, `${timestamp}.${rawBody}`) の hex
//
// POST は生ボディを rawBody に渡す。GET のようにボディを持たない
// リクエストでは rawBody = '' を渡し、署名対象は `${timestamp}.` になる
// （末尾のドットの後に本文が続かない形。本家側の署名生成も同じ約束）。
import { findActiveApiKey } from './api-keys';
import { verifySignature } from './hmac';

/** 署名付き連携リクエストの認証。OK なら true。 */
export async function verifyProvisioningRequest(
  request: Request,
  rawBody: string,
): Promise<boolean> {
  const keyId = request.headers.get('x-event-key-id') ?? '';
  const timestamp = request.headers.get('x-event-timestamp') ?? '';
  const signature = request.headers.get('x-event-signature') ?? '';

  const key = await findActiveApiKey(keyId);
  return (
    key !== null &&
    verifySignature({
      secret: key.secret,
      timestamp,
      rawBody,
      signature,
      nowSec: Math.floor(Date.now() / 1000),
    })
  );
}
