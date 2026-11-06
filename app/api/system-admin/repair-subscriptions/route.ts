import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { FieldPath, FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin-auth';
import { isValidCronRequest } from '@/lib/cron-auth';
import { isShopIdArray, normalizeShopIds } from '@/lib/subscription-shop-ids';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const fields = ['shopIds', 'unsubscribedShopIds'] as const;

function describeField(value: unknown) {
  return {
    type: Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value,
    count: Array.isArray(value) ? value.length : 0,
    invalid: !isShopIdArray(value),
  };
}

export async function POST(request: Request) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid && !isValidCronRequest(request)) {
    return NextResponse.json({ error: '管理者権限またはCron認証が必要です' }, { status: 403 });
  }

  const summary = {
    scanned: 0,
    repaired: 0,
    needsReview: 0,
    before: { shopIds: 0, unsubscribedShopIds: 0, invalidFields: 0 },
    after: { shopIds: 0, unsubscribedShopIds: 0, invalidFields: 0 },
  };
  const runRef = db.collection('subscriptionRepairRuns').doc();
  let cursor: string | undefined;

  try {
    await runRef.set({
      status: 'running',
      actor: adminUid || 'cron',
      startedAt: FieldValue.serverTimestamp(),
      ...summary,
    });
    console.info('[repair-subscriptions] started', { runId: runRef.id });

    while (true) {
      let query = db.collection('subscriptions')
        .orderBy(FieldPath.documentId()).limit(200)
        .select(...fields);
      if (cursor) query = query.startAfter(cursor);
      const page = await query.get();
      if (page.empty) break;

      for (const doc of page.docs) {
        const documentKey = createHash('sha256').update(doc.id).digest('hex');
        const scannedData = doc.data();
        const scannedFields = {
          shopIds: describeField(scannedData.shopIds),
          unsubscribedShopIds: describeField(scannedData.unsubscribedShopIds),
        };
        const result = fields.every((field) => !scannedFields[field].invalid)
          ? { before: scannedFields, after: scannedFields, repaired: false, reviewFields: [] }
          : await db.runTransaction(async (transaction) => {
              // 再取得して、走査後に発生した通常の購読更新を上書きしない。
              const current = await transaction.get(doc.ref);
              if (!current.exists) return null;
              const data = current.data()!;
              const before = {
                shopIds: describeField(data.shopIds),
                unsubscribedShopIds: describeField(data.unsubscribedShopIds),
              };
              const updates: Partial<Record<typeof fields[number], string[]>> = {};
              const reviewFields: string[] = [];
              for (const field of fields) {
                if (!isShopIdArray(data[field])) {
                  updates[field] = normalizeShopIds(data[field]);
                  if (data[field] != null && updates[field].length === 0) {
                    reviewFields.push(field);
                  }
                }
              }
              const after = {
                shopIds: describeField(updates.shopIds ?? data.shopIds),
                unsubscribedShopIds: describeField(updates.unsubscribedShopIds ?? data.unsubscribedShopIds),
              };
              const repaired = Object.keys(updates).length > 0;
              if (repaired) {
                transaction.update(doc.ref, { ...updates, updatedAt: FieldValue.serverTimestamp() });
                transaction.set(runRef.collection('documents').doc(documentKey), {
                  subscriptionId: doc.id,
                  before,
                  after,
                  recovered: updates,
                  reviewFields,
                  repairedAt: FieldValue.serverTimestamp(),
                });
              }
              return { before, after, repaired, reviewFields };
        });
        if (!result) continue;

        summary.scanned++;
        if (result.repaired) summary.repaired++;
        if (result.reviewFields.length > 0) summary.needsReview++;
        for (const field of fields) {
          summary.before[field] += result.before[field].count;
          summary.after[field] += result.after[field].count;
          if (result.before[field].invalid) summary.before.invalidFields++;
          if (result.after[field].invalid) summary.after.invalidFields++;
        }
        if (result.repaired) {
          // subscriptions のIDはFCMトークンなので、ログではハッシュで参照する。
          console.info('[repair-subscriptions] repaired', {
            runId: runRef.id, documentKey, ...result,
          });
        }
        if (result.reviewFields.length > 0) {
          console.warn('[repair-subscriptions] no recoverable shop IDs', {
            runId: runRef.id, documentKey, fields: result.reviewFields,
          });
        }
      }

      cursor = page.docs[page.docs.length - 1].id;
      await runRef.update({ ...summary, updatedAt: FieldValue.serverTimestamp() });
    }

    await runRef.update({
      ...summary, status: 'completed', completedAt: FieldValue.serverTimestamp(),
    });
    console.info('[repair-subscriptions] completed', { runId: runRef.id, ...summary });
    return NextResponse.json({ success: true, runId: runRef.id, ...summary });
  } catch (error) {
    console.error('[repair-subscriptions] failed', { runId: runRef.id, ...summary, error });
    try {
      await runRef.set({
        ...summary, status: 'failed', failedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (auditError) {
      console.error('[repair-subscriptions] failed to persist failure', { runId: runRef.id, auditError });
    }
    return NextResponse.json({
      error: '修復が中断しました。監査記録を確認し、再実行してください。',
      runId: runRef.id, ...summary,
    }, { status: 500 });
  }
}
