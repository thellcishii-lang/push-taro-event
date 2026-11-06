// app/api/affiliate/stats/route.ts
/**
 * アフィリエイトダッシュボード用データ取得
 *
 * - アフィリエイト情報（紹介コード・口座）
 * - 紹介店舗一覧（referral_relations + shops）
 * - サマリー（累計報酬・未払い・紹介店舗数）
 *
 * 月次明細は /api/affiliate/statements で取得
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import {
  PLAN_PRICES,
} from '@/lib/constants';
import {
  calculateRewards,
  getOneTimeRewardAmount,
  calculateRewardRate,
} from '@/lib/square-webhook/reward-calculator';

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
    let affiliateId = searchParams.get('affiliateId');

    // affiliateId 未指定 → ログイン中の uid から自動解決
    if (!affiliateId) {
      const snap = await db.collection('affiliates')
        .where('uid', '==', uid)
        .limit(1)
        .get();

      if (snap.empty) {
        return NextResponse.json({ error: 'アフィリエイト情報が見つかりません' }, { status: 404 });
      }
      affiliateId = snap.docs[0].id;
    }

    // ============================================================
    // 1. アフィリエイト情報
    // ============================================================
    const affDoc = await db.collection('affiliates').doc(affiliateId).get();
    if (!affDoc.exists) {
      return NextResponse.json({ error: 'アフィリエイト情報が見つかりません' }, { status: 404 });
    }

    const affData = affDoc.data()!;
    if (affData.uid !== uid && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // ============================================================
    // 2. referral_relations から紹介店舗IDを取得
    // ============================================================
    const relSnap = await db.collection('referral_relations')
      .where('referrerId', '==', affiliateId)
      .where('referrerType', '==', 'affiliate')
      .get();

    const relations: Array<{ relId: string; relData: any; shopId: string }> = [];
    for (const relDoc of relSnap.docs) {
      const relData = relDoc.data();
      const shopId = relData.referredTenantId;
      if (!shopId) continue;
      relations.push({ relId: relDoc.id, relData, shopId });
    }

    // ============================================================
    // 3. 各店舗の shops を取得
    // ============================================================
    const referrals: any[] = [];
    let activeCount = 0;

    for (const rel of relations) {
      const shopDoc = await db.collection('shops').doc(rel.shopId).get();
      if (!shopDoc.exists) continue;

      const shopData = shopDoc.data()!;
      const shopStatus = shopData.status || 'active';
      const relStatus = rel.relData.status || 'pending';

      if (relStatus === 'active') activeCount++;

      // 店舗の利用開始日
      let startedAt = '不明';
      if (rel.relData.createdAt?.toDate) {
        startedAt = rel.relData.createdAt.toDate().toISOString().slice(0, 10);
      }

      // 報酬タイプ（affiliate は rewardType で判定）
            // 報酬タイプ（affiliate は rewardType で判定）
      const rewardType = rel.relData.rewardType || affData.rewardType || 'recurring';
      const isRecurring = rewardType === 'recurring';

      const plan = (shopData.plan || 'light').toLowerCase();
      const planAmount = PLAN_PRICES[plan] || PLAN_PRICES.light;

      // 源泉前の率
      const baseRate = isRecurring
        ? await calculateRewardRate(affData, 'affiliate', plan, affiliateId, {
            createdAt: rel.relData.createdAt,
            tieredReward: rel.relData.tieredReward === true,
          })
        : 0;

      // 参考値の計算（月末バッチと同じロジック）
      const result = calculateRewards({
        baseRate,
        paymentAmount: planAmount,
        hasInvoice: affData.hasInvoice === true,
        oneTimeAmount: isRecurring ? undefined : getOneTimeRewardAmount(plan),
      });

      referrals.push({
        id: rel.shopId,
        shopName: shopData.name || '未設定',
        plan,
        status: relStatus,
        shopStatus,
        rewardType,
        rewardRate: result.effectiveRate,
        monthlyReward: result.reward,
        startedAt,
      });
    }   

    // ============================================================
    // 4. サマリー
    // ============================================================
    const totalEarnings = affData.totalEarnings || 0;
    const unpaidReward = affData.unpaidReward || 0;

    return NextResponse.json({
      success: true,
      affiliate: {
        id: affiliateId,
        name: affData.name || '',
        email: affData.email || '',
        referralCode: affData.referralCode || '',
        rewardType: affData.rewardType || 'recurring',
        hasInvoice: affData.hasInvoice === true,
        status: affData.status || 'active',
        bankAccount: affData.bankAccount || null,
      },
      summary: {
        totalEarnings,
        unpaidReward,
        referralCount: activeCount,
      },
      referrals,
    });
  } catch (error: any) {
    console.error('[affiliate/stats] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
