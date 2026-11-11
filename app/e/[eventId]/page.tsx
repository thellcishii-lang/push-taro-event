'use client';

// app/e/[eventId]/page.tsx
// Push-taro EVENT の来場者登録画面（QRコードの着地先）。
// 流れ: イベント情報の確認 → 電話番号のSMS認証 → 通知許可とFCMトークン取得 → 登録API。
// 電話番号認証の作法は本家の登録画面（app/subscribe）に合わせている。
// 画面の固定文は4言語辞書（lib/ui-text.ts）で切り替える。初期表示は
// イベントのデフォルト言語、本人が切り替えたらその選択が優先される。
// クーポン表示: 取得済みを上部に固定し、全カタログは出店者ごとの
// アコーディオンにする（100件あっても縦に伸びないように）。
// 取得状態は画面を開いている間15秒ごと＋タブ復帰時に再取得し、
// 消込が手動リロードなしで「使用済み」に切り替わるようにしている。
// 見た目は承認済みモック（来場者 v2）準拠: ブランド行＋薄紫のイベント
// カード（言語はピル選択）、取得済みカードはQR常時表示、登録フェーズでは
// 画面下に固定したプッシュ有効化バナーが登録ボタンになる。
// 結果・エラーの文は、操作した場所のすぐ近くに出す（ページ末尾には出さない）。
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  onAuthStateChanged,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth, requestFCMToken } from '@/lib/firebase-client';
import {
  SUPPORTED_LOCALES,
  resolveLocale,
  type Locale,
} from '@/lib/i18n';
import { uiText } from '@/lib/ui-text';
import { buildCouponGroups } from '@/lib/coupon-groups';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';

interface PublicEventLink {
  title: string;
  url: string;
}

interface PublicEvent {
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'live' | 'ended';
  resetMode: 'full-daily' | 'keep-phones';
  defaultLocale: string;
  /** 入場用QRの取り込みが有効か（主催者設定。オフなら画面に何も出さない） */
  admissionQrEnabled: boolean;
  /** 主催者リンク（最大3件）。未登録なら空で、画面に何も出さない */
  links?: PublicEventLink[];
}

interface AdmissionQrState {
  stored: boolean;
  content: string | null;
}

type Phase =
  | 'loading'
  | 'not-found'
  | 'unavailable'
  | 'phone'
  | 'code'
  | 'register'
  | 'done';

interface PublicCoupon {
  id: string;
  title: string;
  description: string;
  exhibitorName: string;
  keywords: string[];
}

interface MemberClaim {
  claimId: string;
  couponId: string;
  title: string;
  exhibitorName: string;
  status: 'claimed' | 'redeemed';
}

interface InfoPdf {
  id: string;
  title: string;
  url: string;
}

function normalizePhoneNumber(value: string): string {
  const compact = value
    .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
    .replace(/[\s().-]/g, '');
  if (compact.startsWith('00')) return `+${compact.slice(2)}`;
  if (compact.startsWith('0')) return `+81${compact.slice(1)}`;
  if (compact.startsWith('81')) return `+${compact}`;
  return compact;
}

const VIOLET = '#6D28D9';
const VIOLET_BRIGHT = '#7C3AED';
const CLAIM_BLUE = '#2563eb';
const INK = '#17122b';
const HERO_GRADIENT = 'linear-gradient(135deg, #e7dcfd, #d2c0f8)';
const CARD_GRADIENT = 'linear-gradient(180deg, #f3efff, #e9e2fd)';

// モックの言語ピルは短い表記（EN など）。選択の保存・送信は従来どおり locale で行う。
const PILL_LABELS: Record<Locale, string> = {
  ja: '日本語',
  en: 'EN',
  zh: '中文',
  ko: '한국어',
};

const containerStyle: React.CSSProperties = {
  padding: '16px 16px 32px',
  maxWidth: 480,
  margin: '0 auto',
  fontFamily: 'sans-serif',
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  boxSizing: 'border-box',
  color: '#0f172a',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  marginTop: 6,
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  fontSize: 16,
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 20px',
  fontWeight: 700,
  fontSize: 15,
  width: '100%',
  marginTop: 16,
  backgroundColor: VIOLET,
  color: '#ffffff',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
};

const feedbackStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: 14,
  color: '#b91c1c',
  whiteSpace: 'pre-wrap',
};

function PinLogo() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${VIOLET_BRIGHT}, ${VIOLET})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 3px 8px rgba(109, 40, 217, 0.35)',
      }}
    >
      <svg width="25" height="25" viewBox="0 0 24 24">
        <path
          d="M12 21.5s-7.2-5.6-7.2-11.1a7.2 7.2 0 1 1 14.4 0c0 5.5-7.2 11.1-7.2 11.1Z"
          fill="#ffffff"
        />
        <circle cx="12" cy="9.7" r="2.7" fill={VIOLET} />
      </svg>
    </div>
  );
}

