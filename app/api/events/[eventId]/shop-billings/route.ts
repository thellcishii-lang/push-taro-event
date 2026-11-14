// app/api/events/[eventId]/shop-billings/route.ts
// 出店者課金オプション: 出店者ごとの課金状態一覧と収支サマリ（主催者）。
// 状態・合計はすべてローカル記録（Webhook で蓄積した Firestore）が正で、
// Stripe API へは問い合わせない。
// オプション OFF の契約では 404 にして機能の存在自体を隠す。
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { requireEventOwner } from '@/lib/event-auth';
import { listExhibitors } from '@/lib/event-coupon';
import {
  findEnabledBillingOrganizer,
  listBillingPayments,
  listShopBillings,
  summarizePaymentsByMonth,
} from '@/lib/event-billing';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;

  const organizer = await findEnabledBillingOrganizer(guard.uid);
  if (!organizer) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 });
  }

  const [exhibitors, billings, recentPayments, allPayments] = await Promise.all([
    listExhibitors(eventId),
    listShopBillings(db, eventId),
    listBillingPayments(db, eventId, 50),
    listBillingPayments(db, eventId, 1000),
  ]);
  const summary = summarizePaymentsByMonth(allPayments, new Date());

  return NextResponse.json({
    exhibitors: exhibitors.map((exhibitor) => ({
      id: exhibitor.id,
      name: exhibitor.name,
    })),
    billings,
    payments: recentPayments,
    summary: {
      currentMonthKey: summary.currentMonthKey,
      currentMonthTotal: summary.currentMonthTotal,
      previousMonthKey: summary.previousMonthKey,
      previousMonthTotal: summary.previousMonthTotal,
    },
  });
}
