// app/api/test/verify-referral/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase-admin';
import { authAdmin } from '@/lib/firebase-admin';

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
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: '紹介コードが必要です' }, { status: 400 });
  }

  try {
    const snapshot = await db.collection('shops')
      .where('referralCode', '==', code)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        valid: false,
        message: '紹介コードは無効です（該当店舗なし）',
      });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return NextResponse.json({
      valid: true,
      shopId: doc.id,
      shopName: data.name || '未設定',
      plan: data.plan || 'light',
      role: data.role || 'normal',
      email: data.email || '不明',
    });
  } catch (error: any) {
    console.error('[verify-referral] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
