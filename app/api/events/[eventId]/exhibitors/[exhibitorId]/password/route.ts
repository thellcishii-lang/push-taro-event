// app/api/events/[eventId]/exhibitors/[exhibitorId]/password/route.ts
// 主催者向け: 出店者のパスワード（イベント専用アクセスコード）再発行。
// 新コードに差し替えて登録メールへ送信する（旧コードは即失効）。
// メール未登録の旧出店者（Auth 方式時代のドキュメント）は、body の email で
// メールを設定してから発行できる（移行手段）。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import {
  ExhibitorAccessError,
  reissueExhibitorPassword,
} from '@/lib/exhibitor-access';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string; exhibitorId: string }> },
) {
  const { eventId, exhibitorId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;

  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await request.json();
    if (parsed && typeof parsed === 'object') {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    // body は任意（メール済みの出店者は空でよい）。JSON でなければ無視する。
  }
  const email =
    typeof body.email === 'string' && body.email.trim() ? body.email : null;

  try {
    const result = await reissueExhibitorPassword({
      eventId,
      exhibitorId,
      email,
      eventName: guard.event.name,
    });
    return NextResponse.json({
      ok: true,
      email: result.email,
      mailSent: result.mailSent,
    });
  } catch (error) {
    if (error instanceof ExhibitorAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'パスワードの再発行に失敗しました' },
      { status: 500 },
    );
  }
}
