// app/api/system-admin/stats/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {

  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }
  
  try {
    // 1. 全店舗データの取得
    const shopsSnapshot = await db.collection('shops').get();
    
    // 2. subscriptions から店舗ごとのカウント集計
    const subsSnapshot = await db.collection('subscriptions').get();
    const subscriberCounts: Record<string, number> = {};

    subsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.shopIds)) {
        data.shopIds.forEach((sId: string) => {
          subscriberCounts[sId] = (subscriberCounts[sId] || 0) + 1;
        });
      } else if (data.shopId) {
        subscriberCounts[data.shopId] = (subscriberCounts[data.shopId] || 0) + 1;
      }
    });

    const totalSubscribers = subsSnapshot.size;

    const shops = shopsSnapshot.docs.map((doc) => {
      const shopData = doc.data();
      const subscriberCount = subscriberCounts[doc.id] || 0;

      return {
        id: doc.id,
        ...shopData,
        subscriberCount,
        pushCount: shopData.currentMonthSent || 0,
      };
    });

    // 🔥 3. agencies コレクションから代理店データを取得（変更点）
       const agenciesSnapshot = await db.collection('agencies').get();
    const agencies = agenciesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        companyName: data.companyName || '',
        ownerName: data.ownerName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        businessType: data.businessType || 'corporation',
        invoiceNumber: data.invoiceNumber || null,
        status: data.status || 'pending_approval',
        approvedAt: data.approvedAt?.toDate?.()?.toISOString() || null,
        rejectedAt: data.rejectedAt?.toDate?.()?.toISOString() || null,
        rejectReason: data.rejectReason || null,
        referralCode: data.referralCode || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    // 4. プラン別・流入区分別の集計
    let lightCount = 0;
    let standardCount = 0;
    let proCount = 0;
    let directCount = 0;
    let referralCount = 0;
    let agencyCount = 0;

    shops.forEach((shop: any) => {
      const plan = shop.plan?.toLowerCase() || 'light';
      if (plan === 'pro') proCount++;
      else if (plan === 'standard') standardCount++;
      else lightCount++;

      if (shop.agencyId) agencyCount++;
      else if (shop.referrerId) referralCount++;
      else directCount++;
    });

    return NextResponse.json({
      summary: {
        totalSubscribers,
        lightCount,
        standardCount,
        proCount,
        proDetails: {
          direct: directCount,
          referral: referralCount,
          agency: agencyCount,
        },
        agencyTotal: agencies.filter((agency) => agency.status !== 'rejected').length,
      },
      shops,
      agencies, // 🔥 agencies データを返す
    });
  } catch (error: any) {
    console.error('[API System Admin Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
