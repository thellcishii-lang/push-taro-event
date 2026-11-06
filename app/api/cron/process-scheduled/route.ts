// app/api/cron/process-scheduled/route.ts
import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';
import { sendPushToShop } from '@/lib/push-sender';
import { isValidCronRequest } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

// 毎日 0:00 UTC（日本時間 9:00）に実行される予約配信バッチ
export async function GET(req: Request) {
  // 🔒 Cron認証（Vercel Cron Jobs からのみ実行可能）
  if (!isValidCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const currentDateStr = today.toISOString().slice(0, 10);
    const currentDayOfMonth = today.getDate().toString();
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDayOfWeek = days[today.getDay()];

    const shopsSnapshot = await adminDb.collection('shops').get();
    let totalSent = 0;
    const errors: string[] = [];

    for (const doc of shopsSnapshot.docs) {
      const shop = doc.data();
      const scheduledList = shop.scheduledList || [];
      let activeScheduledCoupons = [...(shop.scheduledCoupons || [])];
      if (scheduledList.length === 0) continue;

      const remainingSchedules: any[] = [];

      for (const item of scheduledList) {
        let shouldSend = false;

        // ① 1回限りの日付指定
        if (item.scheduleType === 'once' && item.scheduleRaw?.date === currentDateStr) {
          shouldSend = true;
        }
        // ② 毎月指定日
        else if (
          item.scheduleType === 'monthly' &&
          String(item.scheduleRaw?.dayOfMonth) === currentDayOfMonth
        ) {
          shouldSend = true;   // 🔥 ここが抜けていた
        }
        // ③ 毎週指定曜日
        else if (
          item.scheduleType === 'weekly' &&
          item.scheduleRaw?.dayOfWeek === currentDayOfWeek
        ) {
          shouldSend = true;
        }

        if (shouldSend) {
  let sendOk = false;
  try {
    await sendPushToShop({
      shopId: doc.id,
      title: item.title,
      body: item.body,
      url: item.linkUrl,
      source: 'cron_scheduled',
    });
    if (item.type === 'coupon') {
      const issuedAt = new Date();
      const couponId = `${item.id}-${issuedAt.getTime()}`;
      const expiresAt = new Date(issuedAt.getTime() + Math.max(1, Number(item.couponExpireDays) || 14) * 24 * 60 * 60 * 1000).toISOString();
      activeScheduledCoupons = activeScheduledCoupons.filter((coupon: any) => coupon.scheduleId !== item.id && new Date(coupon.expiresAt || 0).getTime() >= issuedAt.getTime());
      activeScheduledCoupons.push({
        id: couponId,
        scheduleId: item.id,
        title: item.title,
        body: item.body,
        issuedAt: issuedAt.toISOString(),
        expiresAt,
        sameDayCombinable: item.sameDayCombinable === true,
        loyaltyCountable: item.loyaltyCountable === true,
      });
      await adminDb.collection('shops').doc(doc.id).update({ scheduledCoupons: activeScheduledCoupons });
    }
    totalSent++;
    sendOk = true;
  } catch (err: any) {
    console.error(`[process-scheduled] 送信エラー shop=${doc.id}:`, err);
    errors.push(`${doc.id}: ${err.message}`);
  }

  // 🆕 送信成功時のみ once を削除。失敗時は残して翌日リトライ
  if (item.scheduleType !== 'once') {
    remainingSchedules.push(item);       // 定期は常に残す
  } else if (!sendOk) {
    remainingSchedules.push(item);       // 🆕 once かつ失敗 → 残す
  }
  // once かつ成功 → push しない → 削除される
} else {
  remainingSchedules.push(item);
}
  }

      // リストの差分がある場合のみ更新（無駄な書き込みを回避）
      if (remainingSchedules.length !== scheduledList.length) {
        await adminDb.collection('shops').doc(doc.id).update({
          scheduledList: remainingSchedules,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('予約配信バッチエラー:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
