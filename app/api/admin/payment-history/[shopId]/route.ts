// app/api/admin/payment-history/[shopId]/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let uid: string;
  let isAdmin = false;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    uid = decoded.uid;
    const userRecord = await authAdmin.getUser(uid);
    isAdmin = userRecord.customClaims?.admin === true;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const { shopId } = await params;
    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    const shopData = shopDoc.data()!;

    // ============================================================
    // 権限チェック
    //   管理者 OR 店舗オーナー OR 紹介者（agency / affiliate / pro）
    // ============================================================
    let hasAccess = false;

    if (isAdmin) {
      hasAccess = true;
    } else if (shopData.ownerUid === uid) {
      hasAccess = true;
    } else {
      // 紹介者かどうかを referral_relations で確認
      const relSnap = await db.collection('referral_relations')
        .where('referredTenantId', '==', shopId)
        .get();

      for (const relDoc of relSnap.docs) {
        const relData = relDoc.data();
        const referrerId = relData.referrerId;
        const referrerType = relData.referrerType;

        if (!referrerId || !referrerType) continue;

        // 紹介者の種別に応じて、コレクションを切り替えて uid を確認
        let collection = 'shops';
        if (referrerType === 'agency') collection = 'agencies';
        else if (referrerType === 'affiliate') collection = 'affiliates';

        const referrerDoc = await db.collection(collection).doc(referrerId).get();
        if (referrerDoc.exists) {
          const referrerData = referrerDoc.data()!;
          if (
            (referrerData.uid === uid || referrerData.ownerUid === uid) &&
            (referrerType !== 'agency' || referrerData.status === 'active')
          ) {
            hasAccess = true;
            break;
          }
        }
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // ============================================================
    // payment_history を取得（attemptedAt 降順）
    // ============================================================
    const historySnap = await db.collection('shops')
      .doc(shopId)
      .collection('payment_history')
      .orderBy('attemptedAt', 'desc')
      .get();

    const history = historySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        billingMonth: data.billingMonth,
        periodStart: data.periodStart?.toDate?.()?.toISOString() || null,
        periodEnd: data.periodEnd?.toDate?.()?.toISOString() || null,
        amount: data.amount || 0,
        result: data.result,
        failureAttempt: data.failureAttempt || null,
        attemptedAt: data.attemptedAt?.toDate?.()?.toISOString() || null,
        paymentId: data.paymentId || null,
      };
    });

    // 月単位でグルーピング
    const groupedByMonth: Record<string, any[]> = {};
    history.forEach((h) => {
      const month = h.billingMonth || 'unknown';
      if (!groupedByMonth[month]) groupedByMonth[month] = [];
      groupedByMonth[month].push(h);
    });

    return NextResponse.json({
      success: true,
      shopId,
      shopName: shopData?.name || '未設定',
      paymentStatus: shopData?.paymentStatus?.current || 'normal',
      manualActions: shopData?.manualActions || {},
      history,
      groupedByMonth,
    });
  } catch (error: any) {
    console.error('[payment-history] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
