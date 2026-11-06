// app/api/partner-info/route.ts
/**
 * 代理店 / アフィリエイト / affilishop の情報を返す（認証不要）
 *
 * 用途: /print/application が、メール経由で開かれた際にデータを取得する
 * 参照: /api/shop-info（店舗用、既存）
 *
 * クエリ:
 *   type: 'agency' | 'affiliate' | 'affilishop'
 *   id:   各コレクションのドキュメントID
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { verifyPrintToken } from '@/lib/print-token';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['agency', 'affiliate', 'affilishop'] as const;
type PartnerType = typeof VALID_TYPES[number];

const COLLECTION_BY_TYPE: Record<PartnerType, string> = {
  agency: 'agencies',
  affiliate: 'affiliates',
  affilishop: 'affilishops',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as PartnerType | null;
  const id = searchParams.get('id');

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { success: false, error: `type は ${VALID_TYPES.join(' / ')} のいずれかが必要です` },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
    return NextResponse.json(
      { success: false, error: 'id パラメータが必要です' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 口座情報等の機密情報を含むため、申込受付メールのリンクに付与される
  // 署名付きトークンを必須とする（ID を知っているだけでは取得不可）
  if (!verifyPrintToken(type, id.trim(), searchParams.get('token'))) {
    return NextResponse.json(
      { success: false, error: 'アクセス権限がありません。お申し込み時のメールに記載されたリンクからアクセスしてください。' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const collection = COLLECTION_BY_TYPE[type];
    const doc = await db.collection(collection).doc(id.trim()).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: `${collection}/${id} が見つかりません` },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const data = doc.data()!;

    // print/application が必要とするフィールドに絞って返す
    const payload = {
      companyName: data.companyName || '',
      ownerName: data.ownerName || '',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      businessType: data.businessType || 'corporation',
      invoiceNumber: data.invoiceNumber || '',
      bankAccount: data.bankAccount || null,
      rewardType: data.rewardType || null,        // affiliate 用
      referralCode: data.referralCode || '',
      plan: data.plan || null,                    // 将来拡張用
    };

    return NextResponse.json(
      { success: true, type, data: payload },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('[partner-info] エラー:', error);
    return NextResponse.json(
      { success: false, error: `サーバー内部エラー: ${error.message}` },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
