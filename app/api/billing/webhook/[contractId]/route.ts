// app/api/billing/webhook/[contractId]/route.ts
// 出店者課金オプションの Stripe Webhook 受信口。
// パスで主催者（契約）を特定し、その主催者自身の Webhook シークレットで
// 署名を検証する。検証は生ボディに対して行う（JSON に変換してからでは
// 署名が一致しない）。署名検証に失敗したら 400。
// 処理結果はローカル記録（Firestore）に反映され、それが課金状態の正。
// オプション OFF／未設定の契約には 404 を返して存在を隠す。
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getOrganizer } from '@/lib/organizers';
import {
  applyStripeWebhookEffect,
  getStripeBillingSettings,
  verifyStripeWebhookEvent,
  type StripeWebhookEventLike,
} from '@/lib/event-billing';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> },
) {
  const { contractId } = await params;
  const organizer = await getOrganizer(contractId);
  if (!organizer || !organizer.billingOptionEnabled) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 });
  }
  const settings = await getStripeBillingSettings(db, contractId);
  if (!settings) {
    return NextResponse.json(
      { error: 'Stripe設定が未完了です' },
      { status: 400 },
    );
  }
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: '署名がありません' }, { status: 400 });
  }
  const rawBody = await request.text();

  let event;
  try {
    event = verifyStripeWebhookEvent(
      settings.secretKey,
      settings.webhookSecret,
      rawBody,
      signature,
    );
  } catch {
    return NextResponse.json({ error: '署名検証に失敗しました' }, { status: 400 });
  }

  const result = await applyStripeWebhookEffect(
    db,
    contractId,
    event as unknown as StripeWebhookEventLike,
  );
  return NextResponse.json({
    received: true,
    applied: result.applied,
    duplicate: result.duplicate,
  });
}
