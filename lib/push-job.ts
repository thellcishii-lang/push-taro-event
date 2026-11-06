import { FieldPath, FieldValue } from 'firebase-admin/firestore';
import { db, messaging } from './firebase-admin';
import { PLAN_LIMITS } from './constants';
import { jstMonth } from './coupon-day';

const CHUNK_SIZE = 450;
const LEASE_MS = 2 * 60 * 1000;
const INVALID_TOKEN_ERRORS = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

export type PushJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface PushJob {
  shopId: string;
  ownerUid: string;
  title: string;
  body: string;
  url?: string;
  notificationId: string;
  openToken?: string;
  status: PushJobStatus;
  cursor?: string;
  successCount: number;
  failureCount: number;
  processedCount: number;
  createdAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  leaseUntil?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  error?: string;
}

export async function enqueuePushJob(input: Omit<PushJob, 'status' | 'successCount' | 'failureCount' | 'processedCount' | 'createdAt' | 'updatedAt'>) {
  const jobRef = db.collection('push_jobs').doc();
  const shopRef = db.collection('shops').doc(input.shopId);
  const historyRef = db.collection('histories').doc(input.notificationId);
  const openToken = crypto.randomUUID();

  await db.runTransaction(async (transaction) => {
    const shopSnapshot = await transaction.get(shopRef);
    if (!shopSnapshot.exists || shopSnapshot.data()?.ownerUid !== input.ownerUid) {
      throw new Error('店舗が見つかりません');
    }
    if (shopSnapshot.data()?.activePushJobId) {
      throw new Error('この店舗では別の配信を処理中です。完了後に再度お試しください');
    }

    const now = FieldValue.serverTimestamp();
    transaction.create(jobRef, {
      shopId: input.shopId,
      ownerUid: input.ownerUid,
      title: input.title,
      body: input.body,
      notificationId: input.notificationId,
      openToken,
      ...(input.url ? { url: input.url } : {}),
      status: 'queued',
      successCount: 0,
      failureCount: 0,
      processedCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    transaction.create(historyRef, {
      shopId: input.shopId,
      notificationId: input.notificationId,
      title: input.title,
      body: input.body,
      linkUrl: input.url || null,
      sentAt: now,
      status: 'pending',
      successCount: 0,
      failureCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      openToken,
    });
    transaction.update(shopRef, { activePushJobId: jobRef.id });
  });

  return jobRef.id;
}

function getBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return process.env.NODE_ENV === 'production'
    ? configuredBaseUrl.replace(/^http:/, 'https:')
    : configuredBaseUrl;
}

async function failJob(jobId: string, shopId: string, error: string) {
  const jobRef = db.collection('push_jobs').doc(jobId);
  const shopRef = db.collection('shops').doc(shopId);
  await db.runTransaction(async (transaction) => {
    transaction.update(jobRef, { status: 'failed', error, updatedAt: FieldValue.serverTimestamp() });
    transaction.update(shopRef, { activePushJobId: FieldValue.delete() });
  });
}

export async function processPushJobBatch(jobId: string): Promise<'skipped' | 'processed' | 'completed' | 'failed'> {
  const jobRef = db.collection('push_jobs').doc(jobId);
  const initial = await jobRef.get();
  if (!initial.exists) return 'skipped';
  const initialData = initial.data() as PushJob;
  if (initialData.status === 'completed' || initialData.status === 'failed') return 'skipped';

  const claimed = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(jobRef);
    if (!snapshot.exists) return false;
    const job = snapshot.data() as PushJob;
    const leaseUntil = job.leaseUntil && 'toMillis' in job.leaseUntil ? job.leaseUntil.toMillis() : 0;
    if (job.status === 'processing' && leaseUntil > Date.now()) return false;
    transaction.update(jobRef, {
      status: 'processing',
      leaseUntil: new Date(Date.now() + LEASE_MS),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
  if (!claimed) return 'skipped';

  const jobSnapshot = await jobRef.get();
  const job = jobSnapshot.data() as PushJob;
  const shopSnapshot = await db.collection('shops').doc(job.shopId).get();
  if (!shopSnapshot.exists) {
    await failJob(jobId, job.shopId, '店舗が見つかりません');
    return 'failed';
  }
  const shop = shopSnapshot.data()!;

  let query = db.collection('subscriptions')
    .where('shopIds', 'array-contains', job.shopId)
    .orderBy(FieldPath.documentId())
    .limit(CHUNK_SIZE);
  if (job.cursor) query = query.startAfter(job.cursor) as typeof query;
  const subscriptions = await query.get();
  if (subscriptions.empty) {
    await db.runTransaction(async (transaction) => {
      transaction.update(jobRef, {
        status: 'completed',
        leaseUntil: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.update(db.collection('shops').doc(job.shopId), { activePushJobId: FieldValue.delete() });
      transaction.set(db.collection('histories').doc(job.notificationId), {
        shopId: job.shopId,
        notificationId: job.notificationId,
        title: job.title,
        body: job.body,
        linkUrl: job.url || null,
        sentAt: FieldValue.serverTimestamp(),
        status: job.successCount > 0 ? 'success' : 'error',
        successCount: job.successCount,
        failureCount: job.failureCount,
        openToken: job.openToken || job.notificationId,
      }, { merge: true });
    });
    return 'completed';
  }

  const tokens = Array.from(new Set(subscriptions.docs
    .map((doc) => doc.data().token)
    .filter((token): token is string => typeof token === 'string' && token.length > 0)));
  const lastCursor = subscriptions.docs[subscriptions.docs.length - 1].id;
  const planKey = String(shop.plan || 'standard');
  const limit = Number(shop.monthlyLimit || PLAN_LIMITS[planKey] || PLAN_LIMITS.standard);
  // JST基準で月を判定（UTCのままだと JST 1日 0:00〜8:59 が前月扱いになる）
  const currentMonth = jstMonth(new Date());
  const currentMonthSent = shop.lastSentMonth === currentMonth ? Number(shop.currentMonthSent || 0) : 0;
  if (planKey !== 'pro' && currentMonthSent + tokens.length > limit) {
    await failJob(jobId, job.shopId, `今月の送信上限（${limit.toLocaleString()}件）を超えるため送信を停止しました`);
    return 'failed';
  }

  let successCount = 0;
  let failureCount = 0;
  const failedTokens: string[] = [];
  if (tokens.length > 0) {
    const appBaseUrl = getBaseUrl();
    const customerHome = new URL(`/subscribe?s=${encodeURIComponent(job.shopId)}`, appBaseUrl);
    let target = customerHome;
    if (job.url) {
      const destination = new URL(job.url, appBaseUrl);
      target = new URL('/notification-link', appBaseUrl);
      target.searchParams.set('target', destination.toString());
      target.searchParams.set('returnTo', `${customerHome.pathname}${customerHome.search}`);
    }
    const displayIcon = new URL(shop.iconUrl || '/icon-192x192.png', appBaseUrl).toString();
    const response = await messaging.sendEachForMulticast({
      tokens,
      data: {
        title: job.title,
        body: job.body,
        icon: displayIcon,
        url: target.toString(),
        shopId: job.shopId,
        notificationId: job.notificationId,
        openToken: job.openToken || job.notificationId,
      },
      webpush: { headers: { Urgency: 'high' }, fcmOptions: { link: target.toString() } },
      android: { priority: 'high', notification: { title: job.title, body: job.body, icon: displayIcon } },
      apns: { payload: { aps: { alert: { title: job.title, body: job.body }, sound: 'default', 'content-available': 1 } } },
    });
    successCount = response.successCount;
    failureCount = response.failureCount;
    response.responses.forEach((result, index) => {
      if (!result.success && INVALID_TOKEN_ERRORS.has(result.error?.code || '')) {
        failedTokens.push(tokens[index]);
      }
    });
  }

  if (failedTokens.length > 0) {
    for (let i = 0; i < failedTokens.length; i += 30) {
      const invalidSnapshot = await db.collection('subscriptions').where('token', 'in', failedTokens.slice(i, i + 30)).get();
      if (!invalidSnapshot.empty) {
        const batch = db.batch();
        invalidSnapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
    }
  }

  await db.runTransaction(async (transaction) => {
    const latestJob = await transaction.get(jobRef);
    const latestShop = await transaction.get(db.collection('shops').doc(job.shopId));
    if (!latestJob.exists) {
      // ジョブが処理中に削除された場合は何もせず終了
      return;
    }
    const latestData = latestJob.data() as PushJob;
    if (!latestShop.exists) {
      // 店舗が削除された場合はジョブを失敗終了させ、
      // processing 残留による再試行ループと配信ブロックを防ぐ
      transaction.update(jobRef, {
        status: 'failed',
        error: '店舗ドキュメントが削除されたため送信を中断しました',
        leaseUntil: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    }
    const latestShopData = latestShop.data()!;
    const latestMonthSent = latestShopData.lastSentMonth === currentMonth ? Number(latestShopData.currentMonthSent || 0) : 0;
    transaction.update(jobRef, {
      cursor: lastCursor,
      status: 'queued',
      leaseUntil: FieldValue.delete(),
      successCount: latestData.successCount + successCount,
      failureCount: latestData.failureCount + failureCount,
      processedCount: latestData.processedCount + subscriptions.size,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(latestShop.ref, {
      currentMonthSent: latestMonthSent + successCount,
      lastSentMonth: currentMonth,
    });
  });
  return 'processed';
}

export async function getPushJob(jobId: string) {
  const snapshot = await db.collection('push_jobs').doc(jobId).get();
  return snapshot.exists ? { id: snapshot.id, ...(snapshot.data() as PushJob) } : null;
}
