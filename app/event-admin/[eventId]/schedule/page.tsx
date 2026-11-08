'use client';

// app/event-admin/[eventId]/schedule/page.tsx
// Push-taro EVENT 管理画面②：予約配信。
// 15分刻み（00/15/30/45分）で複数の予約を入れられる。実行は event-tick が担う。
// 画面の固定文は4言語辞書（lib/ui-text.ts の ADMIN_TEXT）。
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { AdminLanguageSelect, useAdminLocale } from '@/components/AdminLocale';
import { adminText, uiText } from '@/lib/ui-text';
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

function historyBadge(status: string): { key: 'badgeSent' | 'badgeFailed' | 'badgeCancelled'; style: React.CSSProperties } | null {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    whiteSpace: 'nowrap',
  };
  if (status === 'sent')
    return { key: 'badgeSent', style: { ...base, backgroundColor: '#dcfce7', color: '#15803d' } };
  if (status === 'failed')
    return { key: 'badgeFailed', style: { ...base, backgroundColor: '#fee2e2', color: '#b91c1c' } };
  if (status === 'cancelled')
    return { key: 'badgeCancelled', style: { ...base, backgroundColor: '#e2e8f0', color: '#475569' } };
  return null;
}

export default function EventScheduleAdminPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [locale, setLocale] = useAdminLocale();
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

  const loadCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const data = await callApi(`/api/events/${eventId}/campaigns`);
      setCampaigns(data.campaigns ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'loadFailed'));
    }
  }, [user, eventId, callApi, locale]);

  useEffect(() => {
    if (user) void loadCampaigns();
  }, [user, loadCampaigns]);

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
      setMessage(adminText(locale, 'scheduledMessage', { date: form.date, time: form.time }));
      setForm({ ...form, title: '', body: '' });
      await loadCampaigns();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'scheduleFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (campaignId: string) => {
    if (!window.confirm(adminText(locale, 'confirmCancel'))) return;
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/events/${eventId}/campaigns/${campaignId}/cancel`, { method: 'POST' });
      setMessage(adminText(locale, 'cancelledMessage'));
      await loadCampaigns();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'cancelFailed'));
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

  const scheduled = campaigns
    .filter((c) => c.kind === 'scheduled' && c.status === 'scheduled')
    .sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''));
  const finished = campaigns.filter((c) => c.kind === 'scheduled' && c.status !== 'scheduled');

  return (
    <main style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{adminText(locale, 'schedulePageTitle')}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <AdminLanguageSelect locale={locale} onChange={setLocale} />
          <button onClick={() => void signOut(auth)} style={logoutButtonStyle}>
            {adminText(locale, 'logoutButton')}
          </button>
        </div>
      </header>
      <AdminNav eventId={eventId} current="②" locale={locale} />

      <section style={{ ...cardStyle, marginTop: 20, padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 14px' }}>{adminText(locale, 'newScheduleTitle')}</h2>
        <label style={labelStyle}>
          {adminText(locale, 'titleLabel')}
          <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'bodyLabel')}
          <textarea style={{ ...inputStyle, minHeight: 72 }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'dateLabel')}
          <input style={inputStyle} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'timeLabel')}
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
          style={primaryButtonStyle}
        >
          {adminText(locale, 'scheduleButton')}
        </button>
      </section>

      {message && <p style={{ marginTop: 14, fontSize: 14 }}>{message}</p>}

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
          {adminText(locale, 'scheduledListTitle', { count: String(scheduled.length) })}
        </h2>
        {scheduled.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noScheduled')}</p>}
        {scheduled.map((campaign) => (
          <article key={campaign.id} style={{ ...cardStyle, padding: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{campaign.title}</div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 999,
                  backgroundColor: '#ede9fe',
                  color: VIOLET,
                  whiteSpace: 'nowrap',
                }}
              >
                {campaign.scheduledAt?.replace('T', ' ')}
              </span>
            </div>
            <p style={{ fontSize: 13, marginTop: 4 }}>{campaign.body}</p>
            <button onClick={() => void handleCancel(campaign.id)} disabled={busy} style={{ ...dangerButtonStyle, marginTop: 8 }}>
              {adminText(locale, 'cancelButton')}
            </button>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{adminText(locale, 'scheduleHistoryTitle')}</h2>
        {finished.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noScheduleHistory')}</p>}
        {finished.map((campaign) => {
          const badge = historyBadge(campaign.status);
          return (
            <article key={campaign.id} style={{ ...cardStyle, padding: 16, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{campaign.title}</div>
                {badge && <span style={badge.style}>{adminText(locale, badge.key)}</span>}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                {adminText(locale, 'historyReservedPrefix', { at: campaign.scheduledAt?.replace('T', ' ') ?? '' })}
                {campaign.status === 'sent' && adminText(locale, 'histSent', { count: String(campaign.sentCount ?? 0) })}
                {campaign.status === 'cancelled' && adminText(locale, 'histCancelled')}
                {campaign.status === 'failed' && adminText(locale, 'historyFailed', { error: campaign.error ?? '' })}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
