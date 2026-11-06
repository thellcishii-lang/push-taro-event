// app/api/affilishop/dashboard/route.ts
/**
 * affilishop ダッシュボード用データ取得
 *
 * - affilishop情報（紹介コード・口座）
 * - 紹介店舗一覧
 * - 報酬明細
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);
    let affilishopId = searchParams.get('affilishopId');
    if (!affilishopId) {
      const ownAffilishop = await db.collection('affilishops').where('uid', '==', uid).limit(1).get();
      if (ownAffilishop.empty) {
        return NextResponse.json({ error: 'affilishop情報が見つかりません' }, { status: 403 });
      }
      affilishopId = ownAffilishop.docs[0].id;
    }

    const affilishopDoc = await db.collection('affilishops').doc(affilishopId).get();
    if (!affilishopDoc.exists) {
      return NextResponse.json({ error: 'affilishop情報が見つかりません' }, { status: 404 });
    }

    const affilishopData = affilishopDoc.data()!;
    if (affilishopData.uid !== uid && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // ============================================================
    // 紹介店舗一覧（referral_relations から）
    // ============================================================
    const relSnap = await db.collection('referral_relations')
      .where('referrerId', '==', affilishopId)
      .where('referrerType', '==', 'affilishop')
      .get();

    const referrals: any[] = [];
    let activeCount = 0;

    for (const relDoc of relSnap.docs) {
      const relData = relDoc.data();
      const shopId = relData.referredTenantId;
      if (!shopId) continue;

      const shopDoc = await db.collection('shops').doc(shopId).get();
      if (!shopDoc.exists) continue;

      const shopData = shopDoc.data()!;
      if (relData.status === 'active') activeCount++;

      let startedAtStr = '不明';
      if (relData.createdAt?.toDate) {
        startedAtStr = relData.createdAt.toDate().toISOString().slice(0, 10);
      }

      referrals.push({
        id: shopId,
        shopCode: shopData.referralCode || shopId,
        name: shopData.name || '未設定',
        plan: (shopData.plan || 'light').toLowerCase(),
        status: relData.status || 'pending',
        rewardRate: relData.rewardRate || 0,
        startedAt: startedAtStr,
      });
    }

    // ============================================================
    // 報酬明細（monthly_rewards から）
    // ============================================================
    const rewardsSnap = await db.collection('monthly_rewards')
      .where('userId', '==', affilishopId)
      .where('referrerType', '==', 'affilishop')
      .get();

    const rewards = rewardsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        billingMonth: data.billingMonth || '',
        scheduledPayoutMonth: data.scheduledPayoutMonth || '',
        sourceShopName: data.sourceShopName || '不明',
        amount: data.amount || 0,
        status: data.status || 'unpaid',
      };
    });

    rewards.sort((a, b) => b.scheduledPayoutMonth.localeCompare(a.scheduledPayoutMonth));

    const totalEarnings = rewards.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
    const unpaidReward = rewards.filter((r) => r.status === 'unpaid').reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      success: true,
      affilishop: {
        id: affilishopId,
        companyName: affilishopData.companyName || '',
        ownerName: affilishopData.ownerName || '',
        email: affilishopData.email || '',
        phone: affilishopData.phone || '',
        referralCode: affilishopData.referralCode || '',
        bankAccount: affilishopData.bankAccount || null,
        status: affilishopData.status || '',
      },
      summary: {
        totalEarnings,
        unpaidReward,
        referralCount: activeCount,
      },
      referrals,
      rewards,
    });
  } catch (error: any) {
    console.error('[affilishop/dashboard] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// 口座情報の更新
// ============================================================
export async function PUT(request: Request) {
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
    const { bankAccount } = await request.json();
    if (!bankAccount) {
      return NextResponse.json({ error: 'bankAccount が必要です' }, { status: 400 });
    }

    const ownAffilishop = await db.collection('affilishops').where('uid', '==', uid).limit(1).get();
    if (ownAffilishop.empty) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await ownAffilishop.docs[0].ref.update({ bankAccount });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[affilishop/dashboard PUT] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
