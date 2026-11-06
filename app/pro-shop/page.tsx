'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { db as localDb, exportHistoryToJSON, PushHistory } from '../../lib/db';
import { QRCodeSVG } from 'qrcode.react';
import ImageUploader from '../../components/ImageUploader';
import { Html5Qrcode } from 'html5-qrcode';
import ShopPopSection from '@/components/print/ShopPopSection';
import CouponHistorySection from '../../components/CouponHistorySection';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
    </label>
  );
}

export default function ProShopPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 店舗情報
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('');
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [couponTitle, setCouponTitle] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [clientLinkUrl, setClientLinkUrl] = useState('');
  const [shopIconUrl, setShopIconUrl] = useState('');

  // タブ管理
  const [activeTab, setActiveTab] = useState<'push' | 'history' | 'redeem' | 'shop' | 'pro' | 'reserve'>('push');

  // 即時通知
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 履歴・購読者
  const [history, setHistory] = useState<PushHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  // 退会
  const [shopStatus, setShopStatus] = useState<string>('active');
  const [validUntilDate, setValidUntilDate] = useState<string>('');

  // 通常クーポン
  const [normalCouponEnabled, setNormalCouponEnabled] = useState(false);
  const [normalCouponTitle, setNormalCouponTitle] = useState('');
  const [normalCouponDesc, setNormalCouponDesc] = useState('');
  const [normalCouponExpiresAt, setNormalCouponExpiresAt] = useState('');

  // 特別達成クーポン
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [loyaltyTargetCount, setLoyaltyTargetCount] = useState(3);
  const [loyaltyTitle, setLoyaltyTitle] = useState('');
  const [loyaltyExpireType, setLoyaltyExpireType] = useState('none');
  const [loyaltyExpireDays, setLoyaltyExpireDays] = useState(7);
  const [loyaltyExpireDate, setLoyaltyExpireDate] = useState('');
  const [loyaltyCombinable, setLoyaltyCombinable] = useState(false);
  const [loyaltyRepeatEnabled, setLoyaltyRepeatEnabled] = useState(false);

  // PRO機能：ステップアップ
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpList, setStepUpList] = useState<Array<{ title: string; expireType: string; expireDays: number; expireDate?: string; combinable: boolean; sameDayCombinable: boolean }>>([
    { title: '', expireType: 'days', expireDays: 7, combinable: false, sameDayCombinable: false },
    { title: '', expireType: 'days', expireDays: 14, combinable: false, sameDayCombinable: false },
  ]);

  // PRO機能：連続クーポン
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatTitle, setRepeatTitle] = useState('');
  const [repeatExpireType, setRepeatExpireType] = useState('days');
  const [repeatExpireDays, setRepeatExpireDays] = useState(14);
  const [repeatExpireDate, setRepeatExpireDate] = useState('');
  const [repeatCombinable, setRepeatCombinable] = useState(false);
  const [repeatSameDayCombinable, setRepeatSameDayCombinable] = useState(false);

  // PRO機能：誕生日
  const [birthdayEnabled, setBirthdayEnabled] = useState(false);
  const [birthdayTitle, setBirthdayTitle] = useState('');
  const [birthdayMessage, setBirthdayMessage] = useState('');
  const [birthdayCombinable, setBirthdayCombinable] = useState(true);
  const [birthdaySameDayCombinable, setBirthdaySameDayCombinable] = useState(false);

  // PRO機能：休眠復活
  const [dormantEnabled, setDormantEnabled] = useState(false);
  const [dormantTargetDays, setDormantTargetDays] = useState(60);
  const [dormantTitle, setDormantTitle] = useState('');
  const [dormantMessage, setDormantMessage] = useState('');
  const [dormantExpireDays, setDormantExpireDays] = useState(14);
  const [dormantCombinable, setDormantCombinable] = useState(false);
  const [dormantSameDayCombinable, setDormantSameDayCombinable] = useState(false);

  // 連続ログイン用ステート
  const [streakEnabled, setStreakEnabled] = useState(false);
  const [streakTargetDays, setStreakTargetDays] = useState(5);
  const [streakCouponName, setStreakCouponName] = useState('');
  const [streakNotifyEnabled, setStreakNotifyEnabled] = useState(true);
  const [streakNotifyTitle, setStreakNotifyTitle] = useState('あと1日でクーポンGET！🔥');
  const [streakNotifyBody, setStreakNotifyBody] = useState('連続ログイン達成まであと1日です！今日中にアプリを開いてスタンプを押して、リセットを防ぎましょう。');
  const [streakCampaignId, setStreakCampaignId] = useState<string | null>(null); // 👈 追加

  // 予約配信
  const [scheduledList, setScheduledList] = useState<Array<{
    id: string;
    type: 'notification' | 'coupon';
    scheduleType: 'once' | 'monthly' | 'weekly';
    scheduleValue: string;
    title: string;
    body: string;
    linkUrl?: string;
    couponExpireDays?: number;
    sameDayCombinable?: boolean;
    loyaltyCountable?: boolean;
  }>>([]);

  const [reserveType, setReserveType] = useState<'notification' | 'coupon'>('notification');
  const [reserveScheduleType, setReserveScheduleType] = useState<'once' | 'monthly' | 'weekly'>('once');
  const [reserveDate, setReserveDate] = useState('');
  const [reserveDayOfMonth, setReserveDayOfMonth] = useState('1');
  const [reserveDayOfWeek, setReserveDayOfWeek] = useState('mon');
  const [reserveTitle, setReserveTitle] = useState('');
  const [reserveBody, setReserveBody] = useState('');
  const [reserveLinkUrl, setReserveLinkUrl] = useState('');
  const [reserveCouponExpireDays, setReserveCouponExpireDays] = useState(14);
  const [reserveCouponSameDayCombinable, setReserveCouponSameDayCombinable] = useState(false);
  const [reserveCouponLoyaltyCountable, setReserveCouponLoyaltyCountable] = useState(false);

  // QRスキャン
  const [scanOpen, setScanOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoadingAuth(false);

      if (u) {
        await loadHistory(undefined, u);

        try {
          const idToken = await u.getIdToken();

          const res = await fetch('/api/create-shop', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({}),
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            await signOut(auth);
            setUser(null);
            setLoginError('このアカウントはPRO管理画面を利用できません。');
            return;
          }

          if (String(data.shop?.plan || '').toLowerCase() !== 'pro') {
            await signOut(auth);
            setUser(null);
            setLoginError('PROプラン専用の管理画面です。');
            return;
          }

          if (data.success) {
            const currentShopId = data.shopId;
            setShopId(currentShopId);
            await loadHistory(currentShopId, u);

            const dashRes = await fetch(`/api/dashboard?shopId=${currentShopId}`, {
              headers: { 'Authorization': `Bearer ${idToken}` },
            });

            if (dashRes.ok) {
              const dashData = await dashRes.json();
              const shop = dashData.shop || data.shop;

              setShopName(shop?.name || '');

              if (shop?.scheduledList) {
                setScheduledList(shop.scheduledList);
              }

              if (shop?.status) setShopStatus(shop.status);
              if (shop?.validUntil) {
                const vDate = shop.validUntil._seconds
                  ? new Date(shop.validUntil._seconds * 1000)
                  : new Date(shop.validUntil);
                setValidUntilDate(vDate.toISOString().slice(0, 10));
              }

              if (shop?.normalCoupon) {
                setNormalCouponEnabled(shop.normalCoupon.enabled || false);
                setNormalCouponTitle(shop.normalCoupon.title || '');
                setNormalCouponDesc(shop.normalCoupon.description || '');
                setNormalCouponExpiresAt(shop.normalCoupon.expiresAt || '');
              }

              if (shop?.loyaltyCoupon) {
                setLoyaltyEnabled(shop.loyaltyCoupon.enabled || false);
                setLoyaltyTargetCount(shop.loyaltyCoupon.targetCount || 3);
                setLoyaltyTitle(shop.loyaltyCoupon.title || '');
                setLoyaltyExpireType(shop.loyaltyCoupon.expireType || 'none');
                if (shop.loyaltyCoupon.expireDays) setLoyaltyExpireDays(shop.loyaltyCoupon.expireDays);
                if (shop.loyaltyCoupon.expireDate) setLoyaltyExpireDate(shop.loyaltyCoupon.expireDate);
                setLoyaltyCombinable(shop.loyaltyCoupon.combinable || false);
                setLoyaltyRepeatEnabled(shop.loyaltyCoupon.repeatEnabled === true);
              }

              if (shop?.proCoupons) {
                const pro = shop.proCoupons;
                if (pro.stepUp) {
                  setStepUpEnabled(pro.stepUp.enabled || false);
                  if (pro.stepUp.steps) setStepUpList(pro.stepUp.steps.map((step: any) => ({ ...step, combinable: step.combinable ?? step.loyaltyCountable ?? false, sameDayCombinable: step.sameDayCombinable === true })));
                }
                if (pro.repeat) {
                  setRepeatEnabled(pro.repeat.enabled || false);
                  setRepeatTitle(pro.repeat.title || '');
                  setRepeatExpireType(pro.repeat.expireType || 'days');
                  setRepeatExpireDays(pro.repeat.expireDays || 14);
                  setRepeatExpireDate(pro.repeat.expireDate || '');
                  setRepeatCombinable(pro.repeat.loyaltyCountable ?? pro.repeat.combinable ?? false);
                  setRepeatSameDayCombinable(pro.repeat.sameDayCombinable === true);
                }
                if (pro.birthday) {
                  setBirthdayEnabled(pro.birthday.enabled || false);
                  setBirthdayTitle(pro.birthday.title || '');
                  setBirthdayMessage(pro.birthday.message || '');
                  setBirthdayCombinable(pro.birthday.loyaltyCountable ?? pro.birthday.combinable ?? false);
                  setBirthdaySameDayCombinable(pro.birthday.sameDayCombinable === true);
                }
                if (pro.dormant) {
                  setDormantEnabled(pro.dormant.enabled || false);
                  setDormantTargetDays(pro.dormant.targetDays || 60);
                  setDormantTitle(pro.dormant.title || '');
                  setDormantMessage(pro.dormant.message || '');
                  setDormantExpireDays(pro.dormant.expireDays || 14);
                  setDormantCombinable(pro.dormant.loyaltyCountable ?? pro.dormant.combinable ?? false);
                  setDormantSameDayCombinable(pro.dormant.sameDayCombinable === true);
                }
              }

              if (shop?.streakCoupon) {
                setStreakEnabled(shop.streakCoupon.enabled || false);
                setStreakTargetDays(shop.streakCoupon.targetDays || 5);
                setStreakCouponName(shop.streakCoupon.couponName || '');
                setStreakNotifyEnabled(shop.streakCoupon.notifyEnabled !== false);
                setStreakNotifyTitle(shop.streakCoupon.notifyTitle || 'あと1日でクーポンGET！🔥');
                setStreakNotifyBody(shop.streakCoupon.notifyBody || '連続ログイン達成まであと1日です！今日中にアプリを開いてスタンプを押して、リセットを防ぎましょう。');
                if (shop.streakCoupon.campaignId) setStreakCampaignId(shop.streakCoupon.campaignId); // 👈 追加
              }

              if (shop?.coupon) {
                setCouponEnabled(shop.coupon.enabled);
                setCouponTitle(shop.coupon.title || '');
                setCouponDesc(shop.coupon.description || '');
              }
              if (shop?.linkUrl) setClientLinkUrl(shop.linkUrl);
              if (shop?.iconUrl) setShopIconUrl(shop.iconUrl);

              if (dashData.stats && typeof dashData.stats.subscriberCount === 'number') {
                setSubscriberCount(dashData.stats.subscriberCount);
              }
            }
          }
        } catch (err) {
          console.error('店舗情報取得エラー:', err);
        }
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!shopId) return;
    let manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.rel = 'manifest';
      document.head.appendChild(manifest);
    }
    manifest.href = `/manifest/${shopId}?mode=pro`;
    document.title = shopName || 'Push-taro';

    if (shopIconUrl) {
      let icon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'apple-touch-icon';
        document.head.appendChild(icon);
      }
      icon.href = shopIconUrl;
    }

    let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement | null;
    if (!appleTitle) {
      appleTitle = document.createElement('meta');
      appleTitle.name = 'apple-mobile-web-app-title';
      document.head.appendChild(appleTitle);
    }
    appleTitle.content = shopName || 'Push-taro';
  }, [shopId, shopName, shopIconUrl]);

  const loadHistory = async (targetShopId = shopId, targetUser = user) => {
    setHistoryLoading(true);
    try {
      const all = await localDb.history.orderBy('sentAt').reverse().toArray();
      if (!targetShopId || !targetUser) {
        setHistory(all);
        return;
      }

      const idToken = await targetUser.getIdToken();
      const response = await fetch(`/api/push-history?shopId=${encodeURIComponent(targetShopId)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) {
        setHistory(all);
        return;
      }
      const data = await response.json();
      const remote = new Map<string, PushHistory>(
        data.histories.map((item: PushHistory & { sentAt: string | null }) => [
          item.notificationId,
          { ...item, sentAt: item.sentAt ? new Date(item.sentAt) : new Date() },
        ])
      );
      const localNotificationIds = new Set(all.map((item) => item.notificationId).filter(Boolean));
      const mergedLocal = all.map((item) => ({ ...item, ...(item.notificationId ? remote.get(item.notificationId) : {}) }));
      const remoteOnly = Array.from(remote.values()).filter((item) => !localNotificationIds.has(item.notificationId));
      setHistory([...mergedLocal, ...remoteOnly].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime()));
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError('メールアドレスまたはパスワードが正しくありません。');
    }
  };

  const startCamera = async () => {
    try {
      setScanLoading(true);
      const html5QrCode = new Html5Qrcode('qr-reader');
      (window as any).__html5QrCode = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopCamera();
          handleRedeemCoupon(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      console.error('カメラ起動エラー:', err);
      const name = err?.name || '';
      const message = err?.message || String(err);
      if (name === 'NotAllowedError' || message.includes('Permission')) {
        alert('📷 カメラの使用が許可されていません。\nブラウザの設定から、このサイトのカメラ利用を「許可」にしてください。');
      } else if (name === 'NotFoundError' || message.includes('not found')) {
        alert('📷 カメラが見つかりません。\nカメラ付きの端末でお試しください。');
      } else {
        alert('❌ カメラの起動に失敗しました。\n' + message);
      }
    } finally {
      setScanLoading(false);
    }
  };

  const stopCamera = async () => {
    const html5QrCode = (window as any).__html5QrCode;
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop();
        html5QrCode.clear();
      } catch (err) {
        console.error('カメラ停止エラー:', err);
      }
    }
    (window as any).__html5QrCode = null;
  };

  useEffect(() => {
    if (!scanOpen || scanResult) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        await startCamera();
      } catch (err) {
        if (!cancelled) console.error('カメラ自動起動エラー:', err);
      }
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanOpen, scanResult]);

  const handleRedeemCoupon = async (qrDataStr: string) => {
    try {
      setScanLoading(true);
      const parsedData = JSON.parse(qrDataStr);

      if (!parsedData.shopId || !parsedData.couponType || !parsedData.token) {
        alert('❌ 無効なクーポンQRコードです。');
        setScanOpen(false);
        return;
      }

      if (user) {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/redeem-coupon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(parsedData),
        });

        const data = await res.json();
        if (res.ok) {
          setScanResult(`✅ 消し込み完了！\n【${data.couponTitle}】を適用しました。`);
        } else {
          alert('❌ エラー: ' + data.error);
        }
      }
    } catch (err) {
      alert('❌ QRコードの形式が正しくありません。');
    } finally {
      setScanLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !shopId) {
      setMessage('❌ ユーザーまたは店舗IDが取得できていません');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ shopId, title, body, url: linkUrl || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '送信に失敗しました');
      }

      await localDb.history.add({
        title,
        body,
        linkUrl: linkUrl || undefined,
        sentAt: new Date(),
        status: 'pending',
        successCount: data.successCount || 0,
        notificationId: data.notificationId,
        jobId: data.jobId,
        openedCount: 0,
        openRate: 0,
      });

      await loadHistory();

      setMessage('✨ 送信を受け付けました。バックグラウンドで配信します。');
      setTitle('');
      setBody('');
      setLinkUrl('');

      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('送信エラー:', err);
      setMessage(`❌ エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user || !shopId) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/update-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          shopId,
          name: shopName,
          normalCoupon: {
            enabled: normalCouponEnabled,
            title: normalCouponTitle,
            description: normalCouponDesc,
            expiresAt: normalCouponExpiresAt,
          },
          loyaltyCoupon: {
            enabled: loyaltyEnabled,
            targetCount: loyaltyTargetCount,
            title: loyaltyTitle,
            expireType: loyaltyExpireType,
            expireDays: loyaltyExpireDays,
            expireDate: loyaltyExpireDate,
            combinable: loyaltyCombinable,
            repeatEnabled: loyaltyRepeatEnabled,
          },
          proCoupons: {
            stepUp: { enabled: stepUpEnabled, steps: stepUpList.map(({ combinable, ...step }) => ({ ...step, loyaltyCountable: combinable })) },
            repeat: { enabled: repeatEnabled, title: repeatTitle, expireType: repeatExpireType, expireDays: repeatExpireDays, expireDate: repeatExpireDate, loyaltyCountable: repeatCombinable, sameDayCombinable: repeatSameDayCombinable },
            birthday: { enabled: birthdayEnabled, title: birthdayTitle, message: birthdayMessage, loyaltyCountable: birthdayCombinable, sameDayCombinable: birthdaySameDayCombinable },
            dormant: { enabled: dormantEnabled, targetDays: dormantTargetDays, title: dormantTitle, message: dormantMessage, expireDays: dormantExpireDays, loyaltyCountable: dormantCombinable, sameDayCombinable: dormantSameDayCombinable },
          },
          // 👇 追加：連続ログイン特典
          streakCoupon: {
            enabled: streakEnabled,
            targetDays: streakTargetDays,
            couponName: streakCouponName,
            notifyEnabled: streakNotifyEnabled,
            notifyTitle: streakNotifyTitle,
            notifyBody: streakNotifyBody,
            ...(streakCampaignId ? { campaignId: streakCampaignId } : {}),
          },
          coupon: {
            enabled: couponEnabled,
            title: couponTitle,
            description: couponDesc,
          },
          linkUrl: clientLinkUrl,
          iconUrl: shopIconUrl,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setMessage('✅ 設定を保存しました');
        setTimeout(() => {
          setSaveSuccess(false);
          setMessage('');
        }, 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage('❌ 保存エラー: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveTitle || !reserveBody) {
      alert('タイトルと本文を入力してください');
      return;
    }

    let val = '';
    if (reserveScheduleType === 'once') {
      if (!reserveDate) {
        alert('配信指定日を入力してください');
        return;
      }
      val = reserveDate;
    } else if (reserveScheduleType === 'monthly') {
      val = `毎月 ${reserveDayOfMonth} 日`;
    } else if (reserveScheduleType === 'weekly') {
      const dayMap: Record<string, string> = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日' };
      val = `毎週 ${dayMap[reserveDayOfWeek] || ''} 曜日`;
    }

    const newItem = {
      id: Date.now().toString(),
      type: reserveType,
      scheduleType: reserveScheduleType,
      scheduleValue: val,
      scheduleRaw: {
        date: reserveDate,
        dayOfMonth: reserveDayOfMonth,
        dayOfWeek: reserveDayOfWeek,
      },
      title: reserveTitle,
      body: reserveBody,
      linkUrl: reserveLinkUrl || undefined,
      couponExpireDays: reserveType === 'coupon' ? Math.max(1, reserveCouponExpireDays) : undefined,
      sameDayCombinable: reserveType === 'coupon' ? reserveCouponSameDayCombinable : undefined,
      loyaltyCountable: reserveType === 'coupon' ? reserveCouponLoyaltyCountable : undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [...scheduledList, newItem];
    setScheduledList(updatedList);

    if (user && shopId) {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/update-shop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ shopId, scheduledList: updatedList }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert('❌ 予約の保存に失敗しました: ' + (data.error || `HTTP ${res.status}`));
          setScheduledList(scheduledList);
          return;
        }
      } catch (err: any) {
        console.error('予約リスト保存エラー:', err);
        alert('❌ 予約の保存に失敗しました: ' + err.message);
        setScheduledList(scheduledList);
        return;
      }
    }

    setReserveTitle('');
    setReserveBody('');
    setReserveLinkUrl('');
    setReserveCouponExpireDays(14);
    alert('✅ 予約を送信リストにセットし、保存しました！');
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('この予約配信を取り消して削除しますか？')) return;

    const updatedList = scheduledList.filter((item) => item.id !== id);
    setScheduledList(updatedList);

    if (user && shopId) {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/update-shop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ shopId, scheduledList: updatedList }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert('❌ 予約の削除に失敗しました: ' + (data.error || `HTTP ${res.status}`));
          setScheduledList(scheduledList);
        }
      } catch (err: any) {
        console.error('予約削除エラー:', err);
        alert('❌ 予約の削除に失敗しました: ' + err.message);
        setScheduledList(scheduledList);
      }
    }
  };

  const handleExport = async () => {
    const json = await exportHistoryToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `push-taro-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCleanup = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.removed}件の古いトークンを削除しました`);
      } else {
        alert('❌ クリーンアップ失敗: ' + data.error);
      }
    } catch (err: any) {
      alert('エラー: ' + err.message);
    }
  };

   if (loadingAuth) {
    return (
      <main className="max-w-lg mx-auto mt-16 text-center text-slate-500">
        <p>読み込み中...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-sm mx-auto mt-16 px-5 text-center font-sans">
        <div className="flex justify-center mb-4">
          <img src="/icon-192x192.png" alt="Push-taro" className="w-20 h-20 rounded-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Push-taro</h1>
        <p className="text-gray-500 mb-5">PROオーナー専用ログイン画面</p>
        {loginError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm mb-4">
            {loginError}
          </div>
        )}
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input type="email" placeholder="メールアドレス（ログインID）" value={email} onChange={(e) => setEmail(e.target.value)} required className="px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full box-border pl-3 pr-11 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'} className="absolute right-2 top-1/2 -translate-y-1/2 text-lg">👁</button>
          </div>
          <button type="submit" className="mt-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-lg transition-colors">ログイン</button>
        </form>
        <div className="mt-4 text-sm">
          <Link href="/reset-password?role=shop&returnTo=/pro-shop" className="text-orange-700 hover:underline">パスワードをお忘れの方</Link>
        </div>
      </main>
    );
  }

  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/subscribe?s=${shopId}` : '';

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-slate-900" style={{ fontFamily: "'Inter','Noto Sans JP',sans-serif" }}>
      <style jsx global>{`
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes spin-border { to { --angle: 360deg; } }
        .glow-border {
          position: relative; padding: 2px; border-radius: 20px;
          background: conic-gradient(from var(--angle), #f97316, #fbbf24, #f59e0b, #f97316);
          animation: spin-border 3s linear infinite;
          box-shadow: 0 6px 24px -6px rgba(249,115,22,0.35);
        }
        .glow-inner { border-radius: 18px; background: linear-gradient(135deg, #fffbf5 0%, #fff7ed 60%, #ffedd5 100%); padding: 14px 16px; }
      `}</style>

            {/* ヘッダー */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {shopIconUrl ? (
              <img src={shopIconUrl} alt="icon" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-md flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-sm sm:text-base shadow-md shadow-orange-500/25 flex-shrink-0">🍰</div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold truncate">{shopName || 'Push-taro'}</h1>
                <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white flex-shrink-0">PRO</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate hidden sm:block">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={`/notification-link?target=${encodeURIComponent('https://push-taro.com/torisetsu')}&returnTo=${encodeURIComponent('/pro-shop')}&label=${encodeURIComponent('PRO管理に戻る')}`}
              aria-label="取扱説明書"
              title="取扱説明書"
              className="inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
            >
              <span className="text-sm sm:text-xs">📖</span>
              <span className="hidden sm:inline sm:ml-1">取説</span>
            </a>
            <button onClick={() => window.location.reload()} aria-label="画面を更新" title="画面を更新" className="inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all">
              <span className="text-sm sm:text-xs">↻</span>
              <span className="hidden sm:inline sm:ml-1">更新</span>
            </button>
            <button onClick={() => signOut(auth)} className="px-2.5 sm:px-3 h-8 sm:h-auto sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] sm:text-xs font-bold transition-colors flex-shrink-0">ログアウト</button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-4 pb-20">

        {/* タブ（7つ・横スクロール） */}
        <div className="flex gap-1 p-1 bg-slate-200/60 rounded-2xl mb-4 overflow-x-auto sticky top-[62px] z-20">
          {([
            { key: 'push', label: '📢 即時配信' },
            { key: 'history', label: '📋 送信履歴' },
            { key: 'redeem', label: '🎫 消込履歴' },
            { key: 'shop', label: '🏪 店舗設定' },
            { key: 'pro', label: '🔥 PRO機能' },
            { key: 'reserve', label: '📅 予約配信' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 min-w-fit px-3 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
                activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ===== 即時配信タブ ===== */}
        {activeTab === 'push' && (
          <div className="space-y-3.5">
            <button
              onClick={() => { setScanResult(null); setScanOpen(true); }}
              className="w-full py-3.5 rounded-[18px] bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all group"
            >
              <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📷</span>
              <div className="text-left">
                <div className="text-sm font-bold text-white">クーポンQRを読み取る</div>
                <div className="text-[11px] text-slate-400">スタッフの消し込み処理</div>
              </div>
            </button>

            <form onSubmit={handleSend} className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-base shadow-sm">📢</div>
                <div>
                  <h3 className="text-sm font-bold">プッシュ通知を送信</h3>
                  <p className="text-[11px] text-slate-500">お客様のデバイスに即時配信</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 ml-1">タイトル</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="新着セールのお知らせ" className="w-full px-3.5 py-2.5 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 ml-1">本文</label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} placeholder="本日から全品20%OFFセール開催中！" className="w-full px-3.5 py-2.5 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-y" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 ml-1">リンク先URL <span className="text-slate-400 font-normal">（任意）</span></label>
                  <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com/sale" className="w-full px-3.5 py-2.5 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                </div>
                <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl text-white text-sm font-bold mt-1 transition-all ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg shadow-orange-500/40 hover:from-orange-500 hover:to-orange-600'}`}>
                  {loading ? '送信中...' : '🔥 通知を送信する'}
                </button>
                {message && <p className={`mt-2 font-bold text-sm ${message.includes('❌') ? 'text-red-600' : 'text-green-700'}`}>{message}</p>}
              </div>
            </form>

            {/* 配信無制限バッジ（ゲージではなくバッジ） */}
            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-600">🔥 月間送信ステータス</p>
                <p className="text-[10px] text-slate-400">PROプラン</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md">配信無制限</span>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-4">
                <p className="text-[11px] font-bold text-slate-500 mb-1">📱 受取許可</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{subscriberCount !== null ? subscriberCount.toLocaleString() : '—'}</p>
                <p className="text-[10px] text-slate-400 mt-1">件</p>
              </div>
              <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-4">
                <p className="text-[11px] font-bold text-slate-500 mb-1">📨 今月送信</p>
                <p className="text-2xl font-black text-slate-900 leading-none">—</p>
                <p className="text-[10px] text-slate-400 mt-1">通</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== 送信履歴タブ ===== */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold">📋 送信履歴</h2>
              <div className="flex gap-1.5">
                <button onClick={() => loadHistory()} disabled={historyLoading} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-all disabled:opacity-60">
                  🔄 {historyLoading ? '更新中...' : '更新'}
                </button>
                <button onClick={handleExport} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-all">
                  📤 エクスポート
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-10 text-center text-slate-400 text-sm">
                送信履歴がありません。
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((h) => (
                  <div key={h.id} className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <strong className="text-sm text-slate-900">{h.title}</strong>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(h.sentAt).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">{h.body}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {h.status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-slate-100 shadow-sm text-sky-700">⏳ 送信待ち</span>
                      ) : h.status === 'success' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-slate-100 shadow-sm text-emerald-700">✓ 送信成功</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-slate-100 shadow-sm text-red-700">✕ 送信失敗</span>
                      )}
                      {typeof h.successCount === 'number' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] text-slate-500">{h.successCount}件</span>
                      )}
                      {typeof h.openRate === 'number' && h.notificationId && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-slate-100 shadow-sm text-sky-700">
                          開封 {h.openRate.toFixed(1)}%
                          {typeof h.successCount === 'number' && h.successCount > 0 && `（${h.openedCount || 0}/${h.successCount}）`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user && (
              <div className="flex justify-end pt-2">
                <button onClick={handleCleanup} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-[11px] font-bold text-slate-500 transition-all">
                  🧹 古いトークン削除
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== 消込履歴タブ ===== */}
        {activeTab === 'redeem' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold">🎫 消込履歴</h2>
            </div>
            {shopId && <CouponHistorySection shopId={shopId} refreshKey={scanResult} />}
          </div>
        )}

        {/* ===== 店舗設定タブ ===== */}
        {shopId && activeTab === 'shop' && (
          <div className="space-y-3.5">

            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <h3 className="text-sm font-bold mb-4">🏪 店舗基本情報</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 ml-1">店舗名</label>
                  <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full px-3.5 py-2.5 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-sky-300 focus:ring-4 focus:ring-sky-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 ml-1">アイコン画像</label>
                  <ImageUploader onImageUploaded={(url) => setShopIconUrl(url)} currentUrl={shopIconUrl} />
                </div>
                <p className="text-[11px] text-slate-500">店舗ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{shopId}</code></p>
              </div>
            </div>

            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-center">
                <p className="text-[11px] font-bold text-slate-400 mb-3">📱 顧客用QRコード</p>
                {qrUrl && (
                  <div className="inline-block bg-white p-2.5 rounded-2xl shadow-2xl">
                    <QRCodeSVG value={qrUrl} size={128} />
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-3">スマホで読み取って通知を受け取れます</p>
              </div>
            </div>

            {/* 店頭POP */}
            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-base shadow-sm">🖨️</div>
                <div>
                  <h3 className="text-sm font-bold">店頭POP（印刷用）</h3>
                  <p className="text-[11px] text-slate-500">レジ横に貼るQRコードポップ</p>
                </div>
              </div>
              <ShopPopSection shopId={shopId} returnTo="/pro-shop" />
            </div>

            {/* クーポン設定 */}
            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5 space-y-5">

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><span className="text-base">🎫</span><h4 className="text-sm font-bold">初回クーポン</h4></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={couponEnabled} onChange={(e) => setCouponEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                </div>
                {couponEnabled && (
                  <div className="space-y-2 bg-orange-50/50 rounded-xl p-3 border border-orange-100/60">
                    <input type="text" placeholder="クーポンタイトル" value={couponTitle} onChange={(e) => setCouponTitle(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 outline-none transition-all" />
                    <input type="text" placeholder="説明文" value={couponDesc} onChange={(e) => setCouponDesc(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 outline-none transition-all" />
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* 通常クーポン */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><span className="text-base">🎟️</span><h4 className="text-sm font-bold">通常クーポン</h4></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={normalCouponEnabled} onChange={(e) => setNormalCouponEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
                {normalCouponEnabled && (
                  <div className="space-y-2 bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/60">
                    <input type="text" placeholder="クーポンタイトル" value={normalCouponTitle} onChange={(e) => setNormalCouponTitle(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-emerald-300 outline-none transition-all" />
                    <textarea placeholder="説明文・利用条件" value={normalCouponDesc} onChange={(e) => setNormalCouponDesc(e.target.value)} rows={2} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-emerald-300 outline-none transition-all resize-y" />
                    <input type="date" value={normalCouponExpiresAt} onChange={(e) => setNormalCouponExpiresAt(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-emerald-300 outline-none transition-all" />
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* 特別達成クーポン */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><span className="text-base">🏆</span><h4 className="text-sm font-bold">特別達成クーポン</h4></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={loyaltyEnabled} onChange={(e) => setLoyaltyEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>
                {loyaltyEnabled && (
                  <div className="space-y-2 bg-amber-50/50 rounded-xl p-3 border border-amber-100/60">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-600">達成回数</span>
                      <input type="number" min="1" value={loyaltyTargetCount} onChange={(e) => setLoyaltyTargetCount(Math.max(1, Number(e.target.value) || 1))} className="w-14 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center bg-white outline-none focus:border-amber-300" />
                      <span className="text-slate-600">回来店で達成</span>
                    </div>
                    <input type="text" placeholder="特典タイトル" value={loyaltyTitle} onChange={(e) => setLoyaltyTitle(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-amber-300 outline-none transition-all" />
                    <div className="flex items-center gap-2 text-[11px] flex-wrap">
                      <span className="font-bold text-slate-600">有効期限:</span>
                      <select value={loyaltyExpireType} onChange={(e) => setLoyaltyExpireType(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-[11px] focus:border-amber-300 outline-none">
                        <option value="none">無制限</option>
                        <option value="days">出現からN日間</option>
                        <option value="date">日付固定</option>
                      </select>
                      {loyaltyExpireType === 'days' && (
                        <input type="number" min="1" value={loyaltyExpireDays} onChange={(e) => setLoyaltyExpireDays(Number(e.target.value))} className="w-14 px-2 py-1 border border-slate-200 rounded-lg text-[11px]" />
                      )}
                      {loyaltyExpireType === 'date' && (
                        <input type="date" value={loyaltyExpireDate} onChange={(e) => setLoyaltyExpireDate(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg text-[11px]" />
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
                      <input type="checkbox" checked={loyaltyCombinable} onChange={(e) => setLoyaltyCombinable(e.target.checked)} className="accent-amber-500 w-4 h-4 rounded" />
                      同日、他のクーポンと併用
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
                      <input type="checkbox" checked={loyaltyRepeatEnabled} onChange={(e) => setLoyaltyRepeatEnabled(e.target.checked)} className="accent-amber-500 w-4 h-4 rounded" />
                      繰り返す（利用後、再度達成回数をカウント）
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* 保存 */}
            <button onClick={handleSaveSettings} disabled={saving} className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all ${saveSuccess ? 'bg-emerald-500' : saving ? 'bg-gray-300 cursor-wait' : 'bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg shadow-orange-500/40 hover:from-orange-500 hover:to-orange-600'}`}>
              {saving ? '保存中...' : saveSuccess ? '✨ 保存しました' : '💾 設定を保存'}
            </button>

            {/* 退会 */}
            <div className="pt-2">
              {shopStatus === 'canceled' ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-[12px] font-bold">
                  ⚠️ 退会手続きが完了しています。{validUntilDate ? `${validUntilDate} までご利用いただけます。` : ''}
                </div>
              ) : (
                <button onClick={() => router.push(`/shop/cancel?shopId=${shopId}`)} className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 text-xs font-bold transition-colors">
                  店舗の退会手続きを行う
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== PRO機能タブ ===== */}
        {activeTab === 'pro' && (
          <div className="space-y-3.5">

            {/* ステップアップ */}
            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-base">🐾</span> ステップアップクーポン
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">PRO限定</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">来店回数に応じて段階的に特典がアップします。</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={stepUpEnabled} onChange={(e) => setStepUpEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
              {stepUpEnabled && (
                <div className="space-y-2.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60">
                  {stepUpList.map((step, index) => (
                    <div key={index} className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <strong className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">ステップ {index + 1}</strong>
                        {stepUpList.length > 1 && (
                          <button type="button" onClick={() => setStepUpList(stepUpList.filter((_, i) => i !== index))} className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors">削除</button>
                        )}
                      </div>
                      <input type="text" placeholder={`例: ${index + 1}回目来店特典`} value={step.title} onChange={(e) => { const n = [...stepUpList]; n[index].title = e.target.value; setStepUpList(n); }} className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg mb-2 focus:border-emerald-300 outline-none" />
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <label className="block">
                          <span className="font-bold text-slate-600">期限方式</span>
                          <select value={step.expireType} onChange={(e) => { const n = [...stepUpList]; n[index].expireType = e.target.value; setStepUpList(n); }} className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] focus:border-emerald-300 outline-none">
                            <option value="none">無期限</option>
                            <option value="days">出現からN日間</option>
                            <option value="date">日付固定</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className="font-bold text-slate-600">有効日数</span>
                          <div className="flex items-center gap-1 mt-1">
                            <input type="number" min="1" value={step.expireDays} onChange={(e) => { const n = [...stepUpList]; n[index].expireDays = Math.max(1, Number(e.target.value) || 1); setStepUpList(n); }} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[11px]" />
                            <span className="text-slate-500 whitespace-nowrap text-[10px]">日</span>
                          </div>
                        </label>
                        {step.expireType === 'date' && (
                          <label className="block col-span-2">
                            <span className="font-bold text-slate-600">固定日付</span>
                            <input type="date" value={step.expireDate || ''} onChange={(e) => { const n = [...stepUpList]; n[index].expireDate = e.target.value; setStepUpList(n); }} className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg text-[11px]" />
                          </label>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                          <input type="checkbox" checked={step.combinable} onChange={(e) => { const n = [...stepUpList]; n[index].combinable = e.target.checked; setStepUpList(n); }} className="accent-emerald-500 w-3.5 h-3.5 rounded" />
                          特別達成クーポンに追加
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                          <input type="checkbox" checked={step.sameDayCombinable} onChange={(e) => { const n = [...stepUpList]; n[index].sameDayCombinable = e.target.checked; setStepUpList(n); }} className="accent-emerald-500 w-3.5 h-3.5 rounded" />
                          同日、他のクーポンと併用
                        </label>
                      </div>
                    </div>
                  ))}
                  {stepUpList.length < 10 && (
                    <button type="button" onClick={() => setStepUpList([...stepUpList, { title: '', expireType: 'days', expireDays: 7, combinable: false, sameDayCombinable: false }])} className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-[11px] transition-colors">
                      ＋ ステップを追加（最大10段階）
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 連続クーポン */}
            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-base">🔄</span> 連続クーポン
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-700">PRO限定</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">消し込みで次回クーポンが即時発効します。</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={repeatEnabled} onChange={(e) => setRepeatEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
              {repeatEnabled && (
                <div className="space-y-2.5 bg-sky-50/50 p-3 rounded-xl border border-sky-100/60">
                  <input type="text" placeholder="次回使える特典タイトル" value={repeatTitle} onChange={(e) => setRepeatTitle(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-sky-300 outline-none transition-all" />
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block text-[11px]">
                      <span className="font-bold text-slate-600">期限方式</span>
                      <select value={repeatExpireType} onChange={(e) => setRepeatExpireType(e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] focus:border-sky-300 outline-none">
                        <option value="none">無期限</option>
                        <option value="days">出現からN日間</option>
                        <option value="date">日付固定</option>
                      </select>
                    </label>
                    <label className="block text-[11px]">
                      <span className="font-bold text-slate-600">有効日数</span>
                      <input type="number" min="1" value={repeatExpireDays} onChange={(e) => setRepeatExpireDays(Math.max(1, Number(e.target.value) || 1))} className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg text-[11px]" />
                    </label>
                    {repeatExpireType === 'date' && (
                      <label className="block text-[11px] col-span-2">
                        <span className="font-bold text-slate-600">固定日付</span>
                        <input type="date" value={repeatExpireDate} onChange={(e) => setRepeatExpireDate(e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg text-[11px]" />
                      </label>
                    )}
                  </div>
                  <div className="space-y-1 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input type="checkbox" checked={repeatCombinable} onChange={(e) => setRepeatCombinable(e.target.checked)} className="accent-sky-500 w-3.5 h-3.5 rounded" />
                      特別達成クーポンに追加
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input type="checkbox" checked={repeatSameDayCombinable} onChange={(e) => setRepeatSameDayCombinable(e.target.checked)} className="accent-sky-500 w-3.5 h-3.5 rounded" />
                      同日、他のクーポンと併用
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 誕生日 */}
            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-base">🎂</span> 記念日・お誕生日クーポン
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">PRO限定</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">お客様の記念日に特別なクーポンを自動配信します。</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={birthdayEnabled} onChange={(e) => setBirthdayEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
              {birthdayEnabled && (
                <div className="space-y-2.5 bg-rose-50/50 p-3 rounded-xl border border-rose-100/60">
                  <input type="text" placeholder="クーポンタイトル" value={birthdayTitle} onChange={(e) => setBirthdayTitle(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-rose-300 outline-none transition-all" />
                  <textarea placeholder="お祝いメッセージ本文" value={birthdayMessage} onChange={(e) => setBirthdayMessage(e.target.value)} rows={2} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-rose-300 outline-none transition-all resize-y" />
                  <div className="space-y-1 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input type="checkbox" checked={birthdayCombinable} onChange={(e) => setBirthdayCombinable(e.target.checked)} className="accent-rose-500 w-3.5 h-3.5 rounded" />
                      特別達成クーポンに追加
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input type="checkbox" checked={birthdaySameDayCombinable} onChange={(e) => setBirthdaySameDayCombinable(e.target.checked)} className="accent-rose-500 w-3.5 h-3.5 rounded" />
                      同日、他のクーポンと併用
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 休眠復活 */}
            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-base">💤</span> 休眠復活クーポン
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-100 text-violet-700">PRO限定</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">ご無沙汰のお客様を呼び戻すクーポンを自動配信します。</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={dormantEnabled} onChange={(e) => setDormantEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
              {dormantEnabled && (
                <div className="space-y-2.5 bg-violet-50/50 p-3 rounded-xl border border-violet-100/60">
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="text-slate-600">最終利用から</span>
                    <input type="number" value={dormantTargetDays} onChange={(e) => setDormantTargetDays(Number(e.target.value))} className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-[12px] text-center bg-white outline-none" />
                    <span className="text-slate-600">日経過した顧客</span>
                  </div>
                  <input type="text" placeholder="復帰クーポンタイトル" value={dormantTitle} onChange={(e) => setDormantTitle(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-violet-300 outline-none transition-all" />
                  <textarea placeholder="お久しぶりメッセージ本文" value={dormantMessage} onChange={(e) => setDormantMessage(e.target.value)} rows={2} className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-violet-300 outline-none transition-all resize-y" />
                  <div className="space-y-1 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input type="checkbox" checked={dormantCombinable} onChange={(e) => setDormantCombinable(e.target.checked)} className="accent-violet-500 w-3.5 h-3.5 rounded" />
                      特別達成クーポンに追加
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input type="checkbox" checked={dormantSameDayCombinable} onChange={(e) => setDormantSameDayCombinable(e.target.checked)} className="accent-violet-500 w-3.5 h-3.5 rounded" />
                      同日、他のクーポンと併用
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 連続ログイン特典 */}
            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-base">🔥</span> 連続ログイン特典
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700">PRO限定</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">アプリを開く習慣をつけ、連続達成でクーポンをプレゼントします。</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={streakEnabled} onChange={(e) => setStreakEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
              {streakEnabled && (
                <div className="space-y-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100/60">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">目標日数</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="1" max="10" value={streakTargetDays} onChange={(e) => setStreakTargetDays(Number(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                      <span className="text-lg font-black text-orange-600 whitespace-nowrap leading-none">{streakTargetDays}<span className="text-[11px] font-bold text-slate-500 ml-0.5">日</span></span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-orange-200/50">
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">達成時のクーポン名</label>
                    <input type="text" value={streakCouponName} onChange={(e) => setStreakCouponName(e.target.value)} placeholder="例: 5日連続ログイン達成！10%OFFクーポン" className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 outline-none transition-all" />
                  </div>
                  <div className="pt-2 border-t border-orange-200/50">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] font-bold text-slate-700">
                      <input type="checkbox" checked={streakNotifyEnabled} onChange={(e) => setStreakNotifyEnabled(e.target.checked)} className="accent-orange-500 w-4 h-4 rounded" />
                      リマインド通知を送る（あと1日で達成時）
                    </label>
                    <p className="text-[10px] text-slate-500 mt-1">毎日夕方18時にリセット防止の通知を自動送信します。</p>
                    {streakNotifyEnabled && (
                      <div className="space-y-2 mt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">通知タイトル</label>
                          <input type="text" value={streakNotifyTitle} onChange={(e) => setStreakNotifyTitle(e.target.value)} className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">通知本文</label>
                          <textarea value={streakNotifyBody} onChange={(e) => setStreakNotifyBody(e.target.value)} rows={2} className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 outline-none resize-y" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleSaveSettings} disabled={saving} className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all ${saveSuccess ? 'bg-emerald-500' : saving ? 'bg-gray-300 cursor-wait' : 'bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg shadow-orange-500/40 hover:from-orange-500 hover:to-orange-600'}`}>
              {saving ? '保存中...' : saveSuccess ? '✨ 設定完了' : '✅ 設定完了（顧客画面に反映）'}
            </button>
          </div>
        )}

        {/* ===== 予約配信タブ ===== */}
        {activeTab === 'reserve' && (
          <div className="space-y-3.5">
            <form onSubmit={handleAddSchedule} className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2"><span className="text-base">📅</span> 新規配信予約をセット</h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">① 配信の種別</label>
                <div className="flex gap-3 flex-wrap">
                  <label className="cursor-pointer text-[12px] flex items-center gap-1.5"><input type="radio" checked={reserveType === 'notification'} onChange={() => setReserveType('notification')} className="accent-orange-500" /> 📢 通常通知</label>
                  <label className="cursor-pointer text-[12px] flex items-center gap-1.5"><input type="radio" checked={reserveType === 'coupon'} onChange={() => setReserveType('coupon')} className="accent-orange-500" /> 🎫 クーポン付き</label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">② スケジュール形式</label>
                <div className="flex gap-3 flex-wrap">
                  <label className="cursor-pointer text-[12px] flex items-center gap-1.5"><input type="radio" checked={reserveScheduleType === 'once'} onChange={() => setReserveScheduleType('once')} className="accent-orange-500" /> 日付指定</label>
                  <label className="cursor-pointer text-[12px] flex items-center gap-1.5"><input type="radio" checked={reserveScheduleType === 'monthly'} onChange={() => setReserveScheduleType('monthly')} className="accent-orange-500" /> 毎月</label>
                  <label className="cursor-pointer text-[12px] flex items-center gap-1.5"><input type="radio" checked={reserveScheduleType === 'weekly'} onChange={() => setReserveScheduleType('weekly')} className="accent-orange-500" /> 毎週</label>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-900/5">
                {reserveScheduleType === 'once' && (
                  <input type="date" value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:border-orange-300 outline-none" />
                )}
                {reserveScheduleType === 'monthly' && (
                  <div className="flex items-center gap-2 text-[12px]">
                    <span>毎月</span>
                    <input type="number" min="1" max="31" value={reserveDayOfMonth} onChange={(e) => setReserveDayOfMonth(e.target.value)} className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-center" />
                    <span>日に自動配信</span>
                  </div>
                )}
                {reserveScheduleType === 'weekly' && (
                  <div className="flex items-center gap-2 text-[12px]">
                    <span>毎週</span>
                    <select value={reserveDayOfWeek} onChange={(e) => setReserveDayOfWeek(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white">
                      <option value="mon">月曜</option><option value="tue">火曜</option><option value="wed">水曜</option><option value="thu">木曜</option><option value="fri">金曜</option><option value="sat">土曜</option><option value="sun">日曜</option>
                    </select>
                    <span>に自動配信</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">③ タイトル</label>
                <input type="text" value={reserveTitle} onChange={(e) => setReserveTitle(e.target.value)} placeholder="予約通知のタイトル" className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 outline-none" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">④ 本文</label>
                <textarea value={reserveBody} onChange={(e) => setReserveBody(e.target.value)} rows={3} placeholder="予約通知の本文" className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 outline-none resize-y" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">リンク先URL <span className="text-slate-400 font-normal">（任意）</span></label>
                <input type="url" value={reserveLinkUrl} onChange={(e) => setReserveLinkUrl(e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-900/5 rounded-xl shadow-inner focus:bg-white focus:border-orange-300 outline-none" />
              </div>

              {reserveType === 'coupon' && (
                <div className="space-y-2 bg-amber-50/50 p-3 rounded-xl border border-amber-100/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">クーポン有効日数</label>
                    <div className="flex items-center gap-1.5">
                      <input type="number" min="1" value={reserveCouponExpireDays} onChange={(e) => setReserveCouponExpireDays(Math.max(1, Number(e.target.value) || 1))} className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-[12px]" />
                      <span className="text-[11px] text-slate-600">日間</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                    <input type="checkbox" checked={reserveCouponSameDayCombinable} onChange={(e) => setReserveCouponSameDayCombinable(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5 rounded" />
                    同日、他のクーポンと併用
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                    <input type="checkbox" checked={reserveCouponLoyaltyCountable} onChange={(e) => setReserveCouponLoyaltyCountable(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5 rounded" />
                    特別達成クーポンの達成回数に加算
                  </label>
                </div>
              )}

              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/40 transition-all">
                ➕ この内容で予約をセットする
              </button>
            </form>

            <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">📋 予約配信一覧（{scheduledList.length} 件）</h3>
              {scheduledList.length === 0 ? (
                <p className="text-slate-400 text-[12px] text-center py-6">現在セットされている予約配信はありません。</p>
              ) : (
                <div className="space-y-2.5">
                  {scheduledList.map((item) => (
                    <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${item.type === 'coupon' ? 'bg-violet-600' : 'bg-blue-600'}`}>
                            {item.type === 'coupon' ? '🎫 クーポン' : '📢 通知'}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">{item.scheduleValue}</span>
                        </div>
                        <strong className="text-[13px] block text-slate-800">{item.title}</strong>
                        <p className="text-[11px] text-slate-600 mt-0.5">{item.body}</p>
                      </div>
                      <button onClick={() => handleDeleteSchedule(item.id)} className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap">🗑️ 取消</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* QRスキャンモーダル */}
      {scanOpen && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-center">
            <h3 className="m-0 mb-4 text-base font-bold">📱 顧客のQRコードをスキャン</h3>
            {scanResult ? (
              <div>
                <div className="p-5 bg-green-50 border-2 border-green-500 rounded-xl text-green-700 font-bold text-base whitespace-pre-line mb-5">
                  {scanResult}
                </div>
                <button onClick={async () => { await stopCamera(); setScanResult(null); setScanOpen(false); }} className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-base transition-colors">
                  閉じる
                </button>
              </div>
            ) : (
              <div>
                <div id="qr-reader" className="w-full min-h-[250px] bg-slate-800 rounded-xl overflow-hidden mb-4" />
                <div className="flex flex-col gap-2.5">
                  <button onClick={startCamera} disabled={scanLoading} className={`w-full py-3 rounded-xl text-white font-bold text-base transition-colors ${scanLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                    {scanLoading ? 'カメラ初期化中...' : '📷 カメラを再起動する'}
                  </button>
                  <button onClick={async () => { await stopCamera(); setScanOpen(false); }} className="w-full py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-colors">
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
