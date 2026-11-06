// app/api/admin/manual-action/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

type ActionKey =
  | 'squareStopped'
  | 'invoice2MonthsSent'
  | 'invoice3MonthsSent'
  | 'paymentConfirmed'
  | 'squareResumed'
  | 'canceled';

const VALID_ACTIONS: ActionKey[] = [
  'squareStopped',
  'invoice2MonthsSent',
  'invoice3MonthsSent',
  'paymentConfirmed',
  'squareResumed',
  'canceled',
];

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let adminUid: string;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    if (userRecord.customClaims?.admin !== true) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }
    adminUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const { shopId, action, done } = await request.json();

    if (!shopId) {
      return NextResponse.json({ error: 'shopIdが必要です' }, { status: 400 });
    }
    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: '無効なアクションです' }, { status: 400 });
    }
    if (typeof done !== 'boolean') {
      return NextResponse.json({ error: 'done (boolean) が必要です' }, { status: 400 });
    }

    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    const actionData = done
      ? { done: true, doneAt: FieldValue.serverTimestamp(), doneBy: adminUid }
      : { done: false, doneAt: null, doneBy: null };

    const updatePayload: Record<string, any> = {
      [`manualActions.${action}`]: actionData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // アクション別の追加処理
    if (action === 'paymentConfirmed' && done) {
      // 決済確認 → recovering 状態にする
      updatePayload['paymentStatus.current'] = 'recovering';
      updatePayload['paymentStatus.lastUpdatedAt'] = FieldValue.serverTimestamp();
    }

    if (action === 'squareResumed' && done) {
      // Square再開 → そのまま recovering を維持（次の決済成功で normal）
      updatePayload['paymentStatus.current'] = 'recovering';
      updatePayload['paymentStatus.lastUpdatedAt'] = FieldValue.serverTimestamp();
    }

    if (action === 'canceled' && done) {
      // 退会処理
      updatePayload['paymentStatus.current'] = 'canceled';
      updatePayload['paymentStatus.lastUpdatedAt'] = FieldValue.serverTimestamp();
      updatePayload['paymentCanceledAt'] = FieldValue.serverTimestamp();
      updatePayload['status'] = 'canceled';
      updatePayload['canceledAt'] = FieldValue.serverTimestamp();
    }

    if (action === 'canceled' && !done) {
      // 退会処理の取り消し → failure_3_stopped に戻す
      updatePayload['paymentStatus.current'] = 'failure_3_stopped';
      updatePayload['paymentStatus.lastUpdatedAt'] = FieldValue.serverTimestamp();
      updatePayload['paymentCanceledAt'] = null;
      updatePayload['status'] = 'send_disabled';
    }

    await db.collection('shops').doc(shopId).update(updatePayload);

    console.log(`[manual-action] ${action} = ${done} / shopId: ${shopId} / by: ${adminUid}`);

    return NextResponse.json({
      success: true,
      message: `${action} を${done ? '記録' : '取り消し'}しました`,
    });
  } catch (error: any) {
    console.error('[manual-action] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
