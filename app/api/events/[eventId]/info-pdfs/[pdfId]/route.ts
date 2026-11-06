// app/api/events/[eventId]/info-pdfs/[pdfId]/route.ts
// 主催者向け: 案内PDFの削除（Storage本体もベストエフォートで削除）。
import { NextResponse } from 'next/server';
import { requireEventOwner } from '@/lib/event-auth';
import { deleteInfoPdf } from '@/lib/event-info';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string; pdfId: string }> },
) {
  const { eventId, pdfId } = await params;
  const guard = await requireEventOwner(request, eventId);
  if ('error' in guard) return guard.error;

  try {
    await deleteInfoPdf(eventId, pdfId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '削除に失敗しました' },
      { status: 400 },
    );
  }
}
