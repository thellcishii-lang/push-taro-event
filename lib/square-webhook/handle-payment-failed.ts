// lib/square-webhook/handle-payment-failed.ts
/**
 * 決済失敗（invoice.payment_failed）の処理
 * 
 * 1回目: paymentStatus='failure_1' + 紹介者メール + 顧客メール
 * 2回目: paymentStatus='failure_2' + 顧客警告メール
 * 3回目: paymentStatus='failure_3_stopped' + 顧客停止メール + 送信停止
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';
import { jstMonth } from '@/lib/coupon-day';

const PLAN_PRICES: Record<string, number> = {
  light: 1980,
  standard: 3800,
  pro: 10000,
};

export async function handlePaymentFailed(body: any) {
  const dataObject = body?.data?.object;
  const invoice = dataObject?.invoice;
  const customerEmail = invoice?.primary_recipient?.email_address;
  const customerId = invoice?.customer_id;
  const paymentId = invoice?.id || null;

  if (!customerEmail && !customerId) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 店舗を特定
  let shopSnap = await db.collection('shops').where('email', '==', customerEmail).get();
  if (shopSnap.empty && customerId) {
    shopSnap = await db.collection('shops').where('squareCustomerId', '==', customerId).get();
  }

  if (shopSnap.empty) {
    console.log(`[決済失敗] 店舗が見つかりません: ${customerEmail}`);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const shopDoc = shopSnap.docs[0];
  const shopData = shopDoc.data();
  const shopId = shopDoc.id;

  // 現在の失敗回数を取得
  const currentStatus = shopData?.paymentStatus?.current || 'normal';
  let newStatus: string;
  let failureAttempt: number;

  if (currentStatus === 'normal') {
    newStatus = 'failure_1';
    failureAttempt = 1;
  } else if (currentStatus === 'failure_1') {
    newStatus = 'failure_2';
    failureAttempt = 2;
  } else if (currentStatus === 'failure_2') {
    newStatus = 'failure_3_stopped';
    failureAttempt = 3;
  } else {
    // 既に failure_3_stopped 以降 → 記録のみ
    newStatus = currentStatus;
    failureAttempt = 3;
  }

  const now = new Date();
  // JST基準で計算（サーバーTZ=UTC だと JST 月初 0:00〜8:59 が前月に計上される）
  const currentMonth = jstMonth(now);
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const plan = shopData?.plan || 'light';
  const amount = invoice?.amount_money?.amount || PLAN_PRICES[plan] || 0;

  // ============================================================
  // 1. paymentStatus を更新
  // ============================================================
  const updatePayload: Record<string, any> = {
    paymentStatus: {
      current: newStatus,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    },
    updatedAt: FieldValue.serverTimestamp(),
  };

  // 3回目は送信停止も同時に
  if (failureAttempt === 3) {
    updatePayload.status = 'send_disabled';
  } else if (failureAttempt === 1) {
    updatePayload.status = 'payment_warning';
  }

  await shopDoc.ref.update(updatePayload);

  // ============================================================
  // 2. payment_history に記録
  // ============================================================
  await db.collection('shops').doc(shopId).collection('payment_history').add({
    billingMonth: currentMonth,
    periodStart,
    periodEnd,
    amount,
    result: 'failed',
    failureAttempt,
    attemptedAt: FieldValue.serverTimestamp(),
    paymentId,
    createdAt: FieldValue.serverTimestamp(),
  });

  // ============================================================
  // 3. メール送信
  // ============================================================
  if (failureAttempt === 1) {
    // 1回目：紹介者 + 店舗オーナー
    await sendFirstFailureEmails(shopId, shopData);
  } else if (failureAttempt === 2) {
    // 2回目：店舗オーナーのみ（警告）
    await sendSecondFailureEmail(shopData);
  } else if (failureAttempt === 3) {
    // 3回目：店舗オーナーのみ（停止）
    await sendThirdFailureEmail(shopData);
  }

  console.log(`[決済失敗 ${failureAttempt}回目] ${customerEmail} - ${newStatus}`);
  return NextResponse.json({ success: true, message: `決済失敗処理完了 (${failureAttempt}回目)` }, { status: 200 });
}

// ============================================================
// 1回目のメール：紹介者 + 店舗オーナー
// ============================================================
async function sendFirstFailureEmails(shopId: string, shopData: any) {
  // 紹介者を取得
  try {
    const relSnap = await db.collection('referral_relations')
      .where('referredTenantId', '==', shopId)
      .get();

    for (const relDoc of relSnap.docs) {
      const relData = relDoc.data();
      const referrerType = relData.referrerType || 'pro';
      // reward-calculator の getReferrerCollection と同じマッピング。
      // affilishop が欠けると shops を誤検索して通知が届かない。
      const referrerCollection =
        referrerType === 'agency' ? 'agencies' :
        referrerType === 'affiliate' ? 'affiliates' :
        referrerType === 'affilishop' ? 'affilishops' :
        'shops';

      const referrerDoc = await db.collection(referrerCollection).doc(relData.referrerId).get();
      if (referrerDoc.exists) {
        const referrerData = referrerDoc.data()!;
        if (referrerData.email) {
          await sendEmail({
            to: referrerData.email,
            subject: `【Push-taro】紹介店舗の決済失敗のお知らせ`,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2>${referrerData.name || referrerData.companyName || '紹介者'} 様</h2>
                <p>あなたが紹介された下記店舗の決済が失敗しました。</p>
                <hr />
                <p><strong>店舗名:</strong> ${shopData.name || '未設定'}</p>
                <p>この店舗の今月分の紹介報酬は停止されます。</p>
                <p>決済が成功すると、翌月から報酬が再開されます。</p>
                <hr />
                <p><strong>Push-taro.com</strong></p>
                <p>運営会社：the合同会社</p>
                <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
              </div>
            `,
          });
          console.log(`[決済失敗1回目] 紹介者メール送信: ${referrerData.email}`);
        }
      }
    }
  } catch (err) {
    console.error('[決済失敗1回目] 紹介者メールエラー:', err);
  }

  // 店舗オーナー
  if (shopData.email) {
    await sendEmail({
      to: shopData.email,
      subject: '【Push-taro】決済失敗のお知らせ',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>${shopData.name || '店舗'} 様</h2>
          <p>ご利用料金の引き落としができませんでした。</p>
          <p>Squareよりカード情報更新のご案内が届いているかと思いますので、ご確認ください。</p>
          <hr />
          <p><strong>Push-taro.com</strong></p>
          <p>運営会社：the合同会社</p>
          <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
        </div>
      `,
    });
    console.log(`[決済失敗1回目] 店舗メール送信: ${shopData.email}`);
  }
}

// ============================================================
// 2回目のメール：店舗オーナーに警告
// ============================================================
async function sendSecondFailureEmail(shopData: any) {
  if (!shopData.email) return;

  await sendEmail({
    to: shopData.email,
    subject: '【Push-taro】決済失敗のお知らせ（2回目）',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${shopData.name || '店舗'} 様</h2>
        <p>ご利用料金の決済に失敗しました（2回目）。</p>
        <p>Squareよりカード情報更新のご案内が届いているかと思いますので、</p>
        <p>お手数ですがカード情報を更新いただき、再決済をお願いいたします。</p>
        <p style="color: #e53e3e; font-weight: bold;">※3回目の失敗でプッシュ通知が送れなくなります。</p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      </div>
    `,
  });
  console.log(`[決済失敗2回目] 店舗メール送信: ${shopData.email}`);
}

// ============================================================
// 3回目のメール：店舗オーナーに停止通知
// ============================================================
async function sendThirdFailureEmail(shopData: any) {
  if (!shopData.email) return;

  await sendEmail({
    to: shopData.email,
    subject: '【Push-taro】プッシュ通知機能の一時停止のお知らせ',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${shopData.name || '店舗'} 様</h2>
        <p>ご利用料金の決済が3回連続で失敗したため、</p>
        <p>プッシュ通知機能を一時停止いたしました。</p>
        <p>カード情報を更新いただき、再決済が完了しましたら</p>
        <p style="font-weight: bold; color: #16a34a;">サービスが再開されます。</p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      </div>
    `,
  });
  console.log(`[決済失敗3回目] 店舗メール送信: ${shopData.email}`);
}
