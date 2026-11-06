// app/api/referrals/export-csv/route.ts
/**
 * 紹介報酬の月次CSVダウンロード
 *
 * クエリパラメータ:
 *   referrer_id:   紹介者ID（PRO店舗 / 代理店 / アフィリ）
 *   referrer_type: 'pro' | 'agency' | 'affiliate'（デフォルト: pro）
 *   month:         '2026-08'（省略時は全期間）
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['pro', 'agency', 'affiliate'] as const;
type ReferrerType = typeof VALID_TYPES[number];

export async function GET(request: Request) {
  // 🆕 認証（本人 or 管理者）
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

  const { searchParams } = new URL(request.url);
  const referrerId = searchParams.get('referrer_id');
  const referrerType = (searchParams.get('referrer_type') || 'pro') as ReferrerType;
  const targetMonth = searchParams.get('month');

  if (!referrerId) {
    return NextResponse.json({ error: 'referrer_id が必要です' }, { status: 400 });
  }

  if (!VALID_TYPES.includes(referrerType)) {
    return NextResponse.json(
      { error: `referrer_type は ${VALID_TYPES.join(' / ')} のいずれかです` },
      { status: 400 }
    );
  }

  if (!isAdmin) {
    const ownerFieldByType: Record<ReferrerType, { collection: string; ownerField: string }> = {
      pro: { collection: 'shops', ownerField: 'ownerUid' },
      agency: { collection: 'agencies', ownerField: 'uid' },
      affiliate: { collection: 'affiliates', ownerField: 'uid' },
    };
    const { collection, ownerField } = ownerFieldByType[referrerType];
    const ownerDoc = await db.collection(collection).doc(referrerId).get();
    if (!ownerDoc.exists || ownerDoc.data()?.[ownerField] !== uid) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }
    if (referrerType === 'agency' && ownerDoc.data()?.status !== 'active') {
      return NextResponse.json({ error: '決済完了後にご利用いただけます' }, { status: 403 });
    }
  }

  try {
    // monthly_rewards から該当する報酬を取得
    let query: any = db.collection('monthly_rewards')
      .where('userId', '==', referrerId)
      .where('referrerType', '==', referrerType);

    if (targetMonth) {
      query = query.where('billingMonth', '==', targetMonth);
    }

    const rewardsSnap = await query.get();

    // CSV生成
    let csv = '\uFEFF対象月,紹介先店舗名,報酬率,決済額,基本報酬,源泉徴収,報酬額,ステータス\n';

    rewardsSnap.docs.forEach((doc: any) => {
      const d = doc.data();
      const status = d.status === 'paid' ? '振込済' : '未払い';
      const rate = d.baseAmount > 0 ? ((d.baseAmount / (d.paymentAmount || 1)) * 100).toFixed(1) : '—';
      csv += [
        d.billingMonth || '',
        `"${d.sourceShopName || '不明'}"`,
        `${rate}%`,
        d.paymentAmount || 0,
        d.baseAmount || 0,
        d.withholding || 0,
        d.amount || 0,
        status,
      ].join(',') + '\n';
    });

    const filename = `referral_statement_${referrerType}_${targetMonth || 'all'}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('[referrals/export-csv] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
