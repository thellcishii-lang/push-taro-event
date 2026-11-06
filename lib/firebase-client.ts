import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app as firebaseApp };

export const auth = getAuth(app);
export const storage = getStorage(app);

export async function requestFCMToken(options?: { shopName?: string; iconUrl?: string }): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams();
    if (options?.shopName) params.set('shopName', options.shopName);
    if (options?.iconUrl) params.set('iconUrl', options.iconUrl);

    const swUrl = `/firebase-messaging-sw.js${params.toString() ? `?${params.toString()}` : ''}`;
    const registration = await navigator.serviceWorker.register(swUrl);
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (err) {
    console.error('FCM Token 取得エラー:', err);
    throw err;
  }
}
