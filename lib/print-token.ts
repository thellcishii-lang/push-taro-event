// lib/print-token.ts
import crypto from 'crypto';

/**
 * 申込書印刷ページ (/print/application) 用の署名付きアクセストークン。
 *
 * shop-info / partner-info API は、店舗ID・代理店ID だけでは
 * 機密情報（銀行口座・住所等）を返さない。
 * 申込受付メールに記載するリンクにこのトークンを付与し、
 * トークンを持つリクエストのみに機密情報を開放する。
 *
 * 環境変数 PRINT_TOKEN_SECRET が未設定の場合:
 *   - generatePrintToken は null を返す（リンクにトークンが付かない）
 *   - verifyPrintToken は常に false を返す（機密情報は一切開放されない）
 *   → 安全側に倒れる設計。
 */

const SECRET = process.env.PRINT_TOKEN_SECRET;

export function generatePrintToken(docType: string, docId: string): string | null {
  if (!SECRET) {
    console.warn('[print-token] PRINT_TOKEN_SECRET が未設定のためトークンを発行できません');
    return null;
  }
  return crypto
    .createHmac('sha256', SECRET)
    .update(`${docType}:${docId}`)
    .digest('base64url');
}

export function verifyPrintToken(
  docType: string,
  docId: string,
  token: string | null
): boolean {
  if (!SECRET || !token) return false;
  const expected = generatePrintToken(docType, docId);
  if (!expected) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(String(token));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
