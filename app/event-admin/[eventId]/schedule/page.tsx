'use client';

// app/event-admin/[eventId]/schedule/page.tsx
// Push-taro EVENT 管理画面②：予約配信。
// 15分刻み（00/15/30/45分）で複数の予約を入れられる。実行は event-tick が担う。
// 画面の固定文は4言語辞書（lib/ui-text.ts の ADMIN_TEXT）。
// 見た目は承認済みモック準拠。ログイン後は共通シェル（components/AdminShell）
// を使い、PC は左サイドバー固定の2カラム、スマホはアコーディオンになる。
// フィードバック文は予約フォームの直下／予約一覧の直上に出す。
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, storage } from '@/lib/firebase-client';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { AdminLanguageSelect, useAdminLocale } from '@/components/AdminLocale';
import {
  ADMIN_CARD_BORDER,
  ADMIN_CARD_SHADOW,
  ADMIN_PAGE_BG,
  AdminBrandBar,
  ButtonSpinner,
  adminButtonContentStyle,
  adminErrorTextStyle,
  adminFeedbackStyle,
  adminPageTitleStyle,
} from '@/components/AdminBrand';
import { adminText, uiText } from '@/lib/ui-text';
import { AdminShell } from '@/components/AdminShell';
import { CapWarningBanner } from '@/components/CapWarningBanner';
import { AdminNav } from '../AdminNav';

interface CampaignAttachment {
  url: string;
  type: 'pdf' | 'image';
  storagePath: string;
}

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
  attachment: CampaignAttachment | null;
}

