import { NextResponse } from 'next/server';
import { db as adminDb } from '../../../../lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    // 1. 全店舗データの取得
    const shopsSnapshot = await adminDb.collection('shops').get();
    const shops = shopsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. 代理店データの取得
    const agenciesSnapshot = await adminDb.collection('agencies').get();
    const agencies = agenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. 審査待ち・代理店申請データの取得
    const applicationsSnapshot = await adminDb.collection('agency_applications').get();
    const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // --- 集計ロジック ---
    let lightCount = 0;
    let standardCount = 0;
    
    // プロプランの内訳カウント
    let proDirectCount = 0;
    let proReferralCount = 0;
    let proAgencyCount = 0;

    const proShops: any[] = [];
    const otherShops: any[] = [];

    shops.forEach((shop: any) => {
      const plan = shop.plan || 'light'; // デフォルトはライトプラン

      if (plan === 'pro') {
        // 流入チャネルの判定
        let channel = 'direct';
        if (shop.agencyId) {
          channel = 'agency';
          proAgencyCount++;
        } else if (shop.referrerId) {
          channel = 'referral';
          proReferralCount++;
        } else {
          proDirectCount++;
        }

        proShops.push({
          id: shop.id,
          name: shop.name || '未設定の店舗',
          email: shop.email || '-',
          channel, // 'direct' | 'referral' | 'agency'
          agencyName: shop.agencyName || '-',
          referrerName: shop.referrerName || '-',
          subscriberCount: shop.subscriberCount || 0,
          pushCountMonthly: shop.pushCountMonthly || 0,
          createdAt: shop.createdAt || '-',
          status: shop.status || 'active',
        });
      } else if (plan === 'standard') {
        standardCount++;
        otherShops.push({ ...shop, plan: 'standard' });
      } else {
        lightCount++;
        otherShops.push({ ...shop, plan: 'light' });
      }
    });

    const proTotalCount = proShops.length;

    return NextResponse.json({
      success: true,
      summary: {
        lightCount,
        standardCount,
        proTotalCount,
        proBreakdown: {
          direct: proDirectCount,
          referral: proReferralCount,
          agency: proAgencyCount,
        },
        activeAgencyCount: agencies.length,
        pendingApplicationCount: applications.filter((app: any) => app.status === 'pending_approval').length,
      },
      proShops,
      otherShops,
      agencies,
      applications,
    });
  } catch (error: any) {
    console.error('全体データ取得エラー:', error);
    return NextResponse.json({ error: error.message || 'データ取得に失敗しました' }, { status: 500 });
  }
}
