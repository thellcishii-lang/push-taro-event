// app/api/admin/payouts/route.ts
/**
 * 月別の支払い対象一覧
 * 
 * クエリパラメータ:
 *   month: '2026-10' （省略時は今月）
 * 
 * 返却:
 *   該当月に支払い予定の紹介者一覧 + 各者の明細
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
    const { searchParams } = new URL(request.url);
    let targetMonth = searchParams.get('month');

    // デフォルトは今月
    if (!targetMonth) {
      const now = new Date();
      targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // 該当月に支払い予定の monthly_rewards を取得
    const rewardsSnap = await db.collection('monthly_rewards')
      .where('scheduledPayoutMonth', '==', targetMonth)
      .get();

    // ユーザーごとに集計
    const userMap = new Map<string, {
      userId: string;
      referrerType: string;
      items: Array<{
        id: string;
        sourceShopName: string;
        billingMonth: string;
        amount: number;
        status: string;
      }>;
      totalAmount: number;
      unpaidAmount: number;
      allPaid: boolean;
    }>();

    rewardsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;
      const referrerType = data.referrerType || 'pro';
      const key = `${referrerType}_${userId}`;

      if (!userMap.has(key)) {
        userMap.set(key, {
          userId,
          referrerType,
          items: [],
          totalAmount: 0,
          unpaidAmount: 0,
          allPaid: true,
        });
      }

      const entry = userMap.get(key)!;
      entry.items.push({
        id: doc.id,
        sourceShopName: data.sourceShopName || '不明',
        billingMonth: data.billingMonth || '',
        amount: data.amount || 0,
        status: data.status || 'unpaid',
      });
      entry.totalAmount += data.amount || 0;
      if (data.status !== 'paid') {
        entry.unpaidAmount += data.amount || 0;
        entry.allPaid = false;
      }
    });

    // 各ユーザーの詳細情報を取得
    const payouts: any[] = [];

    for (const [key, entry] of Array.from(userMap.entries())) {
      const { userId, referrerType } = entry;

      let collection = 'shops';
      if (referrerType === 'agency') collection = 'agencies';
      else if (referrerType === 'affiliate') collection = 'affiliates';

      const userDoc = await db.collection(collection).doc(userId).get();
      if (!userDoc.exists) continue;

      const userData = userDoc.data()!;
      const typeLabel =
        referrerType === 'agency'    ? '代理店' :
        referrerType === 'affiliate' ? 'アフィリエイト' :
                                       'PRO紹介';

      payouts.push({
        userId,
        referrerType,
        typeLabel,
        name: userData.name || userData.companyName || userData.ownerName || '未設定',
        email: userData.email || '',
        bankAccount: userData.bankAccount || null,
        totalAmount: entry.totalAmount,
        unpaidAmount: entry.unpaidAmount,
        allPaid: entry.allPaid,
        items: entry.items.sort((a, b) => a.billingMonth.localeCompare(b.billingMonth)),
      });
    }

    // 未払い額の降順でソート
    payouts.sort((a, b) => b.unpaidAmount - a.unpaidAmount);

    // 合計
    const totals = payouts.reduce(
      (acc, p) => ({
        count: acc.count + 1,
        totalAmount: acc.totalAmount + p.totalAmount,
        unpaidAmount: acc.unpaidAmount + p.unpaidAmount,
      }),
      { count: 0, totalAmount: 0, unpaidAmount: 0 }
    );

    return NextResponse.json({
      success: true,
      month: targetMonth,
      payouts,
      totals,
    });
  } catch (error: any) {
    console.error('[payouts] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
