// app/api/affiliate/statements/route.ts
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
    const affiliateId = searchParams.get('affiliateId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!affiliateId) {
      return NextResponse.json({ error: 'affiliateId が必要です' }, { status: 400 });
    }

    // 権限チェック（本人 or 管理者）
    const affDoc = await db.collection('affiliates').doc(affiliateId).get();
    if (!affDoc.exists) {
      return NextResponse.json({ error: 'アフィリエイト情報が見つかりません' }, { status: 404 });
    }
    const affData = affDoc.data()!;
    if (affData.uid !== uid && !isAdmin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // monthly_statements を取得
    const snap = await db.collection('monthly_statements')
      .where('userId', '==', affiliateId)
      .where('referrerType', '==', 'affiliate')
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

    const filtered = statements.filter((s) => {
      if (from && s.scheduledPayoutMonth < from) return false;
      if (to && s.scheduledPayoutMonth > to) return false;
      return true;
    });

    filtered.sort((a, b) => b.scheduledPayoutMonth.localeCompare(a.scheduledPayoutMonth));

    return NextResponse.json({ success: true, statements: filtered });
  } catch (error: any) {
    console.error('[affiliate/statements] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
