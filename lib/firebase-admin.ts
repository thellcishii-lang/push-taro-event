import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

// 🔥 遅延初期化：初回アクセス時にのみ初期化する
function getAdminApp(): App {
  // 既に初期化済みなら、それを返す
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  console.log('[firebase-admin.ts] Admin SDK 初期化開始。projectId:', projectId);

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[firebase-admin.ts] エラー: 環境変数が不足しています', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
    });
    throw new Error('Firebase Admin SDK の環境変数が不足しています');
  }

  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  console.log('[firebase-admin.ts] Admin SDK 初期化完了');
  return app;
}

// 🔥 getter 経由で遅延初期化（ビルド時には実行されない）
export const messaging = new Proxy({} as Messaging, {
  get: (_, prop) => {
    const app = getAdminApp();
    const instance = getMessaging(app);
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export const db = new Proxy({} as Firestore, {
  get: (_, prop) => {
    const app = getAdminApp();
    const instance = getFirestore(app);
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export const authAdmin = new Proxy({} as Auth, {
  get: (_, prop) => {
    const app = getAdminApp();
    const instance = getAuth(app);
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
