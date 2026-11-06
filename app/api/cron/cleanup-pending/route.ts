import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase-admin';
import { isValidCronRequest } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 🔒 Cron認証（Vercel Cron Jobs からのみ実行）
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // 5日以上経過した pending_payment を取得
    const snapshot = await db.collection('shops')
      .where('status', '==', 'pending_payment')
      .get();

    const expiredDocs = snapshot.docs.filter((doc) => {
      const createdAt = doc.data().createdAt?.toDate?.() ||
        (doc.data().createdAt ? new Date(doc.data().createdAt) : null);
      return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt < fiveDaysAgo;
    });

    if (expiredDocs.length === 0) {
      return NextResponse.json({ 
        success: true, 
        deleted: 0,
        message: '削除対象の pending_payment はありませんでした。'
      });
    }

    // バッチ削除
    const batch = db.batch();
    expiredDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`[cleanup-pending] ${expiredDocs.length}件の期限切れ pending_payment を削除しました`);

    return NextResponse.json({ 
      success: true, 
      deleted: expiredDocs.length,
      message: `${expiredDocs.length}件の期限切れ pending_payment を削除しました。`
    });

  } catch (error: any) {
    console.error('[cleanup-pending] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
