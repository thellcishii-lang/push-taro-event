import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin';
import { getPushJob } from '@/lib/push-job';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const { uid } = await getAuth().verifyIdToken(authHeader.slice(7));
    const { jobId } = await params;
    const job = await getPushJob(jobId);
    if (!job) return NextResponse.json({ error: 'ジョブが見つかりません' }, { status: 404 });

    const shop = await db.collection('shops').doc(String(job.shopId)).get();
    if (!shop.exists || shop.data()?.ownerUid !== uid) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }
    return NextResponse.json({ job });
  } catch (error) {
    console.error('[push-jobs] エラー:', error);
    return NextResponse.json({ error: '送信状態の取得に失敗しました' }, { status: 500 });
  }
}
