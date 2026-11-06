import { NextResponse } from 'next/server';

export async function GET() {
  const swCode = `
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
  authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
});

const messaging = firebase.messaging();

// 💾 IndexedDB への履歴保存処理（最大30件管理）
function saveNotificationToDB(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PushTaroDB', 3);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const upgradeTransaction = e.target.transaction;
      if (!db.objectStoreNames.contains('notifications')) {
        const store = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains('history')) {
        const history = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        history.createIndex('sentAt', 'sentAt', { unique: false });
      } else if (!upgradeTransaction.objectStore('history').indexNames.contains('sentAt')) {
        upgradeTransaction.objectStore('history').createIndex('sentAt', 'sentAt', { unique: false });
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('notifications')) {
        db.close();
        resolve();
        return;
      }
      const tx = db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      store.add({
        title: data.title,
        body: data.body,
        icon: data.icon,
        url: data.url,
        timestamp: Date.now()
      });
      const getAllReq = store.index('timestamp').getAll();
      getAllReq.onsuccess = () => {
        const items = getAllReq.result;
        if (items.length > 30) {
          items.sort((a, b) => a.timestamp - b.timestamp);
          for (let i = 0; i < items.length - 30; i++) store.delete(items[i].id);
        }
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  });
}

// 🔔 バックグラウンド通知受信処理（iOS / Android / PC 対応）
messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] Push received:', payload);

  const title = payload.data?.title || payload.notification?.title || '新着通知';
  const body = payload.data?.body || payload.notification?.body || '';
  const icon = payload.data?.icon || payload.notification?.icon || '/icon-192x192.png';
  const rawLinkUrl = payload.data?.url || payload.data?.linkUrl || '/';
  const linkUrl = new URL(rawLinkUrl, self.location.origin).toString();
  const image = payload.data?.image || payload.notification?.image || '';
  const shopId = payload.data?.shopId || 'default';
  const notificationId = payload.data?.notificationId || '';
  const openToken = payload.data?.openToken || '';
  const openReceiptId = crypto.randomUUID();

  // 1. IndexedDB へ履歴保存
  await saveNotificationToDB({ title, body, icon, url: linkUrl });

  // 2. OS別ポップアップ表示オプションの構築
  const options = {
    body: body,
    icon: icon,
    badge: icon,
    ...(image ? { image } : {}),
    tag: shopId,
    renotify: true,
    data: { url: linkUrl, notificationId, openToken, openReceiptId },
    vibrate: [200, 100, 200],
    silent: false,
    requireInteraction: true
  };

  await self.registration.showNotification(title, options);

  if (notificationId && openToken && openReceiptId) {
    await fetch(new URL('/api/notification-open', self.location.origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId, openToken, openReceiptId, eventType: 'delivered' }),
    }).catch(() => undefined);
  }
});

// 📱 通知タップ時の画面遷移処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).toString();
  const notificationId = event.notification.data?.notificationId;
  const openToken = event.notification.data?.openToken;
  const openReceiptId = event.notification.data?.openReceiptId;

  event.waitUntil(
    Promise.all([
      notificationId && openToken && openReceiptId ? fetch(new URL('/api/notification-open', self.location.origin), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, openToken, openReceiptId, eventType: 'opened' }),
      }).catch(() => undefined) : Promise.resolve(),
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const sameOriginClient = windowClients.find((client) => {
        try {
          return new URL(client.url).origin === new URL(urlToOpen).origin;
        } catch {
          return false;
        }
      });
      if (sameOriginClient) {
        if ('navigate' in sameOriginClient) {
          return sameOriginClient.navigate(urlToOpen).then((client) => client?.focus());
        }
        return sameOriginClient.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
      }),
    ])
  );
});
`;

  return new NextResponse(swCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
