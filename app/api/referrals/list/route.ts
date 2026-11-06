// app/api/referrals/list/route.ts
/**
 * 紹介関係の一覧取得
 *
 * 用途: ダッシュボードの「紹介店舗一覧」タブ（将来用）
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // ─── 認証 ───
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let uid: string;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  // ─── パラメータ ───
  const { searchParams } = new URL(request.url);
  const referrerId = searchParams.get('referrer_id');

  if (!referrerId) {
    return NextResponse.json({ error: 'referrer_id が必要です' }, { status: 400 });
  }

  try {
    // ─── 権限チェック（本人 or 管理者）───
    // referrerId が shop / agency / affiliate のどれかを判定
    let referrerData: any = null;

    // shops (PRO)
    const shopDoc = await db.collection('shops').doc(referrerId).get();
    if (shopDoc.exists && shopDoc.data()?.ownerUid === uid) {
      referrerData = { type: 'pro', ...shopDoc.data() };
    }

    // agencies
    if (!referrerData) {
      const agencyDoc = await db.collection('agencies').doc(referrerId).get();
      if (
        agencyDoc.exists &&
        agencyDoc.data()?.uid === uid &&
        agencyDoc.data()?.status === 'active'
      ) {
        referrerData = { type: 'agency', ...agencyDoc.data() };
      }
    }

    // affiliates
    if (!referrerData) {
      const affDoc = await db.collection('affiliates').doc(referrerId).get();
      if (affDoc.exists && affDoc.data()?.uid === uid) {
        referrerData = { type: 'affiliate', ...affDoc.data() };
      }
    }

    // 管理者バイパス
    if (!referrerData) {
      const userRecord = await authAdmin.getUser(uid);
      if (userRecord.customClaims?.admin !== true) {
        return NextResponse.json({ error: '権限がありません' }, { status: 403 });
      }
    }

    // ─── referral_relations を取得 ───
    const relSnap = await db.collection('referral_relations')
      .where('referrerId', '==', referrerId)
      .where('status', '==', 'active')
      .get();

    const referrals: any[] = [];

    for (const relDoc of relSnap.docs) {
      const relData = relDoc.data();
      const referredShopId = relData.referredTenantId;
      if (!referredShopId) continue;

      const referredShopDoc = await db.collection('shops').doc(referredShopId).get();
      if (!referredShopDoc.exists) continue;

      const d = referredShopDoc.data()!;

      referrals.push({
        id: referredShopId,
        shopCode: d.referralCode || referredShopId,
        name: d.name || '未設定',
        plan: (d.plan || 'light').toLowerCase(),
        rewardRate: relData.rewardRate || 0,
        rewardType: relData.rewardType || null,
        status: relData.status,
        createdAt: relData.createdAt?.toDate?.()?.toISOString() || null,
      });
    }

    return NextResponse.json({
      success: true,
      referrals,
      count: referrals.length,
    });

  } catch (error: any) {
    console.error('[referrals/list] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
