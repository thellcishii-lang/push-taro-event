'use client';

// app/event-admin/[eventId]/coupons/page.tsx
// Push-taro EVENT 主催者向けのクーポン管理画面（管理画面③）。
// 出店者（会社）の登録と、クーポンの登録・一覧を行う。クーポンはイベント全体で上限あり。
// 案内PDFの管理もこの画面で行う。
// 画面の固定文は4言語辞書（lib/ui-text.ts の ADMIN_TEXT）。
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
import { adminText, uiText } from '@/lib/ui-text';
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
const VIOLET_BRIGHT = '#7C3AED';

/** クーポンオプションで増やせるイベント単位の上限（LP 記載）。 */
const COUPON_OPTION_MAX_CAP = 500;
/** クーポンオプションの購入先（本家の決済ページ）。 */
const HONKE_COUPON_OPTION_URL = 'https://push-taro.com/event-option';

const containerStyle: React.CSSProperties = {
  padding: '20px 16px 40px',
  maxWidth: 880,
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
  padding: '16px 20px',
  color: '#ffffff',
  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.35)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 12,
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  marginTop: 6,
  border: '1px solid #cbd5e1',
  borderRadius: 10,
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
  padding: '10px 20px',
  fontWeight: 700,
  fontSize: 14,
  backgroundColor: VIOLET,
  color: '#ffffff',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
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

const dangerButtonStyle: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 999,
  border: '1px solid #fca5a5',
  backgroundColor: '#ffffff',
  color: '#b91c1c',
  cursor: 'pointer',
};

function linkBadgeStyle(linked: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    whiteSpace: 'nowrap',
    ...(linked
      ? { backgroundColor: '#dcfce7', color: '#15803d' }
      : { backgroundColor: '#e2e8f0', color: '#475569' }),
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
  const [busy, setBusy] = useState(false);

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
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'loadFailed'));
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
    setMessage('');
    try {
      const result = await callApi(`/api/events/${eventId}/exhibitors`, {
        method: 'POST',
        body: JSON.stringify({ name: exhibitorName, authEmail: exhibitorEmail || undefined }),
      });
      setExhibitorName('');
      setExhibitorEmail('');
      setMessage(
        adminText(locale, result?.accountCreated ? 'exhibitorAddedInvited' : 'exhibitorAdded'),
      );
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'exhibitorAddFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleAddCoupon = async () => {
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/events/${eventId}/coupons`, {
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
      setMessage(adminText(locale, 'couponAdded'));
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'couponAddFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handlePdfDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !user) return;
      setPdfUploading(true);
      setMessage('');
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
        setMessage(adminText(locale, 'pdfAdded'));
        await loadAll();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : adminText(locale, 'pdfAddFailed'));
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
    setMessage('');
    try {
      await callApi(`/api/events/${eventId}/info-pdfs/${pdfId}`, { method: 'DELETE' });
      setMessage(adminText(locale, 'pdfDeleted'));
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'pdfDeleteFailed'));
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;

  if (!user) {
    return (
      <main style={{ ...containerStyle, maxWidth: 480 }}>
        <header style={headerStyle}>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{adminText(locale, 'adminLoginTitle')}</h1>
          <AdminLanguageSelect locale={locale} onChange={setLocale} />
        </header>
        <section style={{ ...cardStyle, padding: 20, marginTop: 16 }}>
          <label style={labelStyle}>
            {adminText(locale, 'emailLabel')}
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={labelStyle}>
            {adminText(locale, 'passwordLabel')}
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button onClick={handleLogin} disabled={busy} style={{ ...primaryButtonStyle, width: '100%' }}>
            {adminText(locale, 'loginButton')}
          </button>
          {message && <p style={{ color: '#b91c1c', marginTop: 12, fontSize: 14 }}>{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{adminText(locale, 'couponsPageTitle')}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <AdminLanguageSelect locale={locale} onChange={setLocale} />
          <button onClick={() => void signOut(auth)} style={logoutButtonStyle}>
            {adminText(locale, 'logoutButton')}
          </button>
        </div>
      </header>
      <AdminNav eventId={eventId} current="③" locale={locale} />

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
          {adminText(locale, 'exhibitorsTitle', { count: String(exhibitors.length) })}
        </h2>
        {exhibitors.length > 0 && (
          <div style={{ ...cardStyle, padding: '4px 16px', marginTop: 10 }}>
            {exhibitors.map((exhibitor, i) => (
              <div
                key={exhibitor.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  padding: '10px 0',
                  borderBottom: i < exhibitors.length - 1 ? '1px solid #f1f5f9' : 'none',
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
        <div style={{ ...cardStyle, marginTop: 12, padding: 20 }}>
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
            {adminText(locale, 'addExhibitorButton')}
          </button>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
          {adminText(locale, 'couponsCountTitle', { count: String(coupons.length), cap: String(couponCap) })}
        </h2>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
          {adminText(locale, 'capNote')}
        </p>
        <div style={{ ...cardStyle, marginTop: 12, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>
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
                marginTop: 8,
              }}
            >
              {adminText(locale, 'couponOptionButton')}
            </a>
          )}
        </div>
        {coupons.map((coupon) => (
          <article key={coupon.id} style={{ ...cardStyle, padding: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{coupon.title}</div>
              {!coupon.active && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 999,
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
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
        <div style={{ ...cardStyle, marginTop: 12, padding: 20 }}>
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
            {adminText(locale, 'addCouponButton')}
          </button>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
          {adminText(locale, 'pdfsTitle', { count: String(pdfs.length) })}
        </h2>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
          {adminText(locale, 'pdfsNote')}
        </p>
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', marginTop: 10 }}
          >
            <a href={pdf.url} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 600, color: VIOLET }}>
              {pdf.title}
            </a>
            <button onClick={() => void handleDeletePdf(pdf.id)} disabled={busy} style={dangerButtonStyle}>
              {adminText(locale, 'deleteButton')}
            </button>
          </div>
        ))}
        <div style={{ ...cardStyle, marginTop: 12, padding: 20 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>
            {adminText(locale, 'pdfTitleLabel')}
            <input style={inputStyle} value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} placeholder={adminText(locale, 'pdfTitlePlaceholder')} />
          </label>
          <div
            {...pdfDropzone.getRootProps()}
            style={{
              border: `2px dashed ${pdfDropzone.isDragActive ? '#6D28D9' : '#c4b5fd'}`,
              backgroundColor: pdfDropzone.isDragActive ? '#f5f3ff' : '#ffffff',
              borderRadius: 12,
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

      {message && <p style={{ marginTop: 14, fontSize: 14 }}>{message}</p>}
    </main>
  );
}
