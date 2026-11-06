'use client';

// app/event-admin/[eventId]/coupons/page.tsx
// Push-taro EVENT 主催者向けのクーポン管理画面（管理画面③の先行実装）。
// 出店者（会社）の登録と、クーポンの登録・一覧を行う。クーポンはイベント全体で最大100件。
// 案内PDFの管理も本来はこの画面に入る（別PRで追加）。
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, storage } from '@/lib/firebase-client';
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

const containerStyle: React.CSSProperties = {
  padding: 24,
  maxWidth: 880,
  margin: '0 auto',
  fontFamily: 'sans-serif',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  marginTop: 4,
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 12,
};

export default function EventCouponAdminPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
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
      if (!user) throw new Error('ログインが必要です');
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
      if (!res.ok) throw new Error(data.error ?? `エラー (${res.status})`);
      return data;
    },
    [user],
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
      setMessage(e instanceof Error ? e.message : '読み込みに失敗しました');
    }
  }, [user, eventId, callApi]);

  useEffect(() => {
    if (user) void loadAll();
  }, [user, loadAll]);

  const handleLogin = async () => {
    setBusy(true);
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setMessage('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setBusy(false);
    }
  };

  const handleAddExhibitor = async () => {
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/events/${eventId}/exhibitors`, {
        method: 'POST',
        body: JSON.stringify({ name: exhibitorName, authEmail: exhibitorEmail || undefined }),
      });
      setExhibitorName('');
      setExhibitorEmail('');
      setMessage('出店者を登録しました');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '出店者の登録に失敗しました');
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
      setMessage('クーポンを登録しました');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'クーポンの登録に失敗しました');
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
        setMessage('案内PDFを登録しました');
        await loadAll();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'PDFの登録に失敗しました');
      } finally {
        setPdfUploading(false);
      }
    },
    [user, eventId, pdfTitle, callApi, loadAll],
  );

  const pdfDropzone = useDropzone({
    onDrop: handlePdfDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: pdfUploading || pdfs.length >= 5,
  });

  const handleDeletePdf = async (pdfId: string) => {
    if (!window.confirm('このPDFを削除しますか？')) return;
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/events/${eventId}/info-pdfs/${pdfId}`, { method: 'DELETE' });
      setMessage('PDFを削除しました');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'PDFの削除に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) return <main style={containerStyle}>読み込み中…</main>;

  if (!user) {
    return (
      <main style={{ ...containerStyle, maxWidth: 420 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Push-taro EVENT 管理ログイン</h1>
        <label style={labelStyle}>
          メールアドレス
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={labelStyle}>
          パスワード
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button onClick={handleLogin} disabled={busy} style={{ padding: '10px 20px', fontWeight: 700 }}>
          ログイン
        </button>
        {message && <p style={{ color: '#b91c1c', marginTop: 12, fontSize: 14 }}>{message}</p>}
      </main>
    );
  }

  return (
    <main style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>クーポン管理</h1>
        <button onClick={() => void signOut(auth)}>ログアウト</button>
      </div>
      <AdminNav eventId={eventId} current="③" />

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>出店者（{exhibitors.length}社）</h2>
        {exhibitors.map((exhibitor) => (
          <div key={exhibitor.id} style={{ fontSize: 14, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            {exhibitor.name}
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              {exhibitor.authUid ? 'ログイン連携済み' : 'ログイン未連携'}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
          <label style={labelStyle}>
            出店者名（会社名）
            <input style={inputStyle} value={exhibitorName} onChange={(e) => setExhibitorName(e.target.value)} />
          </label>
          <label style={labelStyle}>
            消込ログイン用メールアドレス（任意）
            <input style={inputStyle} type="email" value={exhibitorEmail} onChange={(e) => setExhibitorEmail(e.target.value)} />
          </label>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
            出店者のログイン用アカウント（メール+パスワード）を先に作成しておくと、そのメールアドレスで連携できます。
          </p>
          <button onClick={handleAddExhibitor} disabled={busy || !exhibitorName.trim()} style={{ padding: '8px 16px', fontWeight: 700 }}>
            出店者を登録
          </button>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>クーポン（{coupons.length} / {couponCap}件）</h2>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
          上限は契約枠のため、変更は運営側で行います。
        </p>
        {coupons.map((coupon) => (
          <article key={coupon.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{coupon.title}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {coupon.exhibitorName}
              {coupon.keywords.length > 0 && `／キーワード: ${coupon.keywords.join('、')}`}
              {!coupon.active && '／現在無効'}
            </div>
            {coupon.description && <p style={{ fontSize: 13, marginTop: 2 }}>{coupon.description}</p>}
          </article>
        ))}
        <div style={{ marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
          <label style={labelStyle}>
            出店者
            <select
              style={inputStyle}
              value={couponForm.exhibitorId}
              onChange={(e) => setCouponForm({ ...couponForm, exhibitorId: e.target.value })}
            >
              <option value="">選択してください</option>
              {exhibitors.map((exhibitor) => (
                <option key={exhibitor.id} value={exhibitor.id}>
                  {exhibitor.name}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            タイトル
            <input style={inputStyle} value={couponForm.title} onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })} />
          </label>
          <label style={labelStyle}>
            説明（任意）
            <input style={inputStyle} value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} />
          </label>
          <label style={labelStyle}>
            検索キーワード（カンマ区切り、任意）
            <input style={inputStyle} value={couponForm.keywords} onChange={(e) => setCouponForm({ ...couponForm, keywords: e.target.value })} placeholder="例: 飲み物, 無料" />
          </label>
          <button
            onClick={handleAddCoupon}
            disabled={busy || !couponForm.exhibitorId || !couponForm.title.trim() || coupons.length >= couponCap}
            style={{ padding: '8px 16px', fontWeight: 700 }}
          >
            クーポンを登録
          </button>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>案内PDF（{pdfs.length} / 5件）</h2>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
          来場者画面にカードとして表示されます（例: 会場案内、タイムスケジュール）。
        </p>
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8 }}
          >
            <a href={pdf.url} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 600 }}>
              {pdf.title}
            </a>
            <button onClick={() => void handleDeletePdf(pdf.id)} disabled={busy}>
              削除
            </button>
          </div>
        ))}
        <label style={{ ...labelStyle, marginTop: 12 }}>
          表示タイトル（任意。空ならファイル名）
          <input style={inputStyle} value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} placeholder="例: 会場案内" />
        </label>
        <div
          {...pdfDropzone.getRootProps()}
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            fontSize: 14,
            color: '#475569',
            cursor: pdfs.length >= 5 ? 'not-allowed' : 'pointer',
            opacity: pdfs.length >= 5 ? 0.5 : 1,
          }}
        >
          <input {...pdfDropzone.getInputProps()} />
          {pdfUploading
            ? 'アップロード中…'
            : pdfs.length >= 5
              ? '上限（5件）に達しています'
              : 'PDFをドラッグ＆ドロップ、またはクリックして選択'}
        </div>
      </section>

      {message && <p style={{ marginTop: 14, fontSize: 14 }}>{message}</p>}
    </main>
  );
}
