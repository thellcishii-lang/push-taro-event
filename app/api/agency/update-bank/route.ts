// app/api/agency/update-bank/route.ts
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
    const { agencyId, bankAccount } = await request.json();

    if (!agencyId || !bankAccount) {
      return NextResponse.json({ error: 'agencyId と bankAccount が必要です' }, { status: 400 });
    }

    const agencyDoc = await db.collection('agencies').doc(agencyId).get();
    if (
      !agencyDoc.exists ||
      agencyDoc.data()?.uid !== uid ||
      agencyDoc.data()?.status !== 'active'
    ) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await agencyDoc.ref.update({
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
    console.error('[agency/update-bank] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
