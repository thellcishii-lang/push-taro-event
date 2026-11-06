import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    if (userRecord.customClaims?.admin !== true) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const { shopId } = await request.json();

    if (!shopId) {
      return NextResponse.json({ error: 'shopIdが必要です' }, { status: 400 });
    }

    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    const shopData = shopDoc.data();

    // ============================================================
    // 1. サブコレクションを全部削除
    // ============================================================
    const subCollections = [
      'subscriptions',
      'histories',
      'coupon_logs',
      'token_chunks',
      'invoice_history',
      'subscribers',
    ];

    for (const col of subCollections) {
      const snapshot = await db.collection('shops').doc(shopId).collection(col).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      if (snapshot.size > 0) {
        await batch.commit();
      }
    }

    // ============================================================
    // 2. shopドキュメント本体を削除
    // ============================================================
    await db.collection('shops').doc(shopId).delete();

    // ============================================================
    // 3. Firebase Auth ユーザーも削除（ownerUidがあれば）
    // ============================================================
    if (shopData?.ownerUid) {
      try {
        await authAdmin.deleteUser(shopData.ownerUid);
        console.log(`[delete-shop] Authユーザー削除: ${shopData.ownerUid}`);
      } catch (authErr) {
        console.warn(`[delete-shop] Auth削除スキップ（ユーザー不在）: ${shopData.ownerUid}`);
      }
    }

    // ============================================================
    // 4. 紹介リレーションも無効化（あれば）
    // ============================================================
    const relSnap = await db.collection('referral_relations')
      .where('referredTenantId', '==', shopId)
      .get();
    const batch2 = db.batch();
    relSnap.docs.forEach((doc) => batch2.delete(doc.ref));
    if (relSnap.size > 0) {
      await batch2.commit();
    }

    console.log(`[delete-shop] 完全削除完了: ${shopId}`);

    return NextResponse.json({
      success: true,
      message: '店舗と関連データを完全に削除しました',
    });
  } catch (error: any) {
    console.error('[delete-shop] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
