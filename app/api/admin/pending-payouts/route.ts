// app/api/admin/pending-payouts/route.ts
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

export async function GET(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const pendingUsers: any[] = [];

    // ============================================================
    // ① 代理店（agencies）
    // ============================================================
    const agenciesSnap = await db.collection('agencies')
      .where('unpaidRewardTotal', '>', 0)
      .get();

    agenciesSnap.docs.forEach((doc) => {
      const data = doc.data();
      pendingUsers.push({
        id: doc.id,                       // ← Auth UID
        collection: 'agencies',           // ← 修正
        referrerType: 'agency',
        name: data.companyName || data.ownerName || '未設定',
        email: data.email || '',
        type: '代理店',
        unpaidReward: data.unpaidRewardTotal || 0,
        payoutStatus: data.payoutStatus || 'none',
        bankAccount: data.bankAccount || null,
        lastPaidAt: data.lastPaidAt?.toDate?.()?.toISOString() || null,
      });
    });

    // ============================================================
    // ② PRO（shops で plan='pro'）
    // ============================================================
    const proShopsSnap = await db.collection('shops')
      .where('unpaidRewardTotal', '>', 0)
      .where('plan', '==', 'pro')
      .get();

    proShopsSnap.docs.forEach((doc) => {
      const data = doc.data();
      pendingUsers.push({
        id: doc.id,                       // ← shopId
        collection: 'shops',
        referrerType: 'pro',
        name: data.name || '未設定',
        email: data.email || '',
        type: 'PRO紹介者',
        unpaidReward: data.unpaidRewardTotal || 0,
        payoutStatus: data.payoutStatus || 'none',
        bankAccount: data.bankAccount || null,
        lastPaidAt: data.lastPaidAt?.toDate?.()?.toISOString() || null,
      });
    });

    // ============================================================
    // ③ アフィリエイト（affiliates）
    // ============================================================
    const affiliatesSnap = await db.collection('affiliates')
      .where('unpaidReward', '>', 0)
      .get();

    affiliatesSnap.docs.forEach((doc) => {
      const data = doc.data();
      pendingUsers.push({
        id: doc.id,                       // ← docId
        collection: 'affiliates',
        referrerType: 'affiliate',
        name: data.name || '未設定',
        email: data.email || '',
        type: 'アフィリエイト',
        unpaidReward: data.unpaidReward || 0,
        payoutStatus: data.payoutStatus || 'none',
        bankAccount: data.bankAccount || null,
        lastPaidAt: data.lastPaidAt?.toDate?.()?.toISOString() || null,
      });
    });

    // ============================================================
    // ④ affilishop（実店舗向けアフィリエイト）
    // ============================================================
    const affilishopsSnap = await db.collection('affilishops')
      .where('unpaidRewardTotal', '>', 0)
      .get();

    affilishopsSnap.docs.forEach((doc) => {
      const data = doc.data();
      pendingUsers.push({
        id: doc.id,                       // ← docId
        collection: 'affilishops',
        referrerType: 'affilishop',
        name: data.companyName || data.ownerName || '未設定',
        email: data.email || '',
        type: 'affilishop',
        unpaidReward: data.unpaidRewardTotal || 0,
        payoutStatus: data.payoutStatus || 'none',
        bankAccount: data.bankAccount || null,
        lastPaidAt: data.lastPaidAt?.toDate?.()?.toISOString() || null,
      });
    });

    // 未払い額の降順
    pendingUsers.sort((a, b) => b.unpaidReward - a.unpaidReward);

    return NextResponse.json({ success: true, users: pendingUsers });
  } catch (error: any) {
    console.error('[pending-payouts] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
