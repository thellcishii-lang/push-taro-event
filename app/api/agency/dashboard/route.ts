// app/api/agency/dashboard/route.ts
/**
 * 代理店ダッシュボード用データ取得
 * 
 * - 代理店情報（紹介コード・口座）
 * - 配下店舗一覧（紹介店舗）
 * - 報酬明細
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { AGENCY_RATE_OTHER } from '@/lib/constants';

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
    const agencyId = searchParams.get('agencyId');

    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId が必要です' }, { status: 400 });
    }

    // 権限チェック（代理店本人 or 管理者）
    const agencyDoc = await db.collection('agencies').doc(agencyId).get();
    if (!agencyDoc.exists) {
      return NextResponse.json({ error: '代理店情報が見つかりません' }, { status: 404 });
    }

    const agencyData = agencyDoc.data()!;
    if (agencyData.uid !== uid && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }
    if (!isAdmin && agencyData.status !== 'active') {
      return NextResponse.json({ error: '決済完了後に代理店機能をご利用いただけます' }, { status: 403 });
    }

    // ============================================================
    // 紹介店舗一覧（referral_relations から）
    // ============================================================
    const relSnap = await db.collection('referral_relations')
      .where('referrerId', '==', agencyId)
      .where('referrerType', '==', 'agency')
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
        rewardRate: shopData.plan === 'pro' ? 0 : AGENCY_RATE_OTHER,
        startedAt: startedAtStr,
      });
    }

    // ============================================================
    // 報酬明細（monthly_rewards から）
    // ============================================================
    const rewardsSnap = await db.collection('monthly_rewards')
      .where('userId', '==', agencyId)
      .where('referrerType', '==', 'agency')
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

    // 支払い予定月で降順ソート
    rewards.sort((a, b) => b.scheduledPayoutMonth.localeCompare(a.scheduledPayoutMonth));

    // ============================================================
    // サマリー
    // ============================================================
    const totalEarnings = rewards
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.amount, 0);

    const unpaidReward = rewards
      .filter((r) => r.status === 'unpaid')
      .reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      success: true,
      agency: {
        id: agencyId,
        companyName: agencyData.companyName || '',
        ownerName: agencyData.ownerName || '',
        email: agencyData.email || '',
        phone: agencyData.phone || '',
        referralCode: agencyData.referralCode || '',
        bankAccount: agencyData.bankAccount || null,
        status: agencyData.status || '',
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
    console.error('[agency/dashboard] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
