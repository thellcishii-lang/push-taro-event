'use client';

// app/e/[eventId]/redeem/page.tsx
// Push-taro EVENT の出店者用 消込専用画面。
// メール+パスワードでログインし、自社のクーポンだけを消し込む。
// 他社のクーポンかどうかはサーバー側（消込API）が判定するので、
// ここで他社のQRを読んでも 403 で弾かれる。
// カメラ読み取りの作法は本家の店舗画面（app/shop）に合わせている。
// 画面の固定文は4言語辞書（lib/ui-text.ts）。出店者の言語は
// 出店者レコードに保存され、次回ログイン時も引き継がれる。
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

const containerStyle: React.CSSProperties = {
  padding: 24,
  maxWidth: 520,
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
      style={{ padding: '6px 8px', fontSize: 14 }}
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{redeemText(locale, 'redeemLoginTitle')}</h1>
          {languageSelect}
        </div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
          {redeemText(locale, 'emailLabel')}
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 12 }}>
          {redeemText(locale, 'passwordLabel')}
          <PasswordInput style={inputStyle} value={password} onChange={setPassword} autoComplete="current-password" />
        </label>
        <button onClick={handleLogin} disabled={busy} style={{ width: '100%', padding: '12px 20px', fontWeight: 700, marginTop: 16 }}>
          {redeemText(locale, 'loginButton')}
        </button>
        {result && <p style={{ marginTop: 12, fontSize: 14, color: '#b91c1c' }}>{result.text}</p>}
      </main>
    );
  }

  return (
    <main style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>{redeemText(locale, 'redeemTitle')}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {languageSelect}
          <button onClick={() => void signOut(auth)}>{redeemText(locale, 'logoutButton')}</button>
        </div>
      </div>

      {exhibitorError && (
        <p style={{ marginTop: 16, fontSize: 14, color: '#b91c1c' }}>
          {exhibitorError}
          {redeemText(locale, 'exhibitorErrorNote')}
        </p>
      )}

      {exhibitor && (
        <>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            {redeemText(locale, 'exhibitorLine', { name: exhibitor.name })}
          </p>

          <div id="qr-reader" style={{ width: '100%', marginTop: 16 }} />
          {!scanning ? (
            <button onClick={startCamera} disabled={busy} style={{ width: '100%', padding: '12px 20px', fontWeight: 700, marginTop: 8 }}>
              {redeemText(locale, 'cameraStart')}
            </button>
          ) : (
            <button onClick={() => void stopCamera()} style={{ width: '100%', padding: '12px 20px', fontWeight: 700, marginTop: 8 }}>
              {redeemText(locale, 'cameraStop')}
            </button>
          )}

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 20 }}>
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
            style={{ width: '100%', padding: '12px 20px', fontWeight: 700, marginTop: 10 }}
          >
            {redeemText(locale, 'redeemButton')}
          </button>

          {result && (
            <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: result.ok ? '#15803d' : '#b91c1c' }}>
              {result.text}
            </p>
          )}

          <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 28 }}>{redeemText(locale, 'ownCouponsTitle')}</h2>
          {coupons.length === 0 && (
            <p style={{ fontSize: 13, color: '#64748b' }}>{redeemText(locale, 'noOwnCoupons')}</p>
          )}
          {coupons.map((coupon) => (
            <article key={coupon.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{coupon.title}</div>
              {coupon.description && <p style={{ fontSize: 13, marginTop: 2 }}>{coupon.description}</p>}
              {!coupon.active && <p style={{ fontSize: 12, color: '#b91c1c' }}>{redeemText(locale, 'couponInactive')}</p>}
            </article>
          ))}
        </>
      )}
    </main>
  );
}
