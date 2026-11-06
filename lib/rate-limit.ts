import crypto from 'crypto';
import { db } from './firebase-admin';

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (forwarded && forwarded !== 'unknown') return forwarded;
  if (realIp && realIp !== 'unknown') return realIp;

  // IP が取れない場合、全クライアントが単一バケット 'unknown' を共有して
  // 相互妨害するのを防ぐため、リクエストヘッダーの組合せからハッシュを生成する
  const fingerprint = [
    request.headers.get('user-agent'),
    request.headers.get('accept-language'),
    request.headers.get('accept'),
  ].filter(Boolean).join('|');

  if (fingerprint) {
    return `fp-${crypto.createHash('sha256').update(fingerprint).digest('hex').slice(0, 16)}`;
  }
  return 'unknown';
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number
): Promise<number | null> {
  const identifier = getClientIp(request);
  const key = crypto.createHash('sha256').update(`${scope}:${identifier}`).digest('hex');
  const ref = db.collection('rate_limits').doc(key);

  try {
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const now = Date.now();
      const data = snapshot.data();
      const resetAt = data?.resetAt?.toMillis?.() || 0;

      if (!snapshot.exists || resetAt <= now) {
        transaction.set(ref, {
          scope,
          count: 1,
          resetAt: new Date(now + windowMs),
          updatedAt: new Date(now),
        });
        return null;
      }

      if (Number(data?.count || 0) >= limit) {
        return Math.max(1, Math.ceil((resetAt - now) / 1000));
      }

      transaction.update(ref, {
        count: Number(data?.count || 0) + 1,
        updatedAt: new Date(now),
      });
      return null;
    });
  } catch (error) {
    // Firestore 障害時にレート制限が無制限回避されるのを防ぐため fail-closed とする
    console.error('[rate-limit] レート制限チェックに失敗したためリクエストを拒否します:', error);
    return 60;
  }
}