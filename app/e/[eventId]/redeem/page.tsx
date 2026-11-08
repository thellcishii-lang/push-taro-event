'use client';

// app/e/[eventId]/redeem/page.tsx
// Push-taro EVENT の出店者用 消込専用画面。
// メール+パスワードでログインし、自社のクーポンだけを消し込む。
// 他社のクーポンかどうかはサーバー側（消込API）が判定するので、
// ここで他社のQRを読んでも 403 で弾かれる。
// カメラ読み取りの作法は本家の店舗画面（app/shop）に合わせている。
// 画面の固定文は4言語辞書（lib/ui-text.ts）。出店者の言語は
// 出店者レコードに保存され、次回ログイン時も引き継がれる。
// 見た目は来場者画面（PR #29）と共通のデザイン言語（紫基調・角丸カード）。
// ブースで立ったまま使うため、スキャンボタンと結果表示は大きく作る。
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Html5Qrcode } from 'html5-qrcode';
import { auth } from '@/lib/firebase-client';
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  normalizeLocale,
  type Locale,
} from '@/lib/i18n';
import { redeemText, uiText } from '@/lib/ui-text';
import PasswordInput from '@/components/PasswordInput';

interface Exhibitor {
  id: string;
  name: string;
  lang: string;
}

interface OwnCoupon {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

const VIOLET = '#6D28D9';
const VIOLET_BRIGHT = '#7C3AED';

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
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
};

const headerStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${VIOLET_BRIGHT}, ${VIOLET})`,
  borderRadius: 16,
  padding: '18px 16px',
  color: '#ffffff',
  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.35)',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '12px 12px',
  marginTop: 6,
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  fontSize: 16,
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  fontWeight: 700,
  fontSize: 16,
  backgroundColor: VIOLET,
  color: '#ffffff',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
};

const scanButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '20px 16px',
  fontWeight: 800,
  fontSize: 19,
  background: `linear-gradient(135deg, ${VIOLET_BRIGHT}, ${VIOLET})`,
  color: '#ffffff',
  border: 'none',
  borderRadius: 14,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.35)',
};

const stopButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px 20px',
  fontWeight: 700,
  fontSize: 17,
  backgroundColor: '#ffffff',
  color: '#b91c1c',
  border: '2px solid #ef4444',
  borderRadius: 14,
  cursor: 'pointer',
};

const languageSelectStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: 14,
  borderRadius: 999,
  border: 'none',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontWeight: 600,
};

const logoutButtonStyle: React.CSSProperties = {
  padding: '7px 14px',
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 999,
  border: '1px solid rgba(255, 255, 255, 0.5)',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  color: '#ffffff',
  cursor: 'pointer',
};

export default function ExhibitorRedeemPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [locale, setLocale] = useState<Locale>('ja');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [exhibitor, setExhibitor] = useState<Exhibitor | null>(null);
  const [exhibitorError, setExhibitorError] = useState('');
  const [coupons, setCoupons] = useState<OwnCoupon[]>([]);
  const [manualClaimId, setManualClaimId] = useState('');
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`event-locale:${eventId}`);
      if (stored) setLocale(normalizeLocale(stored));
    } catch {
      // 保存が読めなくても日本語で続行する
    }
  }, [eventId]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const callApi = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!user) throw new Error(redeemText(locale, 'loginRequired'));
      const idToken = await user.getIdToken();
      const res = await fetch(path, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          ...(init?.headers ?? {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error ?? redeemText(locale, 'apiError', { status: String(res.status) }));
      return data;
    },
    [user, locale],
  );

  const loadCoupons = useCallback(async () => {
    const data = await callApi(`/api/events/${eventId}/exhibitor-coupons`);
    setCoupons(data.coupons ?? []);
  }, [callApi, eventId]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const me = await callApi(`/api/events/${eventId}/exhibitor-me`);
        setExhibitor(me.exhibitor);
        // 出店者レコードの言語（個人の選択）が画面の初期言語になる
        if (me.exhibitor?.lang) setLocale(normalizeLocale(me.exhibitor.lang));
        setExhibitorError('');
        await loadCoupons();
      } catch (e) {
        setExhibitor(null);
        setExhibitorError(
          e instanceof Error ? e.message : redeemText(locale, 'exhibitorLoadFailed'),
        );
      }
    })();
    // locale は初期言語の確定にだけ使い、変更時の再取得は handleLocaleChange 側で行う
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId, callApi]);

  const handleLocaleChange = async (next: Locale) => {
    setLocale(next);
    try {
      window.localStorage.setItem(`event-locale:${eventId}`, next);
    } catch {
      // 保存できなくても画面の切替は有効にする
    }
    if (user && exhibitor) {
      try {
        await callApi(`/api/events/${eventId}/exhibitor-me`, {
          method: 'PATCH',
          body: JSON.stringify({ lang: next }),
        });
        await loadCoupons();
      } catch {
        // 保存に失敗しても画面の切替は止めない
      }
    }
  };

  const languageSelect = (
    <select
      aria-label={uiText(locale, 'language')}
      value={locale}
      onChange={(e) => void handleLocaleChange(e.target.value as Locale)}
      style={languageSelectStyle}
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
  );

  const brandHeader = (title: string, extra?: React.ReactNode) => (
    <header style={headerStyle}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
        Push-taro EVENT
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          marginTop: 4,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{title}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {languageSelect}
          {extra}
        </div>
      </div>
    </header>
  );

  const resultCard = result && (
    <div
      role="status"
      style={{
        ...cardStyle,
        marginTop: 16,
        padding: '18px 16px',
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        backgroundColor: result.ok ? '#f0fdf4' : '#fef2f2',
        border: `2px solid ${result.ok ? '#22c55e' : '#ef4444'}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          fontWeight: 800,
          color: '#ffffff',
          backgroundColor: result.ok ? '#16a34a' : '#dc2626',
        }}
      >
        {result.ok ? '✓' : '✕'}
      </div>
      <div>
        {result.ok && (
          <p style={{ fontSize: 20, fontWeight: 800, color: '#15803d', margin: 0 }}>
            {redeemText(locale, 'redeemDoneTitle')}
          </p>
        )}
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: result.ok ? '#166534' : '#b91c1c',
            margin: result.ok ? '4px 0 0' : 0,
          }}
        >
          {result.text}
        </p>
      </div>
    </div>
  );

  const handleLogin = async () => {
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setResult({ ok: false, text: redeemText(locale, 'loginFailed') });
    } finally {
      setBusy(false);
    }
  };

  const doRedeem = useCallback(
    async (claimId: string) => {
      const trimmed = claimId.trim();
      if (!trimmed) return;
      setBusy(true);
      setResult(null);
      try {
        await callApi(`/api/events/${eventId}/redeem`, {
          method: 'POST',
          body: JSON.stringify({ claimId: trimmed }),
        });
        setResult({ ok: true, text: redeemText(locale, 'redeemDone') });
        setManualClaimId('');
      } catch (e) {
        setResult({
          ok: false,
          text: e instanceof Error ? e.message : redeemText(locale, 'redeemFailed'),
        });
      } finally {
        setBusy(false);
      }
    },
    [callApi, eventId, locale],
  );

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      } catch {
        // 停止失敗は無視する
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const startCamera = async () => {
    setResult(null);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      setScanning(true);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopCamera();
          await doRedeem(decodedText);
        },
        () => {},
      );
    } catch (error) {
      setScanning(false);
      const err = error as { name?: string; message?: string };
      if (err?.name === 'NotAllowedError' || (err?.message ?? '').includes('Permission')) {
        setResult({ ok: false, text: redeemText(locale, 'cameraDenied') });
      } else if (err?.name === 'NotFoundError') {
        setResult({ ok: false, text: redeemText(locale, 'cameraNotFound') });
      } else {
        setResult({ ok: false, text: redeemText(locale, 'cameraFailed') });
      }
    }
  };

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

  if (!authReady) return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;

  if (!user) {
    return (
      <main style={containerStyle}>
        {brandHeader(redeemText(locale, 'redeemLoginTitle'))}
        <section style={{ ...cardStyle, padding: 16, marginTop: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>
            {redeemText(locale, 'emailLabel')}
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 12 }}>
            {redeemText(locale, 'passwordLabel')}
            <PasswordInput style={inputStyle} value={password} onChange={setPassword} autoComplete="current-password" />
          </label>
          <button
            onClick={handleLogin}
            disabled={busy}
            style={{ ...primaryButtonStyle, marginTop: 20, opacity: busy ? 0.6 : 1 }}
          >
            {redeemText(locale, 'loginButton')}
          </button>
        </section>
        {resultCard}
      </main>
    );
  }

  return (
    <main style={containerStyle}>
      {brandHeader(
        redeemText(locale, 'redeemTitle'),
        <button onClick={() => void signOut(auth)} style={logoutButtonStyle}>
          {redeemText(locale, 'logoutButton')}
        </button>,
      )}

      {exhibitorError && (
        <div
          style={{
            ...cardStyle,
            marginTop: 16,
            padding: '14px 16px',
            fontSize: 15,
            fontWeight: 600,
            color: '#b91c1c',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
          }}
        >
          {exhibitorError}
          {redeemText(locale, 'exhibitorErrorNote')}
        </div>
      )}

      {exhibitor && (
        <>
          <section style={{ ...cardStyle, padding: '14px 16px', marginTop: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              {redeemText(locale, 'exhibitorLine', { name: exhibitor.name })}
            </p>
          </section>

          <section style={{ ...cardStyle, padding: 16, marginTop: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
              {redeemText(locale, 'scannerTitle')}
            </h2>
            {!scanning && (
              <div
                aria-hidden="true"
                style={{
                  marginTop: 12,
                  height: 190,
                  borderRadius: 12,
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '0 20px',
                }}
              >
                <div
                  style={{
                    width: 104,
                    height: 104,
                    border: '2px dashed rgba(255, 255, 255, 0.55)',
                    borderRadius: 12,
                  }}
                />
                <p
                  style={{
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.85)',
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  {redeemText(locale, 'scanHint')}
                </p>
              </div>
            )}
            <div
              id="qr-reader"
              style={{ width: '100%', marginTop: scanning ? 12 : 0, borderRadius: 12, overflow: 'hidden' }}
            />
            {!scanning ? (
              <button
                onClick={startCamera}
                disabled={busy}
                style={{ ...scanButtonStyle, marginTop: 14, opacity: busy ? 0.6 : 1 }}
              >
                {redeemText(locale, 'cameraStart')}
              </button>
            ) : (
              <button onClick={() => void stopCamera()} style={{ ...stopButtonStyle, marginTop: 14 }}>
                {redeemText(locale, 'cameraStop')}
              </button>
            )}
          </section>

          {resultCard}

          <section style={{ ...cardStyle, padding: 16, marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>
              {redeemText(locale, 'manualLabel')}
              <input
                style={inputStyle}
                type="text"
                value={manualClaimId}
                onChange={(e) => setManualClaimId(e.target.value)}
                placeholder={redeemText(locale, 'claimCodePlaceholder')}
              />
            </label>
            <button
              onClick={() => void doRedeem(manualClaimId)}
              disabled={busy || !manualClaimId.trim()}
              style={{
                ...primaryButtonStyle,
                marginTop: 12,
                opacity: busy || !manualClaimId.trim() ? 0.6 : 1,
              }}
            >
              {redeemText(locale, 'redeemButton')}
            </button>
          </section>

          <h2 style={{ fontSize: 17, fontWeight: 800, marginTop: 28 }}>
            {redeemText(locale, 'ownCouponsTitle')}
          </h2>
          {coupons.length === 0 && (
            <p style={{ fontSize: 14, color: '#64748b' }}>{redeemText(locale, 'noOwnCoupons')}</p>
          )}
          {coupons.map((coupon) => (
            <article
              key={coupon.id}
              style={{ ...cardStyle, borderLeft: `4px solid ${VIOLET}`, padding: '14px 16px', marginTop: 10 }}
            >
              <div style={{ fontWeight: 700, fontSize: 16 }}>{coupon.title}</div>
              {coupon.description && (
                <p style={{ fontSize: 14, color: '#475569', margin: '4px 0 0' }}>{coupon.description}</p>
              )}
              {!coupon.active && (
                <p style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', margin: '6px 0 0' }}>
                  {redeemText(locale, 'couponInactive')}
                </p>
              )}
            </article>
          ))}
        </>
      )}
    </main>
  );
}
