import { NextResponse } from 'next/server';
import { notifyAdmins } from '@/lib/error-notifier';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // レート制限: 同一IPから10分間に5件まで（管理者へのメールボム防止）
    const retryAfter = await enforceRateLimit(request, 'report-error', 5, 10 * 60 * 1000);
    if (retryAfter !== null) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const { message, stack, digest, url } = await request.json();

    // 型・長さを検証してから管理者通知に渡す（任意内容の大量送信を防止）
    const safeMessage = typeof message === 'string' && message.trim()
      ? message.slice(0, 500)
      : 'Unknown frontend error';
    const error = new Error(safeMessage);
    if (typeof stack === 'string') error.stack = stack.slice(0, 3000);

    await notifyAdmins(error, {
      source: 'frontend',
      details: {
        url: typeof url === 'string' ? url.slice(0, 500) : undefined,
        digest: typeof digest === 'string' ? digest.slice(0, 100) : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
