'use client';

// app/event-admin/page.tsx
// Push-taro EVENT の主催者向けイベント設定画面。
// イベントの一覧・作成・編集（開催期間／リセット方式／リセット時刻／上限／バックアップ保持日数／状態）。
// 将来の管理画面3分割（プッシュ＋消込／予約／クーポン管理）の土台として、
// まずはイベント設定に絞った単独画面にしている。
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
import { EventConfig, EventResetMode } from '@/lib/event';
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

  if (!authReady) return <main style={{ padding: 24 }}>{uiText(locale, 'loading')}</main>;

  if (!user) {
    return (
      <main style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{adminText(locale, 'adminLoginTitle')}</h1>
          <AdminLanguageSelect locale={locale} onChange={setLocale} />
        </div>
        <label style={labelStyle}>
          {adminText(locale, 'emailLabel')}
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'passwordLabel')}
          <PasswordInput style={inputStyle} value={password} onChange={setPassword} autoComplete="current-password" />
        </label>
        <button onClick={handleLogin} disabled={busy} style={{ padding: '10px 20px', fontWeight: 700 }}>
          {adminText(locale, 'loginButton')}
        </button>
        {message && <p style={{ color: '#b91c1c', marginTop: 12 }}>{message}</p>}
      </main>
    );
  }

  const selected = events.find((e) => e.id === selectedId) ?? null;

  const statusText = (status: EventConfig['status']) =>
    adminText(
      locale,
      status === 'live' ? 'statusLive' : status === 'ended' ? 'statusEnded' : 'statusDraft',
    );

  return (
    <main style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>{adminText(locale, 'adminTitle')}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <AdminLanguageSelect locale={locale} onChange={setLocale} />
          <button onClick={() => void signOut(auth)}>{adminText(locale, 'logoutButton')}</button>
        </div>
      </div>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>{adminText(locale, 'eventsListTitle')}</h2>
        {events.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noEvents')}</p>}
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
              <div style={{ marginTop: 6, display: 'flex', gap: 12 }}>
                <a href={`/event-admin/${event.id}/push`} style={{ fontSize: 13 }}>
                  {adminText(locale, 'navPush')} →
                </a>
                <a href={`/event-admin/${event.id}/schedule`} style={{ fontSize: 13 }}>
                  {adminText(locale, 'navSchedule')} →
                </a>
                <a href={`/event-admin/${event.id}/coupons`} style={{ fontSize: 13 }}>
                  {adminText(locale, 'navCoupons')} →
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
          {adminText(locale, 'newEventButton')}
        </button>
      </section>

      <section style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>
          {selected
            ? adminText(locale, 'editEventTitle', { name: selected.name })
            : adminText(locale, 'newEventTitle')}
        </h2>
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
        <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12 }}>
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
        <button onClick={handleSave} disabled={busy} style={{ padding: '10px 20px', fontWeight: 700 }}>
          {selected ? adminText(locale, 'saveButton') : adminText(locale, 'createButton')}
        </button>
        {message && <p style={{ marginTop: 12, fontSize: 14 }}>{message}</p>}
      </section>
    </main>
  );
}
