'use client';

// app/event-admin/[eventId]/coupons/page.tsx
// Push-taro EVENT 主催者向けのクーポン管理画面（管理画面③）。
// 出店者（会社）の登録と、クーポンの登録・一覧を行う。クーポンはイベント全体で上限あり。
// 案内PDFの管理は設定画面（④）に移した（2026-11-11）。
// 画面の固定文は4言語辞書（lib/ui-text.ts の ADMIN_TEXT）。
// 見た目は承認済みモック準拠。ログイン後は共通シェル（components/AdminShell）
// を使い、PC は左サイドバー固定の2カラム、スマホはアコーディオンになる。
// フィードバック文は、出店者／クーポンそれぞれのフォームの直下に出す
// （以前は画面最下部にしか出ず、実利用で「何も起きない」ように見えた）。
// 登録成功時は追加された行までスクロールして一時的にハイライトし、
// 送信中はボタンの文言も「登録中…」に変えて手応えを出す。
// 出店者一覧は100社規模でも使えるよう、検索＋先頭2社＋アコーディオンにし、
// 行タップで下のクーポン一覧をその出店者だけに絞り込めるようにした。
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { AdminLanguageSelect, useAdminLocale } from '@/components/AdminLocale';
import {
  ADMIN_CARD_BORDER,
  ADMIN_CARD_SHADOW,
  ADMIN_PAGE_BG,
  AdminBrandBar,
  ButtonSpinner,
  adminButtonContentStyle,
  adminErrorTextStyle,
  adminFeedbackStyle,
  adminPageTitleStyle,
} from '@/components/AdminBrand';
import { adminText, uiText } from '@/lib/ui-text';
import { AdminShell } from '@/components/AdminShell';
import { CapWarningBanner } from '@/components/CapWarningBanner';
import { AdminNav } from '../AdminNav';

interface Exhibitor {
  id: string;
  name: string;
  email: string | null;
  hasAccessCode: boolean;
}

interface Coupon {
  id: string;
  exhibitorId: string;
  exhibitorName: string;
  title: string;
  description: string;
  keywords: string[];
  active: boolean;
}

const VIOLET = '#6D28D9';

/** クーポンオプションで増やせるイベント単位の上限（LP 記載）。 */
const COUPON_OPTION_MAX_CAP = 500;
/** 出店者一覧で既定表示する件数（残りはアコーディオンに畳む）。 */
const EXHIBITOR_PREVIEW_COUNT = 2;
/** クーポンオプションの購入先（本家の決済ページ）。 */
const HONKE_COUPON_OPTION_URL = 'https://push-taro.com/event-option';

const containerStyle: React.CSSProperties = {
  padding: '20px 16px 48px',
  maxWidth: 880,
  margin: '0 auto',
  fontFamily: 'sans-serif',
  backgroundColor: ADMIN_PAGE_BG,
  minHeight: '100vh',
  boxSizing: 'border-box',
  color: '#0f172a',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: `1px solid ${ADMIN_CARD_BORDER}`,
  borderRadius: 18,
  boxShadow: ADMIN_CARD_SHADOW,
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '11px 12px',
  marginTop: 6,
  border: '1px solid #D9D4EC',
  borderRadius: 12,
  fontSize: 14,
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 12,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '12px 22px',
  fontWeight: 700,
  fontSize: 15,
  backgroundColor: VIOLET,
  color: '#ffffff',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  margin: 0,
};

function linkBadgeStyle(linked: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '3px 12px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    whiteSpace: 'nowrap',
    ...(linked
      ? { backgroundColor: '#D9F5E3', color: '#15803d' }
      : { backgroundColor: '#E8EAF1', color: '#5B6472' }),
  };
}

