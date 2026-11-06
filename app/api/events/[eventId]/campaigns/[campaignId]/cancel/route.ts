// app/api/events/[eventId]/campaigns/[campaignId]/cancel/route.ts
// 主催者向け: 予約配信の取り消し（予約済みのものだけ）。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import { cancelCampaign } from '@/lib/event-push';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string; campaignId: string }> },
) {
  const { eventId, campaignId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;

  try {
    const campaign = await cancelCampaign(eventId, campaignId);
    return NextResponse.json({ campaign });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '取り消しに失敗しました' },
      { status: 400 },
    );
  }
}
