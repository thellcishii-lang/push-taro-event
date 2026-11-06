// lib/customer-session.ts
import crypto from 'crypto';

/**
 * 顧客向けAPI（coupon-history / subscribe-status / unsubscribe）用の
 * HMAC署名付きセッショントークン。
 *
 * 従来は FCM トークンを URL クエリの唯一の認証情報として使っていたが、
 * トークンがサーバーログ・ブラウザ履歴・プロキシに残留する問題があった。
 *
 * 本方式では:
 *   1. クライアントが FCM トークンを POST ボディで送信し、
 *      有効期限付きの署名トークンを取得する（/api/customer-session）
 *   2. 以降の API 呼び出しではこの署名トークンを使用する
 *   3. トークンは `base64url(payload).base64url(hmac)` 形式で、
 *      payload には { token, shopId, exp } を含む
 *
 * 環境変数 PRINT_TOKEN_SECRET を再利用（顧客セッションも同じ鍵で署名）。
 * 未設定の場合は発行・検証ともに失敗する（安全側に倒れる）。
 */

const SECRET = process.env.PRINT_TOKEN_SECRET;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24時間

interface SessionPayload {
  token: string;
  shopId: string;
  exp: number;
}

function base64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function unbase64url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function hmac(data: string): string {
  return crypto.createHmac('sha256', SECRET!).update(data).digest('base64url');
}

/**
 * セッショントークンを発行する
 */
export function issueCustomerSession(
  token: string,
  shopId: string,
  ttlMs: number = DEFAULT_TTL_MS
): string | null {
  if (!SECRET) {
    console.warn('[customer-session] PRINT_TOKEN_SECRET が未設定のため発行できません');
    return null;
  }
  const payload: SessionPayload = {
    token,
    shopId,
    exp: Date.now() + ttlMs,
  };
  const payloadStr = base64url(JSON.stringify(payload));
  const signature = hmac(payloadStr);
  return `${payloadStr}.${signature}`;
}

/**
 * セッショントークンを検証し、payload を返す。
 * 署名不正・期限切れの場合は null を返す。
 */
export function verifyCustomerSession(
  sessionToken: string | null
): SessionPayload | null {
  if (!SECRET || !sessionToken) return null;

  const parts = sessionToken.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expected = hmac(payloadStr);

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(unbase64url(payloadStr)) as SessionPayload;
    if (!payload.token || !payload.shopId || typeof payload.exp !== 'number') return null;
    if (payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
