// app/api/events/[eventId]/exhibitor-me/route.ts
// 出店者画面用: 出店者セッション（カスタムトークン）の所属出店者を返す。
// PATCH は出店者本人の表示言語の変更。
// 認可はトークンのクレーム（eventId / exhibitorId）が正本で、ドキュメントの
// 存在も確認する。旧方式の Auth アカウント（authUid）照合は廃止した。
import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/event-auth';
import { getExhibitor, updateExhibitorLanguage } from '@/lib/event-coupon';
import type { EventExhibitor } from '@/lib/event-coupon';
import { isLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

async function sessionExhibitor(
  request: Request,
  eventId: string,
): Promise<{ exhibitor: EventExhibitor } | { error: NextResponse }> {
  const auth = await getRequestAuth(request);
  if (!auth) {
    return {
      error: NextResponse.json({ error: '認証が必要です' }, { status: 401 }),
    };
  }
  if (!auth.exhibitor || auth.exhibitor.eventId !== eventId) {
    return {
      error: NextResponse.json(
        { error: 'このイベントの出店者として登録されていません' },
        { status: 403 },
      ),
    };
  }
  const exhibitor = await getExhibitor(eventId, auth.exhibitor.exhibitorId);
  if (!exhibitor) {
    return {
      error: NextResponse.json(
        { error: 'このイベントの出店者として登録されていません' },
        { status: 403 },
      ),
    };
  }
  return { exhibitor };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const session = await sessionExhibitor(request, eventId);
  if ('error' in session) return session.error;
  return NextResponse.json({ exhibitor: session.exhibitor });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const session = await sessionExhibitor(request, eventId);
  if ('error' in session) return session.error;
  const { exhibitor } = session;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  if (!isLocale(body.lang)) {
    return NextResponse.json({ error: '対応していない言語です' }, { status: 400 });
  }
  await updateExhibitorLanguage(eventId, exhibitor.id, body.lang);
  return NextResponse.json({ exhibitor: { ...exhibitor, lang: body.lang } });
}
