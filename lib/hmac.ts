// 本家 → EVENT の連携リクエスト署名（HMAC-SHA256）の純粋ロジック。
//
// 方式（Stripe の Webhook 署名と同型）:
// - EVENT が APIキーを発行し、本家はキーを環境変数／シークレットとして保持する
// - リクエストにはキー自体を送らず、X-Event-Key-Id / X-Event-Timestamp /
//   X-Event-Signature ヘッダで署名だけを送る
// - 署名対象は `${timestamp}.${rawBody}`（改ざん検知＋タイムスタンプでリプレイ防止）
// - パスワードを含む連携のため、キー自体が通信やログに残らない形にする
import { createHmac, timingSafeEqual } from 'node:crypto';

/** 署名の許容時刻ずれ（秒）。これを超えたリクエストはリプレイとして拒否する。 */
export const SIGNATURE_TOLERANCE_SEC = 300;

export function computeSignature(
  secret: string,
  timestamp: string,
  rawBody: string,
): string {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
}

export function isTimestampFresh(
  timestamp: string,
  nowSec: number,
  toleranceSec: number = SIGNATURE_TOLERANCE_SEC,
): boolean {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  return Math.abs(nowSec - ts) <= toleranceSec;
}

export function verifySignature(args: {
  secret: string;
  timestamp: string;
  rawBody: string;
  signature: string;
  nowSec: number;
  toleranceSec?: number;
}): boolean {
  if (!isTimestampFresh(args.timestamp, args.nowSec, args.toleranceSec)) {
    return false;
  }
  const expected = computeSignature(args.secret, args.timestamp, args.rawBody);
  const expectedBuf = Buffer.from(expected, 'utf8');
  const givenBuf = Buffer.from(args.signature, 'utf8');
  return expectedBuf.length === givenBuf.length && timingSafeEqual(expectedBuf, givenBuf);
}