export default function EventVisitorPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [locale, setLocale] = useState<Locale>('ja');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [couponQuery, setCouponQuery] = useState('');
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [myClaims, setMyClaims] = useState<MemberClaim[]>([]);
  const [couponMessage, setCouponMessage] = useState('');
  const [infoPdfs, setInfoPdfs] = useState<InfoPdf[]>([]);
  // QRを開いている取得済みクーポン。undefined = 未操作（先頭の未使用分を開く）
  const [openClaimId, setOpenClaimId] = useState<string | null | undefined>(undefined);
  // 入場用QR（外部発行）の保存状態。null = 未取得
  const [admissionQr, setAdmissionQr] = useState<AdmissionQrState | null>(null);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [qrEditing, setQrEditing] = useState(false);
  const [qrScanning, setQrScanning] = useState(false);
  const [qrManual, setQrManual] = useState('');
  const [qrBusy, setQrBusy] = useState(false);
  const [qrFeedback, setQrFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  // カタログで展開中の出店者グループ（検索中は全グループ展開扱い）
  const [openGroups, setOpenGroups] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/public`);
        if (!res.ok) {
          if (!cancelled) setPhase('not-found');
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const ev = data.event as PublicEvent;
        setEvent(ev);
        // 本人の保存済み選択 > イベントのデフォルト > 日本語
        let stored: string | null = null;
        try {
          stored = window.localStorage.getItem(`event-locale:${eventId}`);
        } catch {
          // 保存が読めなくてもデフォルト言語で続行する
        }
        setLocale(resolveLocale(stored, ev.defaultLocale));
        setPhase(ev.status === 'live' ? 'phone' : 'unavailable');
        // 案内PDFは登録前でも見られる（会場案内など）
        try {
          const pdfRes = await fetch(`/api/events/${eventId}/info-pdfs/public`);
          const pdfData = await pdfRes.json().catch(() => ({}));
          if (!cancelled && pdfRes.ok) setInfoPdfs(pdfData.pdfs ?? []);
        } catch {
          // PDFが読めなくても登録フローは止めない
        }
      } catch {
        if (!cancelled) setPhase('not-found');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) setPhase((p) => (p === 'phone' || p === 'code' ? 'register' : p));
      }),
    [],
  );

  const handleLocaleChange = async (next: Locale) => {
    setLocale(next);
    try {
      window.localStorage.setItem(`event-locale:${eventId}`, next);
    } catch {
      // 保存できなくても画面の切替は有効にする
    }
    // 登録済みなら、購読者の言語（＝プッシュの言語）も付け替える
    if (user) {
      try {
        const idToken = await user.getIdToken();
        await fetch(`/api/events/${eventId}/language`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ lang: next }),
        });
      } catch {
        // 付け替えに失敗しても画面の切替は止めない（次回登録時に反映される）
      }
    }
  };

  const handleSendCode = async () => {
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setMessage(uiText(locale, 'phoneFormatError'));
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const previousVerifier = (window as unknown as Record<string, unknown>)
        .__phoneRecaptchaVerifier as RecaptchaVerifier | undefined;
      previousVerifier?.clear();
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'normal' });
      (window as unknown as Record<string, unknown>).__phoneRecaptchaVerifier = verifier;
      const result = await signInWithPhoneNumber(auth, normalized, verifier);
      setConfirmationResult(result);
      setPhase('code');
      setMessage(uiText(locale, 'codeSent'));
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown';
      setMessage(uiText(locale, 'sendCodeFailed', { code }));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!confirmationResult || !verificationCode.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      await confirmationResult.confirm(verificationCode.trim());
      setConfirmationResult(null);
      setPhase('register');
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown';
      setMessage(uiText(locale, 'codeWrong', { code }));
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !event) return;
    setBusy(true);
    setMessage('');
    try {
      // iPhone はホーム画面に追加した状態でないと Web Push を受け取れない（本家と同じ案内）
      const isStandalone =
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;
      const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
      if (isIos && !isStandalone) {
        setMessage(uiText(locale, 'iosStandalone'));
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage(uiText(locale, 'permissionDenied'));
        return;
      }
      const fcmToken = await requestFCMToken({ shopName: event.name });
      if (!fcmToken) {
        setMessage(uiText(locale, 'tokenFailed'));
        return;
      }

      const idToken = await user.getIdToken();
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ fcmToken, lang: locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? uiText(locale, 'registerFailed'));
        return;
      }
      setPhase('done');
    } catch {
      setMessage(uiText(locale, 'registerRetry'));
    } finally {
      setBusy(false);
    }
  };

  // カタログは全件を取得し、絞り込みは画面側（lib/coupon-groups.ts）で行う。
  // 件数は契約枠で最大でも100件程度なので、全件読みでも問題ない。
  const loadCoupons = async (loc: Locale) => {
    try {
      const res = await fetch(`/api/events/${eventId}/coupons/public?lang=${loc}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setCoupons(data.coupons ?? []);
    } catch {
      // 一覧取得の失敗は登録フロー自体を止めない
    }
  };

  const loadMyClaims = async (currentUser: User, loc: Locale) => {
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`/api/events/${eventId}/my-claims?lang=${loc}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setMyClaims(data.claims ?? []);
    } catch {
      // 同上
    }
  };

  useEffect(() => {
    if (!user) return;
    void loadCoupons(locale);
    void loadMyClaims(user, locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId, locale]);

  // 入場用QRの保存状態は、機能がオンのイベントでだけ取得する
  const loadAdmissionQr = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`/api/events/${eventId}/admission-qr`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAdmissionQr({
          stored: data.stored === true,
          content: typeof data.content === 'string' ? data.content : null,
        });
      }
    } catch {
      // 状態が読めなくても他の機能は止めない
    }
  };

  useEffect(() => {
    if (!user || !event?.admissionQrEnabled) return;
    void loadAdmissionQr(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId, event?.admissionQrEnabled]);

  const saveAdmissionQrContent = async (content: string) => {
    if (!user) return;
    setQrBusy(true);
    setQrFeedback(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/events/${eventId}/admission-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setQrFeedback({
          text: data.error ?? uiText(locale, 'admissionQrSaveFailed'),
          error: true,
        });
        return;
      }
      // サーバー側で前後の空白を取り除いて保存するので表示も合わせる
      setAdmissionQr({ stored: true, content: content.trim() });
      setQrEditing(false);
      setQrExpanded(true);
      setQrManual('');
      setQrFeedback({ text: uiText(locale, 'admissionQrSaved'), error: false });
    } catch {
      setQrFeedback({ text: uiText(locale, 'admissionQrSaveFailed'), error: true });
    } finally {
      setQrBusy(false);
    }
  };

  const handleDeleteAdmissionQr = async () => {
    if (!user) return;
    setQrBusy(true);
    setQrFeedback(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/events/${eventId}/admission-qr`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setQrFeedback({
          text: data.error ?? uiText(locale, 'admissionQrDeleteFailed'),
          error: true,
        });
        return;
      }
      setAdmissionQr({ stored: false, content: null });
      setQrExpanded(false);
      setQrFeedback({ text: uiText(locale, 'admissionQrDeleted'), error: false });
    } catch {
      setQrFeedback({ text: uiText(locale, 'admissionQrDeleteFailed'), error: true });
    } finally {
      setQrBusy(false);
    }
  };

  const stopQrCamera = useCallback(async () => {
    const scanner = qrScannerRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      } catch {
        // 停止失敗は無視する
      }
      qrScannerRef.current = null;
    }
    setQrScanning(false);
  }, []);

  const startQrCamera = async () => {
    setQrFeedback(null);
    try {
      const scanner = new Html5Qrcode('admission-qr-reader');
      qrScannerRef.current = scanner;
      setQrScanning(true);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopQrCamera();
          await saveAdmissionQrContent(decodedText);
        },
        () => {},
      );
    } catch (error) {
      setQrScanning(false);
      const err = error as { name?: string; message?: string };
      if (err?.name === 'NotAllowedError' || (err?.message ?? '').includes('Permission')) {
        setQrFeedback({ text: uiText(locale, 'admissionQrCameraDenied'), error: true });
      } else if (err?.name === 'NotFoundError') {
        setQrFeedback({ text: uiText(locale, 'admissionQrCameraNotFound'), error: true });
      } else {
        setQrFeedback({ text: uiText(locale, 'admissionQrCameraFailed'), error: true });
      }
    }
  };

  useEffect(() => {
    return () => {
      void stopQrCamera();
    };
  }, [stopQrCamera]);

  // 登録後は取得状態を自動で追いかける: ブースで消込されたら、
  // 手動リロードなしでカードが「使用済み」に切り替わりQRが閉じる。
  useEffect(() => {
    if (!user || (phase !== 'register' && phase !== 'done')) return;
    const refresh = () => {
      if (document.visibilityState === 'visible') void loadMyClaims(user, locale);
    };
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, phase, eventId, locale]);

  const handleClaim = async (couponId: string) => {
    if (!user) return;
    setBusy(true);
    setCouponMessage('');
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/events/${eventId}/coupons/${couponId}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCouponMessage(data.error ?? uiText(locale, 'claimFailed'));
        return;
      }
      setCouponMessage(uiText(locale, 'claimedMessage'));
      await loadMyClaims(user, locale);
    } catch {
      setCouponMessage(uiText(locale, 'claimFailed'));
    } finally {
      setBusy(false);
    }
  };

  const toggleGroup = (exhibitorName: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(exhibitorName)) {
        next.delete(exhibitorName);
      } else {
        next.add(exhibitorName);
      }
      return next;
    });
  };

  if (phase === 'loading') return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;
  if (phase === 'not-found') {
    return (
      <main style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PinLogo />
          <p style={{ fontSize: 19, fontWeight: 900, color: INK, margin: 0 }}>Push-taro EVENT</p>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 24 }}>{uiText(locale, 'notFoundTitle')}</h1>
        <p style={{ fontSize: 14 }}>{uiText(locale, 'notFoundBody')}</p>
      </main>
    );
  }
  if (!event) return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;

  const searching = couponQuery.trim().length > 0;
  const couponGroups = buildCouponGroups(coupons, couponQuery);
  const firstUnusedClaim = myClaims.find((c) => c.status === 'claimed');
  const effectiveOpenClaimId =
    openClaimId === undefined ? (firstUnusedClaim?.claimId ?? null) : openClaimId;
  // 取得済みカードの対象文はカタログ側の説明文から引く（取得APIは説明を持たない）
  const couponById = new Map(coupons.map((c) => [c.id, c]));
  const totalCompanies = new Set(coupons.map((c) => c.exhibitorName)).size;
  const endDateLabel = event.endDate.replaceAll('-', '.');
  const daysLeft = Math.ceil(
    (new Date(`${event.endDate}T23:59:59`).getTime() - Date.now()) / 86_400_000,
  );

  return (
    <main
      style={{
        ...containerStyle,
        // 登録フェーズでは下部固定バナーに隠れないよう余白を確保する
        paddingBottom: phase === 'register' ? 148 : 32,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PinLogo />
          <div>
            <p
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: INK,
                margin: 0,
                letterSpacing: -0.3,
                lineHeight: 1.15,
              }}
            >
              Push-taro EVENT
            </p>
            <p style={{ fontSize: 12.5, color: '#475569', margin: '2px 0 0' }}>
              {uiText(locale, 'visitorPageLabel')}
            </p>
          </div>
        </div>
        <svg
          aria-hidden="true"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          style={{ flexShrink: 0, marginTop: 4, opacity: 0.75 }}
        >
          <path
            d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58ZM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z"
            fill="#3f3d56"
          />
        </svg>
      </div>

      <header
        style={{
          background: HERO_GRADIENT,
          borderRadius: 18,
          padding: '18px 16px',
          marginTop: 14,
          boxShadow: '0 4px 14px rgba(109, 40, 217, 0.18)',
        }}
      >
        <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0, color: INK }}>{event.name}</h1>
        <p style={{ fontSize: 13, color: '#4b4560', margin: '6px 0 0' }}>
          {uiText(locale, 'period', { start: event.startDate, end: event.endDate })}
        </p>
        <div
          role="group"
          aria-label={uiText(locale, 'language')}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}
        >
          {SUPPORTED_LOCALES.map((l) => {
            const selected = l === locale;
            return (
              <button
                key={l}
                onClick={() => void handleLocaleChange(l)}
                aria-pressed={selected}
                style={{
                  padding: '7px 16px',
                  fontSize: 14,
                  borderRadius: 999,
                  border: selected ? 'none' : '1px solid rgba(76, 29, 149, 0.28)',
                  backgroundColor: selected ? VIOLET : '#ffffff',
                  color: selected ? '#ffffff' : '#2e2a3f',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: selected ? 'none' : '0 1px 2px rgba(23, 18, 43, 0.12)',
                }}
              >
                {PILL_LABELS[l]}
              </button>
            );
          })}
        </div>
      </header>

      {infoPdfs.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>{uiText(locale, 'infoTitle')}</h2>
          {infoPdfs.map((pdf) => (
            <a
              key={pdf.id}
              href={pdf.url}
              target="_blank"
              rel="noreferrer"
              style={{
                ...cardStyle,
                display: 'block',
                padding: 14,
                marginTop: 8,
                fontWeight: 700,
                fontSize: 15,
                color: VIOLET,
                textDecoration: 'none',
              }}
            >
              📄 {pdf.title}
            </a>
          ))}
        </section>
      )}

      {event.links && event.links.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>{uiText(locale, 'linksTitle')}</h2>
          {event.links.map((link, index) => (
            <a
              key={`${link.url}-${index}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              style={{
                ...cardStyle,
                display: 'block',
                padding: 14,
                marginTop: 8,
                fontWeight: 700,
                fontSize: 15,
                color: VIOLET,
                textDecoration: 'none',
              }}
            >
              🔗 {link.title}
            </a>
          ))}
        </section>
      )}

      {phase === 'unavailable' && (
        <p style={{ fontSize: 15, marginTop: 24 }}>
          {event.status === 'ended'
            ? uiText(locale, 'endedMessage')
            : uiText(locale, 'notAccepting')}
        </p>
      )}

      {phase === 'phone' && (
        <section style={{ ...cardStyle, marginTop: 20, padding: 16 }}>
          <p style={{ fontSize: 14, margin: 0 }}>{uiText(locale, 'registerIntro')}</p>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
            {uiText(locale, 'phoneLabel')}
            <input
              style={inputStyle}
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="09012345678"
            />
          </label>
          <div id="recaptcha-container" style={{ marginTop: 12 }} />
          <button style={buttonStyle} onClick={handleSendCode} disabled={busy}>
            {uiText(locale, 'sendCode')}
          </button>
          {message && <p style={feedbackStyle}>{message}</p>}
        </section>
      )}

      {phase === 'code' && (
        <section style={{ ...cardStyle, marginTop: 20, padding: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>
            {uiText(locale, 'codeLabel')}
            <input
              style={inputStyle}
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={uiText(locale, 'codePlaceholder')}
            />
          </label>
          <button style={buttonStyle} onClick={handleConfirmCode} disabled={busy}>
            {uiText(locale, 'confirmCode')}
          </button>
          {message && <p style={feedbackStyle}>{message}</p>}
        </section>
      )}

      {phase === 'done' && (
        <section style={{ ...cardStyle, marginTop: 20, padding: 16 }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{uiText(locale, 'doneTitle')}</p>
          <p style={{ fontSize: 14, marginTop: 12 }}>{uiText(locale, 'dailyResetNote')}</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            {event.resetMode === 'keep-phones'
              ? uiText(locale, 'keepPhonesNote')
              : uiText(locale, 'fullDailyNote')}
          </p>
        </section>
      )}

      {user && (phase === 'register' || phase === 'done') && (
        <section style={{ marginTop: 28 }}>
          {event.admissionQrEnabled && (
            <div style={{ ...cardStyle, padding: 14, marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24">
                  <path
                    d="M4 4h5v5H4zM15 4h5v5h-5zM4 15h5v5H4zM15 15h2v2h-2zM20 15h-1v1h1zM18 18h2v2h-2zM15 18h1v2h-3v-2h2z"
                    fill={VIOLET}
                  />
                  <path d="M6.5 6.5h1v1h-1zM17.5 6.5h1v1h-1zM6.5 17.5h1v1h-1z" fill={VIOLET} />
                </svg>
                <span style={{ fontWeight: 800, fontSize: 15.5, flex: 1 }}>
                  {uiText(locale, 'admissionQrTitle')}
                </span>
                <span
                  style={{
                    backgroundColor: admissionQr?.stored ? VIOLET : '#e5e7eb',
                    color: admissionQr?.stored ? '#ffffff' : '#4b5563',
                    borderRadius: 999,
                    padding: '3px 11px',
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {admissionQr?.stored
                    ? uiText(locale, 'admissionQrStored')
                    : uiText(locale, 'admissionQrNotStored')}
                </span>
                {!admissionQr?.stored && !qrEditing && (
                  <button
                    onClick={() => {
                      setQrFeedback(null);
                      setQrEditing(true);
                    }}
                    style={{
                      padding: '8px 14px',
                      fontWeight: 700,
                      fontSize: 13.5,
                      backgroundColor: VIOLET,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {uiText(locale, 'admissionQrRegisterButton')}
                  </button>
                )}
                {admissionQr?.stored && !qrEditing && (
                  <button
                    onClick={() => setQrExpanded((v) => !v)}
                    aria-expanded={qrExpanded}
                    style={{
                      padding: '8px 14px',
                      fontWeight: 700,
                      fontSize: 13.5,
                      backgroundColor: VIOLET,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {qrExpanded
                      ? uiText(locale, 'admissionQrHideButton')
                      : uiText(locale, 'admissionQrShowButton')}
                  </button>
                )}
              </div>

              {admissionQr?.stored && qrExpanded && !qrEditing && (
                <>
                  <div
                    style={{
                      marginTop: 14,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 14,
                      padding: 14,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <QRCodeSVG value={admissionQr.content ?? ''} size={208} />
                  </div>
                  <p
                    style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: VIOLET,
                      textAlign: 'center',
                      margin: '12px 0 0',
                    }}
                  >
                    {uiText(locale, 'admissionQrShowNote')}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      textAlign: 'center',
                      margin: '6px 0 0',
                      wordBreak: 'break-all',
                    }}
                  >
                    {admissionQr.content}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button
                      onClick={() => {
                        setQrFeedback(null);
                        setQrEditing(true);
                      }}
                      disabled={qrBusy}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        fontWeight: 700,
                        fontSize: 13.5,
                        backgroundColor: '#ffffff',
                        color: VIOLET,
                        border: `1px solid ${VIOLET}`,
                        borderRadius: 10,
                        cursor: 'pointer',
                      }}
                    >
                      {uiText(locale, 'admissionQrRescanButton')}
                    </button>
                    <button
                      onClick={() => void handleDeleteAdmissionQr()}
                      disabled={qrBusy}
                      style={{
                        padding: '10px 16px',
                        fontWeight: 700,
                        fontSize: 13.5,
                        backgroundColor: '#ffffff',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: 10,
                        cursor: 'pointer',
                      }}
                    >
                      {uiText(locale, 'admissionQrDeleteButton')}
                    </button>
                  </div>
                </>
              )}

              {qrEditing && (
                <>
                  <p style={{ fontSize: 13, color: '#475569', margin: '10px 0 0' }}>
                    {uiText(locale, 'admissionQrIntro')}
                  </p>
                  {!qrScanning && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'relative',
                        marginTop: 12,
                        height: 180,
                        borderRadius: 14,
                        backgroundColor: '#101828',
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
                        backgroundSize: '26px 26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: 84,
                          height: 84,
                          border: '2px dashed rgba(255, 255, 255, 0.5)',
                          borderRadius: 10,
                        }}
                      />
                      <p
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 10,
                          fontSize: 12,
                          color: 'rgba(255, 255, 255, 0.8)',
                          textAlign: 'center',
                          margin: 0,
                          padding: '0 16px',
                        }}
                      >
                        {uiText(locale, 'admissionQrScanHint')}
                      </p>
                    </div>
                  )}
                  <div
                    id="admission-qr-reader"
                    style={{
                      width: '100%',
                      marginTop: qrScanning ? 12 : 0,
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  />
                  {!qrScanning ? (
                    <button
                      onClick={() => void startQrCamera()}
                      disabled={qrBusy}
                      style={{ ...buttonStyle, marginTop: 12, opacity: qrBusy ? 0.6 : 1 }}
                    >
                      {uiText(locale, 'admissionQrCameraStart')}
                    </button>
                  ) : (
                    <button
                      onClick={() => void stopQrCamera()}
                      style={{
                        ...buttonStyle,
                        marginTop: 12,
                        backgroundColor: '#ffffff',
                        color: VIOLET,
                        border: `1px solid ${VIOLET}`,
                      }}
                    >
                      {uiText(locale, 'admissionQrCameraStop')}
                    </button>
                  )}
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
                    {uiText(locale, 'admissionQrManualLabel')}
                    <input
                      style={inputStyle}
                      type="text"
                      value={qrManual}
                      onChange={(e) => setQrManual(e.target.value)}
                      placeholder={uiText(locale, 'admissionQrManualPlaceholder')}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                    <button
                      onClick={() => void saveAdmissionQrContent(qrManual)}
                      disabled={qrBusy || !qrManual.trim()}
                      style={{
                        flex: 1,
                        padding: '11px 12px',
                        fontWeight: 700,
                        fontSize: 14,
                        backgroundColor: VIOLET,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        opacity: qrBusy || !qrManual.trim() ? 0.6 : 1,
                      }}
                    >
                      {uiText(locale, 'admissionQrSaveButton')}
                    </button>
                    <button
                      onClick={() => {
                        void stopQrCamera();
                        setQrEditing(false);
                        setQrManual('');
                        setQrFeedback(null);
                      }}
                      style={{
                        padding: '11px 14px',
                        fontWeight: 700,
                        fontSize: 14,
                        background: 'none',
                        color: '#475569',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {uiText(locale, 'admissionQrCancelButton')}
                    </button>
                  </div>
                </>
              )}

              {qrFeedback && (
                <p
                  role="status"
                  style={
                    qrFeedback.error
                      ? feedbackStyle
                      : {
                          marginTop: 12,
                          fontSize: 14,
                          backgroundColor: '#f5f3ff',
                          border: '1px solid #ddd6fe',
                          borderRadius: 10,
                          padding: '9px 12px',
                        }
                  }
                >
                  {qrFeedback.text}
                </p>
              )}
            </div>
          )}

          {myClaims.length > 0 && (
            <>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
                  <rect x="4" y="3" width="16" height="18" rx="2.5" fill="none" stroke={VIOLET} strokeWidth="2" />
                  <path d="M8 8.5h8M8 12.5h8M8 16.5h5" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ flex: 1 }}>{uiText(locale, 'myCouponsTitle')}</span>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  {uiText(locale, 'itemsCount', { count: String(myClaims.length) })}
                </span>
              </h2>
              {myClaims.map((claim) => {
                const catalogCoupon = couponById.get(claim.couponId);
                const detailParts = [
                  catalogCoupon?.description,
                  uiText(locale, 'validUntil', { date: endDateLabel }),
                ].filter((part): part is string => Boolean(part));
                return claim.status === 'redeemed' ? (
                  <article
                    key={claim.claimId}
                    style={{
                      backgroundColor: '#e9edf2',
                      borderRadius: 16,
                      padding: 16,
                      marginTop: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          backgroundColor: '#6b7280',
                          color: '#ffffff',
                          borderRadius: 6,
                          padding: '3px 10px',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {uiText(locale, 'usedStamp')}
                      </span>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>
                        🏢 {claim.exhibitorName}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#4b5563', marginTop: 8 }}>
                      {claim.title}
                    </div>
                    <p style={{ fontSize: 13, margin: '6px 0 0', color: '#6b7280' }}>
                      {uiText(locale, 'redeemedNote')}
                    </p>
                  </article>
                ) : (
                  <article
                    key={claim.claimId}
                    style={{
                      background: CARD_GRADIENT,
                      border: '1px solid #ddd6fe',
                      borderRadius: 16,
                      padding: 16,
                      marginTop: 12,
                      boxShadow: '0 2px 8px rgba(109, 40, 217, 0.12)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          backgroundColor: CLAIM_BLUE,
                          color: '#ffffff',
                          borderRadius: 6,
                          padding: '3px 10px',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {uiText(locale, 'claimedBadge')}
                      </span>
                      <span style={{ fontSize: 13, color: '#475569' }}>
                        🏢 {claim.exhibitorName}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 17, marginTop: 8 }}>{claim.title}</div>
                    {detailParts.length > 0 && (
                      <p style={{ fontSize: 12.5, color: '#475569', margin: '4px 0 0' }}>
                        {detailParts.join(' / ')}
                      </p>
                    )}
                    {effectiveOpenClaimId === claim.claimId ? (
                      <>
                        <div
                          style={{
                            marginTop: 14,
                            backgroundColor: '#ffffff',
                            borderRadius: 14,
                            padding: 14,
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          <QRCodeSVG value={claim.claimId} size={176} />
                        </div>
                        <p
                          style={{
                            fontSize: 14.5,
                            fontWeight: 800,
                            color: VIOLET,
                            textAlign: 'center',
                            margin: '12px 0 0',
                          }}
                        >
                          {uiText(locale, 'showQrNote')}
                        </p>
                        {daysLeft >= 0 && (
                          <p
                            style={{
                              fontSize: 12.5,
                              color: '#475569',
                              textAlign: 'center',
                              margin: '4px 0 0',
                            }}
                          >
                            {uiText(locale, 'daysLeft', { days: String(daysLeft) })}
                          </p>
                        )}
                        <div style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => setOpenClaimId(null)}
                            aria-expanded={true}
                            style={{
                              marginTop: 10,
                              padding: '6px 14px',
                              fontWeight: 700,
                              fontSize: 13,
                              background: 'none',
                              color: VIOLET,
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            {uiText(locale, 'hideQr')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => setOpenClaimId(claim.claimId)}
                        aria-expanded={false}
                        style={{
                          marginTop: 12,
                          padding: '10px 18px',
                          fontWeight: 700,
                          fontSize: 14,
                          backgroundColor: VIOLET,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                        }}
                      >
                        {uiText(locale, 'showQr')}
                      </button>
                    )}
                  </article>
                );
              })}
            </>
          )}

          <div style={{ position: 'relative', marginTop: 22 }}>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 15,
                color: '#64748b',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 14px 12px 40px',
                border: 'none',
                borderRadius: 999,
                fontSize: 15,
                backgroundColor: '#edf0f4',
                boxSizing: 'border-box',
                color: '#0f172a',
              }}
              type="search"
              value={couponQuery}
              onChange={(e) => setCouponQuery(e.target.value)}
              placeholder={uiText(locale, 'searchPlaceholder')}
              aria-label={uiText(locale, 'searchPlaceholder')}
            />
          </div>

          <h3
            style={{
              fontSize: 17,
              fontWeight: 800,
              marginTop: 22,
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <span aria-hidden="true" style={{ color: VIOLET, fontSize: 15 }}>
              ▾
            </span>
            <span style={{ flex: 1 }}>{uiText(locale, 'catalogTitle')}</span>
            {coupons.length > 0 && (
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                {uiText(locale, 'catalogSummary', {
                  companies: String(totalCompanies),
                  count: String(coupons.length),
                })}
              </span>
            )}
          </h3>
          {couponMessage && (
            <p
              role="status"
              style={{
                marginTop: 10,
                fontSize: 14,
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: 10,
                padding: '9px 12px',
              }}
            >
              {couponMessage}
            </p>
          )}
          {couponGroups.length === 0 && (
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
              {uiText(locale, 'noCoupons')}
            </p>
          )}
          {couponGroups.map((group) => {
            const open = searching || openGroups.has(group.exhibitorName);
            return (
              <div key={group.exhibitorName} style={{ ...cardStyle, marginTop: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => toggleGroup(group.exhibitorName)}
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '15px 14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 16, flex: 1 }}>
                    {group.exhibitorName}
                  </span>
                  <span
                    style={{
                      backgroundColor: open ? VIOLET : '#e5e7eb',
                      color: open ? '#ffffff' : '#4b5563',
                      borderRadius: 999,
                      padding: '3px 11px',
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {uiText(locale, 'couponCount', { count: String(group.coupons.length) })}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      color: open ? VIOLET : '#9ca3af',
                      fontWeight: 800,
                      fontSize: open ? 15 : 20,
                      lineHeight: 1,
                    }}
                  >
                    {open ? '▾' : '›'}
                  </span>
                </button>
                {open &&
                  group.coupons.map((coupon) => {
                    const claim = myClaims.find((c) => c.couponId === coupon.id);
                    return (
                      <div
                        key={coupon.id}
                        style={{ padding: '13px 14px 15px', borderTop: '1px solid #f1f5f9' }}
                      >
                        {coupon.keywords[0] && (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: VIOLET_BRIGHT,
                              color: '#ffffff',
                              borderRadius: 6,
                              padding: '3px 10px',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {coupon.keywords[0]}
                          </span>
                        )}
                        <div style={{ fontWeight: 800, fontSize: 16, marginTop: coupon.keywords[0] ? 7 : 0 }}>
                          {coupon.title}
                        </div>
                        {coupon.description && (
                          <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                            {coupon.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                          <button
                            onClick={() => void handleClaim(coupon.id)}
                            disabled={busy || claim !== undefined}
                            style={{
                              padding: '10px 22px',
                              fontWeight: 700,
                              fontSize: 15,
                              borderRadius: 10,
                              border: 'none',
                              backgroundColor: claim ? '#e2e8f0' : CLAIM_BLUE,
                              color: claim ? '#64748b' : '#ffffff',
                              cursor: claim ? 'default' : 'pointer',
                            }}
                          >
                            {claim
                              ? claim.status === 'redeemed'
                                ? uiText(locale, 'redeemedButton')
                                : uiText(locale, 'claimedButton')
                              : uiText(locale, 'claimButton')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </section>
      )}

      {phase === 'register' && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
          }}
        >
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 14px' }}>
            {message && (
              <p
                style={{
                  ...feedbackStyle,
                  marginTop: 0,
                  marginBottom: 10,
                  backgroundColor: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: '9px 12px',
                }}
              >
                {message}
              </p>
            )}
            <div
              style={{
                background: HERO_GRADIENT,
                borderRadius: 18,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 8px 22px rgba(109, 40, 217, 0.28)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  border: `2px solid ${VIOLET}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
                }}
              >
                <svg width="23" height="23" viewBox="0 0 24 24">
                  <path
                    d="M18 9.2a6 6 0 1 0-12 0c0 5.4-2.3 6.8-2.3 6.8h16.6S18 14.6 18 9.2Z"
                    fill={VIOLET}
                  />
                  <path d="M10.1 19.4a2 2 0 0 0 3.8 0" fill={VIOLET} />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15.5, fontWeight: 800, color: INK, margin: 0 }}>
                  {uiText(locale, 'pushBannerTitle')}
                </p>
                <p style={{ fontSize: 12, color: '#4b4560', margin: '3px 0 0' }}>
                  {uiText(locale, 'pushBannerBody')}
                </p>
              </div>
              <button
                onClick={handleRegister}
                disabled={busy}
                style={{
                  padding: '12px 16px',
                  fontWeight: 800,
                  fontSize: 15,
                  backgroundColor: VIOLET,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {uiText(locale, 'pushBannerButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
