import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { isValidCronRequest } from '@/lib/cron-auth';
import { processPushJobBatch } from '@/lib/push-job';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stale = await db.collection('push_jobs').where('status', '==', 'processing').limit(10).get();
    const queued = await db.collection('push_jobs').where('status', '==', 'queued').limit(1).get();
    const jobIds = [...stale.docs, ...queued.docs].map((doc) => doc.id);
    const results = [];
    for (const jobId of jobIds) {
      const result = await processPushJobBatch(jobId);
      results.push({ jobId, result });
      if (result !== 'skipped') break;
    }
    return NextResponse.json({
      success: true,
      processed: results.filter(({ result }) => result !== 'skipped').length,
      results,
    });
  } catch (error: any) {
    console.error('[process-push-jobs] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
