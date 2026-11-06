// app/api/admin/affilishops/route.ts
/**
 * affilishop 一覧取得（管理者専用）
 *
 * system-admin の「affilishop一覧 & 審査」タブが参照
 * 却下された申請も記録として含めて返す
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
    const snap = await db.collection('affilishops').get();

    const affilishops = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        companyName: data.companyName || null,
        ownerName: data.ownerName || '未設定',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        businessType: data.businessType || 'corporation',
        invoiceNumber: data.invoiceNumber || null,
        referralCode: data.referralCode || '',
        status: data.status || 'pending_approval',
        rejectReason: data.rejectReason || '',
        unpaidRewardTotal: data.unpaidRewardTotal || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        approvedAt: data.approvedAt?.toDate?.()?.toISOString() || null,
        rejectedAt: data.rejectedAt?.toDate?.()?.toISOString() || null,
      };
    });

    affilishops.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, affilishops });
  } catch (error: any) {
    console.error('[admin/affilishops] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
