import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import '@/lib/firebase-admin'; // 初期化のみ呼び出し
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {

  const adminUid = await verifyAdmin(req);
  if (!adminUid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }
  
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    // Auth および Firestore のインスタンスを取得
    const auth = getAuth();
    const db = getFirestore();

    // ランダムな初期パスワードを生成
    const generatedPassword = 'pass-' + Math.random().toString(36).substring(2, 10);

    // ユーザー作成（既存の場合は取得してパスワード更新）
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

    // Firestore `shops` コレクションに新店舗を作成
    const shopRef = await db.collection('shops').add({
      name: `テスト店舗 (${email})`,
      ownerUid: userRecord.uid,
      email: email,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      shopId: shopRef.id,
      email: email,
      password: generatedPassword,
    });
  } catch (error: any) {
    console.error('Test Shop Creation Error:', error);
    return NextResponse.json({ error: error.message || '作成処理に失敗しました' }, { status: 500 });
  }
}
