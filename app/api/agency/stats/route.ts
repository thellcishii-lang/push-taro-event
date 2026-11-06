// app/api/agency/stats/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let requesterUid: string;
  let isAdmin = false;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    requesterUid = decoded.uid;
    const userRecord = await authAdmin.getUser(requesterUid);
    isAdmin = userRecord.customClaims?.admin === true;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get('agencyId');

    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId が必要です' }, { status: 400 });
    }

    if (requesterUid !== agencyId && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // ============================================================
    // 1. 代理店自身の情報
    // ============================================================
    const agencyDoc = await db.collection('agencies').doc(agencyId).get();
    if (!agencyDoc.exists) {
      return NextResponse.json({ error: '代理店情報が見つかりません' }, { status: 404 });
    }

    const agencyData = agencyDoc.data()!;
    if (!isAdmin && agencyData.status !== 'active') {
      return NextResponse.json({ error: '決済完了後に代理店機能をご利用いただけます' }, { status: 403 });
    }

    // ============================================================
    // 2. referral_relations から配下店舗IDを取得
    // ============================================================
    const relSnap = await db.collection('referral_relations')
      .where('referrerId', '==', agencyId)
      .where('referrerType', '==', 'agency')
      .get();

    const shopIds: string[] = [];
    const relationMap: Record<string, any> = {};

    relSnap.docs.forEach((relDoc) => {
      const relData = relDoc.data();
      if (relData.referredTenantId) {
        shopIds.push(relData.referredTenantId);
        relationMap[relData.referredTenantId] = relData;
      }
    });

    // ============================================================
    // 3. 各店舗の詳細を shops から取得
    // ============================================================
    const shopDocsData: any[] = [];
    for (const shopId of shopIds) {
      const shopDoc = await db.collection('shops').doc(shopId).get();
      if (shopDoc.exists) {
        shopDocsData.push({
          id: shopDoc.id,
          ...shopDoc.data(),
          _relation: relationMap[shopId],
        });
      }
    }

    // ============================================================
    // 4. subscriptions から配下店舗の購読者数を集計
    //    全件スキャンではなく、配下店舗IDに限定してクエリする
    // ============================================================
    const subscriberCounts: Record<string, number> = {};
    if (shopIds.length > 0) {
      // Firestore 'array-contains-any' は最大10件まで。配下店舗を分割してクエリ。
      const CHUNK = 10;
      for (let i = 0; i < shopIds.length; i += CHUNK) {
        const chunk = shopIds.slice(i, i + CHUNK);
        const snap = await db.collection('subscriptions')
          .where('shopIds', 'array-contains-any', chunk)
          .get();
        snap.docs.forEach((doc) => {
          const data = doc.data();
          if (Array.isArray(data.shopIds)) {
            data.shopIds.forEach((sId: string) => {
              // この代理店の配下店舗のみカウント（他店舗の重複を除外）
              if (relationMap[sId]) {
                subscriberCounts[sId] = (subscriberCounts[sId] || 0) + 1;
              }
            });
          }
        });
      }
    }

    // ============================================================
    // 5. 当月の集計
    // ============================================================
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let monthlyNewCount = 0;
    let monthlyCanceledCount = 0;
    const planCounts = { light: 0, standard: 0, pro: 0, other: 0 };

    // ============================================================
    // 6. 店舗データの整形
    // ============================================================
    const detailedShops = shopDocsData.map((data) => {
      const shopId = data.id;

      const createdAtDate = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : data.createdAt
        ? new Date(data.createdAt)
        : null;
      const canceledAtDate = data.canceledAt?.toDate
        ? data.canceledAt.toDate()
        : data.canceledAt
        ? new Date(data.canceledAt)
        : null;

      if (createdAtDate && createdAtDate >= startOfMonth && createdAtDate <= endOfMonth) {
        monthlyNewCount++;
      }

      if (
        data.status === 'canceled' ||
        (canceledAtDate && canceledAtDate >= startOfMonth && canceledAtDate <= endOfMonth)
      ) {
        monthlyCanceledCount++;
      }

      const plan = (data.plan || 'light').toLowerCase();
      if (plan === 'pro') planCounts.pro++;
      else if (plan === 'standard') planCounts.standard++;
      else if (plan === 'light') planCounts.light++;
      else planCounts.other++;

      return {
        id: shopId,
        shopCode: data.referralCode || shopId,
        name: data.name || '未設定店舗',
        email: data.email || '未登録',
        address: data.address || '未登録',
        phone: data.phone || '未登録',
        subscriberCount: subscriberCounts[shopId] || 0,
        createdAt: createdAtDate ? createdAtDate.toISOString().slice(0, 10) : '不明',
        status: data.status || 'active',
        canceledAt: canceledAtDate ? canceledAtDate.toISOString().slice(0, 10) : null,
        validUntil: data.validUntil
          ? data.validUntil.toDate
            ? data.validUntil.toDate().toISOString().slice(0, 10)
            : String(data.validUntil).slice(0, 10)
          : null,
        plan: plan,
      };
    });

    // ============================================================
    // 7. レスポンス
    // ============================================================
    return NextResponse.json({
      success: true,
      agency: {
        id: agencyId,
        companyName: agencyData.companyName,
        ownerName: agencyData.ownerName,
        email: agencyData.email,
        referralCode: agencyData.referralCode,
        status: agencyData.status,
        approvedAt: agencyData.approvedAt,
      },
      summary: {
        totalShops: detailedShops.length,
        monthlyNewCount,
        monthlyCanceledCount,
        planCounts,
      },
      shops: detailedShops,
    });
  } catch (error: any) {
    console.error('[API Agency Stats Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
