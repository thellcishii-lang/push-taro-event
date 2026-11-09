// 本家 → EVENT のクーポンオプション受付API（決済完了時に本家が呼ぶ）。
//
// オプションはイベント単位の買い切り: 対象イベントの couponCap を
// 100件 × units だけ増やす（処理本体は lib/coupon-options.ts）。
//
// 認証は契約者登録APIと同じ HMAC 署名。生の本文で署名を検証してから
// JSON を読む。冪等キーは paymentId（同じ決済の再送では二重加算しない）。
import { NextResponse } from 'next/server';
import { verifyProvisioningRequest } from '@/lib/provisioning-auth';
import { applyCouponOption, validateCouponOptionInput } from '@/lib/coupon-options';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verified = await verifyProvisioningRequest(request, rawBody);
  if (!verified) {
    return NextResponse.json({ error: '署名検証に失敗しました' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }

  const validation = validateCouponOptionInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const result = await applyCouponOption(validation.input);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(
    { status: result.status, couponCap: result.couponCap },
    { status: result.status === 'applied' ? 201 : 200 },
  );
}
