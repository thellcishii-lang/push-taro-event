'use client';

// app/event-admin/[eventId]/coupons/page.tsx
// Push-taro EVENT 主催者向けのクーポン管理画面（管理画面③）。
// 出店者（会社）の登録と、クーポンの登録・一覧を行う。クーポンはイベント全体で上限あり。
// 案内PDFの管理もこの画面で行う。
// 画面の固定文は4言語辞書（lib/ui-text.ts の ADMIN_TEXT）。
// 見た目は承認済みモック準拠。ログイン後は共通シェル（components/AdminShell）
// を使い、PC は左サイドバー固定の2カラム、スマホはアコーディオンになる。
// フィードバック文は、出店者／クーポン／PDFそれぞれのフォームの直下に出す
// （以前は画面最下部にしか出ず、実利用で「何も起きない」ように見えた）。
// 登録成功時は追加された行までスクロールして一時的にハイライトし、
// 送信中はボタンの文言も「登録中…」に変えて手応えを出す。
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, storage } from '@/lib/firebase-client';
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
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { useDropzone } from 'react-dropzone';

interface Exhibitor {
  id: string;
  name: string;
  authUid: string | null;
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

interface InfoPdf {
  id: string;
  title: string;
  url: string;
}

const VIOLET = '#6D28D9';

/** クーポンオプションで増やせるイベント単位の上限（LP 記載）。 */
const COUPON_OPTION_MAX_CAP = 500;
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

const dangerButtonStyle: React.CSSProperties = {
  padding: '7px 16px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 12,
  border: '1px solid #fca5a5',
  backgroundColor: '#ffffff',
  color: '#b91c1c',
  cursor: 'pointer',
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
  const [pdfs, setPdfs] = useState<InfoPdf[]>([]);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
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
  const [couponMessage, setCouponMessage] = useState('');
  const [pdfMessage, setPdfMessage] = useState('');
  const [busy, setBusy] = useState(false);
  // 送信中フォーム（ボタンの文言を「登録中…」に切り替えるため）。
  const [pendingForm, setPendingForm] = useState<'exhibitor' | 'coupon' | null>(null);
  // 登録直後にスクロール＋ハイライトする行。
  const [highlight, setHighlight] = useState<{ kind: 'exhibitor' | 'coupon'; id: string } | null>(null);

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
      const [exData, cpData, evData, pdfData] = await Promise.all([
        callApi(`/api/events/${eventId}/exhibitors`),
        callApi(`/api/events/${eventId}/coupons`),
        callApi(`/api/events/${eventId}`),
        callApi(`/api/events/${eventId}/info-pdfs`),
      ]);
      setExhibitors(exData.exhibitors ?? []);
      setCoupons(cpData.coupons ?? []);
      setPdfs(pdfData.pdfs ?? []);
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
    try {
      const result = await callApi(`/api/events/${eventId}/exhibitors`, {
        method: 'POST',
        body: JSON.stringify({ name: exhibitorName, authEmail: exhibitorEmail || undefined }),
      });
      setExhibitorName('');
      setExhibitorEmail('');
      setExhibitorMessage(
        adminText(locale, result?.accountCreated ? 'exhibitorAddedInvited' : 'exhibitorAdded'),
      );
      await loadAll();
      const newId = typeof result?.exhibitor?.id === 'string' ? result.exhibitor.id : null;
      if (newId) setHighlight({ kind: 'exhibitor', id: newId });
    } catch (e) {
      setExhibitorMessage(e instanceof Error ? e.message : adminText(locale, 'exhibitorAddFailed'));
    } finally {
      setBusy(false);
      setPendingForm(null);
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

  const handlePdfDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !user) return;
      setPdfUploading(true);
      setPdfMessage('');
      try {
        const storagePath = `events/${eventId}/info-pdfs/${crypto.randomUUID()}.pdf`;
        const ref = storageRef(storage, storagePath);
        await uploadBytes(ref, file, { contentType: 'application/pdf' });
        const url = await getDownloadURL(ref);
        await callApi(`/api/events/${eventId}/info-pdfs`, {
          method: 'POST',
          body: JSON.stringify({
            title: pdfTitle.trim() || file.name.replace(/\.pdf$/i, ''),
            url,
            storagePath,
          }),
        });
        setPdfTitle('');
        setPdfMessage(adminText(locale, 'pdfAdded'));
        await loadAll();
      } catch (e) {
        setPdfMessage(e instanceof Error ? e.message : adminText(locale, 'pdfAddFailed'));
      } finally {
        setPdfUploading(false);
      }
    },
    [user, eventId, pdfTitle, callApi, loadAll, locale],
  );

  const pdfDropzone = useDropzone({
    onDrop: handlePdfDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: pdfUploading || pdfs.length >= 5,
  });

  const handleDeletePdf = async (pdfId: string) => {
    if (!window.confirm(adminText(locale, 'confirmDeletePdf'))) return;
    setBusy(true);
    setPdfMessage('');
    try {
      await callApi(`/api/events/${eventId}/info-pdfs/${pdfId}`, { method: 'DELETE' });
      setPdfMessage(adminText(locale, 'pdfDeleted'));
      await loadAll();
    } catch (e) {
      setPdfMessage(e instanceof Error ? e.message : adminText(locale, 'pdfDeleteFailed'));
    } finally {
      setBusy(false);
    }
  };

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
          <div style={{ ...cardStyle, padding: '4px 20px', marginTop: 12 }}>
            {exhibitors.map((exhibitor, i) => (
              <div
                key={exhibitor.id}
                id={`admin-row-exhibitor-${exhibitor.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  padding: '11px 0',
                  borderBottom: i < exhibitors.length - 1 ? '1px solid #F0EDF8' : 'none',
                  transition: 'background-color 0.5s ease',
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
                <span style={{ fontWeight: 600 }}>{exhibitor.name}</span>
                <span style={linkBadgeStyle(!!exhibitor.authUid)}>
                  {exhibitor.authUid ? adminText(locale, 'loginLinked') : adminText(locale, 'loginNotLinked')}
                </span>
              </div>
            ))}
          </div>
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
          <button onClick={handleAddExhibitor} disabled={busy || !exhibitorName.trim()} style={primaryButtonStyle}>
            <span style={adminButtonContentStyle}>
              {pendingForm === 'exhibitor' && <ButtonSpinner />}
              {pendingForm === 'exhibitor'
                ? adminText(locale, 'addingLabel')
                : adminText(locale, 'addExhibitorButton')}
            </span>
          </button>
          {exhibitorMessage && <p style={adminFeedbackStyle}>{exhibitorMessage}</p>}
        </div>
      </section>

      <section style={{ marginTop: 30 }}>
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
        {coupons.map((coupon) => (
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

      <section style={{ marginTop: 30 }}>
        <h2 style={sectionTitleStyle}>
          {adminText(locale, 'pdfsTitle', { count: String(pdfs.length) })}
        </h2>
        <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 5 }}>
          {adminText(locale, 'pdfsNote')}
        </p>
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', marginTop: 12 }}
          >
            <a href={pdf.url} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 600, color: VIOLET }}>
              {pdf.title}
            </a>
            <button onClick={() => void handleDeletePdf(pdf.id)} disabled={busy} style={dangerButtonStyle}>
              {adminText(locale, 'deleteButton')}
            </button>
          </div>
        ))}
        {pdfMessage && <p style={adminFeedbackStyle}>{pdfMessage}</p>}
        <div style={{ ...cardStyle, marginTop: 12, padding: 24 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>
            {adminText(locale, 'pdfTitleLabel')}
            <input style={inputStyle} value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} placeholder={adminText(locale, 'pdfTitlePlaceholder')} />
          </label>
          <div
            {...pdfDropzone.getRootProps()}
            style={{
              border: `2px dashed ${pdfDropzone.isDragActive ? '#6D28D9' : '#c4b5fd'}`,
              backgroundColor: pdfDropzone.isDragActive ? '#f5f3ff' : '#ffffff',
              borderRadius: 16,
              padding: 24,
              marginTop: 12,
              textAlign: 'center',
              fontSize: 14,
              color: '#475569',
              cursor: pdfs.length >= 5 ? 'not-allowed' : 'pointer',
              opacity: pdfs.length >= 5 ? 0.5 : 1,
            }}
          >
            <input {...pdfDropzone.getInputProps()} />
            {pdfUploading
              ? adminText(locale, 'pdfUploading')
              : pdfs.length >= 5
                ? adminText(locale, 'pdfCapReached')
                : adminText(locale, 'pdfDropHint')}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
