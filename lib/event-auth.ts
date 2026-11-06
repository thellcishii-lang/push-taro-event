// lib/event-auth.ts
// EVENT の API 用認証ヘルパー。
// 既存の店舗向け API（coupon-history 等）と同じ方式:
// Authorization: Bearer <Firebase IDトークン> を検証して uid を返す。
import { authAdmin } from './firebase-admin';

export async function getUidFromRequest(
  request: Request,
): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
    return decoded.uid;
  } catch {
    return null;
  }
}