export default function EventCouponAdminPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [locale, setLocale] = useAdminLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCap, setCouponCap] = useState(100);
  const [exhibitorName, setExhibitorName] = useState('');
  const [exhibitorEmail, setExhibitorEmail] = useState('');
  const [couponForm, setCouponForm] = useState({
    exhibitorId: '',
    title: '',
    description: '',
    keywords: '',
  });
  const [message, setMessage] = useState('');
  const [loadMessage, setLoadMessage] = useState('');
  const [exhibitorMessage, setExhibitorMessage] = useState('');
  // パスワードメールの送信失敗だけを伝える警告（成功文とは別に出す）。
  const [exhibitorMailWarning, setExhibitorMailWarning] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [busy, setBusy] = useState(false);
  // 送信中フォーム（ボタンの文言を「登録中…」に切り替えるため）。
  const [pendingForm, setPendingForm] = useState<'exhibitor' | 'coupon' | null>(null);
  // 登録直後にスクロール＋ハイライトする行。
  const [highlight, setHighlight] = useState<{ kind: 'exhibitor' | 'coupon'; id: string } | null>(null);
  // 出店者一覧の検索文字列、アコーディオンの開閉、クーポン一覧の出店者絞り込み。
  const [exhibitorSearch, setExhibitorSearch] = useState('');
  const [exhibitorsExpanded, setExhibitorsExpanded] = useState(false);
  const [couponExhibitorFilter, setCouponExhibitorFilter] = useState<string | null>(null);

  // 追加された行が見える位置までスクロールし、しばらくハイライトする。
  useEffect(() => {
    if (!highlight) return;
    const el = document.getElementById(`admin-row-${highlight.kind}-${highlight.id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setHighlight(null), 2600);
    return () => clearTimeout(timer);
  }, [highlight]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const callApi = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!user) throw new Error(adminText(locale, 'loginRequired'));
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
        throw new Error(data.error ?? adminText(locale, 'apiError', { status: String(res.status) }));
      return data;
    },
    [user, locale],
  );

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const [exData, cpData, evData] = await Promise.all([
        callApi(`/api/events/${eventId}/exhibitors`),
        callApi(`/api/events/${eventId}/coupons`),
        callApi(`/api/events/${eventId}`),
      ]);
      setExhibitors(exData.exhibitors ?? []);
      setCoupons(cpData.coupons ?? []);
      if (typeof evData.event?.couponCap === 'number') setCouponCap(evData.event.couponCap);
      setLoadMessage('');
    } catch (e) {
      setLoadMessage(e instanceof Error ? e.message : adminText(locale, 'loadFailed'));
    }
  }, [user, eventId, callApi, locale]);

  useEffect(() => {
    if (user) void loadAll();
  }, [user, loadAll]);

  const handleLogin = async () => {
    setBusy(true);
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setMessage(adminText(locale, 'loginFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleAddExhibitor = async () => {
    setBusy(true);
    setPendingForm('exhibitor');
    setExhibitorMessage('');
    setExhibitorMailWarning('');
    try {
      const result = await callApi(`/api/events/${eventId}/exhibitors`, {
        method: 'POST',
        body: JSON.stringify({ name: exhibitorName, email: exhibitorEmail }),
      });
      setExhibitorName('');
      setExhibitorEmail('');
      if (result?.mailSent === false) {
        // 登録は成立しているがパスワードメールが送れていない。「送信しました」
        // という成功文は出さず、警告だけを出す（警告文自体が登録の成立も伝える）。
        setExhibitorMailWarning(adminText(locale, 'exhibitorAddedMailFailed'));
      } else {
        setExhibitorMessage(adminText(locale, 'exhibitorAdded'));
      }
      await loadAll();
      const newId = typeof result?.exhibitor?.id === 'string' ? result.exhibitor.id : null;
      if (newId) {
        // 新規行が検索やアコーディオンの外に隠れないよう、検索を解除して
        // 一覧を展開してからハイライトする（スクロール＆ハイライトの担保）。
        setExhibitorSearch('');
        setExhibitorsExpanded(true);
        setHighlight({ kind: 'exhibitor', id: newId });
      }
    } catch (e) {
      setExhibitorMessage(e instanceof Error ? e.message : adminText(locale, 'exhibitorAddFailed'));
    } finally {
      setBusy(false);
      setPendingForm(null);
    }
  };

  // パスワード再発行。再発行すると旧パスワードは即失効し、新パスワードが
  // 登録メールへ送られる。メール未登録の旧出店者は、その場でメールを
  // 入力してもらってから発行する（移行手段）。
  const [reissuingId, setReissuingId] = useState<string | null>(null);
  const handleReissueExhibitor = async (exhibitor: Exhibitor) => {
    if (!window.confirm(adminText(locale, 'exhibitorReissueConfirm'))) return;
    let email = exhibitor.email;
    if (!email) {
      const entered = window.prompt(adminText(locale, 'exhibitorEmailPrompt'));
      if (!entered || !entered.trim()) return;
      email = entered.trim();
    }
    setBusy(true);
    setReissuingId(exhibitor.id);
    setExhibitorMessage('');
    setExhibitorMailWarning('');
    try {
      const result = await callApi(`/api/events/${eventId}/exhibitors/${exhibitor.id}/password`, {
        method: 'POST',
        body: JSON.stringify(email !== exhibitor.email ? { email } : {}),
      });
      if (result?.mailSent === false) {
        // パスワード自体は差し替わっているが、メールが届いていない状態。
        // 送信済みの成功文は出さず、失敗が分かる警告を出す。
        setExhibitorMailWarning(adminText(locale, 'exhibitorReissueMailFailed'));
      } else {
        setExhibitorMessage(adminText(locale, 'exhibitorReissued'));
      }
      await loadAll();
    } catch (e) {
      setExhibitorMessage(
        e instanceof Error ? e.message : adminText(locale, 'exhibitorReissueFailed'),
      );
    } finally {
      setBusy(false);
      setReissuingId(null);
    }
  };

  const handleAddCoupon = async () => {
    setBusy(true);
    setPendingForm('coupon');
    setCouponMessage('');
    try {
      const result = await callApi(`/api/events/${eventId}/coupons`, {
        method: 'POST',
        body: JSON.stringify({
          exhibitorId: couponForm.exhibitorId,
          title: couponForm.title,
          description: couponForm.description || undefined,
          keywords: couponForm.keywords
            .split(/[,、]/)
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });
      setCouponForm({ ...couponForm, title: '', description: '', keywords: '' });
      setCouponMessage(adminText(locale, 'couponAdded'));
      // 別出店者で絞り込み中だと新規行が見えないため、絞り込みを外してから表示する。
      setCouponExhibitorFilter(null);
      await loadAll();
      const newId = typeof result?.coupon?.id === 'string' ? result.coupon.id : null;
      if (newId) setHighlight({ kind: 'coupon', id: newId });
    } catch (e) {
      setCouponMessage(e instanceof Error ? e.message : adminText(locale, 'couponAddFailed'));
    } finally {
      setBusy(false);
      setPendingForm(null);
    }
  };

  // 出店者行のタップで、その出店者のクーポンだけに絞り込む（同じ行をもう一度
  // タップすると解除）。絞り込んだらクーポン一覧の先頭までスクロールする。
  const handleSelectExhibitor = (exhibitor: Exhibitor) => {
    const selecting = couponExhibitorFilter !== exhibitor.id;
    setCouponExhibitorFilter(selecting ? exhibitor.id : null);
    if (selecting) {
      document
        .getElementById('admin-coupons-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 出店者一覧の表示対象。検索中は一致したものをすべて出し、未検索時は
  // 先頭 EXHIBITOR_PREVIEW_COUNT 社だけを既定表示（残りはアコーディオン）。
  const exhibitorQuery = exhibitorSearch.trim().toLowerCase();
  const matchedExhibitors = exhibitorQuery
    ? exhibitors.filter(
        (exhibitor) =>
          exhibitor.name.toLowerCase().includes(exhibitorQuery) ||
          (exhibitor.email ?? '').toLowerCase().includes(exhibitorQuery),
      )
    : exhibitors;
  const visibleExhibitors =
    exhibitorQuery || exhibitorsExpanded
      ? matchedExhibitors
      : matchedExhibitors.slice(0, EXHIBITOR_PREVIEW_COUNT);
  const hiddenExhibitorCount = matchedExhibitors.length - EXHIBITOR_PREVIEW_COUNT;
  // クーポン一覧の絞り込み対象。対象の出店者がもう存在しない場合は絞らない。
  const filterExhibitor = couponExhibitorFilter
    ? (exhibitors.find((exhibitor) => exhibitor.id === couponExhibitorFilter) ?? null)
    : null;
  const visibleCoupons = filterExhibitor
    ? coupons.filter((coupon) => coupon.exhibitorId === filterExhibitor.id)
    : coupons;

  if (!authReady) return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;

  if (!user) {
    return (
      <main style={{ ...containerStyle, maxWidth: 480 }}>
        <AdminBrandBar right={<AdminLanguageSelect locale={locale} onChange={setLocale} />} />
        <section style={{ ...cardStyle, padding: 24, marginTop: 16 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>{adminText(locale, 'adminLoginTitle')}</h1>
          <label style={labelStyle}>
            {adminText(locale, 'emailLabel')}
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={labelStyle}>
            {adminText(locale, 'passwordLabel')}
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button onClick={handleLogin} disabled={busy} style={{ ...primaryButtonStyle, width: '100%' }}>
            <span style={adminButtonContentStyle}>
              {busy && <ButtonSpinner />}
              {adminText(locale, 'loginButton')}
            </span>
          </button>
          {message && <p style={{ color: '#b91c1c', marginTop: 12, fontSize: 14 }}>{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <AdminShell
      locale={locale}
      email={user.email}
      onLogout={() => void signOut(auth)}
      languageSelect={<AdminLanguageSelect locale={locale} onChange={setLocale} />}
      nav={<AdminNav eventId={eventId} current="③" locale={locale} />}
    >
      <h1 style={adminPageTitleStyle}>{adminText(locale, 'couponsPageTitle')}</h1>
      <CapWarningBanner locale={locale} />
      {loadMessage && <p style={adminErrorTextStyle}>{loadMessage}</p>}

      <section style={{ marginTop: 22 }}>
        <h2 style={sectionTitleStyle}>
          {adminText(locale, 'exhibitorsTitle', { count: String(exhibitors.length) })}
        </h2>
        {exhibitors.length > 0 && (
          <>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 5 }}>
              {adminText(locale, 'exhibitorFilterHint')}
            </p>
            <input
              style={{ ...inputStyle, marginTop: 10 }}
              type="search"
              value={exhibitorSearch}
              onChange={(e) => setExhibitorSearch(e.target.value)}
              placeholder={adminText(locale, 'exhibitorSearchPlaceholder')}
              aria-label={adminText(locale, 'exhibitorSearchPlaceholder')}
            />
            <div style={{ ...cardStyle, padding: '4px 20px', marginTop: 12 }}>
              {visibleExhibitors.map((exhibitor, i) => (
                <div
                  key={exhibitor.id}
                  id={`admin-row-exhibitor-${exhibitor.id}`}
                  onClick={() => handleSelectExhibitor(exhibitor)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    padding: '11px 0',
                    cursor: 'pointer',
                    borderBottom: i < visibleExhibitors.length - 1 ? '1px solid #F0EDF8' : 'none',
                    transition: 'background-color 0.5s ease',
                    ...(couponExhibitorFilter === exhibitor.id
                      ? {
                          backgroundColor: '#F5F3FF',
                          borderRadius: 8,
                          padding: '11px 10px',
                          margin: '0 -10px',
                        }
                      : null),
                    ...(highlight?.kind === 'exhibitor' && highlight.id === exhibitor.id
                      ? {
                          backgroundColor: '#F3EFFF',
                          borderRadius: 8,
                          padding: '11px 10px',
                          margin: '0 -10px',
                        }
                      : null),
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 600, display: 'block' }}>{exhibitor.name}</span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 12,
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {exhibitor.email ?? ''}
                    </span>
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <span style={linkBadgeStyle(exhibitor.hasAccessCode)}>
                      {exhibitor.hasAccessCode
                        ? adminText(locale, 'exhibitorHasPassword')
                        : adminText(locale, 'exhibitorNoPassword')}
                    </span>
                    <button
                      onClick={(e) => {
                        // 行タップの絞り込みに伝播させない（従来どおり再発行だけを行う）。
                        e.stopPropagation();
                        void handleReissueExhibitor(exhibitor);
                      }}
                      disabled={busy}
                      style={{
                        padding: '5px 12px',
                        fontSize: 12.5,
                        fontWeight: 600,
                        borderRadius: 999,
                        border: '1px solid #D9D4EC',
                        backgroundColor: '#ffffff',
                        color: VIOLET,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      {reissuingId === exhibitor.id && <ButtonSpinner />}
                      {adminText(locale, 'exhibitorReissueButton')}
                    </button>
                  </span>
                </div>
              ))}
              {matchedExhibitors.length === 0 && (
                <p style={{ fontSize: 13, color: '#64748b', padding: '12px 0', margin: 0 }}>
                  {adminText(locale, 'exhibitorSearchNoMatch')}
                </p>
              )}
              {!exhibitorQuery && matchedExhibitors.length > EXHIBITOR_PREVIEW_COUNT && (
                <button
                  type="button"
                  onClick={() => setExhibitorsExpanded((v) => !v)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '11px 0',
                    background: 'none',
                    border: 'none',
                    borderTop: '1px solid #F0EDF8',
                    color: VIOLET,
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {exhibitorsExpanded
                    ? adminText(locale, 'exhibitorShowLess')
                    : adminText(locale, 'exhibitorShowMore', {
                        count: String(hiddenExhibitorCount),
                      })}
                </button>
              )}
            </div>
          </>
        )}
        <div style={{ ...cardStyle, marginTop: 12, padding: 24 }}>
          <label style={labelStyle}>
            {adminText(locale, 'exhibitorNameLabel')}
            <input style={inputStyle} value={exhibitorName} onChange={(e) => setExhibitorName(e.target.value)} />
          </label>
          <label style={labelStyle}>
            {adminText(locale, 'exhibitorEmailLabel')}
            <input style={inputStyle} type="email" value={exhibitorEmail} onChange={(e) => setExhibitorEmail(e.target.value)} />
          </label>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
            {adminText(locale, 'exhibitorEmailNote')}
          </p>
          <button onClick={handleAddExhibitor} disabled={busy || !exhibitorName.trim() || !exhibitorEmail.trim()} style={primaryButtonStyle}>
            <span style={adminButtonContentStyle}>
              {pendingForm === 'exhibitor' && <ButtonSpinner />}
              {pendingForm === 'exhibitor'
                ? adminText(locale, 'addingLabel')
                : adminText(locale, 'addExhibitorButton')}
            </span>
          </button>
          {exhibitorMessage && <p style={adminFeedbackStyle}>{exhibitorMessage}</p>}
          {exhibitorMailWarning && <p style={adminErrorTextStyle}>{exhibitorMailWarning}</p>}
        </div>
      </section>

      <section id="admin-coupons-section" style={{ marginTop: 30 }}>
        <h2 style={sectionTitleStyle}>
          {adminText(locale, 'couponsCountTitle', { count: String(coupons.length), cap: String(couponCap) })}
        </h2>
        <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 5 }}>
          {adminText(locale, 'capNote')}
        </p>
        <div
          style={{
            ...cardStyle,
            marginTop: 12,
            padding: 24,
            backgroundColor: '#F5F3FF',
            border: '1px solid #DDD6FE',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15, color: '#4C1D95' }}>
            {adminText(locale, 'couponOptionTitle')}
          </div>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
            {adminText(locale, 'couponOptionBody', { cap: String(couponCap) })}
          </p>
          {couponCap >= COUPON_OPTION_MAX_CAP ? (
            <p style={{ fontSize: 13, fontWeight: 600, color: '#b45309', marginTop: 8 }}>
              {adminText(locale, 'couponOptionMaxNote')}
            </p>
          ) : (
            <a
              href={`${HONKE_COUPON_OPTION_URL}?eventId=${eventId}`}
              target="_blank"
              rel="noreferrer"
              style={{
                ...primaryButtonStyle,
                display: 'inline-block',
                textDecoration: 'none',
                marginTop: 10,
              }}
            >
              {adminText(locale, 'couponOptionButton')}
            </a>
          )}
        </div>
        {filterExhibitor && (
          <div
            style={{
              ...cardStyle,
              marginTop: 12,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#F5F3FF',
              border: '1px solid #DDD6FE',
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#4C1D95' }}>
              {adminText(locale, 'couponFilterLabel', {
                name: filterExhibitor.name,
                count: String(visibleCoupons.length),
              })}
            </span>
            <button
              type="button"
              onClick={() => setCouponExhibitorFilter(null)}
              style={{
                padding: '5px 12px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 999,
                border: '1px solid #D9D4EC',
                backgroundColor: '#ffffff',
                color: VIOLET,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {adminText(locale, 'couponFilterClear')}
            </button>
          </div>
        )}
        {filterExhibitor && visibleCoupons.length === 0 && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
            {adminText(locale, 'couponsFilteredEmpty')}
          </p>
        )}
        {visibleCoupons.map((coupon) => (
          <article
            key={coupon.id}
            id={`admin-row-coupon-${coupon.id}`}
            style={{
              ...cardStyle,
              padding: '18px 20px',
              marginTop: 12,
              transition: 'background-color 0.5s ease, border-color 0.5s ease',
              ...(highlight?.kind === 'coupon' && highlight.id === coupon.id
                ? { backgroundColor: '#F3EFFF', borderColor: VIOLET }
                : null),
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{coupon.title}</div>
              {!coupon.active && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 999,
                    backgroundColor: '#E8EAF1',
                    color: '#5B6472',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {adminText(locale, 'badgeInactive')}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              {coupon.exhibitorName}
              {coupon.keywords.length > 0 &&
                adminText(locale, 'keywordsSuffix', { keywords: coupon.keywords.join('、') })}
            </div>
            {coupon.description && <p style={{ fontSize: 13, marginTop: 2 }}>{coupon.description}</p>}
          </article>
        ))}
        <div style={{ ...cardStyle, marginTop: 12, padding: 24 }}>
          <label style={labelStyle}>
            {adminText(locale, 'exhibitorSelectLabel')}
            <select
              style={inputStyle}
              value={couponForm.exhibitorId}
              onChange={(e) => setCouponForm({ ...couponForm, exhibitorId: e.target.value })}
            >
              <option value="">{adminText(locale, 'selectPlaceholder')}</option>
              {exhibitors.map((exhibitor) => (
                <option key={exhibitor.id} value={exhibitor.id}>
                  {exhibitor.name}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            {adminText(locale, 'couponTitleLabel')}
            <input style={inputStyle} value={couponForm.title} onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })} />
          </label>
          <label style={labelStyle}>
            {adminText(locale, 'couponDescLabel')}
            <input style={inputStyle} value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} />
          </label>
          <label style={labelStyle}>
            {adminText(locale, 'couponKeywordsLabel')}
            <input style={inputStyle} value={couponForm.keywords} onChange={(e) => setCouponForm({ ...couponForm, keywords: e.target.value })} placeholder={adminText(locale, 'couponKeywordsPlaceholder')} />
          </label>
          <button
            onClick={handleAddCoupon}
            disabled={busy || !couponForm.exhibitorId || !couponForm.title.trim() || coupons.length >= couponCap}
            style={primaryButtonStyle}
          >
            <span style={adminButtonContentStyle}>
              {pendingForm === 'coupon' && <ButtonSpinner />}
              {pendingForm === 'coupon'
                ? adminText(locale, 'addingLabel')
                : adminText(locale, 'addCouponButton')}
            </span>
          </button>
          {couponMessage && <p style={adminFeedbackStyle}>{couponMessage}</p>}
        </div>
      </section>
    </AdminShell>
  );
}
