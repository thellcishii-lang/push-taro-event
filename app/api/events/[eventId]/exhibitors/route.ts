// app/api/events/[eventId]/exhibitors/route.ts
// 主催者向け: 出店者（会社）の一覧と登録。出店者はイベント所有者だけが管理する。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import { authAdmin } from '@/lib/firebase-admin';
import { createExhibitor, listExhibitors } from '@/lib/event-coupon';

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
  let authUid = typeof body.authUid === 'string' && body.authUid ? body.authUid : null;
  // 出店者ログインのメールアドレスが渡されたら、アカウントの uid に解決する
  // （主催者は uid ではなくメールで管理するほうが実務的）。
  const authEmail = typeof body.authEmail === 'string' ? body.authEmail.trim() : '';
  if (!authUid && authEmail) {
    try {
      const userRecord = await authAdmin.getUserByEmail(authEmail);
      authUid = userRecord.uid;
    } catch {
      return NextResponse.json(
        { error: 'そのメールアドレスのログイン用アカウントが見つかりません。先にアカウントを作成してください' },
        { status: 400 },
      );
    }
  }

  try {
    const exhibitor = await createExhibitor(eventId, { name, authUid });
    return NextResponse.json({ exhibitor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '登録に失敗しました' },
      { status: 400 },
    );
  }
}
