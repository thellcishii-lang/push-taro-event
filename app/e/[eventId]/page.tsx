'use client';

// app/e/[eventId]/page.tsx
// Push-taro EVENT の来場者登録画面（QRコードの着地先）。
// 流れ: イベント情報の確認 → 電話番号のSMS認証 → 通知許可とFCMトークン取得 → 登録API。
// 電話番号認証の作法は本家の登録画面（app/subscribe）に合わせている。
// 画面の固定文は4言語辞書（lib/ui-text.ts）で切り替える。初期表示は
// イベントのデフォルト言語、本人が切り替えたらその選択が優先される。
import { useEffect, useState } from 'react';
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
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  resolveLocale,
  type Locale,
} from '@/lib/i18n';
import { uiText } from '@/lib/ui-text';
import { QRCodeSVG } from 'qrcode.react';

interface PublicEvent {
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'live' | 'ended';
  resetMode: 'full-daily' | 'keep-phones';
  defaultLocale: string;
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

const containerStyle: React.CSSProperties = {
  padding: 24,
  maxWidth: 480,
  margin: '0 auto',
  fontFamily: 'sans-serif',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  marginTop: 6,
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 16,
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 20px',
  fontWeight: 700,
  fontSize: 15,
  width: '100%',
  marginTop: 16,
};

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

  const loadCoupons = async (query: string, loc: Locale) => {
    try {
      const res = await fetch(
        `/api/events/${eventId}/coupons/public?q=${encodeURIComponent(query)}&lang=${loc}`,
      );
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
    void loadCoupons('', locale);
    void loadMyClaims(user, locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId, locale]);

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

  if (phase === 'loading') return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;
  if (phase === 'not-found') {
    return (
      <main style={containerStyle}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>{uiText(locale, 'notFoundTitle')}</h1>
        <p style={{ fontSize: 14 }}>{uiText(locale, 'notFoundBody')}</p>
      </main>
    );
  }
  if (!event) return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;

  return (
    <main style={containerStyle}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>{event.name}</h1>
      <p style={{ fontSize: 13, color: '#475569' }}>
        {uiText(locale, 'period', { start: event.startDate, end: event.endDate })}
      </p>
      <div style={{ marginTop: 8 }}>
        <select
          aria-label={uiText(locale, 'language')}
          value={locale}
          onChange={(e) => void handleLocaleChange(e.target.value as Locale)}
          style={{ padding: '6px 8px', fontSize: 14 }}
        >
          {SUPPORTED_LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_LABELS[l]}
            </option>
          ))}
        </select>
      </div>

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
                display: 'block',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 14,
                marginTop: 8,
                fontWeight: 700,
                fontSize: 15,
                color: '#0f172a',
                textDecoration: 'none',
              }}
            >
              📄 {pdf.title}
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
        <section style={{ marginTop: 24 }}>
          <p style={{ fontSize: 14 }}>{uiText(locale, 'registerIntro')}</p>
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
        </section>
      )}

      {phase === 'code' && (
        <section style={{ marginTop: 24 }}>
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
        </section>
      )}

      {phase === 'register' && (
        <section style={{ marginTop: 24 }}>
          <p style={{ fontSize: 14 }}>{uiText(locale, 'verifiedIntro')}</p>
          <button style={buttonStyle} onClick={handleRegister} disabled={busy}>
            {uiText(locale, 'registerButton')}
          </button>
        </section>
      )}

      {phase === 'done' && (
        <section style={{ marginTop: 24 }}>
          <p style={{ fontSize: 17, fontWeight: 700 }}>{uiText(locale, 'doneTitle')}</p>
          <p style={{ fontSize: 14, marginTop: 12 }}>{uiText(locale, 'dailyResetNote')}</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            {event.resetMode === 'keep-phones'
              ? uiText(locale, 'keepPhonesNote')
              : uiText(locale, 'fullDailyNote')}
          </p>
        </section>
      )}

      {user && (phase === 'register' || phase === 'done') && (
        <section style={{ marginTop: 32, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>{uiText(locale, 'couponsTitle')}</h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              style={{ ...inputStyle, marginTop: 0, flex: 1 }}
              type="search"
              value={couponQuery}
              onChange={(e) => setCouponQuery(e.target.value)}
              placeholder={uiText(locale, 'searchPlaceholder')}
            />
            <button onClick={() => void loadCoupons(couponQuery, locale)} style={{ padding: '0 16px', fontWeight: 700 }}>
              {uiText(locale, 'searchButton')}
            </button>
          </div>

          {coupons.length === 0 && (
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>{uiText(locale, 'noCoupons')}</p>
          )}
          {coupons.map((coupon) => {
            const claim = myClaims.find((c) => c.couponId === coupon.id);
            return (
              <article
                key={coupon.id}
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 10 }}
              >
                <div style={{ fontWeight: 700, fontSize: 15 }}>{coupon.title}</div>
                <div style={{ fontSize: 12, color: '#475569' }}>{coupon.exhibitorName}</div>
                {coupon.description && <p style={{ fontSize: 13, marginTop: 4 }}>{coupon.description}</p>}
                <button
                  onClick={() => void handleClaim(coupon.id)}
                  disabled={busy || claim !== undefined}
                  style={{ marginTop: 8, padding: '8px 16px', fontWeight: 700 }}
                >
                  {claim
                    ? claim.status === 'redeemed'
                      ? uiText(locale, 'redeemedButton')
                      : uiText(locale, 'claimedButton')
                    : uiText(locale, 'claimButton')}
                </button>
              </article>
            );
          })}

          {myClaims.length > 0 && (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 24 }}>{uiText(locale, 'myCouponsTitle')}</h3>
              {myClaims.map((claim) => (
                <article
                  key={claim.claimId}
                  style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 10 }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{claim.title}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{claim.exhibitorName}</div>
                  {claim.status === 'redeemed' ? (
                    <p style={{ fontSize: 13, marginTop: 8, color: '#64748b' }}>{uiText(locale, 'redeemedNote')}</p>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, marginTop: 8 }}>{uiText(locale, 'showQrNote')}</p>
                      <div style={{ marginTop: 8 }}>
                        <QRCodeSVG value={claim.claimId} size={160} />
                      </div>
                    </>
                  )}
                </article>
              ))}
            </>
          )}
          {couponMessage && <p style={{ marginTop: 12, fontSize: 14 }}>{couponMessage}</p>}
        </section>
      )}

      {message && (
        <p style={{ marginTop: 16, fontSize: 14, color: '#b91c1c', whiteSpace: 'pre-wrap' }}>{message}</p>
      )}
    </main>
  );
}
