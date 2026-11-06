// lib/square-webhook/reward-calculator.ts
import { sendEmail } from '../mailer';
import {
  AGENCY_RATE_PRO_TIERS,
  AGENCY_RATE_OTHER,
  AFFILIATE_RECURRING_RATE,
  AFFILIATE_RECURRING_RATE_FIRST_YEAR,
  AFFILIATE_FIRST_YEAR_MONTHS,
  AFFILIATE_ONE_TIME_REWARDS,
  AFFILISHOP_RATE,
  AFFILISHOP_RATE_FIRST_YEAR,
  AFFILISHOP_FIRST_YEAR_MONTHS,
  WITHHOLDING_RATE,
} from '../constants';
import { getProReferralRate } from '../pro-referral-policy';

// 紹介関係の開始日から現在までの経過月数（0始まり）
function monthsElapsedSince(startDate: Date, now: Date): number {
  return (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
}

export function calculateAgencyProBaseReward(count: number, unitAmount: number): number {
  let previousLimit = 0;
  let reward = 0;
  for (const tier of AGENCY_RATE_PRO_TIERS) {
    const tierCount = Math.max(0, Math.min(count, tier.maxActivePro) - previousLimit);
    reward += Math.floor(tierCount * unitAmount * tier.rate);
    previousLimit = tier.maxActivePro;
  }
  return reward;
}

export function isSuccessfulProPayment(payment: { result?: string; plan?: string }, fallbackPlan: string): boolean {
  return payment.result === 'success' && (payment.plan || fallbackPlan) === 'pro';
}

// ============================================================
// 源泉前の報酬率を取得（単発型アフィリは 0 を返す）
// ============================================================
export async function calculateRewardRate(
  referrerData: any,
  referrerType: string,
  plan: string,
  referrerId: string,
  relationMeta?: { createdAt?: any; tieredReward?: boolean; proReferralPlan?: string }
): Promise<number> {
  if (!referrerType || referrerType === 'shop') return 0;

  if (referrerType === 'agency') {
    if (plan === 'pro') {
      return AGENCY_RATE_PRO_TIERS[0].rate;
    }
    return AGENCY_RATE_OTHER;
  }

  if (referrerType === 'pro') {
    const referralPlan = relationMeta
      ? relationMeta.proReferralPlan ?? 'a'
      : referrerData?.proReferralPlan ?? 'a';
    return getProReferralRate(
      referralPlan,
      plan
    );
  }

  if (referrerType === 'affiliate') {
    if (referrerData?.rewardType === 'one-time') return 0;

    // 新規紹介（tieredReward フラグあり）のみ、初年度（12ヶ月間）8%→13ヶ月目から5%
    if (relationMeta?.tieredReward && relationMeta.createdAt) {
      const startDate = relationMeta.createdAt.toDate
        ? relationMeta.createdAt.toDate()
        : new Date(relationMeta.createdAt);
      const monthsElapsed = monthsElapsedSince(startDate, new Date());
      return monthsElapsed < AFFILIATE_FIRST_YEAR_MONTHS
        ? AFFILIATE_RECURRING_RATE_FIRST_YEAR
        : AFFILIATE_RECURRING_RATE;
    }

    return AFFILIATE_RECURRING_RATE;
  }

  if (referrerType === 'affilishop') {
    // 常に紹介開始日からの経過月数で判定（初年度10% → 13ヶ月目から7%）
    if (relationMeta?.createdAt) {
      const startDate = relationMeta.createdAt.toDate
        ? relationMeta.createdAt.toDate()
        : new Date(relationMeta.createdAt);
      const monthsElapsed = monthsElapsedSince(startDate, new Date());
      return monthsElapsed < AFFILISHOP_FIRST_YEAR_MONTHS
        ? AFFILISHOP_RATE_FIRST_YEAR
        : AFFILISHOP_RATE;
    }
    return AFFILISHOP_RATE_FIRST_YEAR;
  }

  return 0;
}

// ============================================================
// 単発型の固定報酬額（源泉前）
// ============================================================
export function getOneTimeRewardAmount(plan: string): number {
  const normalized = (plan || 'light').toLowerCase();
  return AFFILIATE_ONE_TIME_REWARDS[normalized] ?? AFFILIATE_ONE_TIME_REWARDS.light;
}

// ============================================================
// 報酬を計算（源泉徴収の適用はここだけ）
// ============================================================
export function calculateRewards(params: {
  baseRate: number;
  paymentAmount: number;
  hasInvoice: boolean;
  oneTimeAmount?: number;  // 単発型の場合のみ指定
}): {
  baseRate: number;
  effectiveRate: number;
  baseReward: number;
  reward: number;
  withholding: number;
} {
  const { baseRate, paymentAmount, hasInvoice, oneTimeAmount } = params;

  // 単発型（固定額）
  if (typeof oneTimeAmount === 'number' && oneTimeAmount > 0) {
    const baseReward = oneTimeAmount;
    const reward = hasInvoice ? baseReward : Math.floor(baseReward * (1 - WITHHOLDING_RATE));
    const withholding = baseReward - reward;
    return {
      baseRate: 0,
      effectiveRate: 0,
      baseReward,
      reward,
      withholding,
    };
  }

  // ストック型（率計算）
  const effectiveRate = hasInvoice ? baseRate : baseRate * (1 - WITHHOLDING_RATE);
  const baseReward = Math.floor(paymentAmount * baseRate);
  const reward = Math.floor(paymentAmount * effectiveRate);
  const withholding = baseReward - reward;

  return { baseRate, effectiveRate, baseReward, reward, withholding };
}

// ============================================================
// コレクション名を取得
// ============================================================
export function getReferrerCollection(referrerType: string): string {
  if (referrerType === 'agency') return 'agencies';
  if (referrerType === 'affiliate') return 'affiliates';
  if (referrerType === 'affilishop') return 'affilishops';
  return 'shops';
}

// ============================================================
// 未払いフィールド名を取得
// ============================================================
export function getUnpaidField(referrerType: string): string {
  return referrerType === 'affiliate' ? 'unpaidReward' : 'unpaidRewardTotal';
}

// ============================================================
// 管理者宛の振込リクエストメール送信
// ============================================================
export async function sendAdminPayoutNotification(
  referrerData: any,
  referrerId: string,
  totalAmount: number,
  referrerType: string
) {
  const adminEmail = 'info@push-taro.com';
  const typeLabel =
    referrerType === 'agency'    ? '代理店' :
    referrerType === 'affiliate' ? 'アフィリエイト' :
    referrerType === 'pro'       ? 'PRO紹介者' :
                                   '不明';

  try {
    await sendEmail({
      to: adminEmail,
      subject: `【要対応】${typeLabel}報酬の振込リクエスト（${referrerData.email}）`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #fff5f5; border: 2px solid #dc2626; border-radius: 8px;">
          <h2 style="color: #dc2626; margin: 0 0 16px 0;">【要対応】${typeLabel} 報酬 振込対象</h2>
          <p>${typeLabel}の未払い報酬が発生しています。</p>
          <p>口座情報をご確認の上、手動でお振り込み（PayPay銀行等）をお願いいたします。</p>
          <hr />
          <h3>■ ユーザー情報</h3>
          <ul>
            <li>種別: <strong>${typeLabel}</strong></li>
            <li>ユーザーID: <code>${referrerId}</code></li>
            <li>メールアドレス: ${referrerData.email}</li>
            <li>現在の未払い累計額: <strong>¥${totalAmount.toLocaleString()}</strong></li>
          </ul>
          <h3>■ 振込先口座情報</h3>
          <ul>
            <li>金融機関名: ${referrerData.bankAccount?.bankName || '未登録'}</li>
            <li>支店名: ${referrerData.bankAccount?.branchName || '未登録'}</li>
            <li>口座種別: ${referrerData.bankAccount?.accountType === 'savings' ? '普通' : '当座'}</li>
            <li>口座番号: ${referrerData.bankAccount?.accountNumber || '未登録'}</li>
            <li>口座名義: ${referrerData.bankAccount?.accountHolder || '未登録'}</li>
          </ul>
          <hr />
          <p style="font-size: 12px; color: #64748b;">
            振込完了後、管理画面から「振込完了処理」を実行してください。
          </p>
          <hr />
          <p><strong>Push-taro.com</strong></p>
          <p>運営会社：the合同会社</p>
          <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
          <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
        </div>
      `,
    });
    console.log(`[管理者通知] 送信完了: ${adminEmail}`);
  } catch (error) {
    console.error('[管理者通知] 送信失敗:', error);
  }
}
