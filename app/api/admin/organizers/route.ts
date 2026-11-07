// 運営用: 契約者（主催者）の一覧。
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { listOrganizers } from '@/lib/organizers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '運営権限が必要です' }, { status: 403 });
  }
  const organizers = await listOrganizers();
  return NextResponse.json({ organizers });
}
