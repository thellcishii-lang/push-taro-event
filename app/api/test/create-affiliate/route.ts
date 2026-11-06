import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import '@/lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin-auth';


// 紹介コード生成
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'AF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// パスワード自動生成（8桁）
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {

  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }
  
  try {
    const { email, name, rewardType } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    if (!rewardType || !['recurring', 'one-time'].includes(rewardType)) {
      return NextResponse.json({ error: '報酬タイプを選択してください（recurring / one-time）' }, { status: 400 });
    }

    const auth = getAuth();
    const db = getFirestore();

    const generatedPassword = generatePassword();

    // Firebase Auth ユーザー作成
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

    // 紹介コード生成（重複防止）
    let referralCode = generateReferralCode();
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 10) {
      const existingCode = await db.collection('affiliates')
        .where('referralCode', '==', referralCode)
        .get();
      if (existingCode.empty) {
        codeExists = false;
      } else {
        referralCode = generateReferralCode();
        attempts++;
      }
    }

    // Firestore にアフィリエイトデータを作成
    const affiliateData = {
      uid: userRecord.uid,
      name: name || 'テストアフィリエイター',
      email: email,
      referralCode,
      rewardType,
      status: 'active',
      totalEarnings: 0,
      unpaidReward: 0,
      bankAccount: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('affiliates').add(affiliateData);

    return NextResponse.json({
      success: true,
      affiliateId: docRef.id,
      uid: userRecord.uid,
      email: email,
      password: generatedPassword,
      referralCode,
      rewardType,
    });
  } catch (error: any) {
    console.error('アフィリエイトテストアカウント作成エラー:', error);
    return NextResponse.json({ error: error.message || '作成処理に失敗しました' }, { status: 500 });
  }
}
