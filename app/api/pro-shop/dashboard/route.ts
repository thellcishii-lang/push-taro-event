// app/api/pro-shop/dashboard/route.ts
/**
 * PRO店舗ダッシュボード用データ取得
 *
 * - 店舗情報（紹介コード・口座）
 * - 紹介店舗一覧（referral_relations + shops）
 * - 報酬明細（monthly_rewards）
 * - サマリー（累計報酬・未払い・紹介店舗数）
 *
 * 参照元: app/pro-shop/dashboard/page.tsx
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';
import { isProReferralPlan, PRO_REFERRAL_PLAN_LABELS } from '@/lib/pro-referral-policy';
import { isProPlan } from '@/lib/pro-plan';

export const dynamic = 'force-dynamic';

// plan の表記ゆれ（'PRO' 等）があっても管理画面(/pro-shop)と同じ基準で判定できるよう、
// ownerUid のみで検索してからアプリ側でプランを判定する
async function findOwnedProShop(uid: string) {
  const owned = await db.collection('shops').where('ownerUid', '==', uid).get();
  return owned.docs.find((doc) => isProPlan(doc.data().plan)) ?? null;
}

export async function GET(request: Request) {
  // ─── 認証 ───
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
    let shopId = searchParams.get('shopId');

    if (!shopId) {
      const ownedShop = await findOwnedProShop(uid);
      if (!ownedShop) {
        return NextResponse.json({ error: 'PRO店舗情報が見つかりません' }, { status: 403 });
      }
      shopId = ownedShop.id;
    }

    // ─── 権限チェック（店舗オーナー or 管理者）───
    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return NextResponse.json({ error: '店舗情報が見つかりません' }, { status: 404 });
    }

    const shopData = shopDoc.data()!;
    if (shopData.ownerUid !== uid && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }
    if (!isProPlan(shopData.plan)) {
      return NextResponse.json({ error: 'PROプラン専用の管理画面です' }, { status: 403 });
    }

    // ============================================================
    // 1. 紹介店舗一覧（referral_relations から referrerType='pro'）
    // ============================================================
    const relSnap = await db.collection('referral_relations')
      .where('referrerId', '==', shopId)
      .where('referrerType', '==', 'pro')
      .get();

    const referrals: any[] = [];
    let activeCount = 0;

    for (const relDoc of relSnap.docs) {
      const relData = relDoc.data();
      const referredShopId = relData.referredTenantId;
      if (!referredShopId) continue;

      const referredShopDoc = await db.collection('shops').doc(referredShopId).get();
      if (!referredShopDoc.exists) continue;

      const referredShopData = referredShopDoc.data()!;
      const relStatus = relData.slotReleasedAt || referredShopData.status === 'canceled'
        ? 'canceled'
        : relData.status || 'pending';
      if (relStatus === 'active') activeCount++;

      // 利用開始日
      let startedAt = '不明';
      if (relData.createdAt?.toDate) {
        startedAt = relData.createdAt.toDate().toISOString().slice(0, 10);
      }

      // 参考値：月額報酬
      const plan = (referredShopData.plan || 'light').toLowerCase();
      const PLAN_PRICES: Record<string, number> = {
        light: 1980,
        standard: 3800,
        pro: 10000,
      };
      const planAmount = PLAN_PRICES[plan] || PLAN_PRICES.light;
      const rewardRate = relData.rewardRate || 0;
      const monthlyReward = Math.floor(planAmount * rewardRate);

      referrals.push({
        id: referredShopId,
        shopCode: referredShopData.referralCode || referredShopId,
        name: referredShopData.name || '未設定',
        plan,
        status: relStatus,
        rewardRate,
        monthlyReward,
        startedAt,
      });
    }

    // ============================================================
    // 2. 報酬明細（monthly_rewards から referrerType='pro'）
    // ============================================================
    const rewardsSnap = await db.collection('monthly_rewards')
      .where('userId', '==', shopId)
      .where('referrerType', '==', 'pro')
      .get();

    const rewards = rewardsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        billingMonth: data.billingMonth || '',
        shopName: data.sourceShopName || '不明',
        amount: data.amount || 0,
        status: data.status || 'unpaid',
      };
    });

    // 支払い予定月で降順ソート（billingMonth で代用）
    rewards.sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));

    // ============================================================
    // 3. サマリー
    // ============================================================
    const totalEarnings = shopData.totalEarnings || 0;
    const unpaidReward = shopData.unpaidRewardTotal || 0;

    // ============================================================
    // 4. レスポンス
    // ============================================================
    return NextResponse.json({
      success: true,
      shop: {
        id: shopId,
        name: shopData.name || '',
        referralCode: shopData.referralCode || '',
        bankAccount: shopData.bankAccount || null,
        proReferralPlan: isProReferralPlan(shopData.proReferralPlan)
          ? shopData.proReferralPlan
          : null,
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
    console.error('[pro-shop/dashboard] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.split('Bearer ')[1]);
    const { plan } = await request.json();
    if (!isProReferralPlan(plan)) {
      return NextResponse.json({ error: '報酬プランを選択してください' }, { status: 400 });
    }

    const shopDoc = await findOwnedProShop(decoded.uid);
    if (!shopDoc) {
      return NextResponse.json({ error: 'PRO店舗情報が見つかりません' }, { status: 403 });
    }

    const choice = await db.runTransaction(async (transaction) => {
      const current = await transaction.get(shopDoc.ref);
      const currentData = current.data() || {};
      const currentPlan = currentData.proReferralPlan;
      if (isProReferralPlan(currentPlan)) {
        return {
          status: currentPlan === plan ? 'already-selected' : 'locked',
          needsEmail: !currentData.proReferralPlanEmailSentAt,
        };
      }
      transaction.update(shopDoc.ref, { proReferralPlan: plan });
      return { status: 'saved', needsEmail: true };
    });

    if (choice.status === 'locked') {
      return NextResponse.json({ error: '報酬プランは確定済みのため変更できません' }, { status: 409 });
    }

    if (choice.needsEmail && shopDoc.data().email) {
      await sendEmail({
        to: shopDoc.data().email,
        subject: '【Push-taro】PRO紹介報酬プラン確定のお知らせ',
        html: `
          <div style="font-family:sans-serif;padding:20px;">
            <h2>PRO紹介報酬プランが確定しました</h2>
            <p>報酬プランは<strong>${PRO_REFERRAL_PLAN_LABELS[plan]}</strong>です。</p>
            <p>報酬関連はPROダッシュボードからご確認いただけます。</p>
            <p><a href="${(process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com').replace(/\/$/, '')}/pro-shop/dashboard">PROダッシュボードを開く</a></p>
          </div>
        `,
      });
      await shopDoc.ref.update({ proReferralPlanEmailSentAt: FieldValue.serverTimestamp() });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error('[pro-shop/dashboard] 報酬プラン保存エラー:', error);
    return NextResponse.json({ error: error.message || '保存に失敗しました' }, { status: 500 });
  }
}
