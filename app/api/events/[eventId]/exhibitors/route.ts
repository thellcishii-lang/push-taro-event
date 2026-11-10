// app/api/events/[eventId]/exhibitors/route.ts
// 主催者向け: 出店者（会社）の一覧と登録。出店者はイベント所有者だけが管理する。
// 登録すると、そのイベント専用のログインパスワード（アクセスコード）が発行
// され、出店者のメールアドレス宛てに送信される（lib/exhibitor-access.ts）。
// 出店者は Firebase Auth のアカウントを持たない。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import { listExhibitors } from '@/lib/event-coupon';
import {
  ExhibitorAccessError,
  registerExhibitor,
} from '@/lib/exhibitor-access';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;
  const exhibitors = await listExhibitors(eventId);
  return NextResponse.json({ exhibitors });
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
  const name = typeof body.name === 'string' ? body.name : '';
  if (!name.trim()) {
    return NextResponse.json({ error: '出店者名が必要です' }, { status: 400 });
  }
  const email = typeof body.email === 'string' ? body.email : '';

  try {
    const result = await registerExhibitor({
      eventId,
      name,
      email,
      eventName: guard.event.name,
    });
    const exhibitors = await listExhibitors(eventId);
    const exhibitor = exhibitors.find((e) => e.id === result.exhibitorId) ?? {
      id: result.exhibitorId,
      name: name.trim(),
      email: result.email,
      hasAccessCode: true,
      lang: guard.event.defaultLocale,
    };
    // コード自体はレスポンスに含めない（メールでのみ出店者に渡る）。
    return NextResponse.json({ exhibitor }, { status: 201 });
  } catch (error) {
    if (error instanceof ExhibitorAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: '出店者の登録に失敗しました' },
      { status: 500 },
    );
  }
}
