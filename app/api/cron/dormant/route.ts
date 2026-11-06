// app/api/cron/dormant/route.ts
/**
 * 休眠顧客復活クーポン配信 Cron
 *
 * 実行頻度: 毎日 1回
 * 対象: 最終来店から N日経過 × PRO店舗 × 休眠クーポン有効
 * 重複防止: couponUsage[shopId].dormantNotifiedAt を更新
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendPushToShop } from '@/lib/push-sender';
import { isValidCronRequest } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // ─── Cron認証 ───
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ─── 1. 休眠クーポンが有効な PRO 店舗を全件取得 ───
    const shopsSnap = await db.collection('shops')
      .where('plan', '==', 'pro')
      .get();

    let totalSent = 0;
    const errors: string[] = [];

    for (const shopDoc of shopsSnap.docs) {
      const shopData = shopDoc.data();
      const dormant = shopData.proCoupons?.dormant;
      if (!dormant?.enabled) continue;

      const targetDays = dormant.targetDays || 60;
      const threshold = new Date(Date.now() - targetDays * 24 * 60 * 60 * 1000);
      const shopId = shopDoc.id;

      // 再送防止の最小間隔（同じ人に1ヶ月に1回まで）
      const resendThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // ─── 2. 当該店舗を購読している顧客を取得 ───
      const subsSnap = await db.collection('subscriptions')
        .where('shopIds', 'array-contains', shopId)
        .get();

      for (const subDoc of subsSnap.docs) {
        try {
          const subData = subDoc.data();
          const usage = subData.couponUsage?.[shopId];

          // 2-1. 最終来店日チェック
          const lastUsed = usage?.lastCouponUsedAt?.toDate?.() || null;
          if (!lastUsed) continue;                    // 一度も来店なし → 休眠ではない
          if (lastUsed > threshold) continue;         // まだアクティブ

          // 2-2. 最近送信済みならスキップ
          const lastNotified = usage?.dormantNotifiedAt?.toDate?.() || null;
          if (lastNotified && lastNotified > resendThreshold) continue;

          // 2-3. 送信
          await sendPushToShop({
            shopId,
            token: subData.token || subDoc.id,
            title: dormant.title || '👋 お久しぶりです',
            body: dormant.message || `${shopData.name} です。特別な復帰クーポンをご用意しました🎁`,
            url: `/subscribe?s=${shopId}`,
            source: 'cron_dormant',
          });

          // 2-4. 送信記録
          await subDoc.ref.update({
            [`couponUsage.${shopId}.dormantNotifiedAt`]: FieldValue.serverTimestamp(),
            [`couponUsage.${shopId}.dormantCouponUsedAt`]: null,
          });

          totalSent++;
        } catch (err: any) {
          console.error(`[dormant cron] エラー shopId=${shopId}:`, err);
          errors.push(`${shopId}: ${err.message}`);
        }
      }
    }

    console.log(`[dormant cron] 完了: ${totalSent}件送信`);

    return NextResponse.json({
      success: true,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('[dormant cron] 致命的エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
