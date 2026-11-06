import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import '@/lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {

  const adminUid = await verifyAdmin(req);
  if (!adminUid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }
  
  try {
    const { email, companyName } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const auth = getAuth();
    const db = getFirestore();

    const generatedPassword = 'pass-' + Math.random().toString(36).substring(2, 10);

    // 1. Firebase Auth ユーザー生成
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: email,
        password: generatedPassword,
        emailVerified: true,
      });
    } catch (e: any) {
      if (e.code === 'auth/email-already-exists') {
        userRecord = await auth.getUserByEmail(email);
        await auth.updateUser(userRecord.uid, { password: generatedPassword });
      } else {
        throw e;
      }
    }

    // 代理店用の紹介コード（上位6文字大文字）
    const referralCode = 'AGENCY-' + userRecord.uid.slice(0, 6).toUpperCase();

    // 2. shops コレクションに代理店ユーザーとして作成 (role: 'agency')
    await db.collection('shops').doc(userRecord.uid).set({
      name: companyName || 'テスト代理店',
      email: email,
      ownerUid: userRecord.uid,
      role: 'agency',
      referralCode: referralCode,
      createdAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      agencyUid: userRecord.uid,
      email: email,
      password: generatedPassword,
      referralCode: referralCode,
    });
  } catch (error: any) {
    console.error('代理店アカウント作成エラー:', error);
    return NextResponse.json({ error: error.message || '作成処理に失敗しました' }, { status: 500 });
  }
}
