'use client';

// app/system-admin/organizers/[contractId]/page.tsx
// 運営コンソール：契約者詳細。契約情報・契約枠・状態の管理と、
// 配下イベントの確認（上限は運営用APIで変更）を行う。支払い情報は本家に一元化するので扱わない。
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import type { Organizer } from '@/lib/organizers';
import type { EventConfig } from '@/lib/event';

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

export default function SystemAdminOrganizerDetailPage() {
  const params = useParams<{ contractId: string }>();
  const contractId = params.contractId;
  const [user, setUser] = useState<User | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [subscriberCap, setSubscriberCap] = useState('');
  const [couponCap, setCouponCap] = useState('');
  const [eventCaps, setEventCaps] = useState<Record<string, { subscriberCap: string; couponCap: string }>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
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

  const load = useCallback(async () => {
    if (!user || !contractId) return;
    try {
      const data = await callApi(`/api/admin/organizers/${encodeURIComponent(contractId)}`);
      setOrganizer(data.organizer);
      setEvents(data.events ?? []);
      setSubscriberCap(String(data.organizer.subscriberCap));
      setCouponCap(String(data.organizer.couponCap));
      const caps: Record<string, { subscriberCap: string; couponCap: string }> = {};
      for (const ev of (data.events ?? []) as EventConfig[]) {
        caps[ev.id] = { subscriberCap: String(ev.subscriberCap), couponCap: String(ev.couponCap) };
      }
      setEventCaps(caps);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '読み込みに失敗しました');
    }
  }, [user, contractId, callApi]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const handleSaveCaps = async () => {
    setBusy(true);
    setMessage('');
    try {
      const data = await callApi(`/api/admin/organizers/${encodeURIComponent(contractId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          subscriberCap: Number(subscriberCap),
          couponCap: Number(couponCap),
        }),
      });
      setOrganizer(data.organizer);
      setMessage('契約枠を更新しました');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '更新に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!organizer) return;
    const next = organizer.status === 'active' ? 'suspended' : 'active';
    if (next === 'suspended' && !window.confirm('この契約者を停止しますか？')) return;
    setBusy(true);
    setMessage('');
    try {
      const data = await callApi(`/api/admin/organizers/${encodeURIComponent(contractId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      setOrganizer(data.organizer);
      setMessage(next === 'active' ? '再開しました' : '停止しました');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '変更に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEventCaps = async (eventId: string) => {
    const caps = eventCaps[eventId];
    if (!caps) return;
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          subscriberCap: Number(caps.subscriberCap),
          couponCap: Number(caps.couponCap),
        }),
      });
      setMessage('イベントの上限を更新しました');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '更新に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!organizer) return;
    if (!window.confirm(`${organizer.email} にパスワード再設定メールを送りますか？`)) return;
    setBusy(true);
    setMessage('');
    try {
      // 再設定メールは日本語で送る（Firebase のメール文面の言語指定）
      auth.languageCode = 'ja';
      await sendPasswordResetEmail(auth, organizer.email);
      setMessage('パスワード再設定メールを送信しました');
    } catch {
      setMessage('再設定メールの送信に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <main style={{ padding: 24 }}>
        <p>ログインが必要です。<a href="/system-admin">運営コンソールへ</a></p>
      </main>
    );
  }
  if (!organizer) {
    return (
      <main style={{ padding: 24 }}>
        {message ? <p style={{ color: '#b91c1c' }}>{message}</p> : <p>読み込み中…</p>}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: 24 }}>
      <a href="/system-admin" style={{ fontSize: 13 }}>← 契約者一覧へ</a>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>{organizer.companyName || '（会社名なし）'}</h1>
      {message && <p style={{ color: '#0f766e' }}>{message}</p>}

      <section style={{ marginTop: 16, fontSize: 14, lineHeight: 1.9 }}>
        <div>メールアドレス（ログインID）：{organizer.email}</div>
        <div>住所：{organizer.address || '—'}</div>
        <div>電話：{organizer.phone || '—'}</div>
        <div>使用開始日：{organizer.startDate}</div>
        <div>状態：{organizer.status === 'active' ? '有効' : '停止中'}</div>
        <div>代理店コード：{organizer.agencyCode || '—'}</div>
        <div>契約ID：<code>{organizer.contractId}</code></div>
      </section>

      <section style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>契約枠（新規イベントの既定値）</h2>
        <label style={labelStyle}>
          購読者上限
          <input style={inputStyle} type="number" min={1} value={subscriberCap} onChange={(e) => setSubscriberCap(e.target.value)} />
        </label>
        <label style={labelStyle}>
          クーポン上限
          <input style={inputStyle} type="number" min={1} value={couponCap} onChange={(e) => setCouponCap(e.target.value)} />
        </label>
        <button onClick={handleSaveCaps} disabled={busy} style={{ padding: '10px 16px', fontWeight: 700 }}>
          契約枠を保存
        </button>{' '}
        <button onClick={handleToggleStatus} disabled={busy} style={{ padding: '10px 16px' }}>
          {organizer.status === 'active' ? '契約者を停止する' : '契約者を再開する'}
        </button>{' '}
        <button onClick={handleSendPasswordReset} disabled={busy} style={{ padding: '10px 16px' }}>
          パスワード再設定メールを送る
        </button>
      </section>

      <section style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>この契約者のイベント</h2>
        {events.length === 0 ? (
          <p style={{ fontSize: 14, color: '#64748b' }}>イベントはまだありません。</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {events.map((ev) => (
              <li key={ev.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{ev.name}</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  {ev.startDate} 〜 {ev.endDate} ／ 状態 {ev.status}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    購読者上限
                    <input
                      style={{ ...inputStyle, width: 140 }}
                      type="number"
                      min={1}
                      value={eventCaps[ev.id]?.subscriberCap ?? ''}
                      onChange={(e) =>
                        setEventCaps((prev) => ({
                          ...prev,
                          [ev.id]: { ...(prev[ev.id] ?? { couponCap: '' }), subscriberCap: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    クーポン上限
                    <input
                      style={{ ...inputStyle, width: 120 }}
                      type="number"
                      min={1}
                      value={eventCaps[ev.id]?.couponCap ?? ''}
                      onChange={(e) =>
                        setEventCaps((prev) => ({
                          ...prev,
                          [ev.id]: { ...(prev[ev.id] ?? { subscriberCap: '' }), couponCap: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <button onClick={() => void handleSaveEventCaps(ev.id)} disabled={busy} style={{ padding: '8px 14px' }}>
                    上限を保存
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
