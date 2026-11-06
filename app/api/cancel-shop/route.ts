// app/api/cancel-shop/route.ts
/**
 * 店舗の月額契約（Push-taroサブスクリプション）を解約するAPI
 * 
 * ※ 顧客の通知購読（subscriptions コレクション）とは無関係
 * ※ 解約後も Auth ユーザーは validUntil まで保持される
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Client, Environment } from 'square';

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { shopId } = await request.json();

    const shopRef = db.collection('shops').doc(shopId);
    const shopDoc = await shopRef.get();

    if (!shopDoc.exists || shopDoc.data()?.ownerUid !== uid) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const shopData = shopDoc.data();
    let validUntilDate = new Date();

    // Square解約
    // Square解約
if (shopData?.subscriptionId) {
  try {
    const response = await squareClient.subscriptionsApi.cancelSubscription(shopData.subscriptionId);
    const subscription = response.result.subscription;
    if (subscription?.chargedThroughDate) {
      validUntilDate = new Date(subscription.chargedThroughDate);
    }
  } catch (sqErr: any) {
    console.error('Square解約処理エラー:', sqErr);
    // 🆕 Square解約に失敗したら、Firestore を更新せず 500 を返す
    return NextResponse.json(
      { error: 'Square での解約処理に失敗しました。時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}

    // ============================================================
    // Firestore 更新（Authユーザーは削除しない）
    // ============================================================
    const relations = await db.collection('referral_relations')
      .where('referredTenantId', '==', shopId)
      .get();
    const batch = db.batch();
    batch.update(shopRef, {
      status: 'canceled',
      canceledAt: new Date(),
      validUntil: validUntilDate,
      scheduledDeletionAt: validUntilDate,
    });
    relations.docs.forEach((relation) => {
      batch.update(relation.ref, { slotReleasedAt: FieldValue.serverTimestamp() });
    });
    await batch.commit();

    console.log(`[cancel-shop] 解約受付完了: ${shopId} / 有効期限: ${validUntilDate.toISOString().slice(0, 10)}`);
    console.log(`[cancel-shop] Authユーザーは有効期限まで保持されます: ${uid}`);

    return NextResponse.json({
      success: true,
      validUntil: validUntilDate.toISOString().slice(0, 10),
      message: `解約を受付しました。${validUntilDate.toISOString().slice(0, 10)} までご利用いただけます。`,
    });

  } catch (error: any) {
    console.error('[cancel-shop] エラー:', error);
    return NextResponse.json({ error: error.message || '退会処理に失敗しました' }, { status: 500 });
  }
}
