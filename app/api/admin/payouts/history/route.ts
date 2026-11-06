// app/api/admin/payouts/history/route.ts
/**
 * 特定ユーザーの支払い履歴（全期間）
 * 
 * クエリパラメータ:
 *   userId: 対象ユーザーのID
 *   referrerType: 'agency' | 'pro' | 'affiliate'
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
    const userId = searchParams.get('userId');
    const referrerType = searchParams.get('referrerType') || 'pro';

    if (!userId) {
      return NextResponse.json({ error: 'userId が必要です' }, { status: 400 });
    }

    // 全期間の monthly_rewards を取得
    const rewardsSnap = await db.collection('monthly_rewards')
      .where('userId', '==', userId)
      .where('referrerType', '==', referrerType)
      .get();

    const history = rewardsSnap.docs.map((doc) => {
      const data = doc.data();

      let paidAtStr = null;
      if (data.paidAt?.toDate) {
        paidAtStr = data.paidAt.toDate().toISOString();
      }

      return {
        id: doc.id,
        billingMonth: data.billingMonth || '',
        scheduledPayoutMonth: data.scheduledPayoutMonth || '',
        sourceShopName: data.sourceShopName || '不明',
        amount: data.amount || 0,
        status: data.status || 'unpaid',
        paidAt: paidAtStr,
      };
    });

    // 支払い予定月で降順ソート
    history.sort((a, b) => b.scheduledPayoutMonth.localeCompare(a.scheduledPayoutMonth));

    // 支払い予定月ごとにグループ化
    const grouped: Record<string, any[]> = {};
    history.forEach((h) => {
      const month = h.scheduledPayoutMonth || '未定';
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(h);
    });

    // 各グループの合計
    const summary = Object.entries(grouped).map(([month, items]) => ({
      month,
      total: items.reduce((sum, i) => sum + i.amount, 0),
      paid: items.every((i) => i.status === 'paid'),
      count: items.length,
    }));

    return NextResponse.json({
      success: true,
      userId,
      referrerType,
      history,
      groupedByMonth: grouped,
      summary,
    });
  } catch (error: any) {
    console.error('[payouts/history] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
