// app/api/events/[eventId]/info-pdfs/public/route.ts
// 来場者向け: 案内PDFの一覧（タイトルとURLだけを返す、認証なし）。
import { NextResponse } from 'next/server';
import { listInfoPdfs } from '@/lib/event-info';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const pdfs = (await listInfoPdfs(eventId)).map((pdf) => ({
    id: pdf.id,
    title: pdf.title,
    url: pdf.url,
  }));
  return NextResponse.json({ pdfs });
}
