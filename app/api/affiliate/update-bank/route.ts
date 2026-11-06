// app/api/affiliate/update-bank/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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

  try {
    const { bankAccount } = await request.json();

    if (!bankAccount) {
      return NextResponse.json({ error: 'bankAccount が必要です' }, { status: 400 });
    }

    // affiliate を uid で検索
    const snap = await db.collection('affiliates')
      .where('uid', '==', uid)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: 'アフィリエイト情報が見つかりません' }, { status: 404 });
    }

    await snap.docs[0].ref.update({
      bankAccount: {
        bankName: bankAccount.bankName?.trim() || '',
        branchName: bankAccount.branchName?.trim() || '',
        accountType: bankAccount.accountType || 'savings',
        accountNumber: bankAccount.accountNumber?.trim() || '',
        accountHolder: bankAccount.accountHolder?.trim() || '',
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[affiliate/update-bank] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
