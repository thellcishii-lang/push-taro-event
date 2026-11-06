import { NextResponse } from 'next/server';
import { messaging, db } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { enforceRateLimit } from '@/lib/rate-limit';
import { verifyCustomerSession } from '@/lib/customer-session';
import { normalizeShopIds } from '@/lib/subscription-shop-ids';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // レート制限: トークン総当たりによる第三者の購読解除を防止
    const retryAfter = await enforceRateLimit(request, 'unsubscribe', 10, 10 * 60 * 1000);
    if (retryAfter !== null) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const { token, shopId } = await request.json();
    if (typeof token !== 'string' || !token.trim() || token.includes('/') ||
      typeof shopId !== 'string' || !shopId.trim() || shopId.includes('/') ||
      shopId !== shopId.trim() || shopId === 'undefined' || shopId === 'null') {
      return NextResponse.json({ error: 'tokenとshopIdが必要です' }, { status: 400 });
    }

    // セッショントークンを検証（FCMトークンを直接受け取らない方式）
    // 後方互換: 旧形式（生のFCMトークン）も許可するが、期限付きセッションを推奨
    const session = verifyCustomerSession(token);
    const fcmToken = session ? session.token : token;

    // セッショントークンの場合は shopId の整合を確認
    if (session && session.shopId !== shopId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const subscriptionRef = db.collection('subscriptions').doc(fcmToken);
    const subscriptionDoc = await subscriptionRef.get();
    if (!subscriptionDoc.exists) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const subscriptionData = subscriptionDoc.data()!;
    const shopIds = normalizeShopIds(subscriptionData.shopIds);
    if (!shopIds.includes(shopId)) {
      return NextResponse.json({ error: 'この購読は指定店舗に紐づいていません' }, { status: 403 });
    }

    const topic = `shop_${shopId}_users`;
    await messaging.unsubscribeFromTopic([fcmToken], topic);

    await db.runTransaction(async (transaction) => {
      const currentDoc = await transaction.get(subscriptionRef);
      if (!currentDoc.exists) return;
      const currentData = currentDoc.data()!;
      const remainingShopIds = normalizeShopIds(currentData.shopIds).filter((id) => id !== shopId);
      // 顧客情報・クーポン履歴を保持し、同時登録された他店舗は削除しない。
      transaction.update(subscriptionRef, {
        shopIds: remainingShopIds,
        topics: remainingShopIds.length === 0 ? [] : FieldValue.arrayRemove(topic),
        unsubscribedShopIds: Array.from(new Set([
          ...normalizeShopIds(currentData.unsubscribedShopIds), shopId,
        ])),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const chunkRef = db.collection('shops').doc(shopId).collection('token_chunks').doc('chunk_1');
    await chunkRef.set({
      tokens: FieldValue.arrayRemove(fcmToken),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[unsubscribe] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
