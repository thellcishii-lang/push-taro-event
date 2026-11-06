// app/api/agency/statements/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let uid: string;
  let isAdmin = false;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    uid = decoded.uid;
    const userRecord = await authAdmin.getUser(uid);
    isAdmin = userRecord.customClaims?.admin === true;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get('agencyId');
    const from = searchParams.get('from'); // 例: 2026-01
    const to = searchParams.get('to');     // 例: 2026-12

    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId が必要です' }, { status: 400 });
    }

    // 権限チェック（代理店本人 or 管理者）
    const agencyDoc = await db.collection('agencies').doc(agencyId).get();
    if (!agencyDoc.exists) {
      return NextResponse.json({ error: '代理店情報が見つかりません' }, { status: 404 });
    }
    const agencyData = agencyDoc.data()!;
    if (agencyData.uid !== uid && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }
    if (!isAdmin && agencyData.status !== 'active') {
      return NextResponse.json({ error: '決済完了後に代理店機能をご利用いただけます' }, { status: 403 });
    }

    // monthly_statements を取得
    const snap = await db.collection('monthly_statements')
      .where('userId', '==', agencyId)
      .where('referrerType', '==', 'agency')
      .get();

    const statements = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        scheduledPayoutMonth: data.scheduledPayoutMonth || '',
        hasInvoice: data.hasInvoice || false,
        totalPayment: data.totalPayment || 0,
        totalBaseReward: data.totalBaseReward || 0,
        withholding: data.withholding || 0,
        totalReward: data.totalReward || 0,
        shops: data.shops || [],
        status: data.status || 'unpaid',
        paidAt: data.paidAt?.toDate?.()?.toISOString() || null,
      };
    });

    // 期間フィルタ
    const filtered = statements.filter((s) => {
      if (from && s.scheduledPayoutMonth < from) return false;
      if (to && s.scheduledPayoutMonth > to) return false;
      return true;
    });

    // 新しい順
    filtered.sort((a, b) => b.scheduledPayoutMonth.localeCompare(a.scheduledPayoutMonth));

    return NextResponse.json({ success: true, statements: filtered });
  } catch (error: any) {
    console.error('[agency/statements] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
