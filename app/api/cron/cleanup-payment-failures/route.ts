// app/api/cron/cleanup-payment-failures/route.ts
/**
 * 決済不履行による退会処理から30日経過した店舗を、
 * 決済不履行リストから非表示にする処理。
 * 
 * ※ データ自体は削除しない（入金管理で遡れるようにする）
 * 
 * 実行頻度：毎日 1回
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isValidCronRequest } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 🔒 Cron認証
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ============================================================
    // paymentStatus='canceled' かつ paymentCanceledAt が30日以上前
    // かつまだ非表示フラグが立っていない店舗を取得
    // ============================================================
    // 複合インデックス不要の取得にして、App Hosting環境でも安定して実行する。
    const snapshot = await db.collection('shops')
      .where('paymentStatus.current', '==', 'canceled')
      .get();

    if (snapshot.empty) {
      console.log('[cleanup-payment-failures] 対象なし');
      return NextResponse.json({
        success: true,
        hidden: 0,
        message: '対象の店舗はありませんでした。',
      });
    }

    const batch = db.batch();
    let hiddenCount = 0;
    const hiddenList: Array<{ shopId: string; name: string; canceledAt: string }> = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const canceledAt = data.paymentCanceledAt?.toDate?.() ||
        (data.paymentCanceledAt ? new Date(data.paymentCanceledAt) : null);

      if (!canceledAt || Number.isNaN(canceledAt.getTime()) || canceledAt >= thirtyDaysAgo) return;

      // 既に非表示済みならスキップ
      if (data.paymentFailureHidden === true) return;

      batch.update(doc.ref, {
        paymentFailureHidden: true,
        paymentFailureHiddenAt: FieldValue.serverTimestamp(),
      });

      hiddenCount++;
      hiddenList.push({
        shopId: doc.id,
        name: data.name || '未設定',
        canceledAt: data.paymentCanceledAt?.toDate?.()?.toISOString() || '不明',
      });
    });

    if (hiddenCount > 0) {
      await batch.commit();
    }

    console.log(`[cleanup-payment-failures] ${hiddenCount}件を非表示にしました`);

    return NextResponse.json({
      success: true,
      hidden: hiddenCount,
      hiddenList,
      message: `${hiddenCount}件の店舗を決済不履行リストから非表示にしました。`,
    });

  } catch (error: any) {
    console.error('[cleanup-payment-failures] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
