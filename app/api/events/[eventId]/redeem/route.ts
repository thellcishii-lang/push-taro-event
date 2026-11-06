// app/api/events/[eventId]/redeem/route.ts
// クーポン消込。実行できるのは次の2者だけ（サーバー側で判定する）:
// - 出店者ログイン（メール+パスワード）: 自社クーポンのみ。他社は403。
// - 主催者（イベント所有者）: 管理画面側の消込として全クーポン可。
import { NextResponse } from 'next/server';
import { getUidFromRequest } from '@/lib/event-auth';
import { getEvent } from '@/lib/event-store';
import {
  RedemptionActor,
  findExhibitorByAuthUid,
  redeemClaim,
} from '@/lib/event-coupon';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
  }

  let actor: RedemptionActor;
  if (event.ownerUid === uid) {
    actor = { type: 'organizer' };
  } else {
    const exhibitor = await findExhibitorByAuthUid(eventId, uid);
    if (!exhibitor) {
      return NextResponse.json(
        { error: 'このイベントの出店者として登録されていません' },
        { status: 403 },
      );
    }
    actor = { type: 'exhibitor', exhibitorId: exhibitor.id };
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
