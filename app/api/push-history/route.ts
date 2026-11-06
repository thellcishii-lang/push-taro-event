import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const { uid } = await getAuth().verifyIdToken(authHeader.slice(7));
    const shopId = new URL(request.url).searchParams.get('shopId');
    if (!shopId) return NextResponse.json({ error: 'shopId is required' }, { status: 400 });

    const shop = await db.collection('shops').doc(shopId).get();
    if (!shop.exists || shop.data()?.ownerUid !== uid) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const snapshot = await db.collection('histories').where('shopId', '==', shopId).get();
    const histories = snapshot.docs.map((doc) => {
      const data = doc.data();
      const successCount = Number(data.successCount || 0);
      const deliveredCount = Number(data.deliveredCount || 0);
      const openedCount = Number(data.openedCount || 0);
      return {
        notificationId: data.notificationId || doc.id,
        title: String(data.title || ''),
        body: String(data.body || ''),
        linkUrl: typeof data.linkUrl === 'string' ? data.linkUrl : undefined,
        sentAt: data.sentAt?.toDate?.().toISOString() || null,
        status: data.status === 'success' ? 'success' : data.status === 'error' ? 'error' : 'pending',
        successCount,
        failureCount: Number(data.failureCount || 0),
        deliveredCount,
        openedCount,
        openRate: successCount > 0 ? Math.min(100, (openedCount / successCount) * 100) : null,
      };
    });

    return NextResponse.json({ histories });
  } catch (error) {
    console.error('[push-history] エラー:', error);
    return NextResponse.json({ error: '送信履歴の取得に失敗しました' }, { status: 500 });
  }
}