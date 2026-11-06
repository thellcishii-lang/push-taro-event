// app/api/cron/monthly-rewards/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';
import {
  calculateRewardRate,
  getReferrerCollection,
  getUnpaidField,
  sendAdminPayoutNotification,
  calculateRewards,
  getOneTimeRewardAmount,
  calculateAgencyProBaseReward,
  isSuccessfulProPayment,
} from '@/lib/square-webhook/reward-calculator';
import { PLAN_PRICES, WITHHOLDING_RATE } from '@/lib/constants';
import { isValidCronRequest } from '@/lib/cron-auth';
import { notifyAdmins } from '@/lib/error-notifier';
import { getReferrerDashboardPath } from '@/lib/referrer-dashboard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const scheduledPayoutMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

    console.log(`[月末バッチ] 支払い予定月: ${scheduledPayoutMonth}`);

    // 1. アクティブな紹介関係を一括取得
    const relSnap = await db.collection('referral_relations')
      .where('status', '==', 'active')
      .get();

    console.log(`[月末バッチ] 対象 referral_relations: ${relSnap.size}件`);

    // 2. 店舗ごとに未処理決済を取得し、Collection Groupインデックスに依存しない。
    const shopsSnap = await db.collection('shops').get();
    const paymentSnapshots = await Promise.all(
      shopsSnap.docs.map((shopDoc) =>
        shopDoc.ref.collection('payment_history')
          .where('rewardProcessed', '==', false)
          .get()
      )
    );
    const unpaidSuccessPayments: FirebaseFirestore.QueryDocumentSnapshot[] = [];
    paymentSnapshots.forEach((paymentSnap) => {
      paymentSnap.docs.forEach((paymentDoc) => {
        if (paymentDoc.data().result === 'success') unpaidSuccessPayments.push(paymentDoc);
      });
    });

    console.log(`[月末バッチ] 対象 未処理決済件数: ${unpaidSuccessPayments.length}件`);

    // 3. 決済履歴を shopId (親ドキュメントID) ごとにメモリ上でグループ化
    const paymentsByShop = new Map<string, FirebaseFirestore.QueryDocumentSnapshot[]>();
    unpaidSuccessPayments.forEach((doc) => {
      const shopId = doc.ref.parent.parent?.id;
      if (!shopId) return;

      if (!paymentsByShop.has(shopId)) {
        paymentsByShop.set(shopId, []);
      }
      paymentsByShop.get(shopId)!.push(doc);
    });

    // 4. 紹介者ごとにグループ化
    const groups = new Map<string, {
      referrerId: string;
      referrerType: string;
      relations: Array<{ relId: string; referredTenantId: string; createdAt?: any; tieredReward?: boolean; proReferralPlan?: string }>;
    }>();

    relSnap.docs.forEach((relDoc) => {
      const relData = relDoc.data();
      const referrerId = relData.referrerId;
      const referrerType = relData.referrerType || 'pro';
      const referredTenantId = relData.referredTenantId;
      if (!referrerId || !referredTenantId) return;

      const key = `${referrerType}_${referrerId}`;
      if (!groups.has(key)) {
        groups.set(key, { referrerId, referrerType, relations: [] });
      }
      groups.get(key)!.relations.push({
        relId: relDoc.id,
        referredTenantId,
        createdAt: relData.createdAt,
        tieredReward: relData.tieredReward === true,
        proReferralPlan: relData.proReferralPlan,
      });
    });

    console.log(`[月末バッチ] referrer数: ${groups.size}`);

    let processedCount = 0;
    let totalRewardAmount = 0;
    const errors: string[] = [];

    // DBバッチ処理用の操作を溜める配列
    const batchOperations: Array<
      | { type: 'set_reward'; ref: any; data: any }
      | { type: 'set_statement'; ref: any; data: any }
      | { type: 'update_history'; ref: any }
      | { type: 'update_referrer'; ref: any; data: any }
    > = [];

    // DB成功後に実行するメール送信タスク
    const pendingEmails: Array<() => Promise<void>> = [];

    for (const [key, group] of Array.from(groups.entries())) {
      const { referrerId, referrerType, relations } = group;

      try {
        // 対象店舗の未処理決済が存在するものだけに絞り込み
        const targetRelations = relations.filter(r => paymentsByShop.has(r.referredTenantId));
        if (targetRelations.length === 0) continue;

        const referrerCollection = getReferrerCollection(referrerType);
        const referrerDoc = await db.collection(referrerCollection).doc(referrerId).get();

        if (!referrerDoc.exists) {
          errors.push(`紹介者が見つかりません: ${referrerCollection}/${referrerId}`);
          continue;
        }

        const referrerData = referrerDoc.data()!;
        const hasInvoice = referrerType === 'affiliate'
  ? referrerData?.hasInvoice === true
  : !!(
      referrerData?.invoiceNumber &&
      String(referrerData.invoiceNumber).trim() !== ''
    );
        
        let totalReward = 0;
        let totalBaseReward = 0;
        let totalPayment = 0;
        const shopBreakdown: Array<{ shopId: string; shopName: string; plan: string; rate: number | null; effectiveRate: number; payment: number; baseReward: number; reward: number }> = [];
        const proPaymentsByMonth = new Map<string, { count: number; payment: number }>();

        for (const rel of targetRelations) {
          const { referredTenantId } = rel;
          const historyDocs = paymentsByShop.get(referredTenantId) || [];
          if (historyDocs.length === 0) continue;

                    const shopDoc = await db.collection('shops').doc(referredTenantId).get();
          const shopData = shopDoc.data();
          const plan = shopData?.plan || 'light';
          const shopName = shopData?.name || '不明';

          // 単発型アフィリエイトかどうか
          const isOneTimeAffiliate =
            referrerType === 'affiliate' && referrerData?.rewardType === 'one-time';

          let shopPayment = 0;
          let shopBaseReward = 0;
          let shopReward = 0;
          let shopEffectiveRate = 0;
          let shopRate = 0;
          let oneTimeUsed = false;

          for (const histDoc of historyDocs) {
            const histData = histDoc.data();
            const paymentPlan = histData.plan || plan;
            if (referrerType === 'agency' && paymentPlan === 'pro') {
              const month = histData.billingMonth;
              const current = proPaymentsByMonth.get(month) || { count: 0, payment: 0 };
              proPaymentsByMonth.set(month, { count: current.count + 1, payment: current.payment + (histData.amount || 0) });
              batchOperations.push({ type: 'update_history', ref: histDoc.ref });
              continue;
            }
            const baseRate = isOneTimeAffiliate ? 0
              : await calculateRewardRate(referrerData, referrerType, paymentPlan, referrerId, {
                  createdAt: rel.createdAt,
                  tieredReward: rel.tieredReward,
                  proReferralPlan: rel.proReferralPlan,
                });
            const oneTimeAmount = isOneTimeAffiliate ? getOneTimeRewardAmount(paymentPlan) : undefined;
            const amount = histData.amount || 0;
            shopPayment += amount;
            shopRate = baseRate;

            // 単発型：初回の決済1件のみ報酬を発生させる
            const shouldReward = isOneTimeAffiliate
              ? (!oneTimeUsed && histData.isFirstPayment === true)
              : (baseRate > 0);

            if (shouldReward) {
              const result = calculateRewards({
                baseRate,
                paymentAmount: amount,
                hasInvoice,
                oneTimeAmount,
              });

              shopBaseReward += result.baseReward;
              shopReward += result.reward;
              shopEffectiveRate = result.effectiveRate;

              if (result.reward > 0) {
                const newRewardRef = db.collection('monthly_rewards').doc();
                batchOperations.push({
                  type: 'set_reward',
                  ref: newRewardRef,
                  data: {
                    userId: referrerId,
                    sourceTenantId: referredTenantId,
                    sourceShopName: shopName,
                    amount: result.reward,
                    baseAmount: result.baseReward,
                    withholding: result.withholding,
                    paymentAmount: amount,
                    billingMonth: histData.billingMonth,
                    scheduledPayoutMonth,
                    status: 'unpaid',
                    referrerType,
                    createdAt: FieldValue.serverTimestamp(),
                    paidAt: null,
                    paidBy: null,
                  }
                });

                if (isOneTimeAffiliate) oneTimeUsed = true;
              }
            }

            batchOperations.push({
              type: 'update_history',
              ref: histDoc.ref
            });
          }

          if (shopPayment > 0) {
            totalPayment += shopPayment;
            totalBaseReward += shopBaseReward;
            totalReward += shopReward;
            shopBreakdown.push({ shopId: referredTenantId, shopName, plan, rate: shopRate, effectiveRate: shopEffectiveRate, payment: shopPayment, baseReward: shopBaseReward, reward: shopReward });
          }
        }

        for (const [billingMonth, pending] of proPaymentsByMonth) {
          const counts = await Promise.all(relations.map(async ({ referredTenantId }) => {
            const shopRef = db.collection('shops').doc(referredTenantId);
            const [shop, history] = await Promise.all([
              shopRef.get(),
              shopRef.collection('payment_history').where('billingMonth', '==', billingMonth).get(),
            ]);
            return history.docs.filter((doc) => isSuccessfulProPayment(doc.data(), shop.data()?.plan || 'light')).length;
          }));
          const successfulCount = counts.reduce((sum, count) => sum + count, 0);
          const processedCount = successfulCount - pending.count;
          if (processedCount < 0) throw new Error('PRO決済成功件数が一致しません');
          const totalBase = calculateAgencyProBaseReward(successfulCount, PLAN_PRICES.pro);
          const processedBase = calculateAgencyProBaseReward(processedCount, PLAN_PRICES.pro);
          const baseReward = totalBase - processedBase;
          const reward = hasInvoice
            ? baseReward
            : Math.floor(totalBase * (1 - WITHHOLDING_RATE)) - Math.floor(processedBase * (1 - WITHHOLDING_RATE));
          totalPayment += pending.payment;
          totalBaseReward += baseReward;
          totalReward += reward;
          shopBreakdown.push({
            shopId: '', shopName: `PRO決済成功分（${pending.count}件）`, plan: 'pro', rate: null,
            effectiveRate: 0, payment: pending.payment, baseReward, reward,
          });
          if (reward > 0) {
            batchOperations.push({
              type: 'set_reward', ref: db.collection('monthly_rewards').doc(),
              data: {
                userId: referrerId, sourceTenantId: null, sourceShopName: `PRO決済成功分（${pending.count}件）`,
                amount: reward, baseAmount: baseReward, withholding: baseReward - reward,
                paymentAmount: pending.payment, billingMonth, scheduledPayoutMonth,
                status: 'unpaid', referrerType, createdAt: FieldValue.serverTimestamp(),
                paidAt: null, paidBy: null,
              },
            });
          }
        }

               if (totalReward > 0) {
          const unpaidField = getUnpaidField(referrerType);
          const currentUnpaid = (referrerData?.[unpaidField] || 0) + totalReward;

          const referrerUpdateData: any = {
            [unpaidField]: currentUnpaid,
            payoutStatus: 'pending',  // 閾値撤廃。常に振込対象
            ...(referrerType === 'affiliate' && {
              totalEarnings: (referrerData?.totalEarnings || 0) + totalReward,
            }),
            updatedAt: FieldValue.serverTimestamp(),
          };

          batchOperations.push({
            type: 'update_referrer',
            ref: referrerDoc.ref,
            data: referrerUpdateData
          });

          const statementRef = db.collection('monthly_statements').doc();
          const withholding = totalBaseReward - totalReward;
          batchOperations.push({
            type: 'set_statement',
            ref: statementRef,
            data: {
              userId: referrerId,
              referrerType,
              scheduledPayoutMonth,
              hasInvoice,
              totalPayment,
              totalBaseReward,
              withholding,
              totalReward,
              shops: shopBreakdown,
              status: 'unpaid',
              paidAt: null,
              createdAt: FieldValue.serverTimestamp(),
            }
          });

                    if (referrerData?.email) {
            pendingEmails.push(async () => {
              await sendAdminPayoutNotification(referrerData, referrerId, currentUnpaid, referrerType);
              if (referrerType === 'agency') {
                await sendAgencyPayoutEmail(
                  referrerData,
                  shopBreakdown,
                  totalPayment,
                  totalBaseReward,
                  totalReward,
                  hasInvoice,
                  scheduledPayoutMonth
                );
              } else {
                await sendPayoutScheduledEmail(
                  referrerData,
                  referrerType,
                  totalReward,
                  scheduledPayoutMonth
                );
              }
            });
          }

          processedCount++;
          totalRewardAmount += totalReward;
          console.log(`[月末バッチ] 計算完了 ${referrerType}/${referrerId} -> ${totalReward}円`);
        }

      } catch (relError: any) {
        console.error(`[月末バッチ] referrer 処理エラー (${key}):`, relError);
        errors.push(`${key}: ${relError.message}`);
      }
    }

    // 5. バッチコミット（450件ずつ分割処理）
    const CHUNK_SIZE = 450;
    for (let i = 0; i < batchOperations.length; i += CHUNK_SIZE) {
      const chunk = batchOperations.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();

      chunk.forEach((op) => {
         if (op.type === 'set_reward') {
          batch.set(op.ref, op.data);
        } else if (op.type === 'set_statement') {
          batch.set(op.ref, op.data);
        } else if (op.type === 'update_history') {
          batch.update(op.ref, { rewardProcessed: true });
        } else if (op.type === 'update_referrer') {
          batch.update(op.ref, op.data);
        }
      });

      await batch.commit();
    }

    // 6. DB更新成功後にメールを安全に一括送信
    for (const sendEmailTask of pendingEmails) {
      await sendEmailTask();
    }

    console.log(`[月末バッチ] 全処理完了: ${processedCount}件処理 / 合計 ${totalRewardAmount}円`);

    return NextResponse.json({
      success: true,
      processedCount,
      totalRewardAmount,
      scheduledPayoutMonth,
      errors: errors.length > 0 ? errors : undefined,
      message: `${processedCount}件の紹介者に報酬を加算しました`,
    });

  } catch (error: any) {
    console.error('[月末バッチ] エラー:', error);
    await notifyAdmins(error, { source: 'cron/monthly-rewards' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendAgencyPayoutEmail(
  referrerData: any,
  shopBreakdown: Array<{ shopId: string; shopName: string; plan: string; rate: number | null; payment: number; baseReward: number; reward: number }>,
  totalPayment: number,
  totalBaseReward: number,
  totalReward: number,
  hasInvoice: boolean,
  scheduledPayoutMonth: string
) {
  const [year, month] = scheduledPayoutMonth.split('-');
  const payoutMonthLabel = `${year}年${parseInt(month, 10)}月`;

  const withholding = hasInvoice ? 0 : totalBaseReward - totalReward;
  const netReward = totalReward;

  const withholdingRowHtml = hasInvoice
    ? ''
    : '<tr><td style="padding: 6px; font-weight: bold; color: #dc2626;">源泉徴収（インボイス未登録 -10%）</td><td style="padding: 6px; color: #dc2626;">-' + withholding.toLocaleString() + '円</td></tr>';

  const html = [
    '<div style="font-family: sans-serif; padding: 20px;">',
    '<h2>' + (referrerData.companyName || referrerData.ownerName || '代理店') + ' 様</h2>',
    '<p>いつもPush-taroをご利用いただき、ありがとうございます。</p>',
    '<p>今月分の紹介報酬が確定いたしましたので、ご案内申し上げます。</p>',
    '<hr />',
    '<h3 style="font-size: 15px;">お支払い内訳</h3>',
    '<table style="font-size: 14px;">',
    '<tr><td style="padding: 6px; font-weight: bold;">今回の紹介報酬（税込）</td><td style="padding: 6px;">' + totalBaseReward.toLocaleString() + '円</td></tr>',
    withholdingRowHtml,
    '<tr style="border-top: 1px solid #e2e8f0;">',
    '<td style="padding: 6px; font-weight: bold;">お支払い総額</td>',
    '<td style="padding: 6px; color: #ff4500; font-weight: bold; font-size: 16px;">' + netReward.toLocaleString() + '円</td>',
    '</tr>',
    '<tr><td style="padding: 6px; font-weight: bold;">お振込予定</td><td style="padding: 6px;">' + payoutMonthLabel + '末</td></tr>',
    '</table>',
    '<hr />',
    '<p style="font-size: 13px; color: #64748b;">※ 詳細な明細（配下店舗の内訳）は、代理店コンソールよりご確認いただけます。<br />※ 実際の振込日は前後する場合がございます。</p>',
    '<p><a href="' + process.env.NEXT_PUBLIC_APP_URL + '/agency/dashboard" style="display:inline-block; padding:12px 24px; background:#3182ce; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">代理店コンソールで確認する</a></p>',
    '<hr />',
    '<p><strong>Push-taro.com</strong></p>',
    '<p>運営会社：the合同会社</p>',
     '<p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>',
    '<p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>',
    '</div>',
  ].join('');

  try {
    await sendEmail({
      to: referrerData.email,
      subject: `【Push-taro】${payoutMonthLabel}末 お振込予定のご案内`,
      html,
    });
    console.log(`[代理店支払い予定メール] 送信完了: ${referrerData.email}`);
  } catch (error) {
    console.error('[代理店支払い予定メール] 送信失敗:', error);
  }
}

async function sendPayoutScheduledEmail(
  referrerData: any,
  referrerType: string,
  amount: number,
  scheduledPayoutMonth: string
) {
  const typeLabel = referrerType === 'affiliate'
    ? 'アフィリエイト'
    : referrerType === 'affilishop'
      ? 'affilishop'
      : 'PRO紹介';

  const dashboardPath = getReferrerDashboardPath(referrerType) || '/';

  const [year, month] = scheduledPayoutMonth.split('-');
  const payoutMonthLabel = `${year}年${parseInt(month, 10)}月`;

  const html = [
    '<div style="font-family: sans-serif; padding: 20px;">',
    '<h2>' + (referrerData.name || referrerData.companyName || '紹介者') + ' 様</h2>',
    '<p>いつもPush-taroをご利用いただき、ありがとうございます。</p>',
    '<p>今月分の紹介報酬が確定いたしましたので、ご案内申し上げます。</p>',
    '<hr />',
    '<table style="font-size: 14px; border-collapse: collapse;">',
    '<tr><td style="padding: 6px; font-weight: bold;">種別</td><td style="padding: 6px;">' + typeLabel + '</td></tr>',
    '<tr><td style="padding: 6px; font-weight: bold;">今回発生報酬</td><td style="padding: 6px; color: #ff4500; font-weight: bold;">' + amount.toLocaleString() + '円</td></tr>',
    '<tr><td style="padding: 6px; font-weight: bold;">お振込予定</td><td style="padding: 6px;">' + payoutMonthLabel + '末</td></tr>',
    '</table>',
    '<hr />',
    '<p style="font-size: 13px; color: #64748b;">※ 実際の振込日は前後する場合がございます。<br />※ 詳細な明細は、マイページよりご確認いただけます。</p>',
    '<p><a href="' + process.env.NEXT_PUBLIC_APP_URL + dashboardPath + '" style="display:inline-block; padding:12px 24px; background:#ff4500; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">マイページを確認する</a></p>',
    '<hr />',
    '<p><strong>Push-taro.com</strong></p>',
    '<p>運営会社：the合同会社</p>',
    '<p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>',
    '<p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>',
    '</div>',
  ].join('');

  try {
    await sendEmail({
      to: referrerData.email,
      subject: `【Push-taro】${payoutMonthLabel}末 お振込予定のご案内`,
      html,
    });
    console.log(`[支払い予定メール] 送信完了: ${referrerData.email}`);
  } catch (error) {
    console.error('[支払い予定メール] 送信失敗:', error);
  }
}
