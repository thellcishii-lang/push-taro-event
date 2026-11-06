import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin';
import { enqueuePushJob } from '@/lib/push-job';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await getAuth().verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '無効な認証トークンです' }, { status: 401 });
  }

  try {
    const { shopId: requestedShopId, title, body, url } = await request.json();
    if (!title || !body) {
      return NextResponse.json({ error: 'タイトルと本文は必須です' }, { status: 400 });
    }

    const shopQuery = requestedShopId
      ? await db.collection('shops').where('ownerUid', '==', uid).where('__name__', '==', requestedShopId).limit(1).get()
      : await db.collection('shops').where('ownerUid', '==', uid).limit(1).get();
    if (shopQuery.empty) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 403 });
    }

    const shopId = shopQuery.docs[0].id;
    const notificationId = crypto.randomUUID();
    const jobId = await enqueuePushJob({
      shopId,
      ownerUid: uid,
      title: String(title),
      body: String(body),
      url: url ? String(url) : undefined,
      notificationId,
    });

    return NextResponse.json({
      success: true,
      queued: true,
      status: 'queued',
      jobId,
      notificationId,
      message: '送信を受け付けました。バックグラウンドで配信します。',
    }, { status: 202 });
  } catch (error: any) {
    console.error('[send-push] キュー登録エラー:', error);
    return NextResponse.json({ error: error.message || '送信受付に失敗しました' }, { status: 409 });
  }
}
