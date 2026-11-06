// app/api/cron/streak-reminder/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { couponDay } from '@/lib/coupon-day';
import { sendPushToShop } from '@/lib/push-sender';
import { isValidCronRequest } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = couponDay(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = couponDay(yesterday);

    const shopsSnap = await db.collection('shops').where('plan', '==', 'pro').get();
    let totalSent = 0;

    for (const shopDoc of shopsSnap.docs) {
      const shopData = shopDoc.data();
      const streak = shopData.streakCoupon;
      if (!streak?.enabled || !streak?.notifyEnabled) continue;

      const targetDays = Number(streak.targetDays || 5);
      const shopId = shopDoc.id;

      const subsSnap = await db.collection('subscriptions').where('shopIds', 'array-contains', shopId).get();

      for (const subDoc of subsSnap.docs) {
        const subData = subDoc.data();
        const usage = subData.couponUsage?.[shopId]?.streak;

        if (!usage || usage.campaignId !== streak.campaignId) continue;
        
        // あと1日（currentCount === targetDays - 1）かつ、最終スタンプが昨日（今日まだ押してない）
        if (usage.currentCount === targetDays - 1 && usage.lastStampDate === yesterdayStr) {
          // 今日すでに通知を送っていないか確認
          if (usage.lastRemindedDate === today) continue;

          try {
            await sendPushToShop({
              shopId,
              token: subData.token || subDoc.id,
              title: streak.notifyTitle || 'あと1日でクーポンGET！🔥',
              body: streak.notifyBody || '連続ログイン達成まであと1日です！今日中にアプリを開いてスタンプを押して、リセットを防ぎましょう。',
              url: `/subscribe?s=${shopId}`,
              source: 'cron_streak_reminder',
            });

            await subDoc.ref.update({
              [`couponUsage.${shopId}.streak.lastRemindedDate`]: today,
            });
            totalSent++;
          } catch (err) {
            console.error(`[streak-reminder] 送信エラー shop=${shopId}:`, err);
          }
        }
      }
    }

    return NextResponse.json({ success: true, sent: totalSent });
  } catch (error: any) {
    console.error('[streak-reminder] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
