import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { authenticatePosRequest, isPosAuthError } from '@/lib/pos-api-auth';
import { redeemCouponCore, RedeemError } from '@/lib/redeem-coupon-core';

const couponTypes = new Set(['first', 'normal', 'loyalty', 'step-up', 'repeat', 'birthday', 'dormant', 'scheduled', 'streak']);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function documentId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Buffer.byteLength(value) <= 1500 &&
    !value.includes('/') && value !== '.' && value !== '..';
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parsePosPayload(body: unknown) {
  if (!object(body) || typeof body.qrPayload !== 'string' || body.qrPayload.length > 16_384) {
    throw new RedeemError('INVALID_PAYLOAD', 'qrPayload にQRコードのJSON文字列を指定してください', 400);
  }
  let parsed: unknown;
  try { parsed = JSON.parse(body.qrPayload); } catch {
    throw new RedeemError('INVALID_PAYLOAD', 'qrPayload の形式が正しくありません', 400);
  }
  if (!object(parsed) || !documentId(parsed.shopId) || !documentId(parsed.token) || typeof parsed.couponType !== 'string') {
    throw new RedeemError('INVALID_PAYLOAD', 'QRコードの内容が不足または不正です', 400);
  }
  const normalized = parsed.couponType.trim().toLowerCase().replace(/_/g, '-');
  const couponType = normalized === 'stepup' ? 'step-up' : normalized === 'repeat-coupon' ? 'repeat' : normalized;
  if (!couponTypes.has(couponType) || (parsed.couponId !== undefined && !documentId(parsed.couponId)) ||
    (couponType === 'scheduled' && !documentId(parsed.couponId))) {
    throw new RedeemError('INVALID_COUPON', 'クーポン種別またはクーポンIDが不正です', 400);
  }
  const couponId = typeof parsed.couponId === 'string' ? parsed.couponId : undefined;
  return { shopId: parsed.shopId, token: parsed.token, couponType, couponId };
}

export function posErrorResponse(error: unknown, dryRun = false) {
  if (error instanceof RedeemError) {
    const status = error.code === 'COUPON_ALREADY_USED' || error.code === 'COUPON_NOT_COMBINABLE_TODAY' ? 409
      : error.code === 'COUPON_EXPIRED' ? 410 : error.status;
    return NextResponse.json(
      { ...(dryRun ? { valid: false } : {}), error: error.message, code: error.code },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  console.error('[pos-api] リクエスト処理失敗:', error);
  return NextResponse.json({ ...(dryRun ? { valid: false } : {}), error: 'POS APIの処理に失敗しました' }, { status: 500 });
}

export async function handlePosCoupon(request: Request, dryRun: boolean) {
  try {
    const auth = await authenticatePosRequest(request);
    if (isPosAuthError(auth)) {
      return NextResponse.json({ ...(dryRun ? { valid: false } : {}), error: auth.error }, { status: auth.status });
    }
    let body: unknown;
    try { body = await request.json(); } catch {
      throw new RedeemError('INVALID_JSON', 'JSON形式のリクエストを指定してください', 400);
    }
    const payload = parsePosPayload(body);
    if (payload.shopId !== auth.shopId) {
      throw new RedeemError('SHOP_MISMATCH', 'QRコードの店舗とAPIキーの店舗が一致しません', 403);
    }
    const key = request.headers.get('Idempotency-Key');
    if (!dryRun && (!key || !uuidPattern.test(key))) {
      throw new RedeemError('INVALID_IDEMPOTENCY_KEY', 'Idempotency-Key にUUIDを指定してください', 400);
    }
    const usageRef = db.collection('subscriptions').doc(payload.token);
    const usageDoc = await usageRef.get();
    if (!usageDoc.exists) throw new RedeemError('CUSTOMER_NOT_FOUND', '顧客が見つかりません', 404);
    const result = await redeemCouponCore({
      ...payload, usageRef, usageData: usageDoc.data()!, shopData: auth.shopData,
      scannedBy: `pos:${auth.terminalId || 'unknown'}`, dryRun,
      posKeyHash: auth.shopData.posApi.keyHash,
      ...(!dryRun ? {
        idempotency: {
          ref: db.collection('pos_api_logs').doc(`${auth.shopId}_${key!.toLowerCase()}`),
          payloadHash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
          terminalId: auth.terminalId,
        },
      } : {}),
    });
    return NextResponse.json(dryRun ? {
      valid: true, couponTitle: result.couponTitle, couponType: payload.couponType,
    } : {
      success: true, couponTitle: result.couponTitle, redeemedAt: result.usedAt,
      ...result.responseExtra, ...(result.idempotent ? { idempotent: true } : {}),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return posErrorResponse(error, dryRun);
  }
}
