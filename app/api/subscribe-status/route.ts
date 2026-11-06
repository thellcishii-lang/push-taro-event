// app/api/subscribe-status/route.ts
/**
 * 顧客のクーポン使用状態を返す
 *
 * 参照元: app/subscribe/page.tsx
 *
 * データソース:
 *   subscriptions/{token}.couponUsage[shopId]
 *
 * 認証:
 *   Firebase Auth 不要（顧客は認証されない）
 *   token を知っている人のみが叩ける（実質的な保護）
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { couponDay } from '@/lib/coupon-day';
import { enforceRateLimit } from '@/lib/rate-limit';
import { verifyCustomerSession } from '@/lib/customer-session';
import { createHash } from 'node:crypto';

export const dynamic = 'force-dynamic';

function couponDate(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return couponDate(value.toDate());
  }
  const date = value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

// デフォルト値（既存顧客の遅延マイグレーション用）
const DEFAULT_USAGE = {
  firstCouponUsedAt: null,
  normalCouponUsedAt: null,
  normalCouponUsedCouponId: null,
  normalCouponVisitCount: 0,
  loyaltyCouponAvailable: false,
  lastCouponUsedAt: null,
  totalVisits: 0,
  loyaltyAchieved: false,
  loyaltyAchievedAt: null,
  stepUpIndex: 0,
  repeatCouponActiveUntil: null,
  repeatCouponUsedAt: null,
  dormantNotifiedAt: null,
  dormantCouponUsedAt: null,
  birthdayNotifiedYear: null,
  birthdayCouponUsedYear: null,
  scheduledCouponUsedIds: [],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const token = searchParams.get('token');

    if (!shopId || !token) {
      return NextResponse.json(
        { success: false, error: 'shopId と token が必要です' },
        { status: 400 }
      );
    }

    // セッショントークンを検証（FCMトークンをURLに載せない方式）
    // 後方互換: 旧形式（生のFCMトークン）も許可するが、期限付きセッションを推奨
    const session = verifyCustomerSession(token);
    const fcmToken = session ? session.token : token;

    // 10秒ごとの更新を許容し、署名検証済みの顧客は店舗Wi-Fiでも制限枠を共有しない。
    const rateLimitScope = session
      ? `subscribe-status:${createHash('sha256').update(JSON.stringify([session.shopId, session.token])).digest('hex')}`
      : 'subscribe-status';
    const retryAfter = await enforceRateLimit(request, rateLimitScope, session ? 120 : 20, 10 * 60 * 1000);
    if (retryAfter !== null) {
      return NextResponse.json(
        { success: false, error: 'Too Many Requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    // 署名付きセッション形式（FCMトークンは '.' を含まない）なのに検証できない場合は期限切れとして再発行を促す
    if (!session && token.includes('.')) {
      return NextResponse.json({ success: false, error: 'セッションの有効期限が切れました' }, { status: 401 });
    }

    // セッショントークンの場合は shopId の整合を確認
    if (session && session.shopId !== shopId) {
      return NextResponse.json(
        { success: false, error: '権限がありません' },
        { status: 403 }
      );
    }

    // ─── subscriptions/{token} を取得 ───
    const doc = await db.collection('subscriptions').doc(fcmToken).get();

    if (!doc.exists) {
      // 顧客が未登録 → デフォルト値を返す
      return NextResponse.json({
        success: true,
        firstCouponUsed: false,
        couponUsed: false,
        totalVisits: 0,
        loyaltyAchieved: false,
        stepUpIndex: 0,
        registered: false,
      });
    }

    const data = doc.data()!;
    const shopIds = Array.isArray(data.shopIds) ? data.shopIds : [];
    if (!shopIds.includes(shopId)) {
      return NextResponse.json(
        { success: false, error: 'この購読は指定店舗に紐づいていません' },
        { status: 403 }
      );
    }

    const shopDoc = await db.collection('shops').doc(shopId).get();
    const normalCouponId = shopDoc.data()?.normalCoupon?.couponId || 'legacy';

    // ─── couponUsage[shopId] を取り出す（無ければデフォルト）───
    const usage = data?.couponUsage?.[shopId] || DEFAULT_USAGE;
    const proCoupons = shopDoc.data()?.proCoupons || {};

    // ─── ステップアップ／連続クーポンが再有効化され、キャンペーンIDが変わっていたら進捗をリセット ───
    let stepUpIndex = usage.stepUpIndex || 0;
    let repeatCouponActiveUntilRaw = usage.repeatCouponActiveUntil || null;

    let stepUpIndexUpdatedAt: any = usage.stepUpIndexUpdatedAt || null;
    const stepUpCampaignId = proCoupons.stepUp?.campaignId || null;
    if (stepUpCampaignId && usage.stepUpCampaignId !== stepUpCampaignId) {
      stepUpIndex = 0;
      stepUpIndexUpdatedAt = new Date();
    }

    const repeatCampaignId = proCoupons.repeat?.campaignId || null;
    if (repeatCampaignId && usage.repeatCampaignId !== repeatCampaignId) {
      repeatCouponActiveUntilRaw = null;
    }

    const repeatActiveUntil = repeatCouponActiveUntilRaw?.toDate?.()?.toISOString?.() || repeatCouponActiveUntilRaw || null;
    const stepUpIndexAppearedAt = stepUpIndexUpdatedAt?.toDate?.()?.toISOString?.()
      || (stepUpIndexUpdatedAt instanceof Date ? stepUpIndexUpdatedAt.toISOString() : null)
      || (typeof stepUpIndexUpdatedAt === 'string' ? stepUpIndexUpdatedAt : null);
    const dormantNotifiedAt = usage.dormantNotifiedAt?.toDate?.()?.toISOString?.() || usage.dormantNotifiedAt || null;
    const dormantCouponUsedAt = usage.dormantCouponUsedAt?.toDate?.()?.toISOString?.() || usage.dormantCouponUsedAt || null;
    const currentYear = String(new Date().getFullYear());

    const streakConfig = shopDoc.data()?.streakCoupon || {};
    const streakData = data?.couponUsage?.[shopId]?.streak || {};
    let streakInfo = null;
    if (streakConfig.enabled) {
      const isCurrentCampaign = streakData.campaignId === streakConfig.campaignId;
      streakInfo = {
        enabled: true,
        targetDays: streakConfig.targetDays || 5,
        currentCount: isCurrentCampaign ? (streakData.currentCount || 0) : 0,
        lastStampDate: isCurrentCampaign ? (streakData.lastStampDate || '') : '',
        achieved: isCurrentCampaign ? (streakData.achievedAt != null) : false,
        achievedAt: isCurrentCampaign && streakData.achievedAt ? streakData.achievedAt.toDate().toISOString() : null,
      };
    }
    
    return NextResponse.json({
      success: true,
      registered: true,
      birthMonth: data.birthMonth || null,
      birthDay: data.birthDay || null,
      firstCouponUsed: Boolean(usage.firstCouponUsedAt),
      normalCouponUsed: usage.normalCouponUsedCouponId === normalCouponId ||
        (normalCouponId === 'legacy' && Boolean(usage.normalCouponUsedAt)),
      normalCouponUsedAt: couponDate(usage.normalCouponUsedAt),
      normalCouponVisitCount: usage.normalCouponVisitCount || 0,
      loyaltyCouponAvailable: usage.loyaltyCouponAvailable === true,
      couponUsed: Boolean(usage.firstCouponUsedAt), // 後方互換
      totalVisits: usage.totalVisits || 0,
      loyaltyAchieved: usage.loyaltyAchieved === true,
      loyaltyAchievedAt: usage.loyaltyAchievedAt?.toDate?.()?.toISOString?.() || usage.loyaltyAchievedAt || null,
      stepUpIndex,
      stepUpIndexAppearedAt,
      stepUpEnabled: proCoupons.stepUp?.enabled === true,
      repeatEnabled: proCoupons.repeat?.enabled === true,
      repeatCouponActiveUntil: repeatActiveUntil,
      repeatCouponUsed: Boolean(usage.repeatCouponUsedAt?.toDate?.() && couponDay(usage.repeatCouponUsedAt.toDate()) === couponDay(new Date())),
      birthdayNotifiedYear: usage.birthdayNotifiedYear || null,
      birthdayCouponUsed: String(usage.birthdayCouponUsedYear) === currentYear,
      birthdayCouponUsedAt: couponDate(usage.birthdayCouponUsedAt),
      dormantNotifiedAt,
      dormantCouponUsed: Boolean(dormantCouponUsedAt),
      dormantCouponUsedAt: couponDate(usage.dormantCouponUsedAt),
      scheduledCouponUsedIds: usage.scheduledCouponUsedIds || [],
      scheduledCouponUsedAt: Object.fromEntries(
        Object.entries(usage.scheduledCouponUsedAt || {}).map(([id, value]) => [id, couponDate(value)]),
      ),
      streak: streakInfo, 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[subscribe-status] エラー:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
