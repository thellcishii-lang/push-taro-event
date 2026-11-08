'use client';

// app/event-admin/page.tsx
// Push-taro EVENT の主催者向けイベント設定画面。
// イベントの一覧・作成・編集（開催期間／リセット方式／リセット時刻／上限／バックアップ保持日数／状態）。
// 将来の管理画面3分割（プッシュ＋消込／予約／クーポン管理）の土台として、
// まずはイベント設定に絞った単独画面にしている。
// 同時に仕込めるイベントは3つまで（下書き＋開催中。終了は数えない）で、
// 上限の判定は lib/event.ts の canCreateAnotherEvent、強制は POST /api/events 側。
// 画面の固定文は4言語辞書（lib/ui-text.ts）。主催者の表示言語は
// この端末に保存される個人の選択（components/AdminLocale.tsx）。
import { useCallback, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import PasswordInput from '@/components/PasswordInput';
import { AdminLanguageSelect, useAdminLocale } from '@/components/AdminLocale';
import {
  EventConfig,
  EventResetMode,
  MAX_CONCURRENT_EVENTS,
  canCreateAnotherEvent,
  countConcurrentEvents,
} from '@/lib/event';
import { LOCALE_LABELS, SUPPORTED_LOCALES, Locale } from '@/lib/i18n';
import { adminText, uiText } from '@/lib/ui-text';

interface EventForm {
  name: string;
  startDate: string;
  endDate: string;
  resetMode: EventResetMode;
  resetTime: string;
  defaultLocale: Locale;
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
  defaultLocale: 'ja',
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
    defaultLocale: event.defaultLocale,
    subscriberCap: String(event.subscriberCap),
    backupRetentionDays: String(event.backupRetentionDays),
    status: event.status === 'live' ? 'live' : 'draft',
  };
}

const VIOLET = '#6D28D9';
const VIOLET_BRIGHT = '#7C3AED';

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

const quickLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 12px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 999,
  border: '1px solid #ddd6fe',
  backgroundColor: '#ffffff',
  color: VIOLET,
  textDecoration: 'none',
};

const noticeStyle: React.CSSProperties = {
  border: '1px solid #fcd34d',
  backgroundColor: '#fffbeb',
  color: '#92400e',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 13,
};

function statusBadgeStyle(status: EventConfig['status']): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    whiteSpace: 'nowrap',
  };
  if (status === 'live') return { ...base, backgroundColor: '#dcfce7', color: '#15803d' };
  if (status === 'ended') return { ...base, backgroundColor: '#e2e8f0', color: '#475569' };
  return { ...base, backgroundColor: '#fef3c7', color: '#b45309' };
}

