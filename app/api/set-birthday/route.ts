// app/api/set-birthday/route.ts
/**
 * 顧客の誕生日・記念日の月日を初回のみ登録する
 *
 * 参照元: app/subscribe/page.tsx（ログイン後の設定画面）
 *
 * データソース:
 *   subscriptions/{token}.birthMonth / birthDay
 *
 * 仕様:
 *   一度設定した後は変更不可（既に値がある場合はエラーを返す）
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const retryAfter = await enforceRateLimit(request, 'set-birthday', 10, 10 * 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { success: false, error: 'しばらく待ってから再度お試しください' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '電話番号認証が必要です' }, { status: 401 });
    }

    let customerUid: string;
    try {
      const decoded = await getAuth().verifyIdToken(authHeader.slice('Bearer '.length));
      customerUid = decoded.uid;
    } catch {
      return NextResponse.json({ success: false, error: '認証の有効期限が切れています' }, { status: 401 });
    }

    const body = await request.json();
    const { token, birthMonth: rawBirthMonth, birthDay: rawBirthDay } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'token が必要です' }, { status: 400 });
    }

    const birthMonth = Number(rawBirthMonth);
    const birthDay = Number(rawBirthDay);
    if (!birthMonth || !birthDay || birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) {
      return NextResponse.json({ success: false, error: '誕生日・記念日の月日を正しく選択してください' }, { status: 400 });
    }

    const docRef = db.collection('subscriptions').doc(token);
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) return 'not-found' as const;

      const data = doc.data()!;
      if (!data.customerUid || data.customerUid !== customerUid) return 'forbidden' as const;
      if (data.birthMonth && data.birthDay) return 'already-set' as const;

      transaction.set(docRef, { birthMonth, birthDay }, { merge: true });
      return 'saved' as const;
    });

    if (result === 'not-found') {
      return NextResponse.json({ success: false, error: '顧客情報が見つかりません' }, { status: 404 });
    }
    if (result === 'forbidden') {
      return NextResponse.json({ success: false, error: 'この顧客情報を更新する権限がありません' }, { status: 403 });
    }
    if (result === 'already-set') {
      return NextResponse.json(
        { success: false, error: '誕生日・記念日は既に設定済みのため変更できません' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, birthMonth, birthDay });
  } catch (error: any) {
    console.error('[set-birthday] エラー:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
