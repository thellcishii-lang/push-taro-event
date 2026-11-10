'use client';

// app/e/[eventId]/redeem/page.tsx
// Push-taro EVENT の出店者用 消込専用画面。
// メール+パスワードでログインし、自社のクーポンだけを消し込む。
// 他社のクーポンかどうかはサーバー側（消込API）が判定するので、
// ここで他社のQRを読んでも 403 で弾かれる。
// カメラ読み取りの作法は本家の店舗画面（app/shop）に合わせている。
// 画面の固定文は4言語辞書（lib/ui-text.ts）。出店者の言語は
// 出店者レコードに保存され、次回ログイン時も引き継がれる。
// 見た目は承認済みモック（出店者）準拠: 白地に紫のブランド名、会社名＋
// 言語セグメントのバー、紫の角枠つきスキャナー、大きなスキャンボタン、
// 緑の結果カード、自社クーポンはアイコン＋進捗バーつきの行で出す。
// ブースで立ったまま使うため、スキャンボタンと結果表示は大きく作る。
// 結果表示はスキャン部のすぐ下に出す（ページ末尾には出さない）。
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
  claimedCount?: number;
  redeemedCount?: number;
}

interface RedeemResult {
  ok: boolean;
  text: string;
  at: Date;
}

const VIOLET = '#6D28D9';
const VIOLET_BRIGHT = '#7C3AED';

// モックの言語セグメントは短い表記（EN など）。保存・送信は従来どおり locale で行う。
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
  borderRadius: 18,
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
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
  borderRadius: 12,
  cursor: 'pointer',
};

const scanButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '19px 16px',
  fontWeight: 800,
  fontSize: 19,
  backgroundColor: VIOLET,
  color: '#ffffff',
  border: 'none',
  borderRadius: 14,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
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

const logoutButtonStyle: React.CSSProperties = {
  padding: '7px 13px',
  fontSize: 13.5,
  fontWeight: 700,
  borderRadius: 999,
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#475569',
  cursor: 'pointer',
  flexShrink: 0,
};