export default function EventAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [locale, setLocale] = useAdminLocale();
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

  const loadEvents = useCallback(async () => {
    if (!user) return;
    try {
      const data = await callApi('/api/events');
      setEvents(data.events ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'loadFailed'));
    }
  }, [user, callApi, locale]);

  useEffect(() => {
    if (user) void loadEvents();
  }, [user, loadEvents]);

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

  const handleSave = async () => {
    setBusy(true);
    setMessage('');
    const payload = {
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      resetMode: form.resetMode,
      resetTime: form.resetTime,
      defaultLocale: form.defaultLocale,
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
        setMessage(adminText(locale, 'savedMessage'));
      } else {
        const data = await callApi('/api/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSelectedId(data.event.id);
        setMessage(adminText(locale, 'createdMessage'));
      }
      await loadEvents();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'saveFailed'));
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
            <PasswordInput style={inputStyle} value={password} onChange={setPassword} autoComplete="current-password" />
          </label>
          <button onClick={handleLogin} disabled={busy} style={{ ...primaryButtonStyle, width: '100%' }}>
            {adminText(locale, 'loginButton')}
          </button>
          {message && <p style={{ color: '#b91c1c', marginTop: 12, fontSize: 14 }}>{message}</p>}
        </section>
      </main>
    );
  }

  const selected = events.find((e) => e.id === selectedId) ?? null;
  const activeCount = countConcurrentEvents(events);
  const capReached = !canCreateAnotherEvent(events);

  const statusText = (status: EventConfig['status']) =>
    adminText(
      locale,
      status === 'live' ? 'statusLive' : status === 'ended' ? 'statusEnded' : 'statusDraft',
    );

  return (
    <main style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{adminText(locale, 'adminTitle')}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <AdminLanguageSelect locale={locale} onChange={setLocale} />
          <button onClick={() => void signOut(auth)} style={logoutButtonStyle}>
            {adminText(locale, 'logoutButton')}
          </button>
        </div>
      </header>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{adminText(locale, 'eventsListTitle')}</h2>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
          {adminText(locale, 'concurrentCapNote', {
            cap: String(MAX_CONCURRENT_EVENTS),
            active: String(activeCount),
          })}
        </p>
        {events.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noEvents')}</p>}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '12px 0 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 12,
          }}
        >
          {events.map((event) => (
            <li
              key={event.id}
              style={{
                ...cardStyle,
                padding: 16,
                ...(event.id === selectedId
                  ? { border: '2px solid #6D28D9' }
                  : null),
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <button
                  onClick={() => {
                    setSelectedId(event.id);
                    setForm(toForm(event));
                    setMessage('');
                  }}
                  style={{
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: '#0f172a',
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  {event.name}
                </button>
                <span style={statusBadgeStyle(event.status)}>{statusText(event.status)}</span>
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
                {adminText(locale, 'eventMeta', {
                  start: event.startDate,
                  end: event.endDate,
                  status: statusText(event.status),
                  mode: adminText(
                    locale,
                    event.resetMode === 'full-daily' ? 'resetModeFullShort' : 'resetModeKeepShort',
                  ),
                  time: event.resetTime,
                })}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={`/event-admin/${event.id}/push`} style={quickLinkStyle}>
                  {adminText(locale, 'navPush')} →
                </a>
                <a href={`/event-admin/${event.id}/schedule`} style={quickLinkStyle}>
                  {adminText(locale, 'navSchedule')} →
                </a>
                <a href={`/event-admin/${event.id}/coupons`} style={quickLinkStyle}>
                  {adminText(locale, 'navCoupons')} →
                </a>
              </div>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 14 }}>
          {capReached ? (
            <p style={noticeStyle}>
              {adminText(locale, 'concurrentCapReached', { cap: String(MAX_CONCURRENT_EVENTS) })}
            </p>
          ) : (
            <button
              onClick={() => {
                setSelectedId(null);
                setForm(emptyForm);
                setMessage('');
              }}
              style={primaryButtonStyle}
            >
              {adminText(locale, 'newEventButton')}
            </button>
          )}
        </div>
      </section>

      <section style={{ ...cardStyle, marginTop: 24, padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 14px' }}>
          {selected
            ? adminText(locale, 'editEventTitle', { name: selected.name })
            : adminText(locale, 'newEventTitle')}
        </h2>
        {!selected && capReached && (
          <p style={{ ...noticeStyle, marginBottom: 14 }}>
            {adminText(locale, 'concurrentCapReached', { cap: String(MAX_CONCURRENT_EVENTS) })}
          </p>
        )}
        <label style={labelStyle}>
          {adminText(locale, 'eventNameLabel')}
          <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'startDateLabel')}
          <input style={inputStyle} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'endDateLabel')}
          <input style={inputStyle} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </label>
        <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', margin: '0 0 12px', backgroundColor: '#f8fafc' }}>
          <legend style={{ fontSize: 13, fontWeight: 600 }}>{adminText(locale, 'resetModeLegend')}</legend>
          <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
            <input
              type="radio"
              name="resetMode"
              checked={form.resetMode === 'full-daily'}
              onChange={() => setForm({ ...form, resetMode: 'full-daily' })}
            />{' '}
            {adminText(locale, 'resetModeFull')}
          </label>
          <label style={{ display: 'block', fontSize: 14 }}>
            <input
              type="radio"
              name="resetMode"
              checked={form.resetMode === 'keep-phones'}
              onChange={() => setForm({ ...form, resetMode: 'keep-phones' })}
            />{' '}
            {adminText(locale, 'resetModeKeep')}
          </label>
        </fieldset>
        <label style={labelStyle}>
          {adminText(locale, 'resetTimeLabel')}
          <input style={inputStyle} type="time" value={form.resetTime} onChange={(e) => setForm({ ...form, resetTime: e.target.value })} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'defaultLocaleLabel')}
          <select
            style={inputStyle}
            value={form.defaultLocale}
            onChange={(e) => setForm({ ...form, defaultLocale: e.target.value as Locale })}
          >
            {SUPPORTED_LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABELS[l]}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {adminText(locale, 'defaultLocaleNote')}
          </span>
        </label>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{adminText(locale, 'subscriberCapLabel')}</span>
          <div style={{ fontSize: 14, marginTop: 4 }}>
            {selected ? Number(form.subscriberCap).toLocaleString('ja-JP') : '50,000'}
            {!selected && adminText(locale, 'capDefaultNote')}
            {adminText(locale, 'peopleSuffix')}
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              {adminText(locale, 'subscriberCapNote')}
            </span>
          </div>
        </div>
        <label style={labelStyle}>
          {adminText(locale, 'backupDaysLabel')}
          <input style={inputStyle} type="number" min={1} value={form.backupRetentionDays} onChange={(e) => setForm({ ...form, backupRetentionDays: e.target.value })} />
        </label>
        {selected && (
          <label style={labelStyle}>
            {adminText(locale, 'statusFieldLabel')}
            <select
              style={inputStyle}
              value={form.status}
              disabled={selected.status === 'ended'}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'live' })}
            >
              <option value="draft">{adminText(locale, 'statusDraft')}</option>
              <option value="live">{adminText(locale, 'statusOptionLive')}</option>
            </select>
          </label>
        )}
        <button
          onClick={handleSave}
          disabled={busy || (!selected && capReached)}
          style={primaryButtonStyle}
        >
          {selected ? adminText(locale, 'saveButton') : adminText(locale, 'createButton')}
        </button>
        {message && <p style={{ marginTop: 12, fontSize: 14 }}>{message}</p>}
      </section>
    </main>
  );
}
