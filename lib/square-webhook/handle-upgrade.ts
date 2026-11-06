// lib/square-webhook/handle-upgrade.ts
/**
 * アップグレード（standard / pro）の処理
 * 
 * 1. upgradeData から情報を昇格（bankAccount / invoiceNumber 等）
 * 2. shops を更新（plan / upgradeStatus）
 * 3. アップグレード完了メール送信
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';

export async function handleUpgrade(
  upgradeShopDoc: FirebaseFirestore.QueryDocumentSnapshot,
  customerEmail: string,
  paymentId: string | null
) {
  const upgradeShopData = upgradeShopDoc.data();

  // 🔥 A-5: upgradeTargetPlan を優先、フォールバックで targetPlan
  const targetPlan = upgradeShopData.upgradeTargetPlan || upgradeShopData.targetPlan;

  // 対象プランが未設定/不正な場合、plan: undefined の書き込みで
  // Firestore が例外を投げ webhook 全体が失敗するため、ここでスキップする
  if (targetPlan !== 'standard' && targetPlan !== 'pro') {
    console.error(`[アップグレード] 対象プランが不正のためスキップ: doc=${upgradeShopDoc.id}`, {
      upgradeTargetPlan: upgradeShopData.upgradeTargetPlan,
      targetPlan: upgradeShopData.targetPlan,
    });
    return NextResponse.json(
      { success: false, error: 'invalid upgrade target plan' },
      { status: 200 }
    );
  }

  const planName = targetPlan === 'pro' ? 'PRO' : 'スタンダード';

  // 🔥 A-6: upgradeData から bankAccount / invoiceNumber 等を昇格
  const upgradeData = upgradeShopData.upgradeData || {};
  const updatePayload: Record<string, any> = {
    plan: targetPlan,
    upgradeStatus: 'completed',
    upgradeCompletedAt: FieldValue.serverTimestamp(),
    squarePaymentId: paymentId || '',
    failedAt: null,
    gracePeriodUntil: null,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (upgradeData.bankAccount) {
    updatePayload.bankAccount = upgradeData.bankAccount;
  }
  if (upgradeData.invoiceNumber !== undefined) {
    updatePayload.invoiceNumber = upgradeData.invoiceNumber;
  }
  if (upgradeData.address) {
    updatePayload.address = upgradeData.address;
  }
  if (upgradeData.phone) {
    updatePayload.phone = upgradeData.phone;
  }

  // PROアップグレード時は role も更新
  if (targetPlan === 'pro') {
    updatePayload.role = 'pro';
  }

  await upgradeShopDoc.ref.update(updatePayload);

  // ============================================================
  // アップグレード完了メール
  // ============================================================
  await sendEmail({
    to: customerEmail,
    subject: `【Push-taro】${planName}プランへのアップグレードが完了しました`,
    html: `
      <h2>${upgradeShopData.name || '店舗'} 様</h2>
      <p>${planName}プランへのアップグレードが完了いたしました。</p>
      <p>アップグレードされた機能をご利用いただけます。</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/${targetPlan === 'pro' ? 'pro-shop' : 'shop'}" style="display:inline-block; padding:12px 24px; background:#ff4500; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
          管理画面へログイン
        </a>
      </p>
      ${targetPlan === 'pro' ? '<p>PROプラン特典として、紹介報酬機能も有効になりました。</p>' : ''}
      <hr />
      <p><strong>Push-taro.com</strong></p>
      <p>運営会社：the合同会社</p>
      <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
    `,
  });

  console.log(`[アップグレード完了] 店舗: ${upgradeShopData.name} -> プラン: ${targetPlan}`);
  return NextResponse.json({ success: true, message: 'アップグレード完了しました' }, { status: 200 });
}
