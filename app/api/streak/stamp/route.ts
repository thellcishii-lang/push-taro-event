// app/api/streak/stamp/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { couponDay } from '@/lib/coupon-day';
import { verifyCustomerSession } from '@/lib/customer-session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { shopId, token } = await request.json();
    if (!shopId || !token) {
      return NextResponse.json({ error: 'shopId と token が必要です' }, { status: 400 });
    }

    // セッショントークン検証
    const session = verifyCustomerSession(token);
    const fcmToken = session ? session.token : token;
    if (session && session.shopId !== shopId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    
    const shopData = shopDoc.data()!;
    const streakConfig = shopData.streakCoupon;
    if (!streakConfig || streakConfig.enabled !== true) {
      return NextResponse.json({ error: '連続ログイン特典は現在実施していません' }, { status: 400 });
    }

    const targetDays = Number(streakConfig.targetDays || 5);
    const campaignId = streakConfig.campaignId;
    const today = couponDay(new Date());

    const usageRef = db.collection('subscriptions').doc(fcmToken);
    
    // トランザクションで日付チェックとカウントアップ
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(usageRef);
      if (!doc.exists) throw new Error('顧客が見つかりません');
      
      const data = doc.data()!;
      const currentStreak = data.couponUsage?.[shopId]?.streak || {};
      
      // キャンペーンIDが変わっていたらリセット
      const isNewCampaign = currentStreak.campaignId !== campaignId;
      const currentCount = isNewCampaign ? 0 : (currentStreak.currentCount || 0);
      const lastStampDate = isNewCampaign ? '' : (currentStreak.lastStampDate || '');

      if (lastStampDate === today) {
        throw new Error('ALREADY_STAMPED');
      }

      // 昨日の日付を計算
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = couponDay(yesterday);

      let nextCount = 1;
      if (lastStampDate === yesterdayStr) {
        nextCount = currentCount + 1;
      }

      const achieved = nextCount >= targetDays;

      const updateData: Record<string, any> = {
        [`couponUsage.${shopId}.streak.currentCount`]: nextCount,
        [`couponUsage.${shopId}.streak.lastStampDate`]: today,
        [`couponUsage.${shopId}.streak.campaignId`]: campaignId,
      };

      // 新キャンペーン開始時は旧キャンペーンの達成・使用状態を引き継がない
      if (isNewCampaign) {
        updateData[`couponUsage.${shopId}.streak.achievedAt`] = null;
        updateData[`couponUsage.${shopId}.streak.streakUsedAt`] = null;
      }

      if (achieved) {
        updateData[`couponUsage.${shopId}.streak.achievedAt`] = FieldValue.serverTimestamp();
        updateData[`couponUsage.${shopId}.streak.streakUsedAt`] = null;
      }

      transaction.update(usageRef, updateData);
      return { nextCount, achieved, targetDays };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error.message === 'ALREADY_STAMPED') {
      return NextResponse.json({ error: '本日はすでにスタンプを押しています' }, { status: 409 });
    }
    console.error('[streak/stamp] エラー:', error);
    return NextResponse.json({ error: error.message || 'スタンプの処理に失敗しました' }, { status: 500 });
  }
}
