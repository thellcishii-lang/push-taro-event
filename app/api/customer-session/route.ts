// app/api/customer-session/route.ts
/**
 * 顧客セッショントークン発行
 *
 * FCMトークンを POST ボディで受け取り、subscriptions コレクションに
 * 存在することを確認した上で、HMAC署名付きセッショントークンを発行する。
 * 以降の coupon-history / subscribe-status / unsubscribe 呼び出しは
 * このセッショントークンで認証する（FCMトークンをURLに載せない）。
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { issueCustomerSession } from '@/lib/customer-session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // レート制限: セッション乱打を防止。
    // 店舗Wi-Fiでは複数の顧客が同じIPを共有するため、端末側のキャッシュと併せて余裕を持たせる。
    const retryAfter = await enforceRateLimit(request, 'customer-session', 30, 10 * 60 * 1000);
    if (retryAfter !== null) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const { token, shopId } = await request.json();
    if (!token || typeof token !== 'string' || !shopId || typeof shopId !== 'string') {
      return NextResponse.json({ error: 'token と shopId が必要です' }, { status: 400 });
    }

    // FCMトークンが subscriptions に存在し、指定店舗に紐づいていることを確認
    const doc = await db.collection('subscriptions').doc(token).get();
    if (!doc.exists || !doc.data()?.shopIds?.includes(shopId)) {
      return NextResponse.json({ error: '購読が見つかりません' }, { status: 403 });
    }

    const sessionToken = issueCustomerSession(token, shopId);
    if (!sessionToken) {
      return NextResponse.json({ error: 'セッションの発行に失敗しました' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, sessionToken },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[customer-session] エラー:', error);
    return NextResponse.json({ error: 'セッションの発行に失敗しました' }, { status: 500 });
  }
}
