import { NextResponse } from 'next/server';
import { authenticatePosRequest, isPosAuthError } from '@/lib/pos-api-auth';
import { couponDateEnd, toDate } from '@/lib/redeem-coupon-core';
import { posErrorResponse } from '@/lib/pos-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await authenticatePosRequest(request);
    if (isPosAuthError(auth)) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const shop = auth.shopData;
    const now = Date.now();
    const coupons: Array<{ couponType: string; title: string; couponId?: string }> = [];
    const active = (date: Date | null) => !date || date.getTime() >= now;
    for (const [type, config, fallback] of [
      ['first', shop.coupon, '初回限定クーポン'],
      ['normal', shop.normalCoupon, '通常クーポン'],
      ['loyalty', shop.loyaltyCoupon, '特別達成クーポン'],
      ['repeat', shop.proCoupons?.repeat, '連続クーポン'],
      ['birthday', shop.proCoupons?.birthday, '記念日・お誕生日クーポン'],
      ['dormant', shop.proCoupons?.dormant, '復帰クーポン'],
    ] as const) {
      if (config?.enabled !== true) continue;
      const expiry = config.expiresAt ? couponDateEnd(config.expiresAt)
        : config.expireType === 'date' && config.expireDate ? couponDateEnd(config.expireDate) : null;
      if (active(expiry)) coupons.push({ couponType: type, title: config.title || fallback });
    }
    const stepUp = shop.proCoupons?.stepUp;
    if (stepUp?.enabled === true && stepUp.steps?.some((step: FirebaseFirestore.DocumentData) =>
      active(step.expireType === 'date' && step.expireDate ? couponDateEnd(step.expireDate) : null))) {
      coupons.push({ couponType: 'step-up', title: stepUp.title || 'ステップアップクーポン' });
    }
    if (shop.streakCoupon?.enabled === true) {
      coupons.push({ couponType: 'streak', title: shop.streakCoupon.couponName || '連続ログイン達成クーポン' });
    }
    for (const coupon of shop.scheduledCoupons || []) {
      if (coupon.id && active(toDate(coupon.expiresAt))) {
        coupons.push({ couponType: 'scheduled', couponId: coupon.id, title: coupon.title || '予約クーポン' });
      }
    }
    return NextResponse.json({ coupons }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return posErrorResponse(error);
  }
}
