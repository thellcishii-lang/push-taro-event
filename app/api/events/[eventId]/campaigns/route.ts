// app/api/events/[eventId]/campaigns/route.ts
// 主催者向け配信 API: 一覧、即時配信、予約配信（15分刻み）。
// 即時配信はその場で実行し、送信時点の購読者数を課金根拠として記録する。
// 予約配信は event-tick（15分スケジューラ）が到期分を実行する。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import {
  createCampaignRecord,
  executeCampaign,
  getCampaign,
  isFifteenMinuteSlot,
  jstDateTimeString,
  listCampaigns,
  parseCampaignAttachment,
} from '@/lib/event-push';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;
  const campaigns = await listCampaigns(eventId);
  return NextResponse.json({ campaigns });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  const title = typeof body.title === 'string' ? body.title : '';
  const pushBody = typeof body.body === 'string' ? body.body : '';
  if (!title.trim() || !pushBody.trim()) {
    return NextResponse.json({ error: 'タイトルと本文が必要です' }, { status: 400 });
  }
  // 宣伝ファイルの添付（任意）。検証は lib 側の純粋関数に寄せ、
  // ここでは 400 として早く返す（保存時にも同じ検証がかかる）。
  const parsedAttachment = parseCampaignAttachment(eventId, guard.uid, body.attachment);
  if (!parsedAttachment.ok) {
    return NextResponse.json({ error: parsedAttachment.error }, { status: 400 });
  }
  const attachment = parsedAttachment.attachment;

  const now = new Date();
  const nowJst = jstDateTimeString(now);
  const scheduledAt = typeof body.scheduledAt === 'string' ? body.scheduledAt : '';

  try {
    if (scheduledAt) {
      // 予約配信: 15分刻み・未来の時刻だけを受ける
      if (!isFifteenMinuteSlot(scheduledAt)) {
        return NextResponse.json(
          { error: '予約時刻は15分刻み（00/15/30/45分）で指定してください' },
          { status: 400 },
        );
      }
      if (scheduledAt <= nowJst) {
        return NextResponse.json(
          { error: '予約時刻は未来の時刻を指定してください' },
          { status: 400 },
        );
      }
      const campaign = await createCampaignRecord(eventId, {
        title,
        body: pushBody,
        kind: 'scheduled',
        scheduledAt,
        ownerUid: guard.uid,
        attachment,
      });
      return NextResponse.json({ campaign }, { status: 201 });
    }

    // 即時配信: レコードを作ってその場で実行する
    const campaign = await createCampaignRecord(eventId, {
      title,
      body: pushBody,
      kind: 'instant',
      scheduledAt: nowJst,
      ownerUid: guard.uid,
      attachment,
    });
    const result = await executeCampaign(eventId, campaign.id);
    const executed = await getCampaign(eventId, campaign.id);
    if (!result.sent) {
      return NextResponse.json(
        { error: `配信に失敗しました: ${result.reason}`, campaign: executed },
        { status: 502 },
      );
    }
    return NextResponse.json({ campaign: executed }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '配信の作成に失敗しました' },
      { status: 400 },
    );
  }
}
