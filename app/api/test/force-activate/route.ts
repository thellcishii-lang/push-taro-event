// app/api/test/force-activate/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { POST as webhookPOST } from '../../square-webhook/route';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {

  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }
  
  try {
    const body = await request.json();

    // ① 店舗
    if (body.shopId) {
      return await handleShop(body.shopId);
    }

    // ② 代理店
    if (body.agencyId) {
      return await handleAgency(body.agencyId);
    }

    // ③ アフィリエイト
    if (body.affiliateId) {
      return await handleAffiliate(body.affiliateId);
    }

    return NextResponse.json(
      { error: 'shopId / agencyId / affiliateId のいずれかが必要です' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[force-activate] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ────────────────────────────────────────────────
// 店舗（既存の本番ロジックを踏襲）
// ────────────────────────────────────────────────
async function handleShop(shopId: string) {
  const shopDoc = await db.collection('shops').doc(shopId).get();
  if (!shopDoc.exists) {
    return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
  }

  const shopData = shopDoc.data()!;

  const isPending =
    shopData.status === 'pending_payment' ||
    shopData.upgradeStatus === 'pending_payment';

  if (!isPending) {
    return NextResponse.json(
      { error: 'この店舗は pending_payment ではありません' },
      { status: 400 }
    );
  }

  const isPro = Boolean(shopData.invoiceNumber || shopData.bankAccount);

  const mockRequest = new Request(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/square-webhook`,
    {
      method: 'POST',
      headers: {
  'Content-Type': 'application/json',
  'x-internal-secret': process.env.CRON_SECRET || '',
},
      body: JSON.stringify({
        type: 'payment.updated',
        data: {
          object: {
            payment: {
              id: 'force_' + Date.now(),
              status: 'COMPLETED',
              buyer_email_address: shopData.email,
              customer_id: shopData.squareCustomerId || 'force_customer',
              note: shopId,
              amount_money: { amount: isPro ? 10000 : 3800 },
              reference_id: shopData.referralCode || '',
            },
          },
        },
      }),
    }
  );

  const response = await webhookPOST(mockRequest);
  const result = await response.json();

  return NextResponse.json({
    success: true,
    message: '店舗の決済をスキップして Webhook を実行しました',
    webhookResult: result,
  });
}

// ────────────────────────────────────────────────
// 代理店（フラグを立てるだけ）
// ────────────────────────────────────────────────
async function handleAgency(agencyId: string) {
  const ref = db.collection('agencies').doc(agencyId);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: '代理店が見つかりません' }, { status: 404 });
  }

  await ref.update({
    'initialPayment.paid': true,
    'initialPayment.paidAt': FieldValue.serverTimestamp(),
    'monthlyPayment.status': 'active',
    'monthlyPayment.lastPaidAt': FieldValue.serverTimestamp(),
    status: 'active',
    activatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    success: true,
    message: '代理店を両方履行済み・active にしました',
  });
}

// ────────────────────────────────────────────────
// アフィリエイト（status=active にするだけ）
// ────────────────────────────────────────────────
async function handleAffiliate(affiliateId: string) {
  const ref = db.collection('affiliates').doc(affiliateId);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: 'アフィリエイトが見つかりません' }, { status: 404 });
  }

  await ref.update({
    status: 'active',
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    success: true,
    message: 'アフィリエイトを active にしました',
  });
}
