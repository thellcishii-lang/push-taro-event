import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    return userRecord.customClaims?.admin === true ? decoded.uid : null;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

// 一覧取得
export async function GET(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const snapshot = await db.collection('error_logs')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        source: data.source,
        message: data.message,
        stack: data.stack,
        userId: data.userId,
        shopId: data.shopId,
        details: data.details,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('[error-logs] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 全削除
export async function DELETE(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const snapshot = await db.collection('error_logs').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return NextResponse.json({ success: true, deleted: snapshot.size });
  } catch (error: any) {
    console.error('[error-logs] 削除エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
