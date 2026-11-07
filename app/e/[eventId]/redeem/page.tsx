'use client';

// app/e/[eventId]/redeem/page.tsx
// Push-taro EVENT の出店者用 消込専用画面。
// メール+パスワードでログインし、自社のクーポンだけを消し込む。
// 他社のクーポンかどうかはサーバー側（消込API）が判定するので、
// ここで他社のQRを読んでも 403 で弾かれる。
// カメラ読み取りの作法は本家の店舗画面（app/shop）に合わせている。
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
import PasswordInput from '@/components/PasswordInput';

interface Exhibitor {
  id: string;
  name: string;
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

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const me = await callApi(`/api/events/${eventId}/exhibitor-me`);
        setExhibitor(me.exhibitor);
        setExhibitorError('');
        const data = await callApi(`/api/events/${eventId}/exhibitor-coupons`);
        setCoupons(data.coupons ?? []);
      } catch (e) {
        setExhibitor(null);
        setExhibitorError(
          e instanceof Error ? e.message : '出店者情報の取得に失敗しました',
        );
      }
    })();
  }, [user, eventId, callApi]);

  const handleLogin = async () => {
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setResult({ ok: false, text: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。' });
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
        setResult({ ok: true, text: '消込が完了しました。' });
        setManualClaimId('');
      } catch (e) {
        setResult({
          ok: false,
          text: e instanceof Error ? e.message : '消込に失敗しました。',
        });
      } finally {
        setBusy(false);
      }
    },
    [callApi, eventId],
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
        setResult({ ok: false, text: 'カメラの使用が許可されていません。ブラウザの設定からカメラ利用を許可してください。' });
      } else if (err?.name === 'NotFoundError') {
        setResult({ ok: false, text: 'カメラが見つかりません。カメラ付きの端末でお試しください。' });
      } else {
        setResult({ ok: false, text: 'カメラの起動に失敗しました。コードを手入力してください。' });
      }
    }
  };

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

  if (!authReady) return <main style={containerStyle}>読み込み中…</main>;

  if (!user) {
    return (
      <main style={containerStyle}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>出店者 消込ログイン</h1>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
          メールアドレス
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 12 }}>
          パスワード
          <PasswordInput style={inputStyle} value={password} onChange={setPassword} autoComplete="current-password" />
        </label>
        <button onClick={handleLogin} disabled={busy} style={{ width: '100%', padding: '12px 20px', fontWeight: 700, marginTop: 16 }}>
          ログイン
        </button>
        {result && <p style={{ marginTop: 12, fontSize: 14, color: '#b91c1c' }}>{result.text}</p>}
      </main>
    );
  }

  return (
    <main style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>クーポン消込</h1>
        <button onClick={() => void signOut(auth)}>ログアウト</button>
      </div>

      {exhibitorError && (
        <p style={{ marginTop: 16, fontSize: 14, color: '#b91c1c' }}>
          {exhibitorError}。主催者にアカウントの登録状況を確認してください。
        </p>
      )}

      {exhibitor && (
        <>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            出店者: <strong>{exhibitor.name}</strong>（自社のクーポンのみ消込できます）
          </p>

          <div id="qr-reader" style={{ width: '100%', marginTop: 16 }} />
          {!scanning ? (
            <button onClick={startCamera} disabled={busy} style={{ width: '100%', padding: '12px 20px', fontWeight: 700, marginTop: 8 }}>
              カメラでQRコードを読み取る
            </button>
          ) : (
            <button onClick={() => void stopCamera()} style={{ width: '100%', padding: '12px 20px', fontWeight: 700, marginTop: 8 }}>
              カメラを止める
            </button>
          )}

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 20 }}>
            コードを手入力する場合
            <input
              style={inputStyle}
              type="text"
              value={manualClaimId}
              onChange={(e) => setManualClaimId(e.target.value)}
              placeholder="取得コード"
            />
          </label>
          <button
            onClick={() => void doRedeem(manualClaimId)}
            disabled={busy || !manualClaimId.trim()}
            style={{ width: '100%', padding: '12px 20px', fontWeight: 700, marginTop: 10 }}
          >
            消し込む
          </button>

          {result && (
            <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: result.ok ? '#15803d' : '#b91c1c' }}>
              {result.text}
            </p>
          )}

          <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 28 }}>自社のクーポン</h2>
          {coupons.length === 0 && (
            <p style={{ fontSize: 13, color: '#64748b' }}>登録されているクーポンがありません。</p>
          )}
          {coupons.map((coupon) => (
            <article key={coupon.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{coupon.title}</div>
              {coupon.description && <p style={{ fontSize: 13, marginTop: 2 }}>{coupon.description}</p>}
              {!coupon.active && <p style={{ fontSize: 12, color: '#b91c1c' }}>現在無効</p>}
            </article>
          ))}
        </>
      )}
    </main>
  );
}
