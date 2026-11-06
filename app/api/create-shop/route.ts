// app/api/create-shop/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '../../../lib/mailer';
import {
  AGENCY_RATE_OTHER,
  AFFILIATE_RECURRING_RATE_FIRST_YEAR,
} from '@/lib/constants';
import { getProReferralRate, isProReferralPlan } from '@/lib/pro-referral-policy';

export const dynamic = 'force-dynamic';

// ─── 紹介コード解決（prefix で分岐）───
async function resolveReferrerByCode(code: string): Promise<{
  referrerId: string;
  referrerType: 'agency' | 'affiliate' | 'pro' | 'shop';
  referrerEmail: string | null;
  referrerName: string | null;
  affiliateRewardType: 'recurring' | 'one-time' | null;
  proReferralPlan?: 'a' | 'b';
} | null> {
  const trimmed = code.trim();

  // ① アフィリエイト（AF-S- / AF-O- / AF-）
  if (trimmed.startsWith('AF-S-') || trimmed.startsWith('AF-O-') || trimmed.startsWith('AF-')) {
    const snap = await db.collection('affiliates')
      .where('referralCode', '==', trimmed)
      .limit(1)
      .get();

    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data();

      let rewardType: 'recurring' | 'one-time';
      if (data.rewardType === 'one-time' || data.rewardType === 'recurring') {
        rewardType = data.rewardType;
      } else if (trimmed.startsWith('AF-O-')) {
        rewardType = 'one-time';
      } else {
        rewardType = 'recurring';
      }

      return {
        referrerId: doc.id,
        referrerType: 'affiliate',
        referrerEmail: data.email || null,
        referrerName: data.name || 'アフィリエイト',
        affiliateRewardType: rewardType,
      };
    }
  }

  // ② 代理店（AGENCY-）
  if (trimmed.startsWith('AGENCY-')) {
    const snap = await db.collection('agencies')
      .where('referralCode', '==', trimmed)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data();
      return {
        referrerId: doc.id,
        referrerType: 'agency',
        referrerEmail: data.email || null,
        referrerName: data.companyName || data.ownerName || '代理店',
        affiliateRewardType: null,
      };
    }
  }

  // ③ その他 → shops (PRO / 一般)
  const shopSnap = await db.collection('shops')
    .where('referralCode', '==', trimmed)
    .limit(1)
    .get();

  if (!shopSnap.empty) {
    const doc = shopSnap.docs[0];
    const data = doc.data();

    let referrerType: 'agency' | 'pro' | 'shop';
    if (data.role === 'agency') {
      referrerType = 'agency';
    } else if (data.role === 'pro' || data.plan === 'pro') {
      if (!isProReferralPlan(data.proReferralPlan)) return null;
      referrerType = 'pro';
    } else {
      referrerType = 'shop';
    }

    return {
      referrerId: doc.id,
      referrerType,
      referrerEmail: data.email || null,
      referrerName: data.name || '紹介者',
      affiliateRewardType: null,
      ...(referrerType === 'pro' ? { proReferralPlan: data.proReferralPlan } : {}),
    };
  }

  return null;
}

// ─── プラン別報酬率 ───
function resolveRewardRate(
  referrerType: string,
  plan: string,
  rewardType: 'recurring' | 'one-time' | null
): number {
  if (referrerType === 'agency') {
    return plan === 'pro' ? 0.30 : AGENCY_RATE_OTHER;
  }
  if (referrerType === 'pro') {
    return getProReferralRate('a', plan);
  }
  if (referrerType === 'affiliate') {
    return rewardType === 'one-time' ? 0 : AFFILIATE_RECURRING_RATE_FIRST_YEAR;
  }
  return 0;
}

// ============================================================
// メイン処理
// ============================================================
export async function POST(request: Request) {
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
    return NextResponse.json({ error: '無効な認証トークンです' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, referralCode } = body;

    const partnerCollections = ['agencies', 'affiliates', 'affilishops'];
    for (const collection of partnerCollections) {
      const partner = await db.collection(collection).where('uid', '==', uid).limit(1).get();
      if (!partner.empty) {
        return NextResponse.json({ error: 'このアカウントでは店舗管理画面を利用できません' }, { status: 403 });
      }
    }

    // ─── 既存店舗チェック ───
    const existing = await db.collection('shops').where('ownerUid', '==', uid).limit(1).get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      return NextResponse.json({
        success: true,
        shopId: doc.id,
        exists: true,
        shop: doc.data(),
      }, { status: 200 });
    }

    // ─── 紹介者解決 ───
    const shopName = name || '未設定の店舗';
    let referrerInfo: Awaited<ReturnType<typeof resolveReferrerByCode>> = null;

    if (referralCode) {
      referrerInfo = await resolveReferrerByCode(referralCode);
    }

    if (
      referrerInfo?.referrerType === 'pro' &&
      getProReferralRate(referrerInfo.proReferralPlan, 'light') === 0
    ) {
      referrerInfo = null;
    }

    // ─── shops 作成 ───
    const shopRef = db.collection('shops').doc();
    const shopData: any = {
      name: shopName,
      ownerUid: uid,
      createdAt: FieldValue.serverTimestamp(),
      coupon: { enabled: false, title: '', description: '', discountRate: 0 },
      linkUrl: '',
      iconUrl: '',
    };

    if (referrerInfo) {
      shopData.referrerId = referrerInfo.referrerId;
      shopData.referredByCode = referralCode.trim();
      shopData.referrerType = referrerInfo.referrerType;
    }

    await shopRef.set(shopData);

    // ─── 紹介関係の保存 ───
    if (referrerInfo && referrerInfo.referrerType !== 'shop') {
      const plan = shopData.plan || 'light';
      const rewardRate = resolveRewardRate(
        referrerInfo.referrerType,
        plan,
        referrerInfo.affiliateRewardType
      );

      await db.collection('referral_relations').add({
        referrerId: referrerInfo.referrerId,
        referredTenantId: shopRef.id,
        rewardRate,
        rewardType: referrerInfo.affiliateRewardType,
        referrerType: referrerInfo.referrerType,
        ...(referrerInfo.referrerType === 'pro'
          ? { proReferralPlan: referrerInfo.proReferralPlan }
          : {}),
        status: 'pending',
        tieredReward: referrerInfo.referrerType === 'affiliate' && referrerInfo.affiliateRewardType === 'recurring',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // ─── 紹介者へメール通知 ───
      if (referrerInfo.referrerEmail) {
        const ratePercent =
          rewardRate > 0
            ? `${(rewardRate * 100).toFixed(1)}%`
            : '初回のみ固定報酬';

        await sendEmail({
          to: referrerInfo.referrerEmail,
          subject: `【Push-taro】紹介コード [${referralCode}] から新規登録がありました`,
          html: `
            <h2>${referrerInfo.referrerName} 様</h2>
            <p>あなたの紹介コードを使用して、新しい店舗が登録されました。</p>
            <p><strong>店舗名:</strong> ${shopName}</p>
            <p><strong>紹介報酬:</strong> ${ratePercent}</p>
            <p>この店舗が決済を完了すると、紹介報酬が確定します。</p>
            <hr />
            <p><strong>Push-taro.com</strong></p>
            <p>運営会社：the合同会社</p>
            <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
            <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
          `,
        });
      }
    }

    return NextResponse.json({
      success: true,
      shopId: shopRef.id,
      exists: false,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[create-shop] エラー:', error);
    return NextResponse.json({
      error: 'サーバーエラー',
      detail: error.message,
    }, { status: 500 });
  }
}
