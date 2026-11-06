// lib/square-webhook/handle-new-signup.ts
/**
 * 新規登録（pending_payment → active）の処理
 *
 * 1. Auth ユーザー作成（3役割重複チェック済み）
 * 2. shops を active に更新
 * 3. 本登録完了メール送信
 * 4. referral_relations を active に、payment_history に記録
 * 5. アフィリエイター・管理者への通知メール
 */
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';
import {
  getReferrerCollection,
  getUnpaidField,
  calculateRewardRate,
} from './reward-calculator';
import { getReferrerDashboardUrl } from '@/lib/referrer-dashboard';
import { jstMonth } from '@/lib/coupon-day';
import {
  hasProReferralPlanBCapacity,
  isProReferralPlan,
} from '@/lib/pro-referral-policy';

const PLAN_PRICES: Record<string, number> = {
  light: 1980,
  standard: 3800,
  pro: 10000,
};

export async function handleNewSignup(
  pendingShopDoc: FirebaseFirestore.QueryDocumentSnapshot,
  customerEmail: string,
  customerId: string | null,
  paymentId: string | null
) {
  const pendingShopData = pendingShopDoc.data();
  const shopId = pendingShopDoc.id;
  const plan = pendingShopData.plan || 'light';
  const normalizedEmail = customerEmail.trim().toLowerCase();

  // ============================================================
// 1. Auth ユーザー作成
// ============================================================
const generatedPassword = 'Pass-' + crypto.randomBytes(12).toString('base64url') + 'A1!';

let userRecord;
try {
  userRecord = await authAdmin.createUser({
    email: normalizedEmail,
    password: generatedPassword,
    emailVerified: true,
  });
} catch (e: any) {
  if (e.code === 'auth/email-already-exists') {
    throw new Error('このメールアドレスの認証アカウントは既に存在します');
  } else {
    throw e;
  }
}

  // ============================================================
  // 2. shops を active に更新
  // ============================================================
  await pendingShopDoc.ref.update({
    status: 'active',
    ownerUid: userRecord.uid,
    squareCustomerId: customerId || '',
    plan: plan,
    squarePaymentId: paymentId,
    failedAt: null,
    gracePeriodUntil: null,
    paymentStatus: {
      current: 'normal',
      lastUpdatedAt: FieldValue.serverTimestamp(),
    },
    manualActions: {
      squareStopped:      { done: false, doneAt: null, doneBy: null },
      invoice2MonthsSent: { done: false, doneAt: null, doneBy: null },
      invoice3MonthsSent: { done: false, doneAt: null, doneBy: null },
      paymentConfirmed:   { done: false, doneAt: null, doneBy: null },
      squareResumed:      { done: false, doneAt: null, doneBy: null },
      canceled:           { done: false, doneAt: null, doneBy: null },
    },
    paymentCanceledAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // ============================================================
  // 3. 本登録完了メール（パスワードリセットリンク方式）
  //    平文パスワードをメールに載せないため、Firebaseのリセットリンクを送る
  // ============================================================
  let resetLink: string;
  try {
    resetLink = await authAdmin.generatePasswordResetLink(normalizedEmail);
  } catch (e) {
    console.error('[本登録] リセットリンク生成失敗:', e);
    resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
  }

  await sendEmail({
    to: normalizedEmail,
    subject: '【Push-taro】決済完了・本登録完了のお知らせ',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${pendingShopData.name || '店舗'} 様</h2>
        <p>決済処理が完了して、本登録が完了いたしました。</p>
        <p>この度は、Push-taroにご登録頂き誠にありがとうございます。</p>
        <p>下記のリンクより、パスワードを設定してログインしてください。</p>
        <hr />
        <p>選択プラン: ${plan.toUpperCase()}</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#ff4500;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            パスワードを設定してログイン
          </a>
        </p>
        <p style="font-size:12px;color:#64748b;">※ このリンクの有効期限は1時間です。</p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      </div>
    `,
  });

  // ============================================================
  // 4. 紹介関係の処理
  // ============================================================
  const referrerId = pendingShopData.referrerId;
  const referrerType = pendingShopData.referrerType || null;

  if (referrerId && referrerType && referrerType !== 'shop') {
    try {
      const referrerCollection = getReferrerCollection(referrerType);
      const referrerDoc = await db.collection(referrerCollection).doc(referrerId).get();

      if (!referrerDoc.exists) {
        console.error(`[新規登録] 紹介者が見つかりません: ${referrerCollection}/${referrerId}`);
      } else {
        const referrerData = referrerDoc.data()!;

        // 4-1. referral_relations を active に
        const relSnap = await db.collection('referral_relations')
          .where('referredTenantId', '==', shopId)
          .limit(1)
          .get();

        // 紹介タイプ（affiliate は rewardType を持つ）
        const affiliateRewardType =
          referrerType === 'affiliate' ? (referrerData.rewardType || 'recurring') : null;

        let relationMeta: { createdAt?: any; tieredReward?: boolean; proReferralPlan?: string };

        if (!relSnap.empty) {
          const existingRelData = relSnap.docs[0].data();
          relationMeta = {
            createdAt: existingRelData.createdAt,
            tieredReward: existingRelData.tieredReward === true,
            proReferralPlan: existingRelData.proReferralPlan,
          };
          await relSnap.docs[0].ref.update({
            status: 'active',
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          const isTiered = (referrerType === 'affiliate' && affiliateRewardType === 'recurring') || referrerType === 'affilishop';
          const selectedProPlan = isProReferralPlan(referrerData.proReferralPlan)
            ? referrerData.proReferralPlan
            : null;
          if (referrerType === 'pro' && selectedProPlan === 'b' && plan !== 'pro') {
            throw new Error('BプランではPROプラン以外を紹介できません');
          }
          relationMeta = {
            createdAt: new Date(),
            tieredReward: isTiered,
            ...(referrerType === 'pro' && selectedProPlan
              ? { proReferralPlan: selectedProPlan }
              : {}),
          };
          const effectiveRate = await calculateRewardRate(referrerData, referrerType, plan, referrerId, relationMeta);

          const relationRef = db.collection('referral_relations').doc();
          const relationData = {
            referrerId,
            referredTenantId: shopId,
            rewardRate: effectiveRate,
            referrerType,
            rewardType: affiliateRewardType,
            status: 'active',
            tieredReward: isTiered,
            ...(referrerType === 'pro' && selectedProPlan
              ? { proReferralPlan: selectedProPlan }
              : {}),
            createdAt: FieldValue.serverTimestamp(),
          };

          if (referrerType === 'pro' && selectedProPlan === 'b') {
            const accepted = await db.runTransaction(async (transaction) => {
              const relationSnapshot = await transaction.get(db.collection('referral_relations')
                .where('referrerId', '==', referrerId)
                .where('referrerType', '==', 'pro'));
              if (!hasProReferralPlanBCapacity(relationSnapshot.docs.map((relation) => relation.data()))) {
                return false;
              }
              transaction.create(relationRef, relationData);
              return true;
            });
            if (!accepted) throw new Error('PRO紹介の上限に達しているため紹介関係を作成できません');
          } else {
            await relationRef.set(relationData);
          }
        }

        // 4-2. payment_history に記録（月末バッチが拾う）
        const now = new Date();
        // JST基準で計算（サーバーTZ=UTC だと JST 月初 0:00〜8:59 が前月に計上される）
        const currentMonth = jstMonth(now);
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const planAmount = PLAN_PRICES[plan] || 1980;

        await db.collection('shops').doc(shopId).collection('payment_history').add({
          billingMonth: currentMonth,
          plan,
          periodStart,
          periodEnd,
          amount: planAmount,
          result: 'success',
          failureAttempt: null,
          attemptedAt: FieldValue.serverTimestamp(),
          paymentId,
          rewardProcessed: false,
          isFirstPayment: true,
          createdAt: FieldValue.serverTimestamp(),
        });

        // 4-3. 紹介者への通知メール
        const effectiveRate = await calculateRewardRate(
          referrerData,
          referrerType,
          plan,
          referrerId,
          relationMeta
        );
        const hasInvoice = !!(
          referrerData.invoiceNumber &&
          String(referrerData.invoiceNumber).trim() !== ''
        );

        if (referrerType === 'affiliate' && referrerData.email) {
          await sendAffiliateNotificationEmail(
            referrerData,
            pendingShopData,
            plan,
            affiliateRewardType,
            planAmount,
            hasInvoice,
            effectiveRate
          );
        } else if (referrerType === 'agency' && referrerData.email) {
          await sendAgencyNotificationEmail(
            referrerData,
            pendingShopData,
            plan,
            planAmount,
            hasInvoice,
            effectiveRate
          );
        } else if (referrerType === 'affilishop' && referrerData.email) {
          await sendAffilishopNotificationEmail(
            referrerData,
            pendingShopData,
            plan,
            planAmount,
            hasInvoice,
            effectiveRate
          );
        } else if (referrerType === 'pro' && referrerData.email) {
          await sendProNotificationEmail(
            referrerData,
            pendingShopData,
            plan,
            planAmount,
            hasInvoice,
            effectiveRate
          );
        }

        console.log(
          `[新規登録] ✅ 紹介関係 active: ${referrerType}/${referrerId} / 店舗: ${shopId}`
        );
      }
    } catch (refError) {
      console.error('[新規登録] 紹介報酬処理エラー:', refError);
    }
  }

  console.log(`[新規登録完了] 店舗ID: ${shopId}, メール: ${normalizedEmail}`);
  return NextResponse.json(
    { success: true, message: '本登録完了しました' },
    { status: 200 }
  );
}

// ============================================================
// PRO紹介者への通知メール
// ============================================================
async function sendProNotificationEmail(
  referrerData: any,
  pendingShopData: any,
  plan: string,
  planAmount: number,
  hasInvoice: boolean,
  effectiveRate: number
) {
  const baseReward = Math.floor(planAmount * effectiveRate);
  const withholding = hasInvoice ? 0 : Math.floor(baseReward * 0.1);
  const netReward = baseReward - withholding;
  const dashboardUrl = getReferrerDashboardUrl('pro');

  await sendEmail({
    to: referrerData.email,
    subject: '【Push-taro】あなたの紹介コードから新規店舗の決済が完了しました',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${referrerData.name || 'PRO店舗'} 様</h2>
        <p>あなたの紹介コード（${referrerData.referralCode || '---'}）を経由した新規店舗の決済が完了しました。</p>
        <p>紹介実績が確定し、紹介報酬が発生する予定です。</p>
        <hr />
        <table style="font-size: 14px;">
          <tr><td style="padding: 6px; font-weight: bold;">店舗名</td><td style="padding: 6px;">${pendingShopData.name || '未設定'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">プラン</td><td style="padding: 6px;">${plan.toUpperCase()}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">報酬率</td><td style="padding: 6px;">${(effectiveRate * 100).toFixed(1)}%</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">今回の紹介報酬（参考値）</td><td style="padding: 6px;">¥${baseReward.toLocaleString()}</td></tr>
          ${!hasInvoice ? `<tr><td style="padding: 6px; font-weight: bold; color: #dc2626;">源泉徴収（インボイス未登録 -10%）</td><td style="padding: 6px; color: #dc2626;">-¥${withholding.toLocaleString()}</td></tr>` : ''}
          <tr style="border-top: 1px solid #e2e8f0;"><td style="padding: 6px; font-weight: bold;">お支払い予定額</td><td style="padding: 6px; color: #ff4500; font-weight: bold; font-size: 16px;">¥${netReward.toLocaleString()}</td></tr>
        </table>
        <p style="font-size: 13px; color: #64748b;">※ 正式な確定額は月末締め後にご案内いたします。</p>
        ${dashboardUrl ? `<p><a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#ff4500;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">PRO紹介・報酬ダッシュボードで確認する</a></p>` : ''}
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      </div>
    `,
  });
}

// ============================================================
// アフィリエイターへの通知メール
// ============================================================
async function sendAffiliateNotificationEmail(
  referrerData: any,
  pendingShopData: any,
  plan: string,
  rewardType: string | null,
  planAmount: number,
  hasInvoice: boolean,
  effectiveRate: number
) {
  const isRecurring = rewardType === 'recurring';

  const rewardLabel = isRecurring
    ? `毎月 ${(effectiveRate * 100).toFixed(1)}%（継続）`
    : `初回のみ（プラン別固定額）`;

  const rewardPreview = isRecurring
    ? Math.floor(planAmount * effectiveRate)
    : plan === 'pro' ? 5000 : plan === 'standard' ? 2000 : 1000;

  const withholding = hasInvoice ? 0 : Math.floor(rewardPreview * 0.1);
  const netReward = rewardPreview - withholding;

  await sendEmail({
    to: referrerData.email,
    subject: '【Push-taro】あなたの紹介コードから新規店舗が登録されました',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${referrerData.name || 'アフィリエイター'} 様</h2>
        <p>あなたの紹介コード（${referrerData.referralCode || '---'}）を経由して、</p>
        <p>新しい店舗が登録され、決済が完了しました。</p>
        <hr />
        <table style="font-size: 14px;">
          <tr><td style="padding: 6px; font-weight: bold;">店舗名</td><td style="padding: 6px;">${pendingShopData.name || '未設定'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">プラン</td><td style="padding: 6px;">${plan.toUpperCase()}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">報酬タイプ</td><td style="padding: 6px;">${isRecurring ? 'ストック型' : '単発型'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">報酬</td><td style="padding: 6px;">${rewardLabel}</td></tr>
          ${!hasInvoice ? `<tr><td style="padding: 6px; font-weight: bold; color: #dc2626;">源泉徴収（インボイス未登録 -10%）</td><td style="padding: 6px; color: #dc2626;">-¥${withholding.toLocaleString()}</td></tr>` : ''}
          <tr style="border-top: 1px solid #e2e8f0;">
            <td style="padding: 6px; font-weight: bold;">お支払い予定額</td>
            <td style="padding: 6px; color: #ff4500; font-weight: bold; font-size: 16px;">¥${netReward.toLocaleString()}</td>
          </tr>
        </table>
        <hr />
        <p style="font-size: 13px; color: #64748b;">
          ※ 報酬は月末締め・翌月払いです。<br />
          ※ 詳細はアフィリエイトダッシュボードよりご確認ください。
        </p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/affiliate/dashboard" style="display:inline-block;padding:12px 24px;background:#ff4500;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            ダッシュボードで確認する
          </a>
        </p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      </div>
    `,
  });
}

// ============================================================
// 代理店への通知メール
// ============================================================
async function sendAgencyNotificationEmail(
  referrerData: any,
  pendingShopData: any,
  plan: string,
  planAmount: number,
  hasInvoice: boolean,
  effectiveRate: number
) {
  const baseRate = hasInvoice ? effectiveRate : effectiveRate / 0.9;
  const baseReward = Math.floor(planAmount * baseRate);
  const withholding = hasInvoice ? 0 : Math.floor(baseReward * 0.1);
  const netReward = baseReward - withholding;

  await sendEmail({
    to: referrerData.email,
    subject: '【Push-taro】御社の紹介コードで新規店舗申し込みが完了しました',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${referrerData.companyName || referrerData.ownerName || '代理店'} 様</h2>
        <p>御社の紹介コード（${referrerData.referralCode || '---'}）を経由して、</p>
        <p>新規店舗の申し込みおよび決済が完了いたしました。</p>
        <hr />
        <table style="font-size: 14px;">
          <tr><td style="padding: 6px; font-weight: bold;">店舗名</td><td style="padding: 6px;">${pendingShopData.name || '未設定'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">プラン</td><td style="padding: 6px;">${plan.toUpperCase()}</td></tr>
          ${plan === 'pro' ? '<tr><td colspan="2">PRO報酬は月末の決済成功件数に応じて30%・36%・45%を段階適用します。</td></tr>' : `
            <tr><td style="padding: 6px; font-weight: bold;">報酬率</td><td style="padding: 6px;">${(baseRate * 100).toFixed(1)}%</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">今回の紹介報酬（参考値）</td><td style="padding: 6px;">¥${baseReward.toLocaleString()}</td></tr>
            ${!hasInvoice ? `<tr><td style="padding: 6px; font-weight: bold; color: #dc2626;">源泉徴収（インボイス未登録 -10%）</td><td style="padding: 6px; color: #dc2626;">-¥${withholding.toLocaleString()}</td></tr>` : ''}
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 6px; font-weight: bold;">お支払い予定額</td>
              <td style="padding: 6px; color: #ff4500; font-weight: bold; font-size: 16px;">¥${netReward.toLocaleString()}</td>
            </tr>`}
        </table>
        <hr />
        <p style="font-size: 13px; color: #64748b;">
          ※ 上記金額は参考値です。正式な確定額は月末締め後にご案内いたします。<br />
          ※ 報酬は月末締め・翌月払いです。
        </p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/agency/dashboard" style="display:inline-block;padding:12px 24px;background:#3182ce;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            代理店コンソールで確認する
          </a>
        </p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      </div>
    `,
  });
}

// ============================================================
// affilishop（実店舗向けアフィリエイト）への通知メール
// ============================================================
async function sendAffilishopNotificationEmail(
  referrerData: any,
  pendingShopData: any,
  plan: string,
  planAmount: number,
  hasInvoice: boolean,
  effectiveRate: number
) {
  const baseRate = hasInvoice ? effectiveRate : effectiveRate / 0.9;
  const baseReward = Math.floor(planAmount * baseRate);
  const withholding = hasInvoice ? 0 : Math.floor(baseReward * 0.1);
  const netReward = baseReward - withholding;

  await sendEmail({
    to: referrerData.email,
    subject: '【Push-taro】あなたの紹介コードから新規店舗申し込みが完了しました',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${referrerData.companyName || referrerData.ownerName || 'affilishop'} 様</h2>
        <p>あなたの紹介コード（${referrerData.referralCode || '---'}）を経由して、</p>
        <p>新規店舗の申し込みおよび決済が完了いたしました。</p>
        <hr />
        <table style="font-size: 14px;">
          <tr><td style="padding: 6px; font-weight: bold;">店舗名</td><td style="padding: 6px;">${pendingShopData.name || '未設定'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">プラン</td><td style="padding: 6px;">${plan.toUpperCase()}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">報酬率</td><td style="padding: 6px;">${(baseRate * 100).toFixed(1)}%</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">今回の紹介報酬（参考値）</td><td style="padding: 6px;">¥${baseReward.toLocaleString()}</td></tr>
          ${!hasInvoice ? `<tr><td style="padding: 6px; font-weight: bold; color: #dc2626;">源泉徴収（インボイス未登録 -10%）</td><td style="padding: 6px; color: #dc2626;">-¥${withholding.toLocaleString()}</td></tr>` : ''}
          <tr style="border-top: 1px solid #e2e8f0;">
            <td style="padding: 6px; font-weight: bold;">お支払い予定額</td>
            <td style="padding: 6px; color: #ff4500; font-weight: bold; font-size: 16px;">¥${netReward.toLocaleString()}</td>
          </tr>
        </table>
        <hr />
        <p style="font-size: 13px; color: #64748b;">
          ※ 上記金額は参考値です。正式な確定額は月末締め後にご案内いたします。<br />
          ※ 報酬は月末締め・翌月払いです。
        </p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/affilishop/dashboard" style="display:inline-block;padding:12px 24px;background:#0ea5e9;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            affilishopダッシュボードで確認する
          </a>
        </p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      </div>
    `,
  });
}
