// app/api/redeem-coupon/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { redeemCouponCore, RedeemError } from '@/lib/redeem-coupon-core';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // ─── 認証（店舗オーナー）───
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let uid: string;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shopId, token, couponId } = body;
    const rawCouponType = body.couponType;
    const normalizedCouponType = typeof rawCouponType === 'string'
      ? rawCouponType.trim().toLowerCase().replace(/_/g, '-')
      : rawCouponType;
    const couponType = normalizedCouponType === 'stepup' ? 'step-up'
      : normalizedCouponType === 'repeat-coupon' ? 'repeat'
      : normalizedCouponType;

    if (!shopId || !couponType || !token) {
      return NextResponse.json({ error: '無効なQRコードデータです' }, { status: 400 });
    }

    // ─── 店舗所有権チェック ───
    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists || shopDoc.data()?.ownerUid !== uid) {
      return NextResponse.json({ error: '店舗の操作権限がありません' }, { status: 403 });
    }
    const shopData = shopDoc.data()!;

    // ─── 顧客ドキュメント ───
    const usageRef = db.collection('subscriptions').doc(token);
    const usageDoc = await usageRef.get();
    if (!usageDoc.exists) {
      return NextResponse.json(
        { error: '顧客が見つかりません。通知登録が完了しているかご確認ください。' },
        { status: 404 }
      );
    }

    // ─── コア実行 ───
    const result = await redeemCouponCore({
      shopId,
      couponType,
      token,
      couponId,
      shopData,
      usageRef,
      usageData: usageDoc.data()!,
      scannedBy: uid,
    });

    return NextResponse.json({
      success: true,
      couponTitle: result.couponTitle,
      usedAt: result.usedAt,
      ...result.responseExtra,
    });
  } catch (error: any) {
    console.error('[redeem-coupon] エラー:', error);

    // RedeemError → そのまま返す
    if (error instanceof RedeemError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    // 既存のエラーハンドリング（後方互換）
    if (error?.message === 'COUPON_ALREADY_USED') {
      return NextResponse.json(
        { error: '⚠️ この通常クーポンはすでに使用済みです！' },
        { status: 400 }
      );
    }
    if (error?.message === 'REPEAT_COUPON_USED_TODAY') {
      return NextResponse.json({ error: '⚠️ 連続クーポンは1日1回のみ使用できます' }, { status: 400 });
    }
    if (error?.message === 'COUPON_NOT_COMBINABLE_TODAY') {
      return NextResponse.json({ error: '⚠️ このクーポンは、本日使用済みのクーポンと併用できません' }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || '消し込み処理に失敗しました' },
      { status: 500 }
    );
  }
}
