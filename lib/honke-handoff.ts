// lib/honke-handoff.ts
/**
 * 本家（push-taro.com）の契約ページ / クーポン購入ページへの
 * ログイン引き継ぎ（ハンドオフ）リンクの発行。
 *
 * 背景: EVENT と本家は別の Firebase プロジェクトで、パスワードは
 * 初期値だけが共通。以後は別々に変わるため、支払いの導線で
 * 「EVENT で設定したパスワードが通らない」詰まりが起きる。
 * そこでコンソール側が短時間・ワンタイムの署名付きリンクを発行し、
 * 本家はそれを検証して契約者本人としてログインさせる
 * （検証側は本家の lib/event-handoff.ts）。
 *
 * トークン形式: base64url(JSON ペイロード) + '.' + base64url(HMAC-SHA256)
 * ペイロード: { v, contractId, purpose, eventId?, exp, nonce }
 * 共有シークレットは環境変数 HONKE_HANDOFF_SECRET
 * （本家側の EVENT_HANDOFF_SECRET と同値）。
 */

import { createHmac, randomBytes } from 'node:crypto';

export const HONKE_BASE_URL = 'https://push-taro.com';
export const HANDOFF_TTL_SECONDS = 600;

export type HandoffPurpose = 'account' | 'coupon-option';

export interface HandoffPayload {
  v: 1;
  contractId: string;
  purpose: HandoffPurpose;
  eventId?: string;
  exp: number;
  nonce: string;
}

function sign(payloadPart: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadPart).digest('base64url');
}

/** ハンドオフトークンを組み立てる（nonce はテスト用に差し替え可能）。 */
export function createHandoffToken(
  input: {
    contractId: string;
    purpose: HandoffPurpose;
    eventId?: string;
    nonce?: string;
  },
  secret: string,
  nowSeconds: number
): string {
  const payload: HandoffPayload = {
    v: 1,
    contractId: input.contractId,
    purpose: input.purpose,
    exp: nowSeconds + HANDOFF_TTL_SECONDS,
    nonce: input.nonce ?? randomBytes(16).toString('hex'),
  };
  if (input.eventId) payload.eventId = input.eventId;
  const payloadPart = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${payloadPart}.${sign(payloadPart, secret)}`;
}

/** 目的先の本家 URL（トークン付き）を組み立てる。 */
export function buildHonkeHandoffUrl(
  input: { contractId: string; purpose: HandoffPurpose; eventId?: string },
  secret: string,
  nowSeconds: number
): string {
  const token = createHandoffToken(input, secret, nowSeconds);
  if (input.purpose === 'coupon-option') {
    return `${HONKE_BASE_URL}/event-option?eventId=${encodeURIComponent(
      input.eventId ?? ''
    )}&handoff=${encodeURIComponent(token)}`;
  }
  return `${HONKE_BASE_URL}/event-account?handoff=${encodeURIComponent(token)}`;
}

/** ハンドオフ機能が使える設定かどうか（未設定なら通常リンクにフォールバック）。 */
export function honkeHandoffSecret(): string | null {
  const value = process.env.HONKE_HANDOFF_SECRET;
  return typeof value === 'string' && value !== '' ? value : null;
}
