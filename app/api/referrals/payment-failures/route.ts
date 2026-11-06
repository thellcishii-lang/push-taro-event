// app/api/referrals/payment-failures/route.ts
/**
 * 紹介者の配下で決済不履行になっている店舗を返す
 * 読み取り専用
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const FAILURE_STATUSES = ['failure_1', 'failure_2', 'failure_3_stopped', 'recovering', 'canceled'];

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let uid: string;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const referrerId = searchParams.get('referrerId');
    const referrerType = searchParams.get('referrerType');

    if (!referrerId || !referrerType) {
      return NextResponse.json({ error: 'referrerId と referrerType が必要です' }, { status: 400 });
    }

    // ============================================================
    // 権限チェック（自分自身 or 管理者）
    // ============================================================
    let isAuthorized = false;
    if (referrerType === 'agency') {
      const doc = await db.collection('agencies').doc(referrerId).get();
      if (doc.exists && doc.data()?.uid === uid && doc.data()?.status === 'active') isAuthorized = true;
    } else if (referrerType === 'affiliate') {
      const doc = await db.collection('affiliates').doc(referrerId).get();
      if (doc.exists && doc.data()?.uid === uid) isAuthorized = true;
    } else if (referrerType === 'pro') {
      const doc = await db.collection('shops').doc(referrerId).get();
      if (doc.exists && doc.data()?.ownerUid === uid) isAuthorized = true;
    }

    const userRecord = await authAdmin.getUser(uid);
    const isAdmin = userRecord.customClaims?.admin === true;

    if (!isAuthorized && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // ============================================================
    // 配下の紹介関係を取得
    // ============================================================
    const relSnap = await db.collection('referral_relations')
      .where('referrerId', '==', referrerId)
      .get();

    if (relSnap.empty) {
      return NextResponse.json({ success: true, shops: [] });
    }

    // ============================================================
    // 各店舗の paymentStatus をチェック
    // ============================================================
    const shops: any[] = [];

    for (const relDoc of relSnap.docs) {
      const relData = relDoc.data();
      const shopId = relData.referredTenantId;
      if (!shopId) continue;

      const shopDoc = await db.collection('shops').doc(shopId).get();
      if (!shopDoc.exists) continue;

      const shopData = shopDoc.data();
      const paymentStatus = shopData?.paymentStatus?.current || 'normal';

      if (shopData?.paymentFailureHidden === true) {
        continue;
      } 
      
      if (!FAILURE_STATUSES.includes(paymentStatus)) continue;

      // canceled は30日経過したら除外
      if (paymentStatus === 'canceled' && shopData?.paymentCanceledAt) {
        const canceledAt = shopData.paymentCanceledAt.toDate
          ? shopData.paymentCanceledAt.toDate()
          : new Date(shopData.paymentCanceledAt);
        const daysSince = (Date.now() - canceledAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 30) continue;
      }

      shops.push({
        id: shopId,
        name: shopData?.name || '未設定',
        plan: shopData?.plan || 'light',
        paymentStatus,
        lastUpdatedAt: shopData?.paymentStatus?.lastUpdatedAt?.toDate?.()?.toISOString() || null,
      });
    }

    // 状態の優先順位でソート
    const statusOrder: Record<string, number> = {
      failure_3_stopped: 1,
      failure_2: 2,
      failure_1: 3,
      canceled: 4,
      recovering: 5,
    };
    shops.sort((a, b) => (statusOrder[a.paymentStatus] || 99) - (statusOrder[b.paymentStatus] || 99));

    return NextResponse.json({ success: true, shops });
  } catch (error: any) {
    console.error('[referrals/payment-failures] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
