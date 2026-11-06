import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// システム状態を取得
export async function GET(request: Request) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const doc = await db.collection('config').doc('system').get();
    const isCircuitBreakerOpen = doc.exists ? (doc.data()?.isCircuitBreakerOpen || false) : false;
    
    return NextResponse.json({
      success: true,
      isCircuitBreakerOpen,
      updatedAt: doc.data()?.updatedAt || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// システム状態を更新
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const uid = decoded.uid;

    // 管理者チェック
    const userRecord = await authAdmin.getUser(uid);
    if (userRecord.customClaims?.admin !== true) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { isCircuitBreakerOpen } = await request.json();

    await db.collection('config').doc('system').set({
      isCircuitBreakerOpen: !!isCircuitBreakerOpen,
      updatedAt: new Date(),
      updatedBy: uid,
    }, { merge: true });

    return NextResponse.json({
      success: true,
      isCircuitBreakerOpen: !!isCircuitBreakerOpen,
      message: isCircuitBreakerOpen ? 'システムを緊急停止しました' : 'システムを再開しました',
    });
  } catch (error: any) {
    console.error('[system-status] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
