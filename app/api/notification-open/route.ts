import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const retryAfter = await enforceRateLimit(request, 'notification-open', 1000, 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'レート制限を超えました' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const { notificationId, openToken, openReceiptId, eventType = 'opened' } = await request.json();
    if (
      typeof notificationId !== 'string' || !notificationId ||
      typeof openToken !== 'string' || !openToken ||
      typeof openReceiptId !== 'string' || !openReceiptId ||
      !['delivered', 'opened'].includes(eventType)
    ) {
      return NextResponse.json({ error: '開封情報が不足しています' }, { status: 400 });
    }

    const historyRef = db.collection('histories').doc(notificationId);
    const receiptRef = historyRef.collection('open_receipts').doc(openReceiptId);
    await db.runTransaction(async (transaction) => {
      const [history, receipt] = await Promise.all([
        transaction.get(historyRef),
        transaction.get(receiptRef),
      ]);
      if (!history.exists) return;

      const data = history.data()!;
      if (data.openToken !== openToken) return;

      if (eventType === 'delivered') {
        if (receipt.exists) return;
        transaction.create(receiptRef, { deliveredAt: FieldValue.serverTimestamp() });
        transaction.update(historyRef, { deliveredCount: FieldValue.increment(1) });
        return;
      }

      if (receipt.exists && receipt.data()?.openedAt) return;
      if (receipt.exists) {
        transaction.update(receiptRef, { openedAt: FieldValue.serverTimestamp() });
        transaction.update(historyRef, { openedCount: FieldValue.increment(1) });
      } else {
        transaction.create(receiptRef, {
          deliveredAt: FieldValue.serverTimestamp(),
          openedAt: FieldValue.serverTimestamp(),
        });
        transaction.update(historyRef, {
          deliveredCount: FieldValue.increment(1),
          openedCount: FieldValue.increment(1),
        });
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[notification-open] エラー:', error);
    return NextResponse.json({ error: '開封情報の記録に失敗しました' }, { status: 500 });
  }
}