function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

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
  const [result, setResult] = useState<RedeemResult | null>(null);
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

  const languagePills = (
    <div
      role="group"
      aria-label={uiText(locale, 'language')}
      style={{
        display: 'inline-flex',
        backgroundColor: '#eef1f5',
        borderRadius: 999,
        padding: 3,
        gap: 2,
        flexShrink: 0,
      }}
    >
      {SUPPORTED_LOCALES.map((l) => {
        const selected = l === locale;
        return (
          <button
            key={l}
            onClick={() => void handleLocaleChange(l)}
            aria-pressed={selected}
            style={{
              padding: '6px 12px',
              fontSize: 13.5,
              fontWeight: 700,
              borderRadius: 999,
              border: 'none',
              backgroundColor: selected ? VIOLET : 'transparent',
              color: selected ? '#ffffff' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {PILL_LABELS[l]}
          </button>
        );
      })}
    </div>
  );

  const brandRow = (right?: React.ReactNode) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <p style={{ fontSize: 21, fontWeight: 800, color: VIOLET, margin: 0, letterSpacing: -0.2 }}>
        Push-taro EVENT
      </p>
      {right}
    </div>
  );

  const resultCard = result && (
    <div
      role="status"
      style={{
        ...cardStyle,
        marginTop: 16,
        padding: '16px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        backgroundColor: result.ok ? '#f0fdf4' : '#fef2f2',
        border: `2px solid ${result.ok ? '#22c55e' : '#ef4444'}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 50,
          height: 50,
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          {result.ok ? (
            <p style={{ fontSize: 20, fontWeight: 800, color: '#15803d', margin: 0 }}>
              {redeemText(locale, 'redeemDoneTitle')}
            </p>
          ) : (
            <span />
          )}
          <span style={{ fontSize: 12.5, color: '#64748b', whiteSpace: 'nowrap' }}>
            {redeemText(locale, 'resultTime', { time: formatTime(result.at) })}
          </span>
        </div>
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: result.ok ? '#166534' : '#b91c1c',
            margin: result.ok ? '4px 0 0' : '2px 0 0',
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
      setResult({ ok: false, text: redeemText(locale, 'loginFailed'), at: new Date() });
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
        setResult({ ok: true, text: redeemText(locale, 'redeemDone'), at: new Date() });
        setManualClaimId('');
        // 消込したので件数表示を最新化する（失敗しても成功表示はそのまま）
        try {
          await loadCoupons();
        } catch {
          // 件数の再取得失敗で消込成功の表示は妨げない
        }
      } catch (e) {
        setResult({
          ok: false,
          text: e instanceof Error ? e.message : redeemText(locale, 'redeemFailed'),
          at: new Date(),
        });
      } finally {
        setBusy(false);
      }
    },
    [callApi, eventId, locale, loadCoupons],
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
        setResult({ ok: false, text: redeemText(locale, 'cameraDenied'), at: new Date() });
      } else if (err?.name === 'NotFoundError') {
        setResult({ ok: false, text: redeemText(locale, 'cameraNotFound'), at: new Date() });
      } else {
        setResult({ ok: false, text: redeemText(locale, 'cameraFailed'), at: new Date() });
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
        {brandRow(languagePills)}
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: '18px 0 0' }}>
          {redeemText(locale, 'redeemLoginTitle')}
        </h1>
        <section style={{ ...cardStyle, padding: 16, marginTop: 14 }}>
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

  const cornerStyle = (pos: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    width: 27,
    height: 27,
    borderColor: VIOLET_BRIGHT,
    borderStyle: 'solid',
    borderWidth: 0,
    ...pos,
  });

  return (
    <main style={containerStyle}>
      {brandRow(
        <button onClick={() => void signOut(auth)} style={logoutButtonStyle}>
          {redeemText(locale, 'logoutButton')}
        </button>,
      )}

      {exhibitorError && (
        <>
          {!exhibitor && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              {languagePills}
            </div>
          )}
          <div
            style={{
              ...cardStyle,
              marginTop: 12,
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
        </>
      )}

      {exhibitor && (
        <>
          <section
            style={{
              ...cardStyle,
              padding: '12px 14px',
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <p style={{ fontSize: 16.5, fontWeight: 800, margin: 0, flex: 1, minWidth: 110 }}>
              {exhibitor.name}
            </p>
            {languagePills}
          </section>

          <section style={{ ...cardStyle, padding: 16, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24">
                <path
                  d="M4 4h5v5H4zM15 4h5v5h-5zM4 15h5v5H4zM15 15h2v2h-2zM20 15h-1v1h1zM18 18h2v2h-2zM15 18h1v2h-3v-2h2z"
                  fill="#334155"
                />
                <path d="M6.5 6.5h1v1h-1zM17.5 6.5h1v1h-1zM6.5 17.5h1v1h-1z" fill="#334155" />
              </svg>
              <h2 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: '#334155' }}>
                {redeemText(locale, 'scannerTitle')}
              </h2>
            </div>
            {!scanning && (
              <div
                aria-hidden="true"
                style={{
                  position: 'relative',
                  marginTop: 12,
                  height: 208,
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
                <span style={cornerStyle({ top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 7 })} />
                <span style={cornerStyle({ top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 7 })} />
                <span style={cornerStyle({ bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 7 })} />
                <span style={cornerStyle({ bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 7 })} />
                <div
                  style={{
                    width: 96,
                    height: 96,
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
                    fontSize: 12.5,
                    color: 'rgba(255, 255, 255, 0.8)',
                    textAlign: 'center',
                    margin: 0,
                    padding: '0 16px',
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
                <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24">
                  <path
                    d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M3 12h18"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
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

          <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 28 }}>
            {redeemText(locale, 'ownCouponsTitle')}
          </h2>
          {coupons.length === 0 && (
            <p style={{ fontSize: 14, color: '#64748b' }}>{redeemText(locale, 'noOwnCoupons')}</p>
          )}
          {coupons.map((coupon) => {
            const claimed = coupon.claimedCount ?? 0;
            const redeemed = coupon.redeemedCount ?? 0;
            const left = Math.max(claimed - redeemed, 0);
            const pct = claimed > 0 ? Math.round((redeemed / claimed) * 100) : 0;
            return (
              <article
                key={coupon.id}
                style={{
                  ...cardStyle,
                  borderRadius: 16,
                  padding: '15px 16px',
                  marginTop: 12,
                  display: 'flex',
                  gap: 13,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: '#ede9fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="27" height="27" viewBox="0 0 24 24">
                    <path
                      d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a2.5 2.5 0 0 0 0-5V8Z"
                      fill={VIOLET}
                    />
                    <path
                      d="M13.5 7v2M13.5 11v2M13.5 15v2"
                      stroke="#ede9fe"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeDasharray="0.1 3.1"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{coupon.title}</div>
                  {coupon.description && (
                    <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
                      {coupon.description}
                    </p>
                  )}
                  {!coupon.active && (
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', margin: '6px 0 0' }}>
                      {redeemText(locale, 'couponInactive')}
                    </p>
                  )}
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', margin: 0 }}>
                    {redeemText(locale, 'redeemProgress', {
                      redeemed: String(redeemed),
                      left: String(left),
                    })}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      justifyContent: 'flex-end',
                      marginTop: 7,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        width: 84,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: '#e2e8f0',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: VIOLET,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </>
      )}
    </main>
  );
}
