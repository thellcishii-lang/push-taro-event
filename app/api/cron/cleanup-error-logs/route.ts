import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { isValidCronRequest } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 🔒 Cron認証
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 7日前の日時を計算
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 7日以上前のログを取得
    const snapshot = await db.collection('error_logs')
      .where('createdAt', '<', sevenDaysAgo)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: '削除対象のログはありませんでした。',
      });
    }

    // バッチ削除
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`[cleanup-error-logs] ${snapshot.size}件の古いログを削除しました`);

    return NextResponse.json({
      success: true,
      deleted: snapshot.size,
      message: `${snapshot.size}件の古いエラーログを削除しました。`,
    });
  } catch (error: any) {
    console.error('[cleanup-error-logs] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
