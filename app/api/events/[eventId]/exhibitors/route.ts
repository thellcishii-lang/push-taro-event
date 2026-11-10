// app/api/events/[eventId]/exhibitors/route.ts
// 主催者向け: 出店者（会社）の一覧と登録。出店者はイベント所有者だけが管理する。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import { createExhibitor, listExhibitors } from '@/lib/event-coupon';
import { getEvent } from '@/lib/event-store';
import {
  ExhibitorAccountError,
  resolveOrCreateExhibitorAccount,
} from '@/lib/exhibitor-account';

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
  let authUid = typeof body.authUid === 'string' && body.authUid ? body.authUid : null;
  // 出店者ログインのメールアドレスが渡されたら、アカウントの uid に解決する
  // （主催者は uid ではなくメールで管理するほうが実務的）。
  // アカウントが無い場合はサーバー側で自動作成し、パスワード設定の招待メールを
  // 送る（主催者に Firebase コンソールを触らせる前提にはしない）。
  const authEmail = typeof body.authEmail === 'string' ? body.authEmail.trim() : '';
  let accountCreated = false;
  if (!authUid && authEmail) {
    let eventName: string | null = null;
    try {
      eventName = (await getEvent(eventId))?.name ?? null;
    } catch {
      eventName = null;
    }
    try {
      const resolved = await resolveOrCreateExhibitorAccount(authEmail, {
        exhibitorName: name,
        eventName,
      });
      authUid = resolved.authUid;
      accountCreated = resolved.accountCreated;
    } catch (error) {
      if (error instanceof ExhibitorAccountError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      return NextResponse.json(
        { error: 'ログイン用アカウントの処理に失敗しました' },
        { status: 500 },
      );
    }
  }

  try {
    const exhibitor = await createExhibitor(eventId, { name, authUid });
    return NextResponse.json({ exhibitor, accountCreated }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '登録に失敗しました' },
      { status: 400 },
    );
  }
}
