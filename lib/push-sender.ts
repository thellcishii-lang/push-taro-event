// lib/push-sender.ts
/**
 * Push送信の共通コアロジック
 *
 * 呼び出し元:
 *   - app/api/send-push/route.ts        (店舗ダッシュボード)
 *   - app/api/cron/birthday/route.ts    (誕生日Cron)
 *   - app/api/cron/dormant/route.ts     (休眠Cron)
 *   - app/api/cron/scheduled-push/route.ts (予約配信Cron)
 *
 * 役割:
 *   1. subscriptions から対象トークンを取得
 *   2. 450件ずつ FCM 送信
 *   3. 失敗トークンを Firestore から削除
 *   4. histories に送信ログを記録
 */
import { messaging, db } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { enqueuePushJob } from './push-job';

export interface SendPushOptions {
  shopId: string;
  token?: string;
  title: string;
  body: string;
  url?: string;
  imageUrl?: string;
  /** 送信理由（ログ用） 'manual' | 'cron_birthday' | 'cron_dormant' | 'cron_scheduled' */
  source?: string;
}

export interface SendPushResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  totalTokens: number;
  error?: string;
}

const CHUNK_SIZE = 450;
const INVALID_TOKEN_ERRORS = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

export async function sendPushToShop(options: SendPushOptions): Promise<SendPushResult> {
  const { shopId, title, body, url, source = 'manual' } = options;

  // ─── 1. 店舗情報取得 ───
  const shopDoc = await db.collection('shops').doc(shopId).get();
  if (!shopDoc.exists) {
    return { success: false, successCount: 0, failureCount: 0, totalTokens: 0, error: '店舗が見つかりません' };
  }
  const shopData = shopDoc.data()!;

  // 店舗全体への配信はFirestoreキューへ登録し、Cronワーカーで分割送信する。
  // token指定の誕生日・休眠通知は1端末だけなので従来の短時間処理を使う。
  if (!options.token) {
    const notificationId = crypto.randomUUID();
    await enqueuePushJob({
      shopId,
      ownerUid: String(shopData.ownerUid || ''),
      title,
      body,
      url,
      notificationId,
    });
    return { success: true, successCount: 0, failureCount: 0, totalTokens: 0 };
  }

  // ─── 2. トークン取得 ───
  const tokensSnapshot = options.token
    ? null
    : await db.collection('subscriptions').where('shopIds', 'array-contains', shopId).get();

  const tokenByCustomer = new Map<string, { token: string; lastActive: number }>();
  if (options.token) {
    tokenByCustomer.set(options.token, { token: options.token, lastActive: Date.now() });
  } else {
    tokensSnapshot?.forEach((doc) => {
      const data = doc.data();
      if (data.token) {
        const customerKey = data.customerId || data.deviceId || data.token;
        const lastActive = data.lastActive?.toMillis?.() || data.lastActive?.seconds * 1000 || 0;
        const current = tokenByCustomer.get(customerKey);
        if (!current || lastActive >= current.lastActive) {
          tokenByCustomer.set(customerKey, { token: data.token, lastActive });
        }
      }
    });
  }

  // 重複除去
  const uniqueTokens = Array.from(new Set(
    Array.from(tokenByCustomer.values()).map(({ token }) => token)
  ));

  if (uniqueTokens.length === 0) {
    return { success: true, successCount: 0, failureCount: 0, totalTokens: 0 };
  }

  // ─── 3. メッセージ構築 ───
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appBaseUrl = process.env.NODE_ENV === 'production'
    ? configuredBaseUrl.replace(/^http:/, 'https:')
    : configuredBaseUrl;
  const targetUrl = new URL(url || `/subscribe?s=${shopId}`, appBaseUrl).toString();
  const displayTitle = title || shopData.name || 'Push-taro';
  const displayIcon = new URL(shopData.iconUrl || '/icon-192x192.png', appBaseUrl).toString();

  const baseMessage = {
    data: {
      title: String(displayTitle),
      body: String(body),
      icon: String(displayIcon),
      url: String(targetUrl),
      shopId: String(shopId),
    },
    apns: {
      payload: {
        aps: {
          alert: { title: displayTitle, body },
          sound: 'default',
          badge: 1,
          'content-available': 1,
        },
      },
    },
    android: {
      priority: 'high' as const,
      notification: {
        title: displayTitle,
        body,
        icon: displayIcon,
        sound: 'default',
      },
    },
    webpush: {
      headers: { Urgency: 'high' },
      fcmOptions: { link: targetUrl },
    },
  };

  // ─── 4. 450件ずつ送信 ───
  let totalSuccessCount = 0;
  let totalFailureCount = 0;
  const failedTokens: string[] = [];

  for (let i = 0; i < uniqueTokens.length; i += CHUNK_SIZE) {
    const chunkTokens = uniqueTokens.slice(i, i + CHUNK_SIZE);

    try {
      const response = await messaging.sendEachForMulticast({
        ...baseMessage,
        tokens: chunkTokens,
      });

      totalSuccessCount += response.successCount;
      totalFailureCount += response.failureCount;

      response.responses.forEach((resp, idx) => {
        if (!resp.success && INVALID_TOKEN_ERRORS.has(resp.error?.code || '')) {
          failedTokens.push(chunkTokens[idx]);
        }
      });
    } catch (chunkErr) {
      console.error(`[push-sender] チャンク送信エラー (index ${i}):`, chunkErr);
      totalFailureCount += chunkTokens.length;
    }
  }

  // ─── 5. 失敗トークンを Firestore から削除 ───
  if (failedTokens.length > 0) {
    const IN_LIMIT = 30;
    for (let i = 0; i < failedTokens.length; i += IN_LIMIT) {
      const chunk = failedTokens.slice(i, i + IN_LIMIT);
      const invalidDocs = await db.collection('subscriptions')
        .where('token', 'in', chunk)
        .get();

      if (!invalidDocs.empty) {
        const batch = db.batch();
        invalidDocs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
    }
    console.log(`[push-sender] 🧹 ${failedTokens.length} 件の無効トークンを削除`);
  }

  // ─── 6. histories に送信ログ ───
  await db.collection('histories').add({
    shopId,
    title,
    body,
    linkUrl: targetUrl,
    source,                     // ← 送信理由を記録
    sentAt: FieldValue.serverTimestamp(),
    status: totalSuccessCount > 0 ? 'success' : 'error',
    successCount: totalSuccessCount,
    failureCount: totalFailureCount,
  });

  return {
    success: true,
    successCount: totalSuccessCount,
    failureCount: totalFailureCount,
    totalTokens: uniqueTokens.length,
  };
}
