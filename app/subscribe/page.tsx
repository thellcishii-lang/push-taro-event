'use client';

import { useState, useEffect, useRef } from 'react';
import { requestFCMToken } from '../../lib/firebase-client';
import { firebaseApp } from '../../lib/firebase-client';
import { getMessaging, isSupported, onMessage } from 'firebase/messaging';
import { QRCodeSVG } from 'qrcode.react';
import { auth } from '../../lib/firebase-client';
import { ConfirmationResult, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import CouponDisplay, { couponExpiry } from './CouponDisplay';
import CelebrationModal from './CelebrationModal';

export default function SubscribePage() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [shopId, setShopId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  const [isRegistered, setIsRegistered] = useState(false);
  const [fcmToken, setFcmToken] = useState('');
  const [shopData, setShopData] = useState<any>(null);

  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [savedBirthMonth, setSavedBirthMonth] = useState<number | null>(null);
  const [savedBirthDay, setSavedBirthDay] = useState<number | null>(null);
  const [birthdaySetStatus, setBirthdaySetStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [birthdaySetMessage, setBirthdaySetMessage] = useState('');
  const [historyTab, setHistoryTab] = useState<'notifications' | 'coupons'>('notifications');
  const [couponUsed, setCouponUsed] = useState(false);
  const [normalCouponUsed, setNormalCouponUsed] = useState(false);
  const [loyaltyCouponAvailable, setLoyaltyCouponAvailable] = useState(false);
  const [loyaltyAchievedAt, setLoyaltyAchievedAt] = useState<string | null>(null);
  const [stepUpIndex, setStepUpIndex] = useState(0);
  const [stepUpIndexAppearedAt, setStepUpIndexAppearedAt] = useState<string | null>(null);
  const [repeatCouponActiveUntil, setRepeatCouponActiveUntil] = useState<string | null>(null);
  const [repeatCouponUsedToday, setRepeatCouponUsedToday] = useState(false);
  const [birthdayCouponAvailable, setBirthdayCouponAvailable] = useState(false);
  const [birthdayCouponUsed, setBirthdayCouponUsed] = useState(false);
  const [dormantCouponAvailable, setDormantCouponAvailable] = useState(false);
  const [dormantCouponUsed, setDormantCouponUsed] = useState(false);
  const [dormantNotifiedAt, setDormantNotifiedAt] = useState<string | null>(null);
  const [scheduledCouponUsedIds, setScheduledCouponUsedIds] = useState<string[]>([]);
  const [couponNow, setCouponNow] = useState(() => Date.now());
  const [couponUsedAt, setCouponUsedAt] = useState<{
    normal: string | null;
    birthday: string | null;
    dormant: string | null;
    scheduled: Record<string, string | null>;
  }>({ normal: null, birthday: null, dormant: null, scheduled: {} });
  const [customerUid, setCustomerUid] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneAuthLoading, setPhoneAuthLoading] = useState(false);

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [couponHistory, setCouponHistory] = useState<Array<{ id: string; title: string; usedAt: string | null }>>([]);
  const [couponHistoryLoaded, setCouponHistoryLoaded] = useState(false);
  const [couponStatusVersion, setCouponStatusVersion] = useState(0);
  const lastCouponStatus = useRef('');
  const [couponHistoryError, setCouponHistoryError] = useState('');
  const [couponHistoryLoading, setCouponHistoryLoading] = useState(false);
  const sessionRequest = useRef<Promise<string> | null>(null);
  const sessionRetryAt = useRef(0);
  const [couponStatusLoaded, setCouponStatusLoaded] = useState(false);
  const [couponStatusError, setCouponStatusError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'coupons' | 'history'>('coupons');
  const [streakInfo, setStreakInfo] = useState<any>(null);
  const [stampLoading, setStampLoading] = useState(false);
  const [celebration, setCelebration] = useState<{
    open: boolean;
    title: string;
    message: string;
    emoji: string;
  }>({ open: false, title: '', message: '', emoji: '🎁' });

  // QRモーダル
  const [qrModal, setQrModal] = useState<{ open: boolean; title: string; value: string }>({
    open: false,
    title: '',
    value: '',
  });

  const prevLoyaltyAvailableRef = useRef<boolean | null>(null);

  const sessionStorageKey = `push_taro_session_${shopId}`;
  const clearSessionToken = () => {
    try { localStorage.removeItem(sessionStorageKey); } catch {}
  };

  const openQR = (title: string, couponType: string, couponId?: string) => {
    const payload: any = { shopId, couponType, token: fcmToken };
    if (couponId) payload.couponId = couponId;
    setQrModal({ open: true, title, value: JSON.stringify(payload) });
  };

  const ensureSessionToken = async (): Promise<string> => {
    if (!fcmToken || !shopId) return '';
    try {
      const cached = JSON.parse(localStorage.getItem(sessionStorageKey) || 'null');
      if (cached?.fcmToken === fcmToken && typeof cached.token === 'string' && cached.exp - 60 * 60 * 1000 > Date.now()) {
        return cached.token;
      }
    } catch {}
    if (sessionRequest.current) return sessionRequest.current;
    if (Date.now() < sessionRetryAt.current) return '';

    sessionRequest.current = (async () => {
      try {
        const res = await fetch('/api/customer-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: fcmToken, shopId }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.sessionToken) {
          let exp = Date.now() + 12 * 60 * 60 * 1000;
          try {
            const payload = JSON.parse(atob(String(data.sessionToken).split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
            if (typeof payload.exp === 'number') exp = payload.exp;
          } catch {}
          localStorage.setItem(sessionStorageKey, JSON.stringify({ fcmToken, token: data.sessionToken, exp }));
          return data.sessionToken as string;
        }
        sessionRetryAt.current = Date.now() + Math.max(30, Number(res.headers.get('Retry-After')) || 60) * 1000;
        throw new Error(data.error || 'セッショントークンを取得できませんでした');
      } catch (err) {
        if (sessionRetryAt.current <= Date.now()) sessionRetryAt.current = Date.now() + 60 * 1000;
        console.error('セッショントークン取得エラー:', err);
        return '';
      } finally {
        sessionRequest.current = null;
      }
    })();
    return sessionRequest.current;
  };

  const withReturnButton = (rawUrl: string) => {
    try {
      const url = new URL(rawUrl, window.location.origin);
      if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return '#';
      const params = new URLSearchParams({ target: url.toString(), returnTo: `/subscribe?s=${encodeURIComponent(shopId)}` });
      return `/notification-link?${params.toString()}`;
    } catch {
      return '#';
    }
  };

  const loadCouponHistory = async () => {
    if (!shopId || !fcmToken) return;
    setCouponHistoryLoading(true);
    setCouponHistoryError('');
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const requestHistory = async () => {
        const session = await ensureSessionToken();
        return fetch(`/api/coupon-history?shopId=${encodeURIComponent(shopId)}&token=${encodeURIComponent(session || fcmToken)}`, {
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
          cache: 'no-store',
        });
      };
      let response = await requestHistory();
      if (response.status === 401) {
        clearSessionToken();
        response = await requestHistory();
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '履歴を取得できませんでした');
      setCouponHistory(data.histories);
      setCouponHistoryLoaded(true);
    } catch (error) {
      setCouponHistoryError(error instanceof Error ? error.message : '履歴を取得できませんでした');
    } finally {
      setCouponHistoryLoading(false);
    }
  };

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setCustomerUid(user?.uid || '');
  }), []);

  const normalizePhoneNumber = (value: string): string => {
    const compact = value
      .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
      .replace(/[\s().-]/g, '');
    if (compact.startsWith('00')) return `+${compact.slice(2)}`;
    if (compact.startsWith('0')) return `+81${compact.slice(1)}`;
    if (compact.startsWith('81')) return `+${compact}`;
    return compact;
  };

  const loadNotificationHistory = () => {
    if (typeof window === 'undefined') return;
    const request = indexedDB.open('PushTaroDB', 3);
    request.onupgradeneeded = (e: any) => {
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

    request.onsuccess = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('notifications')) return;

      const tx = db.transaction('notifications', 'readonly');
      const store = tx.objectStore('notifications');
      const getAllReq = store.getAll();

      getAllReq.onsuccess = () => {
        const items = getAllReq.result || [];
        items.sort((a: any, b: any) => b.timestamp - a.timestamp);
        setHistoryList(items);
      };
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let detectedId = '';
    try {
      const searchParams = new URLSearchParams(window.location.search);
      detectedId = searchParams.get('s') || searchParams.get('shopid') || '';
      if (!detectedId && window.location.href.includes('?')) {
        const fullUrl = new URL(window.location.href);
        detectedId = fullUrl.searchParams.get('s') || fullUrl.searchParams.get('shopid') || '';
      }
      if (!detectedId) {
        const saved = localStorage.getItem('push_taro_shop_id');
        if (saved && saved !== 'undefined' && saved !== 'null') {
          detectedId = saved;
        }
      }
      if (detectedId && detectedId !== 'undefined' && detectedId !== 'null') {
        const cleanId = detectedId.trim();
        setShopId(cleanId);
        localStorage.setItem('push_taro_shop_id', cleanId);
      }
    } catch (e) {
      console.error('ID取得例外:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!shopId) return;

    fetch(`/api/shop-info?s=${shopId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setShopData(data);
        }
      })
      .catch(err => console.error('店舗情報通信エラー:', err));

    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem(`push_taro_token_${shopId}`);
      if (savedToken) {
        setFcmToken(savedToken);
        setIsRegistered(true);
      }
      loadNotificationHistory();
    }
  }, [shopId]);

  useEffect(() => {
    if (!shopId || !fcmToken || !isRegistered) return;
    let disposed = false;
    let unsubscribeMessage: (() => void) | undefined;
    void (async () => {
      if (!await isSupported() || disposed) return;
      const messaging = getMessaging(firebaseApp);
      unsubscribeMessage = onMessage(messaging, async (payload) => {
        const title = payload.data?.title || payload.notification?.title || '新着通知';
        const body = payload.data?.body || payload.notification?.body || '';
        const rawUrl = payload.data?.url || payload.data?.linkUrl || '/';
        const url = new URL(rawUrl, window.location.origin).toString();
        const notificationId = payload.data?.notificationId || '';
        const openToken = payload.data?.openToken || '';
        if (notificationId && openToken) {
          await fetch('/api/notification-open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notificationId,
              openToken,
              openReceiptId: crypto.randomUUID(),
              eventType: 'opened',
            }),
          }).catch(() => undefined);
        }
        const request = indexedDB.open('PushTaroDB', 3);
        request.onsuccess = (event: any) => {
          const historyDb = event.target.result;
          if (!historyDb.objectStoreNames.contains('notifications')) return;
          const transaction = historyDb.transaction('notifications', 'readwrite');
          transaction.objectStore('notifications').add({ title, body, url, timestamp: Date.now() });
          transaction.oncomplete = () => historyDb.close();
        };
      });
    })().catch((error) => console.error('通知受信の初期化エラー:', error));

    return () => {
      disposed = true;
      unsubscribeMessage?.();
    };
  }, [shopId, fcmToken, isRegistered]);

  useEffect(() => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
    let timeoutId: number | undefined;
    const tick = () => {
      const now = Date.now();
      setCouponNow(now);
      const nextJstMidnight = (Math.floor((now + JST_OFFSET_MS) / DAY_MS) + 1) * DAY_MS - JST_OFFSET_MS;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(tick, Math.min(nextJstMidnight - now + 1_000, 60_000));
    };
    const handleVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    tick();
    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('focus', handleVisible);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('focus', handleVisible);
    };
  }, []);

  useEffect(() => {
    if (!shopId || !fcmToken || !isRegistered) return;

    let disposed = false;
    let refreshing = false;
    let retryAt = 0;
    let loaded = false;
    let consecutiveFailures = 0;
    setCouponStatusLoaded(false);
    setCouponStatusError('');

    const refreshCouponStatus = async () => {
      setCouponNow(Date.now());
      if (refreshing || Date.now() < retryAt) return;
      refreshing = true;
      try {
        const requestStatus = async () => {
          const session = await ensureSessionToken();
          return fetch(
            `/api/subscribe-status?shopId=${encodeURIComponent(shopId)}&token=${encodeURIComponent(session || fcmToken)}`,
            { cache: 'no-store' },
          );
        };
        let res = await requestStatus();
        if (res.status === 401) {
          clearSessionToken();
          res = await requestStatus();
        }
        if (res.status === 429) {
          retryAt = Date.now() + Math.max(10, Number(res.headers.get('Retry-After')) || 60) * 1000;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw Object.assign(new Error(data.error || 'クーポン状態を取得できませんでした'), {
            status: res.status,
            retryAfter: Number(res.headers.get('Retry-After')) || 0,
          });
        }
        if (!disposed) {
          setCouponUsed(Boolean(data.firstCouponUsed || data.couponUsed));
          setNormalCouponUsed(data.normalCouponUsed === true);
          const newLoyalty = data.loyaltyCouponAvailable === true;
          setLoyaltyCouponAvailable(newLoyalty);
          if (prevLoyaltyAvailableRef.current === false && newLoyalty === true) {
            setCelebration({
              open: true,
              title: '特別達成クーポン獲得！',
              message: '通常クーポンを規定回数ご利用いただきました。\n特別達成クーポンをプレゼントします🎉',
              emoji: '🏆',
            });
          }
          prevLoyaltyAvailableRef.current = newLoyalty;
          setLoyaltyAchievedAt(data.loyaltyAchievedAt || null);
          setStepUpIndex(data.stepUpIndex || 0);
          setStepUpIndexAppearedAt(data.stepUpIndexAppearedAt || null);
          setRepeatCouponActiveUntil(data.repeatCouponActiveUntil || null);
          setRepeatCouponUsedToday(data.repeatCouponUsed === true);
          setBirthdayCouponAvailable(String(data.birthdayNotifiedYear) === String(new Date().getFullYear()));
          setBirthdayCouponUsed(data.birthdayCouponUsed === true);
          setDormantCouponAvailable(Boolean(data.dormantNotifiedAt));
          setDormantCouponUsed(data.dormantCouponUsed === true);
          setDormantNotifiedAt(data.dormantNotifiedAt || null);
          setScheduledCouponUsedIds(data.scheduledCouponUsedIds || []);
          setCouponUsedAt({
            normal: data.normalCouponUsedAt || null,
            birthday: data.birthdayCouponUsedAt || null,
            dormant: data.dormantCouponUsedAt || null,
            scheduled: data.scheduledCouponUsedAt || {},
          });
          setSavedBirthMonth(data.birthMonth || null);
          setSavedBirthDay(data.birthDay || null);
          if (data.streak) {
            setStreakInfo(data.streak);
          }
          loaded = true;
          consecutiveFailures = 0;
          setCouponStatusLoaded(true);
          setCouponStatusError('');
          const statusSignature = JSON.stringify(data);
          if (statusSignature !== lastCouponStatus.current) {
            lastCouponStatus.current = statusSignature;
            setCouponStatusVersion((version) => version + 1);
          }
        }
      } catch (err) {
        console.error('クーポン状態の自動更新エラー:', err);
        consecutiveFailures += 1;
        if (!disposed && (!loaded || consecutiveFailures >= 3)) {
          const { status: failedStatus, retryAfter } = err as { status?: number; retryAfter?: number };
          setCouponStatusError(
            failedStatus === 429
              ? `アクセスが集中しているため、クーポンの使用状況を確認できません。約${Math.max(1, Math.ceil((retryAfter || 60) / 60))}分後に自動で再確認します。（429）`
              : failedStatus === 403
                ? 'この店舗の通知登録が見つからないため、クーポンの使用状況を確認できません。お手数ですが通知登録をやり直してください。（403）'
                : failedStatus
                  ? `サーバーでエラーが発生したため、クーポンの使用状況を確認できません。自動で再試行します。（${failedStatus}）`
                  : 'クーポンの使用状況を確認できません。通信状況を確認してください。自動で再試行します。',
          );
        }
      } finally {
        refreshing = false;
      }
    };

    void refreshCouponStatus();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshCouponStatus();
      }
    }, 10_000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshCouponStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    
    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [shopId, fcmToken, isRegistered]);

  useEffect(() => {
    if (historyTab === 'coupons' && isRegistered && fcmToken) void loadCouponHistory();
  }, [historyTab, couponStatusVersion, isRegistered, fcmToken]);

  useEffect(() => {
    if (typeof window === 'undefined' || !shopId) return;

    let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = `/manifest/${shopId}`;

    if (shopData?.iconUrl) {
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = shopData.iconUrl;
    }

    if (shopData?.name) {
      let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement;
      if (!appleTitle) {
        appleTitle = document.createElement('meta');
        appleTitle.name = 'apple-mobile-web-app-title';
        document.head.appendChild(appleTitle);
      }
      appleTitle.content = shopData.name;
    }
  }, [shopId, shopData]);

  const handleSendVerificationCode = async () => {
    if (!phoneNumber.trim()) {
      setStatus('error');
      setMessage('電話番号を入力してください。');
      return;
    }
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhoneNumber)) {
      setStatus('error');
      setMessage('電話番号は09012345678、または+819012345678の形式で入力してください。');
      return;
    }
    setPhoneAuthLoading(true);
    setMessage('');
    try {
      const previousVerifier = (window as any).__phoneRecaptchaVerifier as RecaptchaVerifier | undefined;
      previousVerifier?.clear();
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'normal' });
      (window as any).__phoneRecaptchaVerifier = verifier;
      const result = await signInWithPhoneNumber(auth, normalizedPhoneNumber, verifier);
      setConfirmationResult(result);
      setStatus('idle');
      setMessage('SMSで届いた認証コードを入力してください。');
    } catch (error: any) {
      setStatus('error');
      console.error('[phone-auth] SMS送信失敗:', error);
      setMessage(`認証コードの送信に失敗しました（${error.code || 'unknown'}）。Firebase Authenticationで電話番号ログインを有効にしてください。`);
    } finally {
      setPhoneAuthLoading(false);
    }
  };

  const handleConfirmVerificationCode = async () => {
    if (!confirmationResult || !verificationCode.trim()) return;
    setPhoneAuthLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode.trim());
      setCustomerUid(result.user.uid);
      setConfirmationResult(null);
      setMessage('電話番号の認証が完了しました。通知登録を続けます。');
    } catch (error: any) {
      setStatus('error');
      console.error('[phone-auth] コード確認失敗:', error);
      setMessage(`認証コードが正しくありません（${error.code || 'unknown'}）。`);
    } finally {
      setPhoneAuthLoading(false);
    }
  };

  const handleSetBirthday = async () => {
    if (!birthMonth || !birthDay) {
      setBirthdaySetStatus('error');
      setBirthdaySetMessage('誕生日または記念日の月日を選択してください。');
      return;
    }
    setBirthdaySetStatus('saving');
    setBirthdaySetMessage('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('電話番号認証が必要です');
      const res = await fetch('/api/set-birthday', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
        body: JSON.stringify({ token: fcmToken, birthMonth, birthDay }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setSavedBirthMonth(data.birthMonth);
      setSavedBirthDay(data.birthDay);
      setBirthdaySetStatus('idle');
      setBirthdaySetMessage('');
    } catch (err: any) {
      setBirthdaySetStatus('error');
      setBirthdaySetMessage('❌ ' + err.message);
    }
  };

  const handleStamp = async () => {
    if (!shopId || !fcmToken) return;
    setStampLoading(true);
    try {
      const session = await ensureSessionToken();
      const res = await fetch('/api/streak/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, token: session || fcmToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setStreakInfo((prev: any) => ({
        ...prev,
        currentCount: data.nextCount,
        lastStampDate: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
        achieved: data.achieved,
        achievedAt: data.achieved ? new Date().toISOString() : (prev?.achievedAt ?? null),
      }));
      if (data.achieved) {
        setCelebration({
          open: true,
          title: '連続ログイン達成！',
          message: `${data.targetDays || streakInfo?.targetDays || ''}日連続ログイン達成！\nご褒美クーポンを獲得しました🎉`,
          emoji: '🔥',
        });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setStampLoading(false);
    }
  }; 
  
  const handleSubscribe = async () => {
    let effectiveShopId = shopId;
    if (!customerUid) {
      setStatus('error');
      setMessage('電話番号の認証を完了してください。');
      return;
    }
    if (!effectiveShopId && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      effectiveShopId = searchParams.get('s') || localStorage.getItem('push_taro_shop_id') || '';
    }
    if (!effectiveShopId) {
      setStatus('error');
      setMessage('❌ 店舗IDが取得できていません。URLの末尾に ?s=店舗ID がついているかご確認ください。');
      return;
    }
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = typeof window !== 'undefined' && ((window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches);
    if (isIOS && !isStandalone) {
      setStatus('error');
      setMessage('📱 iPhoneではWeb通知の受け取りに「ホーム画面に追加」が必要です。\n\n1. Safari下部の「共有ボタン（□に↑）」をタップ\n2. 「ホーム画面に追加」を選択\n3. ホーム画面に作成されたアイコンから開いて再操作してください。');
      return;
    }
    setStatus('requesting');
    setMessage('');
    try {
      const deviceIdKey = 'push_taro_device_id';
      let deviceId = localStorage.getItem(deviceIdKey);
      if (!deviceId) {
        deviceId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(deviceIdKey, deviceId);
      }
      const customerIdKey = 'push_taro_customer_id';
      let customerId = localStorage.getItem(customerIdKey);
      if (!customerId) {
        customerId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(customerIdKey, customerId);
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('error');
        setMessage('❌ 通知が拒否されました。ブラウザの設定から通知を許可してください。');
        return;
      }
      let token: string | null = '';
      try {
        token = await requestFCMToken({
          shopName: shopData?.name || 'Push-taro',
          iconUrl: shopData?.iconUrl || '/icon-192x192.png',
        });
      } catch (fcmErr: any) {
        throw new Error(`FCMトークン取得エラー: ${fcmErr.message || fcmErr}`);
      }
      if (!token) {
        setStatus('error');
        setMessage('❌ トークンの発行に失敗しました。');
        return;
      }
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.currentUser ? { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } : {}),
        },
        body: JSON.stringify({ token, shopId: effectiveShopId, deviceId, customerId, customerUid }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.error || `HTTP ${res.status}`);
      localStorage.setItem(`push_taro_token_${effectiveShopId}`, token);
      setFcmToken(token);
      setStatus('success');
      setMessage('✨ 通知の受け取りが完了しました！');
      setTimeout(() => {
        setIsRegistered(true);
        loadNotificationHistory();
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage('❌ ' + err.message);
    }
  };

  if (!isLoaded || (shopId && !shopData)) {
    return (
      <main style={{ padding: 24, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>読み込み中...</p>
      </main>
    );
  }

  // 📱 【登録完了画面】
  if (isRegistered) {
    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    const isStampedToday = streakInfo?.lastStampDate === todayStr;

    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {shopData?.iconUrl ? (
              <img src={shopData.iconUrl} alt="icon" className="w-11 h-11 rounded-full object-cover shadow-sm border border-gray-100" />
            ) : (
              <div className="w-11 h-11 bg-orange-50 rounded-full flex items-center justify-center text-xl shadow-sm border border-orange-100">🏪</div>
            )}
            <div className="flex flex-col">
              <h1 className="text-[15px] font-bold text-gray-800 leading-tight">{shopData?.name}</h1>
              {shopData?.linkUrl && (
                <a href={`/notification-link?target=${encodeURIComponent(shopData.linkUrl)}&returnTo=/subscribe?s=${shopId}`} className="text-[11px] text-orange-500 hover:text-orange-600 font-bold transition-colors mt-0.5">
                  公式サイトはこちら →
                </a>
              )}
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">↻ 更新</button>
        </header>

        <main className="max-w-md mx-auto p-4 pb-24">
          <CelebrationModal
            open={celebration.open}
            title={celebration.title}
            message={celebration.message}
            emoji={celebration.emoji}
            onClose={() => setCelebration(prev => ({ ...prev, open: false }))}
          />
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              {/* 連続ログイン特典（PRO） */}
              {shopData?.plan === 'pro' && streakInfo?.enabled && (
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-5 mb-6 shadow-lg relative overflow-hidden text-white">
                <div className="absolute -right-6 -bottom-6 text-8xl opacity-20 transform rotate-12">🎁</div>
                  <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold">アプリを開いてスタンプGET</span>
                    <span className="text-xs font-bold bg-white text-orange-600 px-2 py-0.5 rounded-full">{streakInfo.currentCount}日目</span>
                  </div>
                  <h2 className="text-lg font-black mb-3 relative z-10">連続ログインキャンペーン</h2>
                  <div className="flex justify-between mb-4 relative z-10 gap-1">
                    {Array.from({ length: streakInfo.targetDays }).map((_, i) => (
                      <div key={i} className={`flex-1 aspect-square rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${i < streakInfo.currentCount ? 'bg-white text-orange-500' : 'bg-orange-300/50 border-2 border-white/50 text-white/50'}`}>
                        {i < streakInfo.currentCount ? '✓' : i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="relative z-10">
                    {streakInfo.achieved ? (
                      <p className="text-sm font-bold text-center bg-white/20 py-2 rounded-xl mb-3">🎉 達成しました！クーポンを獲得しています</p>
                    ) : (
                      <p className="text-xs text-white/90 mb-3">あと<span className="font-black text-white text-sm mx-1">{streakInfo.targetDays - streakInfo.currentCount}日</span>でクーポンGET！</p>
                    )}
                    <button 
                      onClick={handleStamp} 
                      disabled={stampLoading || streakInfo.achieved || isStampedToday}
                      className={`w-full font-black py-3 rounded-xl shadow-md transition-all text-sm flex justify-center items-center gap-2
                        ${streakInfo.achieved ? 'bg-white/50 text-white/50 cursor-not-allowed' 
                        : isStampedToday ? 'bg-white/80 text-orange-400 cursor-not-allowed'
                        : 'bg-white text-orange-600 hover:scale-[1.02] active:scale-95'}`}
                    >
                      {stampLoading ? '処理中...' : streakInfo.achieved ? '獲得済み' : isStampedToday ? '今日は押しました✅' : '🎯 今日のスタンプを押す'}
                    </button>
                  </div>
                </div>
              )}

              {/* 記念日・誕生日設定（PRO） */}
              {shopData?.plan === 'pro' && (
                <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-orange-100">
                  <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2 text-sm">🎂 記念日・誕生日設定</h3>
                  {savedBirthMonth && savedBirthDay ? (
                    <p className="text-sm text-gray-700">設定済み: <strong>{savedBirthMonth}月{savedBirthDay}日</strong></p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className="flex-1 p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-orange-500">
                          <option value="">月</option>
                          {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{i+1}月</option>)}
                        </select>
                        <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="flex-1 p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-orange-500">
                          <option value="">日</option>
                          {Array.from({ length: 31 }, (_, i) => <option key={i+1} value={i+1}>{i+1}日</option>)}
                        </select>
                      </div>
                      <p className="text-[11px] text-orange-600 font-bold">⚠️ 一度設定すると後から変更できません</p>
                      <button onClick={handleSetBirthday} disabled={birthdaySetStatus === 'saving'} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm transition-colors">
                        {birthdaySetStatus === 'saving' ? '設定中...' : '設定する'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {couponStatusError && <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-4">{couponStatusError}</div>}
              
              {/* 初回クーポン */}
              {shopData?.coupon?.enabled && !couponUsed && (
                <CouponDisplay
                  key={`first:${shopData.coupon.expiresAt || ''}`}
                  storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:first:${shopData.coupon.expiresAt || ''}`}
                  legacyHiddenKey="first" shopId={shopId}
                  title={shopData.coupon.title || '初回限定クーポン'} now={couponNow}
                  expiresAt={couponExpiry({ expireType: 'date', expireDate: shopData.coupon.expiresAt }, null)}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">初回限定</span>
                      {shopData.coupon.expiresAt && <span className="text-[10px] text-gray-400 font-medium">{shopData.coupon.expiresAt} まで</span>}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">🎁 {shopData.coupon.title || '初回限定クーポン'}</h3>
                    <p className="text-xs text-gray-500 mb-4">{shopData.coupon.description}</p>
                    <button onClick={() => openQR(shopData.coupon.title || '初回限定クーポン', 'first')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2 shadow-sm">
                      <span className="text-lg">📱</span> QRコードを提示する
                    </button>
                  </div>
                </CouponDisplay>
              )}

              {/* 通常クーポン */}
              {shopData?.normalCoupon?.enabled && (
                <CouponDisplay
                  key={`normal:${shopData.normalCoupon.couponId || 'legacy'}`}
                  storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:normal:${shopData.normalCoupon.couponId || 'legacy'}:${shopData.normalCoupon.expiresAt || ''}`}
                  legacyHiddenKey={`normal:${shopData.normalCoupon.couponId || 'legacy'}`} shopId={shopId}
                  title={shopData.normalCoupon.title || '通常クーポン'} now={couponNow}
                  expiresAt={couponExpiry({ expireType: 'date', expireDate: shopData.normalCoupon.expiresAt }, null)}
                  used={normalCouponUsed} usedAt={couponUsedAt.normal}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">通常クーポン</span>
                      {shopData.normalCoupon.expiresAt && <span className="text-[10px] text-gray-400 font-medium">{shopData.normalCoupon.expiresAt} まで</span>}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">🎟️ {shopData.normalCoupon.title || '通常クーポン'}</h3>
                    <p className="text-xs text-gray-500 mb-4">{shopData.normalCoupon.description}</p>
                    <button onClick={() => openQR(shopData.normalCoupon.title || '通常クーポン', 'normal')} className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2">
                      <span className="text-lg">📱</span> QRコードを提示する
                    </button>
                  </div>
                </CouponDisplay>
              )}

              {/* 記念日・誕生日クーポン */}
              {shopData?.proCoupons?.birthday?.enabled && birthdayCouponAvailable && (
                <CouponDisplay
                  key={`birthday:${new Date(couponNow).getFullYear()}`}
                  storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:birthday:${new Date(couponNow).getFullYear()}`}
                  shopId={shopId} title={shopData.proCoupons.birthday.title || '記念日、お誕生日クーポン'}
                  now={couponNow} used={birthdayCouponUsed} usedAt={couponUsedAt.birthday}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-200 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">記念日・お誕生日</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">🎂 {shopData.proCoupons.birthday.title || '記念日、お誕生日クーポン'}</h3>
                    <p className="text-xs text-gray-500 mb-4">{shopData.proCoupons.birthday.message || '特別な日のクーポンです。'}</p>
                    <button onClick={() => openQR(shopData.proCoupons.birthday.title || '記念日クーポン', 'birthday')} className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2">
                      <span className="text-lg">📱</span> QRコードを提示する
                    </button>
                  </div>
                </CouponDisplay>
              )}

              {/* 休眠復活クーポン */}
              {shopData?.proCoupons?.dormant?.enabled && dormantCouponAvailable && (
                <CouponDisplay
                  key={`dormant:${dormantNotifiedAt}`}
                  storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:dormant:${dormantNotifiedAt}`}
                  shopId={shopId} title={shopData.proCoupons.dormant.title || '復帰クーポン'} now={couponNow}
                  expiresAt={couponExpiry({ ...shopData.proCoupons.dormant, expireType: 'days' }, dormantNotifiedAt, 14)}
                  used={dormantCouponUsed} usedAt={couponUsedAt.dormant}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-300 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-400"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-gray-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">休眠復活</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">💤 {shopData.proCoupons.dormant.title || '復帰クーポン'}</h3>
                    <p className="text-xs text-gray-500 mb-4">{shopData.proCoupons.dormant.message || 'お久しぶりの方限定クーポンです。'}</p>
                    <button onClick={() => openQR(shopData.proCoupons.dormant.title || '復帰クーポン', 'dormant')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2">
                      <span className="text-lg">📱</span> QRコードを提示する
                    </button>
                  </div>
                </CouponDisplay>
              )}

              {/* 予約クーポン */}
              {(shopData?.scheduledCoupons || []).map((coupon: any) => {
                const used = scheduledCouponUsedIds.includes(coupon.id);
                return (
                  <CouponDisplay
                    key={coupon.id}
                    storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:scheduled:${coupon.id}:${coupon.expiresAt || ''}`}
                    legacyHiddenKey={`scheduled:${coupon.id}`} shopId={shopId}
                    title={coupon.title || '予約クーポン'} now={couponNow}
                    expiresAt={coupon.expiresAt ? new Date(coupon.expiresAt).getTime() : null}
                    used={used} usedAt={couponUsedAt.scheduled[coupon.id]}
                  >
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-200 relative overflow-hidden text-center">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500"></div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">予約クーポン</span>
                        {coupon.expiresAt && <span className="text-[10px] text-gray-400 font-medium">{new Date(coupon.expiresAt).toLocaleDateString('ja-JP')} まで</span>}
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">🎫 {coupon.title || '予約クーポン'}</h3>
                      <p className="text-xs text-gray-500 mb-4">{coupon.body}</p>
                      <button onClick={() => openQR(coupon.title || '予約クーポン', 'scheduled', coupon.id)} className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2">
                        <span className="text-lg">📱</span> QRコードを提示する
                      </button>
                    </div>
                  </CouponDisplay>
                );
              })}

              {/* ステップアップクーポン */}
              {shopData?.proCoupons?.stepUp?.enabled && shopData.proCoupons.stepUp.steps?.[stepUpIndex] && (
                <CouponDisplay
                  key={`step-up:${shopData.proCoupons.stepUp.campaignId || 'legacy'}:${stepUpIndex}`}
                  storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:step-up:${shopData.proCoupons.stepUp.campaignId || 'legacy'}:${stepUpIndex}:${stepUpIndexAppearedAt || ''}`}
                  shopId={shopId} title={shopData.proCoupons.stepUp.steps[stepUpIndex].title || `ステップ${stepUpIndex + 1}`}
                  now={couponNow} expiresAt={couponExpiry(shopData.proCoupons.stepUp.steps[stepUpIndex], stepUpIndexAppearedAt)}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-200 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-purple-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">ステップアップ</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">🐾 {shopData.proCoupons.stepUp.steps[stepUpIndex].title || `ステップ${stepUpIndex + 1}`}</h3>
                    <p className="text-xs text-gray-500 mb-4">ステップ {stepUpIndex + 1} の特典です。</p>
                    <button onClick={() => openQR(shopData.proCoupons.stepUp.steps[stepUpIndex].title || `ステップ${stepUpIndex + 1}`, 'step-up')} className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2">
                      <span className="text-lg">📱</span> QRコードを提示する
                    </button>
                  </div>
                </CouponDisplay>
              )}

              {/* 連続クーポン */}
              {shopData?.proCoupons?.repeat?.enabled && (
                <CouponDisplay
                  key={`repeat:${shopData.proCoupons.repeat.campaignId || 'legacy'}:${repeatCouponActiveUntil || ''}`}
                  storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:repeat:${shopData.proCoupons.repeat.campaignId || 'legacy'}:${repeatCouponActiveUntil || ''}`}
                  shopId={shopId} title={shopData.proCoupons.repeat.title || '連続クーポン'} now={couponNow}
                  expiresAt={couponExpiry(shopData.proCoupons.repeat, null) ?? (repeatCouponActiveUntil ? new Date(repeatCouponActiveUntil).getTime() : null)}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-200 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-sky-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">連続クーポン</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">🔄 {shopData.proCoupons.repeat.title || '連続クーポン'}</h3>
                    {repeatCouponUsedToday ? (
                      <p className="text-sm font-bold text-red-500 mb-4">本日は使用済みです。次回は翌日から利用できます。</p>
                    ) : (
                      <button onClick={() => openQR(shopData.proCoupons.repeat.title || '連続クーポン', 'repeat')} className="w-full bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2">
                        <span className="text-lg">📱</span> QRコードを提示する
                      </button>
                    )}
                  </div>
                </CouponDisplay>
              )}

              {/* 特別達成クーポン */}
              {shopData?.loyaltyCoupon?.enabled && loyaltyCouponAvailable && (
                <CouponDisplay
                  key={`loyalty:${loyaltyAchievedAt || ''}`}
                  storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:loyalty:${loyaltyAchievedAt || ''}:${shopData.loyaltyCoupon.expireDate || ''}`}
                  shopId={shopId} title={shopData.loyaltyCoupon.title || '特別達成クーポン'} now={couponNow}
                  expiresAt={couponExpiry(shopData.loyaltyCoupon, loyaltyAchievedAt)}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-200 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">特別達成</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">🏆 {shopData.loyaltyCoupon.title || '特別達成クーポン'}</h3>
                    <p className="text-xs text-gray-500 mb-4">通常クーポンを規定回数ご利用いただいた特典です。</p>
                    <button onClick={() => openQR(shopData.loyaltyCoupon.title || '特別達成クーポン', 'loyalty')} className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2">
                      <span className="text-lg">📱</span> QRコードを提示する
                    </button>
                  </div>
                </CouponDisplay>
              )}

              {/* 連続ログイン達成クーポン */}
              {shopData?.plan === 'pro' && streakInfo?.enabled && streakInfo.achieved && streakInfo.achievedAt && (
                <CouponDisplay
                  key={`streak:${streakInfo.achievedAt}`}
                  storageKey={`push_taro_coupon_display:${shopId}:${fcmToken}:streak:${streakInfo.achievedAt}`}
                  shopId={shopId}
                  title={shopData?.streakCoupon?.couponName || '連続ログイン達成クーポン'}
                  now={couponNow}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-300 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">🔥 連続ログイン達成</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">🎉 {shopData?.streakCoupon?.couponName || '連続ログイン達成クーポン'}</h3>
                    <p className="text-xs text-gray-500 mb-4">{streakInfo.targetDays}日連続ログイン達成のご褒美クーポンです。</p>
                    <button onClick={() => openQR(shopData?.streakCoupon?.couponName || '連続ログイン達成クーポン', 'streak')} className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-3 rounded-xl text-sm transition-all flex justify-center items-center gap-2">
                      <span className="text-lg">📱</span> QRコードを提示する
                    </button>
                  </div>
                </CouponDisplay>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="flex bg-gray-200 p-1 rounded-xl mb-4">
                <button onClick={() => { setHistoryTab('notifications'); loadNotificationHistory(); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${historyTab === 'notifications' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>通知履歴</button>
                <button onClick={() => { setHistoryTab('coupons'); void loadCouponHistory(); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${historyTab === 'coupons' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>クーポン使用履歴</button>
              </div>

              {historyTab === 'notifications' ? (
                <div className="space-y-3">
                  {historyList.length === 0 ? <p className="text-center text-gray-400 text-sm py-10">通知履歴はありません</p> : historyList.slice(0, displayCount).map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <h4 className="font-bold text-sm text-gray-800 mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{item.body}</p>
                      {item.url && item.url !== '/' && <a href={withReturnButton(item.url)} className="text-xs text-blue-600 font-bold">詳細を見る →</a>}
                    </div>
                  ))}
                  {displayCount < historyList.length && (
                    <button onClick={() => setDisplayCount(prev => prev + 10)} className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm mt-2">もっと見る</button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {couponHistory.length === 0 ? <p className="text-center text-gray-400 text-sm py-10">使用履歴はありません</p> : couponHistory.map((entry) => (
                    <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                      <div>
                        <strong className="text-sm font-bold text-gray-800 block mb-1">{entry.title}</strong>
                        <span className="text-[10px] text-gray-400">{entry.usedAt ? new Date(entry.usedAt).toLocaleString('ja-JP') : ''}</span>
                      </div>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">使用済み</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QRモーダル */}
          {qrModal.open && (
            <div
              className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-5"
              onClick={() => setQrModal(prev => ({ ...prev, open: false }))}
            >
              <div
                className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-bold text-gray-800 text-base mb-1">{qrModal.title}</h3>
                <p className="text-[11px] text-gray-500 mb-4">
                  会計時にこちらのQRコードを<br />スタッフにご提示ください
                </p>
                <div className="bg-orange-50 p-4 rounded-2xl inline-block mb-4">
                  <QRCodeSVG value={qrModal.value} size={192} />
                </div>
                <button
                  onClick={() => setQrModal(prev => ({ ...prev, open: false }))}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around pt-2 pb-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button onClick={() => setActiveTab('coupons')} className={`flex flex-col items-center w-1/2 transition-colors ${activeTab === 'coupons' ? 'text-orange-500' : 'text-gray-400'}`}>
            <span className="text-xl mb-1">🎫</span>
            <span className="text-[10px] font-bold">クーポン</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center w-1/2 transition-colors ${activeTab === 'history' ? 'text-orange-500' : 'text-gray-400'}`}>
            <span className="text-xl mb-1">📜</span>
            <span className="text-[10px] font-bold">履歴</span>
          </button>
        </nav>
      </div>
    );
  }

  // 🔔 【初期登録画面】
  return (
    <main style={{ padding: 24, maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <div style={{ marginTop: 40, marginBottom: 20 }}>
        {shopData?.iconUrl && (
          <img
            src={shopData.iconUrl}
            alt={shopData?.name || '店舗アイコン'}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px auto' }}
          />
        )}
        <h1 style={{ fontSize: '22px', margin: '0 0 8px 0' }}>{shopData?.name}</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>お得な情報をプッシュ通知でお届けします</p>
      </div>

      {status === 'success' ? (
        <div style={{ marginTop: 30 }}>
          <div style={{ fontSize: 54 }}>✅</div>
          <p style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '16px', marginTop: '10px' }}>通知の受け取りが完了しました！</p>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>まもなく専用画面に切り替わります...</p>
        </div>
      ) : (
        <>
          {!customerUid && !confirmationResult && (
            <div style={{ textAlign: 'left', marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>電話番号認証</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+81 90 1234 5678"
                style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={handleSendVerificationCode} disabled={phoneAuthLoading} style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '15px', background: phoneAuthLoading ? '#cbd5e1' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: phoneAuthLoading ? 'wait' : 'pointer', fontWeight: 'bold' }}>
                {phoneAuthLoading ? '送信中...' : 'SMS認証コードを送る'}
              </button>
            </div>
          )}
          {confirmationResult && (
            <div style={{ textAlign: 'left', marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>SMS認証コード</label>
              <input
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6桁のコード"
                style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={handleConfirmVerificationCode} disabled={phoneAuthLoading} style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '15px', background: phoneAuthLoading ? '#cbd5e1' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: phoneAuthLoading ? 'wait' : 'pointer', fontWeight: 'bold' }}>
                {phoneAuthLoading ? '確認中...' : '認証する'}
              </button>
            </div>
          )}
          {customerUid && (
            <button
              onClick={handleSubscribe}
              disabled={status === 'requesting'}
              style={{ width: '100%', padding: 16, fontSize: 16, background: status === 'requesting' ? '#ccc' : '#ff4500', color: '#fff', border: 'none', borderRadius: 8, cursor: status === 'requesting' ? 'wait' : 'pointer', fontWeight: 'bold' }}
            >
              {status === 'requesting' ? '登録中...' : '🔔 通知を受け取る'}
            </button>
          )}
          <div id="recaptcha-container" />
        </>
      )}

      {status === 'error' && (
        <p style={{ color: 'red', marginTop: 16, whiteSpace: 'pre-line', fontSize: '14px' }}>{message}</p>
      )}
    </main>
  );
}
