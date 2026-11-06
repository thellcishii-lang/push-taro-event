// app/api/admin/payment-failures/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const FAILURE_STATUSES = ['failure_1', 'failure_2', 'failure_3_stopped', 'recovering', 'canceled'];

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    if (userRecord.customClaims?.admin !== true) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }
  } catch (e) {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const resultShops: any[] = [];
    const seenIds: string[] = [];

    let statusIndex = 0;
    while (statusIndex < FAILURE_STATUSES.length) {
      const status = FAILURE_STATUSES[statusIndex];
      const snap = await db.collection('shops')
        .where('paymentStatus.current', '==', status)
        .get();

      let docIndex = 0;
      while (docIndex < snap.docs.length) {
        const doc = snap.docs[docIndex];
        const data = doc.data();

        if (seenIds.indexOf(doc.id) === -1) {
          let shouldAdd = true;

          if (data.paymentFailureHidden === true) {
            shouldAdd = false;
          }

          if (status === 'canceled' && data.paymentCanceledAt) {
            const canceledAt = data.paymentCanceledAt.toDate
              ? data.paymentCanceledAt.toDate()
              : new Date(data.paymentCanceledAt);
            const daysSince = (Date.now() - canceledAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince > 30) {
              shouldAdd = false;
            }
          }

          if (shouldAdd) {
            seenIds.push(doc.id);

            let lastUpdatedAtStr = null;
            if (data.paymentStatus && data.paymentStatus.lastUpdatedAt && data.paymentStatus.lastUpdatedAt.toDate) {
              lastUpdatedAtStr = data.paymentStatus.lastUpdatedAt.toDate().toISOString();
            }

            let paymentCanceledAtStr = null;
            if (data.paymentCanceledAt && data.paymentCanceledAt.toDate) {
              paymentCanceledAtStr = data.paymentCanceledAt.toDate().toISOString();
            }

            resultShops.push({
              id: doc.id,
              name: data.name || '未設定',
              email: data.email || '',
              plan: data.plan || 'light',
              paymentStatus: (data.paymentStatus && data.paymentStatus.current) || 'normal',
              lastUpdatedAt: lastUpdatedAtStr,
              manualActions: data.manualActions || {},
              paymentCanceledAt: paymentCanceledAtStr,
              referrerId: data.referrerId || null,
              referrerType: data.referrerType || null,
            });
          }
        }

        docIndex = docIndex + 1;
      }

      statusIndex = statusIndex + 1;
    }

    resultShops.sort(function (a, b) {
      const statusOrder: any = {
        'failure_3_stopped': 1,
        'failure_2': 2,
        'failure_1': 3,
        'canceled': 4,
        'recovering': 5,
      };
      const orderA = statusOrder[a.paymentStatus] || 99;
      const orderB = statusOrder[b.paymentStatus] || 99;
      return orderA - orderB;
    });

    return NextResponse.json({ success: true, shops: resultShops });
  } catch (error: any) {
    console.error('[payment-failures] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
