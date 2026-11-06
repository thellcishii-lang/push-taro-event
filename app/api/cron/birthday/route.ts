// app/api/cron/birthday/route.ts
/**
 * 誕生日クーポン配信 Cron
 *
 * 実行頻度: 毎日 1回
 * 対象: 今日が誕生日の顧客 × PRO店舗 × 誕生日クーポン有効
 * 重複防止: couponUsage[shopId].birthdayNotifiedYear に年を記録
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
    const now = new Date();
    const currentMonth = now.getMonth() + 1;   // 1〜12
    const currentDay = now.getDate();          // 1〜31
    const currentYear = String(now.getFullYear());

    console.log(`[birthday cron] 対象: ${currentMonth}月${currentDay}日`);

    // ─── 1. 今日が誕生日の顧客を取得 ───
    const subsSnap = await db.collection('subscriptions')
      .where('birthMonth', '==', currentMonth)
      .where('birthDay', '==', currentDay)
      .get();

    if (subsSnap.empty) {
      return NextResponse.json({ success: true, sent: 0, message: '対象者なし' });
    }

    console.log(`[birthday cron] 対象顧客: ${subsSnap.size}件`);

    let sentCount = 0;
    const errors: string[] = [];

    // ─── 2. 顧客ごとに処理 ───
    for (const subDoc of subsSnap.docs) {
      const subData = subDoc.data();
      const shopIds: string[] = subData.shopIds || [];

      for (const shopId of shopIds) {
        try {
          // 2-1. 店舗情報取得（PRO かつ birthday 有効か確認）
          const shopDoc = await db.collection('shops').doc(shopId).get();
          if (!shopDoc.exists) continue;

          const shopData = shopDoc.data()!;
          if (shopData.plan !== 'pro') continue;

          const birthday = shopData.proCoupons?.birthday;
          if (!birthday?.enabled) continue;

          // 2-2. 今年既に送信済みかチェック
          const usage = subData.couponUsage?.[shopId];
          if (usage?.birthdayNotifiedYear === currentYear) continue;

          // 2-3. 送信
          await sendPushToShop({
            shopId,
            token: subData.token || subDoc.id,
            title: birthday.title || '🎂 お誕生日おめでとうございます',
            body: birthday.message || `${shopData.name} より、記念日、お誕生日クーポンをお贈りします🎁`,
            url: `/subscribe?s=${shopId}`,
            source: 'cron_birthday',
          });

          // 2-4. 送信済みフラグを立てる
          await subDoc.ref.update({
            [`couponUsage.${shopId}.birthdayNotifiedYear`]: currentYear,
          });

          sentCount++;
        } catch (err: any) {
          console.error(`[birthday cron] エラー shopId=${shopId}:`, err);
          errors.push(`${shopId}: ${err.message}`);
        }
      }
    }

    console.log(`[birthday cron] 完了: ${sentCount}件送信`);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      candidates: subsSnap.size,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('[birthday cron] 致命的エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
