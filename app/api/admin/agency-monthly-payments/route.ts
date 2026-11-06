// app/api/admin/agency-monthly-payments/route.ts
/**
 * 代理店の月額決済状況一覧
 * 
 * 月額決済が失敗・停止中の代理店を返す
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    if (userRecord.customClaims?.admin !== true) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const agenciesSnap = await db.collection('agencies').get();

    const agencies: any[] = [];

    agenciesSnap.docs.forEach((doc) => {
      const data = doc.data();
      const monthlyStatus = data?.monthlyPayment?.status;

      // active 以外（pending / failed / suspended）の代理店のみ抽出
      if (monthlyStatus === 'active') return;

      // まだ加盟金決済も完了していない（承認後の初期状態）は除外
      if (data.status === 'pending_approval') return;

      let lastPaidAtStr = null;
      if (data.monthlyPayment?.lastPaidAt?.toDate) {
        lastPaidAtStr = data.monthlyPayment.lastPaidAt.toDate().toISOString();
      }

      let lastFailedAtStr = null;
      if (data.monthlyPayment?.lastFailedAt?.toDate) {
        lastFailedAtStr = data.monthlyPayment.lastFailedAt.toDate().toISOString();
      }

      let approvedAtStr = null;
      if (data.approvedAt?.toDate) {
        approvedAtStr = data.approvedAt.toDate().toISOString();
      }

      agencies.push({
        id: doc.id,
        companyName: data.companyName || '',
        ownerName: data.ownerName || '',
        email: data.email || '',
        phone: data.phone || '',
        referralCode: data.referralCode || '',
        status: data.status || 'pending_approval',
        monthlyStatus: monthlyStatus || 'pending',
        failedCount: data.monthlyPayment?.failedCount || 0,
        lastPaidAt: lastPaidAtStr,
        lastFailedAt: lastFailedAtStr,
        approvedAt: approvedAtStr,
      });
    });

    // 失敗回数の降順でソート
    agencies.sort((a, b) => b.failedCount - a.failedCount);

    return NextResponse.json({ success: true, agencies });
  } catch (error: any) {
    console.error('[agency-monthly-payments] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
