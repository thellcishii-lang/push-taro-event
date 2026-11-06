'use client';

// app/event-admin/[eventId]/schedule/page.tsx
// Push-taro EVENT 管理画面②：予約配信。
// 15分刻み（00/15/30/45分）で複数の予約を入れられる。実行は event-tick が担う。
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
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number | null;
  error: string | null;
}

const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h += 1) {
  for (const m of [0, 15, 30, 45]) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
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

export default function EventScheduleAdminPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({ title: '', body: '', date: '', time: '10:00' });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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

  const handleSchedule = async () => {
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/events/${eventId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          scheduledAt: `${form.date}T${form.time}`,
        }),
      });
      setMessage(`予約しました: ${form.date} ${form.time}`);
      setForm({ ...form, title: '', body: '' });
      await loadCampaigns();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '予約に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (campaignId: string) => {
    if (!window.confirm('この予約を取り消しますか？')) return;
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/events/${eventId}/campaigns/${campaignId}/cancel`, { method: 'POST' });
      setMessage('予約を取り消しました');
      await loadCampaigns();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '取り消しに失敗しました');
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

  const scheduled = campaigns
    .filter((c) => c.kind === 'scheduled' && c.status === 'scheduled')
    .sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''));
  const finished = campaigns.filter((c) => c.kind === 'scheduled' && c.status !== 'scheduled');

  return (
    <main style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>予約配信</h1>
        <button onClick={() => void signOut(auth)}>ログアウト</button>
      </div>
      <AdminNav eventId={eventId} current="②" />

      <section style={{ marginTop: 20, border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>新しい予約</h2>
        <label style={labelStyle}>
          タイトル
          <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label style={labelStyle}>
          本文
          <textarea style={{ ...inputStyle, minHeight: 72 }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </label>
        <label style={labelStyle}>
          配信日
          <input style={inputStyle} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label style={labelStyle}>
          時刻（15分刻み）
          <select style={inputStyle} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={handleSchedule}
          disabled={busy || !form.title.trim() || !form.body.trim() || !form.date}
          style={{ padding: '10px 20px', fontWeight: 700 }}
        >
          予約する
        </button>
      </section>

      {message && <p style={{ marginTop: 14, fontSize: 14 }}>{message}</p>}

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>予約中（{scheduled.length}件）</h2>
        {scheduled.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>予約はありません。</p>}
        {scheduled.map((campaign) => (
          <article key={campaign.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {campaign.scheduledAt?.replace('T', ' ')} ― {campaign.title}
            </div>
            <p style={{ fontSize: 13, marginTop: 2 }}>{campaign.body}</p>
            <button onClick={() => void handleCancel(campaign.id)} disabled={busy} style={{ marginTop: 6 }}>
              取り消す
            </button>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>予約配信の履歴</h2>
        {finished.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>履歴はありません。</p>}
        {finished.map((campaign) => (
          <article key={campaign.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{campaign.title}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              予約 {campaign.scheduledAt?.replace('T', ' ')}／
              {campaign.status === 'sent' && `送信済み 送信数 ${campaign.sentCount ?? 0}`}
              {campaign.status === 'cancelled' && '取り消し済み'}
              {campaign.status === 'failed' && `失敗: ${campaign.error ?? ''}`}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
