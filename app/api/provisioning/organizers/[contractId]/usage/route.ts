// 本家 → EVENT の利用状況照会API（プラン変更時の枠超過警告の判定材料）。
//
// 認証は契約者登録API（POST /api/provisioning/organizers）と同じ HMAC 署名:
// - X-Event-Key-Id / X-Event-Timestamp / X-Event-Signature ヘッダ
// - GET はボディを持たないため、署名対象は `${timestamp}.` になる
//   （rawBody = '' として検証する。本家側の署名生成も同じ約束）
//
// 返すのは契約枠と、開催前・開催中（draft / live）イベントの登録者数。
// 「戻すと枠を超えるか」の判定そのものは本家側で行う。
import { NextResponse } from 'next/server';
import { verifyProvisioningRequest } from '@/lib/provisioning-auth';
import { getOrganizerUsage } from '@/lib/provisioning-usage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> },
) {
  // GET にはボディが無いので rawBody は空文字（署名対象は `${timestamp}.`）。
  const verified = await verifyProvisioningRequest(request, '');
  if (!verified) {
    return NextResponse.json({ error: '署名検証に失敗しました' }, { status: 401 });
  }

  const { contractId } = await params;
  const usage = await getOrganizerUsage(contractId.trim());
  if (!usage) {
    return NextResponse.json({ error: '契約者が見つかりません' }, { status: 404 });
  }
  return NextResponse.json(usage);
}
