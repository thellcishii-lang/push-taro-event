// app/api/events/[eventId]/info-pdfs/route.ts
// 主催者向け: 案内PDFの一覧と登録（最大5件）。
// アップロード自体は管理画面が Storage へ直接行い、ここにはメタデータを登録する。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import { addInfoPdf, listInfoPdfs } from '@/lib/event-info';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;
  const pdfs = await listInfoPdfs(eventId);
  return NextResponse.json({ pdfs });
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
  const url = typeof body.url === 'string' ? body.url : '';
  const storagePath = typeof body.storagePath === 'string' ? body.storagePath : '';

  try {
    const pdf = await addInfoPdf(eventId, { title, url, storagePath });
    return NextResponse.json({ pdf }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '登録に失敗しました' },
      { status: 400 },
    );
  }
}
