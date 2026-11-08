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
import { buildCouponGroups } from '@/lib/coupon-groups';
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
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>{uiText(locale, 'notFoundTitle')}</h1>
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

  return (
    <main style={containerStyle}>
      <header
        style={{
          background: `linear-gradient(135deg, ${VIOLET_BRIGHT}, ${VIOLET})`,
          borderRadius: 16,
          padding: '18px 16px',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(109, 40, 217, 0.35)',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{event.name}</h1>
        <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', margin: '6px 0 0' }}>
          {uiText(locale, 'period', { start: event.startDate, end: event.endDate })}
        </p>
        <div style={{ marginTop: 10 }}>
          <select
            aria-label={uiText(locale, 'language')}
            value={locale}
            onChange={(e) => void handleLocaleChange(e.target.value as Locale)}
            style={{
              padding: '6px 10px',
              fontSize: 14,
              borderRadius: 999,
              border: 'none',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontWeight: 600,
            }}
          >
            {SUPPORTED_LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABELS[l]}
              </option>
            ))}
          </select>
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
        </section>
      )}

      {phase === 'register' && (
        <section style={{ ...cardStyle, marginTop: 20, padding: 16 }}>
          <p style={{ fontSize: 14, margin: 0 }}>{uiText(locale, 'verifiedIntro')}</p>
          <button style={buttonStyle} onClick={handleRegister} disabled={busy}>
            {uiText(locale, 'registerButton')}
          </button>
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
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>{uiText(locale, 'couponsTitle')}</h2>

          {myClaims.length > 0 && (
            <>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span>{uiText(locale, 'myCouponsTitle')}</span>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  {uiText(locale, 'itemsCount', { count: String(myClaims.length) })}
                </span>
              </h3>
              {myClaims.map((claim) =>
                claim.status === 'redeemed' ? (
                  <article
                    key={claim.claimId}
                    style={{
                      ...cardStyle,
                      backgroundColor: '#f1f5f9',
                      padding: 12,
                      marginTop: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#64748b' }}>
                        {claim.title}
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          border: '2px solid #94a3b8',
                          color: '#64748b',
                          borderRadius: 6,
                          padding: '2px 10px',
                          fontWeight: 800,
                          fontSize: 13,
                          transform: 'rotate(-6deg)',
                        }}
                      >
                        {uiText(locale, 'usedStamp')}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{claim.exhibitorName}</div>
                    <p style={{ fontSize: 13, marginTop: 8, color: '#64748b' }}>
                      {uiText(locale, 'redeemedNote')}
                    </p>
                  </article>
                ) : (
                  <article
                    key={claim.claimId}
                    style={{
                      ...cardStyle,
                      backgroundColor: '#f5f3ff',
                      border: '1px solid #ddd6fe',
                      padding: 12,
                      marginTop: 10,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{claim.title}</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>{claim.exhibitorName}</div>
                    <button
                      onClick={() =>
                        setOpenClaimId(
                          effectiveOpenClaimId === claim.claimId ? null : claim.claimId,
                        )
                      }
                      aria-expanded={effectiveOpenClaimId === claim.claimId}
                      style={{
                        marginTop: 10,
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: 14,
                        backgroundColor: VIOLET,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                      }}
                    >
                      {effectiveOpenClaimId === claim.claimId
                        ? uiText(locale, 'hideQr')
                        : uiText(locale, 'showQr')}
                    </button>
                    {effectiveOpenClaimId === claim.claimId && (
                      <>
                        <p style={{ fontSize: 13, marginTop: 12 }}>
                          {uiText(locale, 'showQrNote')}
                        </p>
                        <div
                          style={{
                            marginTop: 8,
                            textAlign: 'center',
                            backgroundColor: '#ffffff',
                            borderRadius: 12,
                            padding: 12,
                          }}
                        >
                          <QRCodeSVG value={claim.claimId} size={160} />
                        </div>
                      </>
                    )}
                  </article>
                ),
              )}
            </>
          )}

          <input
            style={{ ...inputStyle, marginTop: 20 }}
            type="search"
            value={couponQuery}
            onChange={(e) => setCouponQuery(e.target.value)}
            placeholder={uiText(locale, 'searchPlaceholder')}
            aria-label={uiText(locale, 'searchPlaceholder')}
          />

          <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 20 }}>
            {uiText(locale, 'catalogTitle')}
          </h3>
          {couponGroups.length === 0 && (
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
              {uiText(locale, 'noCoupons')}
            </p>
          )}
          {couponGroups.map((group) => {
            const open = searching || openGroups.has(group.exhibitorName);
            return (
              <div key={group.exhibitorName} style={{ ...cardStyle, marginTop: 10, overflow: 'hidden' }}>
                <button
                  onClick={() => toggleGroup(group.exhibitorName)}
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>
                    {group.exhibitorName}
                  </span>
                  <span
                    style={{
                      backgroundColor: '#ede9fe',
                      color: VIOLET,
                      borderRadius: 999,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {uiText(locale, 'couponCount', { count: String(group.coupons.length) })}
                  </span>
                  <span style={{ color: VIOLET, fontWeight: 800 }}>{open ? '▾' : '▸'}</span>
                </button>
                {open &&
                  group.coupons.map((coupon) => {
                    const claim = myClaims.find((c) => c.couponId === coupon.id);
                    return (
                      <div
                        key={coupon.id}
                        style={{ padding: '12px 14px', borderTop: '1px solid #f1f5f9' }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{coupon.title}</div>
                        {coupon.description && (
                          <p style={{ fontSize: 13, marginTop: 4 }}>{coupon.description}</p>
                        )}
                        <button
                          onClick={() => void handleClaim(coupon.id)}
                          disabled={busy || claim !== undefined}
                          style={{
                            marginTop: 8,
                            padding: '8px 16px',
                            fontWeight: 700,
                            fontSize: 14,
                            borderRadius: 10,
                            border: 'none',
                            backgroundColor: claim ? '#e2e8f0' : VIOLET,
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
                    );
                  })}
              </div>
            );
          })}
          {couponMessage && <p style={{ marginTop: 12, fontSize: 14 }}>{couponMessage}</p>}
        </section>
      )}

      {message && (
        <p style={{ marginTop: 16, fontSize: 14, color: '#b91c1c', whiteSpace: 'pre-wrap' }}>{message}</p>
      )}
    </main>
  );
}
