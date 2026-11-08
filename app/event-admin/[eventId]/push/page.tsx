'use client';

// app/event-admin/[eventId]/push/page.tsx
// Push-taro EVENT 管理画面①：即時プッシュ＋消込。
// 即時プッシュは campaigns API でその場で送信され、送信数（課金根拠）が履歴に残る。
// 消込は主催者として全クーポン対象（出店者画面と違い自社制限なし）。
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
  sentAt: string | null;
  sentCount: number | null;
  error: string | null;
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

function statusBadgeStyle(sent: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    whiteSpace: 'nowrap',
    ...(sent
      ? { backgroundColor: '#dcfce7', color: '#15803d' }
      : { backgroundColor: '#fee2e2', color: '#b91c1c' }),
  };
}

export default function EventPushAdminPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [locale, setLocale] = useAdminLocale();
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

  const handleSend = async () => {
    if (!window.confirm(adminText(locale, 'confirmSend'))) return;
    setBusy(true);
    setMessage('');
    try {
      const data = await callApi(`/api/events/${eventId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify({ title, body }),
      });
      setMessage(adminText(locale, 'sentMessage', { count: String(data.campaign?.sentCount ?? 0) }));
      setTitle('');
      setBody('');
      await loadCampaigns();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'sendFailed'));
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
      setMessage(adminText(locale, 'redeemDoneMessage'));
      setClaimCode('');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'redeemFailedMessage'));
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

  const sentCampaigns = campaigns.filter((c) => c.status === 'sent' || c.status === 'failed');

  return (
    <main style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{adminText(locale, 'pushPageTitle')}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <AdminLanguageSelect locale={locale} onChange={setLocale} />
          <button onClick={() => void signOut(auth)} style={logoutButtonStyle}>
            {adminText(locale, 'logoutButton')}
          </button>
        </div>
      </header>
      <AdminNav eventId={eventId} current="①" locale={locale} />

      <section style={{ ...cardStyle, marginTop: 20, padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 14px' }}>{adminText(locale, 'instantPushTitle')}</h2>
        <label style={labelStyle}>
          {adminText(locale, 'titleLabel')}
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'bodyLabel')}
          <textarea style={{ ...inputStyle, minHeight: 72 }} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button onClick={handleSend} disabled={busy || !title.trim() || !body.trim()} style={primaryButtonStyle}>
          {adminText(locale, 'sendNowButton')}
        </button>
      </section>

      <section style={{ ...cardStyle, marginTop: 16, padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 14px' }}>{adminText(locale, 'organizerRedeemTitle')}</h2>
        <label style={labelStyle}>
          {adminText(locale, 'claimCodeLabel')}
          <input style={inputStyle} value={claimCode} onChange={(e) => setClaimCode(e.target.value)} placeholder={adminText(locale, 'claimCodePlaceholder')} />
        </label>
        <button onClick={handleRedeem} disabled={busy || !claimCode.trim()} style={primaryButtonStyle}>
          {adminText(locale, 'redeemButton')}
        </button>
      </section>

      {message && <p style={{ marginTop: 14, fontSize: 14 }}>{message}</p>}

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{adminText(locale, 'historyTitle')}</h2>
        {sentCampaigns.length === 0 && (
          <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noHistory')}</p>
        )}
        {sentCampaigns.map((campaign) => (
          <article key={campaign.id} style={{ ...cardStyle, padding: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{campaign.title}</div>
              <span style={statusBadgeStyle(campaign.status === 'sent')}>
                {adminText(locale, campaign.status === 'sent' ? 'badgeSent' : 'badgeFailed')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              {campaign.status === 'sent'
                ? adminText(locale, 'historySent', {
                    sentAt: campaign.sentAt ?? '',
                    count: String(campaign.sentCount ?? 0),
                  })
                : adminText(locale, 'historyFailed', { error: campaign.error ?? '' })}
            </div>
            <p style={{ fontSize: 13, marginTop: 2 }}>{campaign.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
