// app/api/admin/pro-referrers/route.ts
/**
 * PRO紹介者（紹介実績のあるPRO店舗）一覧取得（管理者専用）
 *
 * system-admin の「PRO紹介店舗支払い履歴」タブが参照
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
    const relSnap = await db.collection('referral_relations')
      .where('referrerType', '==', 'pro')
      .get();

    const referrerIds = Array.from(new Set(relSnap.docs.map((doc) => doc.data().referrerId).filter(Boolean)));

    const referrers = await Promise.all(referrerIds.map(async (shopId) => {
      const shopDoc = await db.collection('shops').doc(shopId).get();
      if (!shopDoc.exists) return null;
      const data = shopDoc.data()!;
      return {
        id: shopId,
        name: data.name || '未設定',
        email: data.email || '',
        totalEarnings: data.totalEarnings || 0,
        unpaidReward: data.unpaidRewardTotal || 0,
        hasInvoice: !!(data.invoiceNumber && String(data.invoiceNumber).trim() !== ''),
      };
    }));

    const list = referrers.filter((r): r is NonNullable<typeof r> => r !== null);
    list.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

    return NextResponse.json({ success: true, referrers: list });
  } catch (error: any) {
    console.error('[admin/pro-referrers] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
