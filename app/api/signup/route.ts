import { NextResponse } from 'next/server';
import { db, authAdmin } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '../../../lib/mailer';
import { notifyAdmins } from '../../../lib/error-notifier';
import { enforceRateLimit } from '../../../lib/rate-limit';
import { generatePrintToken } from '../../../lib/print-token';
import { getReferrerDashboardUrl } from '../../../lib/referrer-dashboard';
import {
  AGENCY_RATE_OTHER,
  AFFILIATE_RECURRING_RATE_FIRST_YEAR,
  AFFILISHOP_RATE_FIRST_YEAR,
} from '../../../lib/constants';
import {
  getProReferralRate,
  hasProReferralPlanBCapacity,
  isProReferralPlan,
} from '../../../lib/pro-referral-policy';

export const dynamic = 'force-dynamic';

interface SignupBody {
  email?: string;
  checkOnly?: boolean;
  plan?: string;
  companyName?: string;
  invoiceNumber?: string;
  address?: string;
  phone?: string;
  referralCode?: string;
  bankAccount?: {
    bankName?: string;
    branchName?: string;
    accountType?: string;
    accountNumber?: string;
    accountHolder?: string;
  } | null;
}

export async function POST(request: Request) {
  const retryAfter = await enforceRateLimit(request, 'signup-shop', 10, 10 * 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'しばらく待ってから再度お試しください' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  let body: SignupBody = {};

  try {
    body = await request.json();
    const {
      plan, companyName, invoiceNumber, address, phone, email,
      checkOnly, bankAccount, referralCode: referralCodeFromBody,
    } = body;

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'メールアドレスは必須です。' }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    try {
      await authAdmin.getUserByEmail(normalizedEmail);
      return NextResponse.json({
        error: 'このメールアドレスはすでに登録されています。管理画面よりログインしてください。',
        status: 'already_registered',
        alreadyPaid: true,
      }, { status: 409 });
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    const existingShops = await db.collection('shops')
      .where('email', '==', normalizedEmail)
      .get();
    const statuses = existingShops.docs.map((doc) => doc.data().status || 'active');
    if (statuses.includes('pending_payment')) {
      return NextResponse.json({
        error: 'このメールアドレスはすでにお申し込み中です。決済をお済ませいただくか、別のメールアドレスをご使用ください。',
        status: 'pending_payment',
      }, { status: 409 });
    }
    if (statuses.some((status) => ['active', 'payment_warning', 'send_disabled'].includes(status))) {
      return NextResponse.json({
        error: 'このメールアドレスはすでにご登録済みです。管理画面よりログインしてください。',
        status: 'already_registered',
        alreadyPaid: true,
      }, { status: 409 });
    }

    if (checkOnly === true) {
      return NextResponse.json({ success: true, message: '利用可能なメールアドレスです。' });
    }
    if (typeof companyName !== 'string' || !companyName.trim()) {
      return NextResponse.json({ error: '必須項目が不足しています。' }, { status: 400 });
    }
    if (plan !== 'light' && plan !== 'standard' && plan !== 'pro') {
      return NextResponse.json({ error: '不正なプランです。' }, { status: 400 });
    }
    if (plan === 'pro' && (
      !bankAccount?.bankName || !bankAccount.branchName ||
      !bankAccount.accountNumber || !bankAccount.accountHolder
    )) {
      return NextResponse.json({ error: 'PROプランでは振込先口座情報が必要です。' }, { status: 400 });
    }
    if (referralCodeFromBody !== undefined && typeof referralCodeFromBody !== 'string') {
      return NextResponse.json({ error: '紹介コードが不正です。' }, { status: 400 });
    }

    const paymentUrls = {
      light: process.env.NEXT_PUBLIC_SQUARE_LINK_LIGHT,
      standard: process.env.NEXT_PUBLIC_SQUARE_LINK_STANDARD,
      pro: process.env.NEXT_PUBLIC_SQUARE_LINK_PRO,
    };
    const paymentUrl = paymentUrls[plan];
    if (!paymentUrl) {
      console.error(`[signup] ${plan} の決済リンクが設定されていません`);
      return NextResponse.json({ error: '決済リンクが設定されていません。' }, { status: 500 });
    }

    const refCode = (referralCodeFromBody || '').trim().toUpperCase();
    let referrerId: string | null = null;
    let referrerType: 'affiliate' | 'agency' | 'affilishop' | 'pro' | 'shop' | null = null;
    let referrerEmail: string | null = null;
    let referrerName: string | null = null;
    let rewardRate = 0;
    let affiliateRewardType: 'recurring' | 'one-time' | null = null;
    let proReferralPlan: 'a' | 'b' | null = null;

    if (refCode) {
      if (refCode.startsWith('AF-')) {
        const snapshot = await db.collection('affiliates')
          .where('referralCode', '==', refCode).limit(1).get();
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          referrerId = doc.id;
          referrerType = 'affiliate';
          referrerEmail = data.email || null;
          referrerName = data.name || 'アフィリエイト';
          affiliateRewardType = data.rewardType === 'one-time' || data.rewardType === 'recurring'
            ? data.rewardType
            : refCode.startsWith('AF-O-') ? 'one-time' : 'recurring';
          rewardRate = affiliateRewardType === 'recurring' ? AFFILIATE_RECURRING_RATE_FIRST_YEAR : 0;
        }
      } else if (refCode.startsWith('AGENCY-') || refCode.startsWith('ASHOP-')) {
        const isAgency = refCode.startsWith('AGENCY-');
        const snapshot = await db.collection(isAgency ? 'agencies' : 'affilishops')
          .where('referralCode', '==', refCode)
          .where('status', '==', 'active').limit(1).get();
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          referrerId = doc.id;
          referrerType = isAgency ? 'agency' : 'affilishop';
          referrerEmail = data.email || null;
          referrerName = data.companyName || data.ownerName || (isAgency ? '代理店' : 'affilishop');
          rewardRate = isAgency ? (plan === 'pro' ? 0.30 : AGENCY_RATE_OTHER) : AFFILISHOP_RATE_FIRST_YEAR;
        }
      } else {
        const snapshot = await db.collection('shops')
          .where('referralCode', '==', refCode).limit(1).get();
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          if (data.role === 'pro' || data.plan === 'pro') {
            const proRate = getProReferralRate(data.proReferralPlan, plan);
            if (isProReferralPlan(data.proReferralPlan) && proRate > 0) {
              referrerId = doc.id;
              referrerType = 'pro';
              proReferralPlan = data.proReferralPlan;
              rewardRate = proRate;
            }
          } else {
            referrerId = doc.id;
            referrerType = 'shop';
          }
          if (referrerId) {
            referrerEmail = data.email || null;
            referrerName = data.name || '紹介者';
          }
        }
      }
    }

    const shopRef = db.collection('shops').doc();
    const shopId = shopRef.id;
    const shopData = {
      name: companyName,
      email: normalizedEmail,
      plan,
      status: 'pending_payment',
      referralCode: shopId.slice(0, 8).toUpperCase(),
      createdAt: FieldValue.serverTimestamp(),
      coupon: { enabled: false, title: '', description: '', discountRate: 0 },
      linkUrl: '',
      iconUrl: '',
      invoiceNumber: invoiceNumber || '',
      address: address || '',
      phone: phone || '',
      bankAccount: bankAccount || null,
      referrerId,
      referredByCode: referrerId ? refCode : '',
      referrerType,
    };
    const relationRef = referrerId ? db.collection('referral_relations').doc() : null;
    const relationData = {
      referrerId,
      referredTenantId: shopId,
      rewardRate,
      rewardType: affiliateRewardType,
      status: 'pending',
      referrerType,
      tieredReward: (referrerType === 'affiliate' && affiliateRewardType === 'recurring') || referrerType === 'affilishop',
      ...(referrerType === 'pro' ? { proReferralPlan } : {}),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    let referralAccepted = true;
    if (referrerType === 'pro' && proReferralPlan === 'b' && referrerId && relationRef) {
      const referrerRef = db.collection('shops').doc(referrerId);
      const relationQuery = db.collection('referral_relations')
        .where('referrerId', '==', referrerId).where('referrerType', '==', 'pro');
      referralAccepted = await db.runTransaction(async (transaction) => {
        const [referrerDoc, relations] = await Promise.all([
          transaction.get(referrerRef),
          transaction.get(relationQuery),
        ]);
        const accepted = referrerDoc.data()?.proReferralPlan === 'b' &&
          hasProReferralPlanBCapacity(relations.docs.map((relation) => relation.data()));
        // 枠超過でも申込は受け付け、店舗と紹介関係の整合性を同じトランザクションで保つ。
        transaction.create(shopRef, accepted ? shopData : {
          ...shopData, referrerId: null, referredByCode: '', referrerType: null,
        });
        if (accepted) transaction.create(relationRef, relationData);
        return accepted;
      });
    } else {
      const batch = db.batch();
      batch.create(shopRef, shopData);
      if (relationRef) batch.create(relationRef, relationData);
      await batch.commit();
    }

    if (referralAccepted && referrerId && referrerEmail) {
      const ratePercent = referrerType === 'agency' && plan === 'pro'
        ? '月末のPRO決済成功件数に応じて30%・36%・45%を段階適用'
        : rewardRate > 0 ? `${(rewardRate * 100).toFixed(1)}%` : '初回のみ固定報酬';
      const dashboardUrl = getReferrerDashboardUrl(referrerType || '');
      const referralMail = await sendEmail({
        to: referrerEmail,
        subject: `【Push-taro】紹介コード [${refCode}] から新規登録がありました`,
        html: `
          <h2>${referrerName} 様</h2>
          <p>あなたの紹介コード（${refCode}）を使用して、新しい店舗が登録されました。</p>
          <p><strong>店舗名:</strong> ${companyName}</p>
          <p><strong>紹介報酬:</strong> ${ratePercent}</p>
          <p>この店舗が決済を完了すると、紹介報酬が確定します。</p>
          ${dashboardUrl ? `<p><a href="${dashboardUrl}">ダッシュボードで確認する</a></p>` : ''}
          <hr />
          <p><strong>Push-taro.com</strong></p>
          <p>運営会社：the合同会社</p>
          <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
          <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
        `,
      });
      if (!referralMail.success) {
        console.error(`[signup] 紹介者への通知メール送信失敗: shopId=${shopId}`);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';
    const printType = plan === 'pro' ? 'pro-shop' : 'shop';
    const printToken = generatePrintToken('shop', shopId);
    const applicationUrl = `${appUrl}/print/application?type=${printType}&shopId=${shopId}${printToken ? `&token=${printToken}` : ''}`;
    const termsUrl = `${appUrl}/print/terms?type=${printType}`;
    const applicantMail = await sendEmail({
      to: normalizedEmail,
      subject: '【Push-taro】お申し込み受付のお知らせ（決済手続きのお願い）',
      html: `
        <h2>${companyName} 様</h2>
        <p>この度はPush-taroへのお申し込み、誠にありがとうございます。</p>
        <p>ご登録を完了するには、以下のリンクより決済手続きをお進めください。</p>
        <p><a href="${appUrl}/payment/check?shopId=${shopId}"
          style="display:inline-block; padding:12px 24px; background:#3182ce; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">決済画面へ進む</a></p>
        <p>※決済完了後、改めて本登録完了のメールをお送りいたします。</p>
        <hr />
        <p>選択プラン: ${plan.toUpperCase()}</p>
        <hr />
        <p><strong>📄 お申し込み内容の控え</strong></p>
        <p>以下のリンクから、いつでも申込書・利用規約をダウンロードできます。</p>
        <p><a href="${applicationUrl}" style="color:#3182ce;">📥 申込書をダウンロード（PDF）</a></p>
        <p><a href="${termsUrl}" style="color:#3182ce;">📥 利用規約をダウンロード（PDF）</a></p>
        <p style="font-size:12px; color:#94a3b8;">※上記リンクはご登録のメールアドレス宛にのみお送りしています。第三者と共有しないようご注意ください。</p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      `,
    });
    // メール障害で決済待ちデータを消さず、画面の決済リンクから手続きを継続できるようにする。
    if (!applicantMail.success) {
      console.error(`[signup] 申込受付メール送信失敗: shopId=${shopId}`);
    }

    return NextResponse.json({
      success: true,
      shopId,
      paymentUrl,
      message: '申し込みを受け付けました。決済へお進みください。',
    });
  } catch (error) {
    console.error('[signup] エラー:', error);
    const signupError = error instanceof Error ? error : new Error('登録処理に失敗しました');
    await notifyAdmins(signupError, { source: 'signup', details: { email: body?.email } });
    return NextResponse.json({ error: signupError.message }, { status: 500 });
  }
}
