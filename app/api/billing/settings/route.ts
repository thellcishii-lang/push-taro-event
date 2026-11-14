// app/api/billing/settings/route.ts
// 出店者課金オプションの Stripe 設定（主催者単位）。
// 主催者自身の Stripe の APIキーと Webhook シークレットを保存する。
// キーの値はレスポンスに絶対に含めない: GET は「保存済みかどうか」と
// Webhook URL の案内だけを返し、PUT の応答も状態だけを返す。
// 入力欄は常に空で出す前提（画面側）。
// オプション OFF の契約では 404 にして機能の存在自体を隠す。
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getUidFromRequest, passwordChangeBlock } from '@/lib/event-auth';
import { resolveAppOrigin } from '@/lib/app-origin';
import {
  findEnabledBillingOrganizer,
  getStripeBillingSettingsState,
  parseBillingSettingsInput,
  saveStripeBillingSettings,
} from '@/lib/event-billing';

export const dynamic = 'force-dynamic';

function billingWebhookUrl(contractId: string): string {
  return `${resolveAppOrigin()}/api/billing/webhook/${encodeURIComponent(contractId)}`;
}

async function settingsStateResponse(contractId: string) {
  const state = await getStripeBillingSettingsState(db, contractId);
  return NextResponse.json({
    secretKeyConfigured: state.secretKeyConfigured,
    webhookSecretConfigured: state.webhookSecretConfigured,
    webhookUrl: billingWebhookUrl(contractId),
  });
}

export async function GET(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const organizer = await findEnabledBillingOrganizer(uid);
  if (!organizer) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 });
  }
  return settingsStateResponse(organizer.contractId);
}

export async function PUT(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const organizer = await findEnabledBillingOrganizer(uid);
  if (!organizer) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 });
  }
  const block = await passwordChangeBlock(uid);
  if (block) return block;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  const parsed = parseBillingSettingsInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  await saveStripeBillingSettings(db, organizer.contractId, parsed.value);
  return settingsStateResponse(organizer.contractId);
}
