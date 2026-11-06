// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let requesterUid: string;
  let isAdmin = false;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    requesterUid = decoded.uid;
    const userRecord = await authAdmin.getUser(requesterUid);
    isAdmin = userRecord.customClaims?.admin === true;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }
 
       // 1. 店舗基本情報の取得
    const shopDoc = await db.collection('shops').doc(shopId).get();

    if (!shopDoc.exists) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    const shopData = shopDoc.data()!;

    if (shopData.ownerUid !== requesterUid && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // 2. subscriptions コレクションから shopIds 配列に shopId が含まれるドキュメントをカウント
    const subscribersSnapshot = await db
      .collection('subscriptions')
      .where('shopIds', 'array-contains', shopId)
      .get();

    return NextResponse.json({
      shop: {
        id: shopId,
        ...shopData,
      },
      stats: {
        subscriberCount: subscribersSnapshot.size, // 正しく12件等が取得されます
        pushCount: shopData?.currentMonthSent || 0,
        currentMonthSent: shopData?.currentMonthSent || 0,
        lastSentMonth: shopData?.lastSentMonth || null,
        status: shopData?.status || 'active',
      },
    });
  } catch (error: any) {
    console.error('[API Admin Dashboard Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
