// lib/square-webhook/handle-recurring.ts
/**
 * 継続課金の処理
 *
 * 1. shops を active に更新（決済不履行からの復活も含む）
 * 2. payment_history に成功を記録（rewardProcessed: false）
 * 3. 決済不履行の場合は paymentStatus を 'normal' に戻す
 *
 * 報酬の計算は cron/monthly-rewards が月末にまとめて行う
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { jstMonth } from '@/lib/coupon-day';

const PLAN_PRICES: Record<string, number> = {
  light: 1980,
  standard: 3800,
  pro: 10000,
};

export async function handleRecurring(
  shopDoc: FirebaseFirestore.QueryDocumentSnapshot,
  customerEmail: string,
  customerId: string | null,
  paymentId: string | null
) {
  const shopData = shopDoc.data();
  const shopId = shopDoc.id;
  const plan = shopData.plan || 'light';
  const planAmount = PLAN_PRICES[plan] || 1980;

  const currentStatus = shopData?.paymentStatus?.current || 'normal';

  // ============================================================
  // 1. shops を active に更新
  // ============================================================
  const updatePayload: Record<string, any> = {
    status: 'active',
    squareCustomerId: customerId || shopData.squareCustomerId || '',
    squarePaymentId: paymentId || '',
    failedAt: null,
    gracePeriodUntil: null,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // 決済不履行中だった場合、paymentStatus を normal に戻す
  if (currentStatus !== 'normal') {
    updatePayload.paymentStatus = {
      current: 'normal',
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };
    console.log(`[継続課金] 決済不履行から復活: ${currentStatus} → normal`);
  }

  await shopDoc.ref.update(updatePayload);

  // ============================================================
  // 2. payment_history に成功を記録（rewardProcessed: false）
  //    → 月末バッチがこのレコードを拾って報酬計算する
  // ============================================================
  const now = new Date();
  // JST基準で計算（サーバーTZ=UTC だと JST 月初 0:00〜8:59 が前月に計上される）
  const currentMonth = jstMonth(now);
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

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
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`[継続課金完了] 店舗: ${shopData.name} / プラン: ${plan}`);
  return NextResponse.json({ success: true, message: '契約更新完了' }, { status: 200 });
}
