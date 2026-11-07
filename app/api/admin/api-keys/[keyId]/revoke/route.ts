// 運営用: 本家連携APIキーの失効。
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { revokeApiKey } from '@/lib/api-keys';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ keyId: string }> },
) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '運営権限が必要です' }, { status: 403 });
  }

  const { keyId } = await params;
  const revoked = await revokeApiKey(keyId);
  if (!revoked) {
    return NextResponse.json({ error: 'キーが見つかりません' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, keyId, revoked: true });
}