/** 添付できるファイル種別（MIME → 拡張子）。サーバー側の検証と同じ範囲にそろえる。 */
const ATTACHMENT_MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h += 1) {
  for (const m of [0, 15, 30, 45]) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const VIOLET = '#6D28D9';

const containerStyle: React.CSSProperties = {
  padding: '20px 16px 48px',
  maxWidth: 880,
  margin: '0 auto',
  fontFamily: 'sans-serif',
  backgroundColor: ADMIN_PAGE_BG,
  minHeight: '100vh',
  boxSizing: 'border-box',
  color: '#0f172a',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: `1px solid ${ADMIN_CARD_BORDER}`,
  borderRadius: 18,
  boxShadow: ADMIN_CARD_SHADOW,
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '11px 12px',
  marginTop: 6,
  border: '1px solid #D9D4EC',
  borderRadius: 12,
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
  padding: '12px 22px',
  fontWeight: 700,
  fontSize: 15,
  backgroundColor: VIOLET,
  color: '#ffffff',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
};

const dangerButtonStyle: React.CSSProperties = {
  padding: '7px 16px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 12,
  border: '1px solid #fca5a5',
  backgroundColor: '#ffffff',
  color: '#b91c1c',
  cursor: 'pointer',
};

function historyBadge(status: string): { key: 'badgeSent' | 'badgeFailed' | 'badgeCancelled'; style: React.CSSProperties } | null {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '3px 12px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    whiteSpace: 'nowrap',
  };
  if (status === 'sent')
    return { key: 'badgeSent', style: { ...base, backgroundColor: '#D9F5E3', color: '#15803d' } };
  if (status === 'failed')
    return { key: 'badgeFailed', style: { ...base, backgroundColor: '#fee2e2', color: '#b91c1c' } };
  if (status === 'cancelled')
    return { key: 'badgeCancelled', style: { ...base, backgroundColor: '#E8EAF1', color: '#5B6472' } };
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
  const [attachment, setAttachment] = useState<CampaignAttachment | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [message, setMessage] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [listMessage, setListMessage] = useState('');
  const [busy, setBusy] = useState(false);
  // 送信中アクション（押したボタンの中でスピナーを回すため）。
  const [pendingAction, setPendingAction] = useState<'schedule' | null>(null);

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
      setListMessage(e instanceof Error ? e.message : adminText(locale, 'loadFailed'));
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

  // 宣伝ファイルは Storage へ直接アップロードし、生成された URL を
  // リンク先として配信に添付する（案内PDFと同じ方式）。
  const handleAttachmentSelect = async (file: File | undefined) => {
    if (!file) return;
    const ext = ATTACHMENT_MIME_TO_EXT[file.type];
    if (!ext) {
      setAttachmentError(adminText(locale, 'attachmentTypeError'));
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError(adminText(locale, 'attachmentSizeError'));
      return;
    }
    setAttachmentUploading(true);
    setAttachmentError('');
    try {
      const storagePath = `events/${eventId}/campaign-files/${crypto.randomUUID()}.${ext}`;
      const ref = storageRef(storage, storagePath);
      await uploadBytes(ref, file, { contentType: file.type });
      const url = await getDownloadURL(ref);
      setAttachment({ url, type: ext === 'pdf' ? 'pdf' : 'image', storagePath });
      setAttachmentName(file.name);
    } catch {
      setAttachmentError(adminText(locale, 'attachmentUploadFailed'));
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleSchedule = async () => {
    setBusy(true);
    setPendingAction('schedule');
    setFormMessage('');
    try {
      await callApi(`/api/events/${eventId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          scheduledAt: `${form.date}T${form.time}`,
          attachment,
        }),
      });
      setFormMessage(adminText(locale, 'scheduledMessage', { date: form.date, time: form.time }));
      setForm({ ...form, title: '', body: '' });
      setAttachment(null);
      setAttachmentName('');
      await loadCampaigns();
    } catch (e) {
      setFormMessage(e instanceof Error ? e.message : adminText(locale, 'scheduleFailed'));
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  const handleCancel = async (campaignId: string) => {
    if (!window.confirm(adminText(locale, 'confirmCancel'))) return;
    setBusy(true);
    setListMessage('');
    try {
      await callApi(`/api/events/${eventId}/campaigns/${campaignId}/cancel`, { method: 'POST' });
      setListMessage(adminText(locale, 'cancelledMessage'));
      await loadCampaigns();
    } catch (e) {
      setListMessage(e instanceof Error ? e.message : adminText(locale, 'cancelFailed'));
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;

  if (!user) {
    return (
      <main style={{ ...containerStyle, maxWidth: 480 }}>
        <AdminBrandBar right={<AdminLanguageSelect locale={locale} onChange={setLocale} />} />
        <section style={{ ...cardStyle, padding: 24, marginTop: 16 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>{adminText(locale, 'adminLoginTitle')}</h1>
          <label style={labelStyle}>
            {adminText(locale, 'emailLabel')}
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={labelStyle}>
            {adminText(locale, 'passwordLabel')}
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button onClick={handleLogin} disabled={busy} style={{ ...primaryButtonStyle, width: '100%' }}>
            <span style={adminButtonContentStyle}>
              {busy && <ButtonSpinner />}
              {adminText(locale, 'loginButton')}
            </span>
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
    <AdminShell
      locale={locale}
      email={user.email}
      onLogout={() => void signOut(auth)}
      languageSelect={<AdminLanguageSelect locale={locale} onChange={setLocale} />}
      nav={<AdminNav eventId={eventId} current="②" locale={locale} />}
    >
      <h1 style={adminPageTitleStyle}>{adminText(locale, 'schedulePageTitle')}</h1>
      <CapWarningBanner locale={locale} />

      <section style={{ ...cardStyle, marginTop: 22, padding: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 14px' }}>{adminText(locale, 'newScheduleTitle')}</h2>
        <label style={labelStyle}>
          {adminText(locale, 'titleLabel')}
          <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'bodyLabel')}
          <textarea style={{ ...inputStyle, minHeight: 72 }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </label>
        <div style={{ marginBottom: 12 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>
            {adminText(locale, 'attachmentLabel')}
          </span>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 8px' }}>
            {adminText(locale, 'attachmentNote')}
          </p>
          {attachment ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13 }}>📎 {attachmentName}</span>
              <button
                type="button"
                onClick={() => {
                  setAttachment(null);
                  setAttachmentName('');
                }}
                disabled={busy}
                style={{
                  padding: '5px 12px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: 999,
                  border: '1px solid #D9D4EC',
                  backgroundColor: '#ffffff',
                  color: VIOLET,
                  cursor: 'pointer',
                }}
              >
                {adminText(locale, 'attachmentRemoveButton')}
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
              disabled={busy || attachmentUploading}
              onChange={(e) => {
                void handleAttachmentSelect(e.target.files?.[0]);
                e.target.value = '';
              }}
              style={{ fontSize: 13 }}
            />
          )}
          {attachmentUploading && (
            <span style={{ fontSize: 12.5, color: '#64748b', marginLeft: 8 }}>
              {adminText(locale, 'attachmentUploading')}
            </span>
          )}
          {attachmentError && <p style={adminErrorTextStyle}>{attachmentError}</p>}
        </div>
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
          disabled={busy || attachmentUploading || !form.title.trim() || !form.body.trim() || !form.date}
          style={primaryButtonStyle}
        >
          <span style={adminButtonContentStyle}>
            {pendingAction === 'schedule' && <ButtonSpinner />}
            {adminText(locale, 'scheduleButton')}
          </span>
        </button>
        {formMessage && <p style={adminFeedbackStyle}>{formMessage}</p>}
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
          {adminText(locale, 'scheduledListTitle', { count: String(scheduled.length) })}
        </h2>
        {listMessage && <p style={adminFeedbackStyle}>{listMessage}</p>}
        {scheduled.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noScheduled')}</p>}
        {scheduled.map((campaign) => (
          <article key={campaign.id} style={{ ...cardStyle, padding: '18px 20px', marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{campaign.title}</div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 12px',
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
            {campaign.attachment && (
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                📎 {adminText(locale, 'attachmentBadge')}
              </p>
            )}
            <button onClick={() => void handleCancel(campaign.id)} disabled={busy} style={{ ...dangerButtonStyle, marginTop: 8 }}>
              {adminText(locale, 'cancelButton')}
            </button>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{adminText(locale, 'scheduleHistoryTitle')}</h2>
        {finished.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noScheduleHistory')}</p>}
        {finished.length > 0 && (
          <div style={{ ...cardStyle, marginTop: 12, padding: '4px 20px' }}>
            {finished.map((campaign, i) => {
              const badge = historyBadge(campaign.status);
              return (
                <article
                  key={campaign.id}
                  style={{
                    padding: '14px 0',
                    borderBottom: i < finished.length - 1 ? '1px solid #F0EDF8' : 'none',
                  }}
                >
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
                  {campaign.attachment && (
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      📎 {adminText(locale, 'attachmentBadge')}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
