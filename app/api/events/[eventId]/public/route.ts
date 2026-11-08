// app/api/events/[eventId]/public/route.ts
// 来場者向けの公開情報。登録前の来場者が見るため認証なしで返すが、
//返すのは表示に必要な最小項目だけ（所有者uidなどは出さない）。
import { NextResponse } from 'next/server';
import { getEvent } from '@/lib/event-store';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
  }
  return NextResponse.json({
    event: {
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      resetMode: event.resetMode,
      defaultLocale: event.defaultLocale,
    },
  });
}
