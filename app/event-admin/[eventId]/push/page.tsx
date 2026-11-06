'use client';

// app/event-admin/[eventId]/push/page.tsx
// Push-taro EVENT 管理画面①：即時プッシュ＋消込。
// 即時プッシュは campaigns API でその場で送信され、送信数（課金根拠）が履歴に残る。
// 消込は主催者として全クーポン対象（出店者画面と違い自社制限なし）。
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { AdminNav } from '../AdminNav';

interface Campaign {
  id: string;
  title: string;
  body: string;
  kind: 'instant' | 'scheduled';
  status: string;
  sentAt: string | null;
  sentCount: number | null;
  error: string | null;
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

export default function EventPushAdminPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [claimCode, setClaimCode] = useState('');
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

  const loadCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const data = await callApi(`/api/events/${eventId}/campaigns`);
      setCampaigns(data.campaigns ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '読み込みに失敗しました');
    }
  }, [user, eventId, callApi]);

  useEffect(() => {
    if (user) void loadCampaigns();
  }, [user, loadCampaigns]);

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

  const handleSend = async () => {
    if (!window.confirm('この内容で即時配信します。よろしいですか？')) return;
    setBusy(true);
    setMessage('');
    try {
      const data = await callApi(`/api/events/${eventId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify({ title, body }),
      });
      setMessage(`配信しました（送信数: ${data.campaign?.sentCount ?? 0}）`);
      setTitle('');
      setBody('');
      await loadCampaigns();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '配信に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleRedeem = async () => {
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/events/${eventId}/redeem`, {
        method: 'POST',
        body: JSON.stringify({ claimId: claimCode.trim() }),
      });
      setMessage('消込が完了しました');
      setClaimCode('');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '消込に失敗しました');
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

  const sentCampaigns = campaigns.filter((c) => c.status === 'sent' || c.status === 'failed');

  return (
    <main style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>プッシュ通知＋消込</h1>
        <button onClick={() => void signOut(auth)}>ログアウト</button>
      </div>
      <AdminNav eventId={eventId} current="①" />

      <section style={{ marginTop: 20, border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>即時プッシュ</h2>
        <label style={labelStyle}>
          タイトル
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label style={labelStyle}>
          本文
          <textarea style={{ ...inputStyle, minHeight: 72 }} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button onClick={handleSend} disabled={busy || !title.trim() || !body.trim()} style={{ padding: '10px 20px', fontWeight: 700 }}>
          今すぐ配信する
        </button>
      </section>

      <section style={{ marginTop: 20, border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>クーポン消込（主催者）</h2>
        <label style={labelStyle}>
          取得コード
          <input style={inputStyle} value={claimCode} onChange={(e) => setClaimCode(e.target.value)} placeholder="来場者の取得コード" />
        </label>
        <button onClick={handleRedeem} disabled={busy || !claimCode.trim()} style={{ padding: '10px 20px', fontWeight: 700 }}>
          消し込む
        </button>
      </section>

      {message && <p style={{ marginTop: 14, fontSize: 14 }}>{message}</p>}

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>配信履歴（送信数＝課金の根拠）</h2>
        {sentCampaigns.length === 0 && (
          <p style={{ fontSize: 13, color: '#64748b' }}>まだ配信履歴がありません。</p>
        )}
        {sentCampaigns.map((campaign) => (
          <article key={campaign.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{campaign.title}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {campaign.status === 'sent'
                ? `送信済み ${campaign.sentAt ?? ''}／送信数 ${campaign.sentCount ?? 0}`
                : `失敗: ${campaign.error ?? ''}`}
            </div>
            <p style={{ fontSize: 13, marginTop: 2 }}>{campaign.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
