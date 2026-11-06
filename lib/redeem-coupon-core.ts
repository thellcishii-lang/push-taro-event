import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { couponDay } from '@/lib/coupon-day';
import { canCombineWithLastCoupon } from '@/lib/coupon-combination';

export class RedeemError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = 'RedeemError';
  }
}

export const DEFAULT_USAGE = {
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

export function toDate(value: unknown): Date | null {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return toDate(value.toDate());
  }
  const date = value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
}

export function couponDateEnd(value: string): Date {
  return new Date(`${value}T23:59:59.999+09:00`);
}

export interface RedeemCouponParams {
  shopId: string;
  couponType: string;
  token: string;
  couponId?: string;
  shopData: FirebaseFirestore.DocumentData;
  usageRef: FirebaseFirestore.DocumentReference;
  usageData: FirebaseFirestore.DocumentData;
  scannedBy: string;
  dryRun?: boolean;
  posKeyHash?: string;
  idempotency?: {
    ref: FirebaseFirestore.DocumentReference;
    payloadHash: string;
    terminalId: string | null;
  };
}

export interface RedeemCouponResult {
  couponTitle: string;
  usedAt: string;
  responseExtra: Record<string, unknown>;
  idempotent?: boolean;
}

// Usage, loyalty progress, audit history and the retry receipt must commit together.
export async function redeemCouponCore(params: RedeemCouponParams): Promise<RedeemCouponResult> {
  const { shopId, couponType, token, couponId, usageRef, scannedBy, dryRun = false, idempotency } = params;
  let customerPhone = '';
  if (!dryRun && params.usageData.customerUid) {
    try {
      customerPhone = (await authAdmin.getUser(params.usageData.customerUid)).phoneNumber || '';
    } catch (error) {
      console.error('[redeem-coupon-core] 電話番号取得失敗:', error);
    }
  }
  const shopRef = db.collection('shops').doc(shopId);
  const logRef = shopRef.collection('coupon_logs').doc();

  return db.runTransaction(async (transaction) => {
    const receipt = idempotency ? await transaction.get(idempotency.ref) : null;
    const usageDoc = await transaction.get(usageRef);
    const shopDoc = await transaction.get(shopRef);
    if (!shopDoc.exists) throw new RedeemError('SHOP_NOT_FOUND', '店舗が見つかりません', 404);
    const shopData = shopDoc.data()!;
    if (params.posKeyHash && (shopData.plan !== 'pro' || shopData.posApi?.revokedAt ||
      shopData.posApi?.keyHash !== params.posKeyHash)) {
      throw new RedeemError('POS_KEY_INVALID', 'APIキーが失効しています', 401);
    }
    if (receipt?.exists) {
      const saved = receipt.data()!;
      if (saved.qrPayloadHash !== idempotency!.payloadHash) {
        throw new RedeemError('IDEMPOTENCY_CONFLICT', '同じIdempotency-Keyを別のクーポンには使用できません', 409);
      }
      if (saved.result === 'success') {
        return {
          couponTitle: saved.couponTitle, usedAt: saved.redeemedAt,
          responseExtra: saved.responseExtra || {}, idempotent: true,
        };
      }
    }
    if (!usageDoc.exists) throw new RedeemError('CUSTOMER_NOT_FOUND', '顧客が見つかりません', 404);
    const usageData = usageDoc.data()!;
    if (!Array.isArray(usageData.shopIds) || !usageData.shopIds.includes(shopId)) {
      throw new RedeemError('CUSTOMER_SHOP_MISMATCH', 'この顧客は指定店舗に登録されていません', 403);
    }
    const now = new Date();
    const storedUsage = usageData.couponUsage?.[shopId] || DEFAULT_USAGE;
    const stepUpCampaignId = shopData.proCoupons?.stepUp?.campaignId;
    const newStepCampaign = stepUpCampaignId && storedUsage.stepUpCampaignId !== stepUpCampaignId;
    const usage = newStepCampaign ? { ...storedUsage, stepUpIndex: 0 } : storedUsage;
    const updates: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData> = {};
    const setUsage = (field: string, value: unknown) => { updates[`couponUsage.${shopId}.${field}`] = value; };
    const responseExtra: Record<string, unknown> = {};
    let couponTitle = 'クーポン';
    let sameDayCombinable = false;
    let countForLoyalty = false;
    const used = (message = 'このクーポンはすでに使用済みです') => {
      throw new RedeemError('COUPON_ALREADY_USED', message, 400);
    };
    const enabled = (value: unknown) => {
      if (value !== true) throw new RedeemError('COUPON_DISABLED', 'このクーポンは現在無効です', 400);
    };
    const checkExpiry = (date: Date | null) => {
      if (date && date.getTime() < now.getTime()) {
        throw new RedeemError('COUPON_EXPIRED', 'このクーポンは有効期限切れです', 400);
      }
    };
    const checkConfiguredExpiry = (config: FirebaseFirestore.DocumentData, appearedAt: unknown, defaultDays = 1) => {
      if (config.expireType === 'date' && config.expireDate) checkExpiry(couponDateEnd(config.expireDate));
      const appeared = toDate(appearedAt);
      if (config.expireType === 'days' && appeared) {
        checkExpiry(new Date(appeared.getTime() + Math.max(1, Number(config.expireDays) || defaultDays) * 86_400_000));
      }
    };

    if (couponType === 'first') {
      enabled(shopData.coupon?.enabled);
      couponTitle = shopData.coupon.title || '初回限定クーポン';
      if (usage.firstCouponUsedAt) used('⚠️ この初回限定クーポンはすでに使用済みです！');
      if (shopData.coupon.expiresAt) checkExpiry(couponDateEnd(shopData.coupon.expiresAt));
      sameDayCombinable = true;
      setUsage('firstCouponUsedAt', FieldValue.serverTimestamp());
    } else if (couponType === 'normal') {
      enabled(shopData.normalCoupon?.enabled);
      couponTitle = shopData.normalCoupon.title || '通常クーポン';
      const normalId = shopData.normalCoupon.couponId || 'legacy';
      if (usage.normalCouponUsedCouponId === normalId || (normalId === 'legacy' && usage.normalCouponUsedAt)) {
        used('⚠️ この通常クーポンはすでに使用済みです！');
      }
      if (shopData.normalCoupon.expiresAt) checkExpiry(couponDateEnd(shopData.normalCoupon.expiresAt));
      sameDayCombinable = true;
      setUsage('normalCouponUsedAt', FieldValue.serverTimestamp());
      setUsage('normalCouponUsedCouponId', normalId);
      countForLoyalty = true;
    } else if (couponType === 'loyalty') {
      const loyalty = shopData.loyaltyCoupon || {};
      enabled(loyalty.enabled);
      couponTitle = loyalty.title || '特別達成クーポン';
      if (!usage.loyaltyCouponAvailable) throw new RedeemError('COUPON_NOT_AVAILABLE', 'この特別達成クーポンはまだ利用できません', 400);
      checkConfiguredExpiry(loyalty, usage.loyaltyAchievedAt);
      sameDayCombinable = loyalty.combinable === true;
      setUsage('loyaltyCouponAvailable', false);
      setUsage('loyaltyAchieved', loyalty.repeatEnabled !== true);
      setUsage('loyaltyAchievedAt', FieldValue.serverTimestamp());
    } else if (couponType === 'step-up') {
      const stepUp = shopData.proCoupons?.stepUp || {};
      enabled(stepUp.enabled);
      const index = usage.stepUpIndex || 0;
      const steps = stepUp.steps || [];
      const step = steps[index];
      if (!step) throw new RedeemError('COUPON_COMPLETED', '全てのステップを達成済みです', 400);
      couponTitle = step.title || `ステップ${index + 1}`;
      checkConfiguredExpiry(step, newStepCampaign ? null : usage.stepUpIndexUpdatedAt);
      sameDayCombinable = step.sameDayCombinable === true;
      countForLoyalty = step.loyaltyCountable ?? step.combinable === true;
      setUsage('stepUpIndex', index + 1);
      if (stepUpCampaignId) setUsage('stepUpCampaignId', stepUpCampaignId);
      setUsage('stepUpIndexUpdatedAt', FieldValue.serverTimestamp());
      if (steps[index + 1]) responseExtra.nextStep = { title: steps[index + 1].title || `ステップ${index + 2}`, index: index + 2 };
      else responseExtra.allStepsCompleted = true;
    } else if (couponType === 'repeat') {
      const repeat = shopData.proCoupons?.repeat || {};
      enabled(repeat.enabled);
      couponTitle = repeat.title || '連続クーポン';
      const lastUsed = toDate(usage.repeatCouponUsedAt);
      if (lastUsed && couponDay(lastUsed) === couponDay(now)) used('⚠️ 連続クーポンは1日1回のみ使用できます');
      const expireType = repeat.expireType || 'days';
      let activeUntil: Date | null = null;
      if (expireType === 'date') {
        if (!repeat.expireDate) throw new RedeemError('COUPON_NOT_AVAILABLE', '連続クーポンの有効期限が設定されていません', 400);
        activeUntil = couponDateEnd(repeat.expireDate);
        checkExpiry(activeUntil);
      } else if (expireType === 'days') {
        const sameCampaign = !repeat.campaignId || usage.repeatCampaignId === repeat.campaignId;
        if (sameCampaign) checkExpiry(toDate(usage.repeatCouponActiveUntil));
        activeUntil = new Date(now.getTime() + Math.max(1, Number(repeat.expireDays) || 14) * 86_400_000);
      }
      sameDayCombinable = repeat.sameDayCombinable === true;
      countForLoyalty = repeat.loyaltyCountable ?? repeat.combinable === true;
      if (repeat.campaignId) setUsage('repeatCampaignId', repeat.campaignId);
      setUsage('repeatCouponActiveUntil', activeUntil);
      setUsage('repeatCouponUsedAt', FieldValue.serverTimestamp());
      responseExtra.nextRepeatCouponUntil = activeUntil?.toISOString() || null;
    } else if (couponType === 'birthday') {
      const birthday = shopData.proCoupons?.birthday || {};
      enabled(birthday.enabled);
      couponTitle = birthday.title || '記念日、お誕生日クーポン';
      const year = String(now.getFullYear());
      if (String(usage.birthdayNotifiedYear) !== year) throw new RedeemError('COUPON_NOT_AVAILABLE', 'このお誕生日クーポンは現在利用できません', 400);
      if (String(usage.birthdayCouponUsedYear) === year) used('⚠️ このお誕生日クーポンはすでに使用済みです！');
      sameDayCombinable = birthday.sameDayCombinable === true;
      countForLoyalty = birthday.loyaltyCountable ?? birthday.combinable === true;
      setUsage('birthdayCouponUsedYear', year);
      setUsage('birthdayCouponUsedAt', FieldValue.serverTimestamp());
    } else if (couponType === 'dormant') {
      const dormant = shopData.proCoupons?.dormant || {};
      enabled(dormant.enabled);
      couponTitle = dormant.title || '復帰クーポン';
      if (!usage.dormantNotifiedAt) throw new RedeemError('COUPON_NOT_AVAILABLE', 'この休眠復活クーポンは現在利用できません', 400);
      if (usage.dormantCouponUsedAt) used('⚠️ この休眠復活クーポンはすでに使用済みです！');
      checkConfiguredExpiry({ ...dormant, expireType: 'days' }, usage.dormantNotifiedAt, 14);
      sameDayCombinable = dormant.sameDayCombinable === true;
      countForLoyalty = dormant.loyaltyCountable ?? dormant.combinable === true;
      setUsage('dormantCouponUsedAt', FieldValue.serverTimestamp());
    } else if (couponType === 'scheduled') {
      const scheduled = (shopData.scheduledCoupons || []).find((c: FirebaseFirestore.DocumentData) => c.id === couponId);
      if (!scheduled) throw new RedeemError('COUPON_NOT_FOUND', 'この予約クーポンは見つかりません', 404);
      couponTitle = scheduled.title || '予約クーポン';
      if (scheduled.expiresAt) checkExpiry(toDate(scheduled.expiresAt));
      if ((usage.scheduledCouponUsedIds || []).includes(couponId)) used('この予約クーポンは使用済みです');
      sameDayCombinable = scheduled.sameDayCombinable === true;
      countForLoyalty = scheduled.loyaltyCountable === true;
      setUsage('scheduledCouponUsedIds', FieldValue.arrayUnion(couponId));
      setUsage(`scheduledCouponUsedAt.${couponId}`, FieldValue.serverTimestamp());
       } else if (couponType === 'streak') {
      const streak = shopData.streakCoupon || {};
      enabled(streak.enabled);
      couponTitle = streak.couponName || '連続ログイン達成クーポン';
      
      const streakData = usage.streak || {};
      if (!streakData.achievedAt || streakData.campaignId !== streak.campaignId) {
        throw new RedeemError('COUPON_NOT_AVAILABLE', 'この連続ログインクーポンはまだ利用できません', 400);
      }
      if (streakData.streakUsedAt) {
        used('⚠️ この連続ログインクーポンはすでに使用済みです！');
      }
      
      sameDayCombinable = streak.sameDayCombinable === true;
      countForLoyalty = streak.loyaltyCountable === true;
      
      // 使用済みにして、カウントを1（または0）にリセット
      setUsage('streak.streakUsedAt', FieldValue.serverTimestamp());
      setUsage('streak.currentCount', 0);
      setUsage('streak.achievedAt', null);
    } else {
      throw new RedeemError('COUPON_UNKNOWN_TYPE', `未対応のクーポンタイプです: ${couponType}`, 400);
    }

    if (!canCombineWithLastCoupon(toDate(usage.lastCouponUsedAt), usage.lastCouponSameDayCombinable, sameDayCombinable, now)) {
      throw new RedeemError('COUPON_NOT_COMBINABLE_TODAY', '⚠️ このクーポンは、本日使用済みのクーポンと併用できません', 400);
    }
    if (couponType === 'normal' || (countForLoyalty && shopData.loyaltyCoupon?.enabled === true)) {
      const nextCount = Number(usage.normalCouponVisitCount || 0) + 1;
      const target = Number(shopData.loyaltyCoupon?.targetCount || 0);
      const unlocked = shopData.loyaltyCoupon?.enabled === true && target > 0 && nextCount >= target &&
        (couponType === 'normal' || shopData.loyaltyCoupon.repeatEnabled === true || usage.loyaltyAchieved !== true);
      setUsage('normalCouponVisitCount', unlocked ? 0 : nextCount);
      setUsage('loyaltyCouponAvailable', unlocked || usage.loyaltyCouponAvailable === true);
      if (unlocked) {
        setUsage('loyaltyAchievedAt', FieldValue.serverTimestamp());
        responseExtra.loyaltyUnlocked = true;
      }
    }
    const result: RedeemCouponResult = { couponTitle, usedAt: now.toISOString(), responseExtra };
    if (dryRun) return result;
    setUsage('lastCouponUsedAt', FieldValue.serverTimestamp());
    setUsage('lastCouponSameDayCombinable', sameDayCombinable);
    setUsage('totalVisits', FieldValue.increment(1));
    transaction.update(usageRef, updates);
    transaction.set(logRef, {
      couponType, couponTitle, userToken: token, customerUid: usageData.customerUid || null,
      customerPhone, usedAt: FieldValue.serverTimestamp(), scannedBy,
    });
    if (idempotency) {
      transaction.set(idempotency.ref, {
        shopId, terminalId: idempotency.terminalId, action: 'redeem', result: 'success',
        couponTitle, couponType, qrPayloadHash: idempotency.payloadHash,
        redeemedAt: result.usedAt, responseExtra, createdAt: FieldValue.serverTimestamp(),
      });
    }
    return result;
  });
}
