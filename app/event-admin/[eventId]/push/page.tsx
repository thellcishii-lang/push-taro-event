'use client';

// app/event-admin/[eventId]/push/page.tsx
// Push-taro EVENT 管理画面①：即時プッシュ＋消込。
// 即時プッシュは campaigns API でその場で送信され、送信数（課金根拠）が履歴に残る。
// 消込は主催者として全クーポン対象（出店者画面と違い自社制限なし）。
// 画面の固定文は4言語辞書（lib/ui-text.ts の ADMIN_TEXT）。
// 見た目は承認済みモック準拠。ログイン後は共通シェル（components/AdminShell）
// を使い、PC は左サイドバー固定の2カラム、スマホはアコーディオンになる。
// フィードバック文は送信フォーム／消込フォーム／履歴それぞれの直下に出す。
import { useCallback, useEffect, useRef, useState } from 'react';
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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 800,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

function statusBadgeStyle(sent: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '3px 12px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    whiteSpace: 'nowrap',
    ...(sent
      ? { backgroundColor: '#D9F5E3', color: '#15803d' }
      : { backgroundColor: '#fee2e2', color: '#b91c1c' }),
  };
}

function PlaneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={VIOLET}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </svg>
  );
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
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [attachment, setAttachment] = useState<CampaignAttachment | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [claimCode, setClaimCode] = useState('');
  const [message, setMessage] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [redeemMessage, setRedeemMessage] = useState('');
  const [loadMessage, setLoadMessage] = useState('');
  const [busy, setBusy] = useState(false);
  // 送信中アクション（押したボタンの中でスピナーを回すため）。
  const [pendingAction, setPendingAction] = useState<'send' | 'redeem' | null>(null);

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
      setLoadMessage('');
    } catch (e) {
      setLoadMessage(e instanceof Error ? e.message : adminText(locale, 'loadFailed'));
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
    } catch (e) {
      // 失敗理由（Storage のエラーコード）を文面に添えて、ボタンの近くで
      // 原因が分かるようにする。アップロード方式自体は変更しない。
      const code = (e as { code?: unknown } | null)?.code;
      setAttachmentError(
        adminText(locale, 'attachmentUploadFailed') +
          (typeof code === 'string' && code ? ` (${code})` : ''),
      );
      console.error('[campaign-attachment] upload failed', e);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleSend = async () => {
    if (!window.confirm(adminText(locale, 'confirmSend'))) return;
    setBusy(true);
    setPendingAction('send');
    setPushMessage('');
    try {
      const data = await callApi(`/api/events/${eventId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify({ title, body, attachment }),
      });
      setPushMessage(adminText(locale, 'sentMessage', { count: String(data.campaign?.sentCount ?? 0) }));
      setTitle('');
      setBody('');
      setAttachment(null);
      setAttachmentName('');
      await loadCampaigns();
    } catch (e) {
      setPushMessage(e instanceof Error ? e.message : adminText(locale, 'sendFailed'));
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  const handleRedeem = async () => {
    setBusy(true);
    setPendingAction('redeem');
    setRedeemMessage('');
    try {
      await callApi(`/api/events/${eventId}/redeem`, {
        method: 'POST',
        body: JSON.stringify({ claimId: claimCode.trim() }),
      });
      setRedeemMessage(adminText(locale, 'redeemDoneMessage'));
      setClaimCode('');
    } catch (e) {
      setRedeemMessage(e instanceof Error ? e.message : adminText(locale, 'redeemFailedMessage'));
    } finally {
      setBusy(false);
      setPendingAction(null);
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

  const sentCampaigns = campaigns.filter((c) => c.status === 'sent' || c.status === 'failed');

  return (
    <AdminShell
      locale={locale}
      email={user.email}
      onLogout={() => void signOut(auth)}
      languageSelect={<AdminLanguageSelect locale={locale} onChange={setLocale} />}
      nav={<AdminNav eventId={eventId} current="①" locale={locale} />}
    >
      <h1 style={adminPageTitleStyle}>{adminText(locale, 'pushPageTitle')}</h1>
      <CapWarningBanner locale={locale} />

      <section style={{ ...cardStyle, marginTop: 22, padding: 24 }}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: 14 }}>
          <PlaneIcon />
          {adminText(locale, 'instantPushTitle')}
        </h2>
        <label style={labelStyle}>
          {adminText(locale, 'titleLabel')}
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label style={labelStyle}>
          {adminText(locale, 'bodyLabel')}
          <textarea style={{ ...inputStyle, minHeight: 72 }} value={body} onChange={(e) => setBody(e.target.value)} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={busy || attachmentUploading}
                style={{ ...primaryButtonStyle, padding: '10px 18px', fontSize: 14 }}
              >
                <span style={adminButtonContentStyle}>
                  {attachmentUploading && <ButtonSpinner />}
                  {adminText(locale, 'attachmentSelectButton')}
                </span>
              </button>
              {attachmentUploading && (
                <span style={{ fontSize: 12.5, color: '#64748b' }}>
                  {adminText(locale, 'attachmentUploading')}
                </span>
              )}
              <input
                ref={attachmentInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
                disabled={busy || attachmentUploading}
                onChange={(e) => {
                  void handleAttachmentSelect(e.target.files?.[0]);
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
            </div>
          )}
          {attachmentError && <p style={adminErrorTextStyle}>{attachmentError}</p>}
        </div>
        <button
          onClick={handleSend}
          disabled={busy || attachmentUploading || !title.trim() || !body.trim()}
          style={{ ...primaryButtonStyle, width: '100%', padding: '14px 22px', fontSize: 16 }}
        >
          <span style={adminButtonContentStyle}>
            {pendingAction === 'send' && <ButtonSpinner />}
            {adminText(locale, 'sendNowButton')}
          </span>
        </button>
        {pushMessage && <p style={adminFeedbackStyle}>{pushMessage}</p>}
      </section>

      <section style={{ ...cardStyle, marginTop: 16, padding: 24 }}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: 14 }}>{adminText(locale, 'organizerRedeemTitle')}</h2>
        <label style={labelStyle}>
          {adminText(locale, 'claimCodeLabel')}
          <input style={inputStyle} value={claimCode} onChange={(e) => setClaimCode(e.target.value)} placeholder={adminText(locale, 'claimCodePlaceholder')} />
        </label>
        <button onClick={handleRedeem} disabled={busy || !claimCode.trim()} style={primaryButtonStyle}>
          <span style={adminButtonContentStyle}>
            {pendingAction === 'redeem' && <ButtonSpinner />}
            {adminText(locale, 'redeemButton')}
          </span>
        </button>
        {redeemMessage && <p style={adminFeedbackStyle}>{redeemMessage}</p>}
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{adminText(locale, 'historyTitle')}</h2>
        {loadMessage && <p style={adminErrorTextStyle}>{loadMessage}</p>}
        {sentCampaigns.length === 0 && (
          <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noHistory')}</p>
        )}
        {sentCampaigns.length > 0 && (
          <div style={{ ...cardStyle, marginTop: 12, padding: '4px 20px' }}>
            {sentCampaigns.map((campaign, i) => (
              <article
                key={campaign.id}
                style={{
                  padding: '14px 0',
                  borderBottom: i < sentCampaigns.length - 1 ? '1px solid #F0EDF8' : 'none',
                }}
              >
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
                {campaign.attachment && (
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    📎 {adminText(locale, 'attachmentBadge')}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
