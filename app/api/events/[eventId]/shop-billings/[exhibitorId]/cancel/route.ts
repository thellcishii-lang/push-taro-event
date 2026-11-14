// app/api/events/[eventId]/shop-billings/[exhibitorId]/cancel/route.ts
// 出店者課金オプション: 出店者の課金（月額サブスク）を解約する（主催者）。
// Stripe 側のサブスクリプションも止める。主催者の操作による解約では
// 掲載は止めない（掲載停止は未払い確定のときに Webhook 経由で行う）。
// 一括払いには解約操作はない（lib 側で 400 を返す）。
// オプション OFF の契約では 404 にして機能の存在自体を隠す。
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { requireEventOwner } from '@/lib/event-auth';
import {
  cancelShopBilling,
  findEnabledBillingOrganizer,
} from '@/lib/event-billing';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string; exhibitorId: string }> },
) {
  const { eventId, exhibitorId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;

  const organizer = await findEnabledBillingOrganizer(guard.uid);
  if (!organizer) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 });
  }

  const result = await cancelShopBilling(
    db,
    organizer.contractId,
    eventId,
    exhibitorId,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, billing: result.billing });
}
