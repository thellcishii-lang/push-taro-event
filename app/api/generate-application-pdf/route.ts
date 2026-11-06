// app/api/generate-application-pdf/route.ts
/**
 * 申込書（お申し込み内容確認書）PDFを生成して返す
 * 店舗・代理店・アフィリエイトいずれの申込確認画面からも利用
 */
import { NextResponse } from 'next/server';
import { generateApplicationPDF } from '@/lib/pdf-generator';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['shop', 'agency', 'affiliate'] as const;
const MAX_REQUEST_BYTES = 32 * 1024;
const MAX_FIELD_LENGTH = 500;

function containsOversizedString(value: unknown): boolean {
  if (typeof value === 'string') return value.length > MAX_FIELD_LENGTH;
  if (Array.isArray(value)) return value.some(containsOversizedString);
  if (value && typeof value === 'object') {
    return Object.values(value).some(containsOversizedString);
  }
  return false;
}

export async function POST(request: Request) {
  const retryAfter = await enforceRateLimit(request, 'generate-application-pdf', 10, 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'しばらく待ってから再度お試しください' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'リクエストが大きすぎます' }, { status: 413 });
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'リクエストが大きすぎます' }, { status: 413 });
    }

    const { type, data } = JSON.parse(rawBody);

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type は ${VALID_TYPES.join(' / ')} のいずれかです` },
        { status: 400 }
      );
    }
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'data が必要です' }, { status: 400 });
    }
    if (containsOversizedString(data)) {
      return NextResponse.json({ error: '入力項目は500文字以内で指定してください' }, { status: 400 });
    }

    const pdfBuffer = await generateApplicationPDF(type, data);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="application_${type}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('[generate-application-pdf] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
