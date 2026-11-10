// app/api/events/[eventId]/redeem/route.ts
// クーポン消込。実行できるのは次の2者だけ（サーバー側で判定する）:
// - 出店者セッション（イベント専用コードで発行したカスタムトークン）:
//   自社クーポンのみ。他社は403。
// - 主催者（イベント所有者）: 管理画面側の消込として全クーポン可。
import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/event-auth';
import { getEvent } from '@/lib/event-store';
import {
  RedemptionActor,
  getExhibitor,
  redeemClaim,
} from '@/lib/event-coupon';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const auth = await getRequestAuth(request);
  if (!auth) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
  }

  let actor: RedemptionActor;
  if (event.ownerUid === auth.uid) {
    actor = { type: 'organizer' };
  } else if (auth.exhibitor && auth.exhibitor.eventId === eventId) {
    const exhibitor = await getExhibitor(eventId, auth.exhibitor.exhibitorId);
    if (!exhibitor) {
      return NextResponse.json(
        { error: 'このイベントの出店者として登録されていません' },
        { status: 403 },
      );
    }
    actor = { type: 'exhibitor', exhibitorId: exhibitor.id };
  } else {
    return NextResponse.json(
      { error: 'このイベントの出店者として登録されていません' },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  const claimId = typeof body.claimId === 'string' ? body.claimId.trim() : '';
  if (!claimId) {
    return NextResponse.json({ error: 'claimId が必要です' }, { status: 400 });
  }

  const result = await redeemClaim(eventId, claimId, actor);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, claimId: result.claimId });
}
