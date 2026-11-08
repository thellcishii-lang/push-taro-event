// app/api/events/[eventId]/language/route.ts
// 登録済み来場者の言語変更。電話番号認証のトークンから本人を特定し、
// 購読者レコードの言語と FCM トピックの付け替えを行う。
import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import { memberIdForPhone, updateSubscriberLanguage } from '@/lib/event-register';
import { isLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '電話番号認証が必要です' }, { status: 401 });
  }
  let memberId: string;
  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
    if (typeof decoded.phone_number !== 'string' || !decoded.phone_number) {
      return NextResponse.json({ error: '電話番号認証が必要です' }, { status: 401 });
    }
    memberId = memberIdForPhone(decoded.phone_number);
  } catch {
    return NextResponse.json(
      { error: '電話番号認証の有効期限が切れています' },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }
  if (!isLocale(body.lang)) {
    return NextResponse.json({ error: '対応していない言語です' }, { status: 400 });
  }

  const result = await updateSubscriberLanguage(eventId, memberId, body.lang);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
