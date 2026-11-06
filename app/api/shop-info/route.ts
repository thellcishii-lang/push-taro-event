// app/api/shop-info/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';
import { verifyPrintToken } from '../../../lib/print-token';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get('s') || searchParams.get('shopId') || searchParams.get('shopid');

  if (!shopId || shopId === 'undefined' || shopId === 'null' || shopId.trim() === '') {
    return NextResponse.json(
      { success: false, error: 'URLパラメータ（?s=店舗ID）が正しく渡されていません' },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const cleanId = shopId.trim();
    const doc = await db.collection('shops').doc(cleanId).get();

    if (!doc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: `店舗ID [${cleanId}] はFirestoreに存在しません。admin画面で店舗作成を完了させてください。`,
        },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } }
      );
    }

        const data = doc.data();

    // 申込書印刷用の機密情報（口座・住所等）は、署名付きトークンを
    // 持つリクエスト（申込受付メールのリンク経由）にのみ返す。
    // shopId 単体では公開情報のみ返却し、機密情報の漏洩を防ぐ。
    const includeSensitive = verifyPrintToken('shop', cleanId, searchParams.get('token'));

    const payload: Record<string, any> = {
      success: true,
      shopId: doc.id,
      name: data?.name || '登録店舗',
      status: data?.status || 'pending_payment',

      // ── クーポン情報（全種別）──
      coupon: data?.coupon || null,
      normalCoupon: data?.normalCoupon || null,
      loyaltyCoupon: data?.loyaltyCoupon || null,
      proCoupons: data?.proCoupons || null,
      streakCoupon: data?.streakCoupon || null,
      scheduledCoupons: data?.scheduledCoupons || [],

      // ── アップグレード状態 ──
      upgradeStatus: data?.upgradeStatus || null,
      upgradeTargetPlan: data?.upgradeTargetPlan || data?.targetPlan || null,
      targetPlan: data?.upgradeTargetPlan || data?.targetPlan || null,

      // ── その他 ──
      linkUrl: data?.linkUrl || '',
      iconUrl: data?.iconUrl || '',
      plan: data?.plan || 'free',
    };

    if (includeSensitive) {
      payload.email = data?.email || '';
      payload.address = data?.address || '';
      payload.phone = data?.phone || '';
      payload.invoiceNumber = data?.invoiceNumber || '';
      payload.bankAccount = data?.bankAccount || null;
    }

    return NextResponse.json(payload, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });

  } catch (error: any) {
    console.error('[shop-info] エラー:', error);
    return NextResponse.json(
      { success: false, error: `サーバー内部エラー: ${error.message}` },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } }
    );
  }
}
