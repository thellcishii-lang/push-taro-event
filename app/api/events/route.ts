// app/api/events/route.ts
// 主催者向けイベント管理 API: 一覧取得と新規作成（自分のイベントだけ）。
import { NextResponse } from 'next/server';
import { getUidFromRequest, passwordChangeBlock } from '@/lib/event-auth';
import { createEvent, listEventsByOwner } from '@/lib/event-store';
import { EventResetMode, canCreateAnotherEvent } from '@/lib/event';
import { findOrganizerByOwnerUid, resolveEffectiveCaps } from '@/lib/organizers';
import { Locale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  const events = await listEventsByOwner(uid);
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  // 初回パスワード変更が未完了の間は作成できない。
  const block = await passwordChangeBlock(uid);
  if (block) return block;

  // 同時に仕込めるイベントは3つまで（下書き＋開催中。終了したものは数えない）。
  const existingEvents = await listEventsByOwner(uid);
  if (!canCreateAnotherEvent(existingEvents)) {
    return NextResponse.json(
      { error: '同時に仕込めるイベントは3つまでです' },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const startDate = typeof body.startDate === 'string' ? body.startDate : '';
  const endDate = typeof body.endDate === 'string' ? body.endDate : '';
  if (!name) {
    return NextResponse.json({ error: 'イベント名が必要です' }, { status: 400 });
  }
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    return NextResponse.json(
      { error: '開催期間は YYYY-MM-DD 形式で指定してください' },
      { status: 400 },
    );
  }

  // 枠（購読者・クーポン）は契約側の現在値を継承する。主催者からは
  // 設定できない（料金＝契約枠の軸）。契約レコードが無い場合は既定値。
  const organizer = await findOrganizerByOwnerUid(uid);
  const caps = resolveEffectiveCaps(organizer);

  try {
    const event = await createEvent({
      name,
      ownerUid: uid,
      startDate,
      endDate,
      resetMode: body.resetMode as EventResetMode | undefined,
      resetTime: body.resetTime as string | undefined,
      defaultLocale: body.defaultLocale as Locale | undefined,
      subscriberCap: caps.subscriberCap,
      couponCap: caps.couponCap,
      backupRetentionDays: body.backupRetentionDays as number | undefined,
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '作成に失敗しました' },
      { status: 400 },
    );
  }
}
