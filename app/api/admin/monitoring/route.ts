// 運営用: 運用監視スナップショット（スケジューラ状態・失敗配信・滞留・未送信レポート）。
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { collectMonitoringSnapshot } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '運営権限が必要です' }, { status: 403 });
  }
  const snapshot = await collectMonitoringSnapshot(new Date());
  return NextResponse.json(snapshot);
}
