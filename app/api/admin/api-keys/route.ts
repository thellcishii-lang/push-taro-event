// 運営用: 本家連携APIキーの一覧と発行。
// - GET: 鍵を含まない概要の一覧
// - POST: 発行。鍵（secret）は、このレスポンスで一度だけ返す
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createApiKey, listApiKeys } from '@/lib/api-keys';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '運営権限が必要です' }, { status: 403 });
  }
  const keys = await listApiKeys();
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '運営権限が必要です' }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // ラベルなし発行も許可するので、本文なしは空として扱う
  }
  const label = typeof body.label === 'string' ? body.label : '';

  const issued = await createApiKey(label);
  return NextResponse.json(
    {
      keyId: issued.keyId,
      // この表示は一度きり。一覧や再取得では二度と返さない。
      secret: issued.secret,
      label: issued.label,
    },
    { status: 201 },
  );
}
