'use client';

// app/event-admin/page.tsx
// Push-taro EVENT の主催者向けイベント設定画面。
// イベントの一覧・作成・編集（開催期間／リセット方式／リセット時刻／上限／バックアップ保持日数／状態）。
// 将来の管理画面3分割（プッシュ＋消込／予約／クーポン管理）の土台として、
// まずはイベント設定に絞った単独画面にしている。
import { useCallback, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { EventConfig, EventResetMode } from '@/lib/event';

interface EventForm {
  name: string;
  startDate: string;
  endDate: string;
  resetMode: EventResetMode;
  resetTime: string;
  subscriberCap: string;
  backupRetentionDays: string;
  status: 'draft' | 'live';
}

const emptyForm: EventForm = {
  name: '',
  startDate: '',
  endDate: '',
  resetMode: 'full-daily',
  resetTime: '00:00',
  subscriberCap: '50000',
  backupRetentionDays: '30',
  status: 'draft',
};

function toForm(event: EventConfig): EventForm {
  return {
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate,
    resetMode: event.resetMode,
    resetTime: event.resetTime,
    subscriberCap: String(event.subscriberCap),
    backupRetentionDays: String(event.backupRetentionDays),
    status: event.status === 'live' ? 'live' : 'draft',
  };
}

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

export default function EventAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
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

  const loadEvents = useCallback(async () => {
    if (!user) return;
    try {
      const data = await callApi('/api/events');
      setEvents(data.events ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '読み込みに失敗しました');
    }
  }, [user, callApi]);

  useEffect(() => {
    if (user) void loadEvents();
  }, [user, loadEvents]);

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

  const handleSave = async () => {
    setBusy(true);
    setMessage('');
    const payload = {
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      resetMode: form.resetMode,
      resetTime: form.resetTime,
      // 購読者上限は契約枠（料金の軸）なので主催者からは送信しない。運営側のみ変更可。
      backupRetentionDays: Number(form.backupRetentionDays),
      ...(selectedId ? { status: form.status } : {}),
    };
    try {
      if (selectedId) {
        await callApi(`/api/events/${selectedId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setMessage('保存しました');
      } else {
        const data = await callApi('/api/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSelectedId(data.event.id);
        setMessage('イベントを作成しました');
      }
      await loadEvents();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '保存に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) return <main style={{ padding: 24 }}>読み込み中…</main>;

  if (!user) {
    return (
      <main style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
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
        {message && <p style={{ color: '#b91c1c', marginTop: 12 }}>{message}</p>}
      </main>
    );
  }

  const selected = events.find((e) => e.id === selectedId) ?? null;

  return (
    <main style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Push-taro EVENT イベント設定</h1>
        <button onClick={() => void signOut(auth)}>ログアウト</button>
      </div>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>イベント一覧</h2>
        {events.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>まだイベントがありません。</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.map((event) => (
            <li key={event.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <button
                onClick={() => {
                  setSelectedId(event.id);
                  setForm(toForm(event));
                  setMessage('');
                }}
                style={{ fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}
              >
                {event.name}
              </button>
              <div style={{ fontSize: 13, color: '#475569' }}>
                {event.startDate} 〜 {event.endDate}／状態: {event.status}／リセット: {event.resetMode === 'full-daily' ? '毎日フルリセット' : '期間中は電話番号を保持'} {event.resetTime}
              </div>
              <div style={{ marginTop: 6 }}>
                <a href={`/event-admin/${event.id}/coupons`} style={{ fontSize: 13 }}>
                  クーポン管理 →
                </a>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            setSelectedId(null);
            setForm(emptyForm);
            setMessage('');
          }}
        >
          ＋ 新規イベント
        </button>
      </section>

      <section style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>{selected ? `編集：${selected.name}` : '新規イベント作成'}</h2>
        <label style={labelStyle}>
          イベント名
          <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label style={labelStyle}>
          開始日
          <input style={inputStyle} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </label>
        <label style={labelStyle}>
          終了日
          <input style={inputStyle} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </label>
        <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12 }}>
          <legend style={{ fontSize: 13, fontWeight: 600 }}>日次リセット方式</legend>
          <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
            <input
              type="radio"
              name="resetMode"
              checked={form.resetMode === 'full-daily'}
              onChange={() => setForm({ ...form, resetMode: 'full-daily' })}
            />{' '}
            毎日フルリセット（購読も電話番号も毎日消去）
          </label>
          <label style={{ display: 'block', fontSize: 14 }}>
            <input
              type="radio"
              name="resetMode"
              checked={form.resetMode === 'keep-phones'}
              onChange={() => setForm({ ...form, resetMode: 'keep-phones' })}
            />{' '}
            期間中は保持（毎日リセットは購読のみ。電話番号と取得・消込記録は終了時に消去）
          </label>
        </fieldset>
        <label style={labelStyle}>
          リセット時刻（JST）
          <input style={inputStyle} type="time" value={form.resetTime} onChange={(e) => setForm({ ...form, resetTime: e.target.value })} />
        </label>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>購読者上限（契約枠）</span>
          <div style={{ fontSize: 14, marginTop: 4 }}>
            {selected ? Number(form.subscriberCap).toLocaleString('ja-JP') : '50,000（既定）'}人
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              ※料金プランに連動するため、変更は運営側で行います
            </span>
          </div>
        </div>
        <label style={labelStyle}>
          レポートのバックアップ保持日数（運営用）
          <input style={inputStyle} type="number" min={1} value={form.backupRetentionDays} onChange={(e) => setForm({ ...form, backupRetentionDays: e.target.value })} />
        </label>
        {selected && (
          <label style={labelStyle}>
            状態
            <select
              style={inputStyle}
              value={form.status}
              disabled={selected.status === 'ended'}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'live' })}
            >
              <option value="draft">下書き</option>
              <option value="live">開催中（リセット・終了処理の対象）</option>
            </select>
          </label>
        )}
        <button onClick={handleSave} disabled={busy} style={{ padding: '10px 20px', fontWeight: 700 }}>
          {selected ? '保存する' : '作成する'}
        </button>
        {message && <p style={{ marginTop: 12, fontSize: 14 }}>{message}</p>}
      </section>
    </main>
  );
}
