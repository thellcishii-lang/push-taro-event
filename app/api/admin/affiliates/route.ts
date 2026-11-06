// app/api/admin/affiliates/route.ts
/**
 * アフィリエイト一覧取得（管理者専用）
 * 
 * system-admin の「アフィリエイト一覧」タブが参照
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: Request): Promise<string | null> {
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

export async function GET(request: Request) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const snap = await db.collection('affiliates').get();

    const affiliates = snap.docs.map((doc) => {
      const data = doc.data();

      let createdAtStr: string | null = null;
      if (data.createdAt?.toDate) {
        createdAtStr = data.createdAt.toDate().toISOString();
      }

      return {
        id: doc.id,
        name: data.name || '未設定',
        email: data.email || '',
        referralCode: data.referralCode || '',
        rewardType: data.rewardType || 'recurring',
        totalEarnings: data.totalEarnings || 0,
        unpaidReward: data.unpaidReward || 0,
        hasInvoice: data.hasInvoice === true,
        status: data.status || 'active',
        createdAt: createdAtStr,
      };
    });

    // 登録日の降順
    affiliates.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, affiliates });
  } catch (error: any) {
    console.error('[admin/affiliates] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
