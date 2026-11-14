'use client';

// app/event-admin/[eventId]/billing/page.tsx
// Push-taro EVENT 主催者向けの出店者課金画面（別料金オプション）。
// - Stripe 設定: 主催者自身の Stripe の APIキーと Webhook シークレットを
//   保存する。入力欄は常に空で出し、保存済みかどうかだけを表示する
//   （キーの値はこの画面にも API レスポンスにも出ない）。
// - 出店者ごとの課金: 出店者ごとに課金形態（月額サブスク／一括払い）と
//   金額を設定して支払いリンク（Stripe Checkout の URL）を発行し、
//   主催者がコピーして出店者に渡す。状態（支払い済み／未払い／
//   掲載停止中）と収支サマリは、Webhook で蓄積したローカル記録から表示する。
// - オプション OFF の契約では API が 404 を返すので、その場合は
//   この画面自体に案内文を出す（ナビには常時出す作り）。
// 画面の固定文は4言語辞書（lib/ui-text.ts の ADMIN_TEXT）。
// ログイン後は共通シェル（components/AdminShell）を使う。
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
import { adminText, uiText, type AdminTextKey } from '@/lib/ui-text';
import { AdminShell } from '@/components/AdminShell';
import { CapWarningBanner } from '@/components/CapWarningBanner';
import { AdminNav } from '../AdminNav';

type ShopBillingType = 'subscription' | 'one-time';

type ShopBillingStatus =
  | 'none'
  | 'active'
  | 'paid'
  | 'past_due'
  | 'suspended'
  | 'canceled';

interface ShopBillingItem {
  exhibitorId: string;
  billingType: ShopBillingType;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  amount: number;
  status: ShopBillingStatus;
  currentPeriodEnd: string | null;
  checkoutUrl: string | null;
  checkoutSessionId: string | null;
  updatedAt: string;
}

interface BillingPaymentItem {
  id: string;
  exhibitorId: string;
  amount: number;
  status: 'paid' | 'failed';
  paidAt: string | null;
  occurredAt: string;
  stripeInvoiceId: string | null;
}

interface BillingSummary {
  currentMonthKey: string;
  currentMonthTotal: number;
  previousMonthKey: string;
  previousMonthTotal: number;
}

interface StripeSettingsState {
  secretKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
  webhookUrl: string;
}

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
  backgroundColor: '#6D28D9',
  color: '#ffffff',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 12,
  border: '1px solid #D9D4EC',
  backgroundColor: '#ffffff',
  color: '#26233B',
  cursor: 'pointer',
};

const dangerButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  border: '1px solid #fca5a5',
  color: '#b91c1c',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  margin: 0,
};

const STATUS_BADGE: Record<
  ShopBillingStatus,
  { key: AdminTextKey; color: string; backgroundColor: string }
> = {
  none: { key: 'billingStatusNone', color: '#475569', backgroundColor: '#f1f5f9' },
  active: { key: 'billingStatusActive', color: '#15803d', backgroundColor: '#dcfce7' },
  paid: { key: 'billingStatusPaid', color: '#15803d', backgroundColor: '#dcfce7' },
  past_due: { key: 'billingStatusPastDue', color: '#b45309', backgroundColor: '#fef3c7' },
  suspended: { key: 'billingStatusSuspended', color: '#b91c1c', backgroundColor: '#fee2e2' },
  canceled: { key: 'billingStatusCanceled', color: '#475569', backgroundColor: '#f1f5f9' },
};

function formatDateTime(iso: string | null, locale: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

export default function EventBillingAdminPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [locale, setLocale] = useAdminLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [eventName, setEventName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // null = 読み込み中 / true = オプション OFF（案内を出す）
  const [optionOff, setOptionOff] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<StripeSettingsState | null>(null);
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [webhookSecretInput, setWebhookSecretInput] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  const [exhibitors, setExhibitors] = useState<Array<{ id: string; name: string }>>([]);
  const [billings, setBillings] = useState<ShopBillingItem[]>([]);
  const [payments, setPayments] = useState<BillingPaymentItem[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loadMessage, setLoadMessage] = useState('');
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});
  const [typeInputs, setTypeInputs] = useState<Record<string, ShopBillingType>>({});
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [rowMessages, setRowMessages] = useState<Record<string, string>>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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

  const loadSettings = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/billing/settings', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.status === 404) {
        setOptionOff(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? '');
      setOptionOff(false);
      setSettings(data as StripeSettingsState);
    } catch {
      // 設定が読めない場合はオプション状態を確定させない
    }
  }, [user]);

  const loadBillings = useCallback(async () => {
    if (!user) return;
    try {
      const data = await callApi(`/api/events/${eventId}/shop-billings`);
      setExhibitors((data.exhibitors as Array<{ id: string; name: string }>) ?? []);
      const loadedBillings = (data.billings as ShopBillingItem[]) ?? [];
      setBillings(loadedBillings);
      setPayments((data.payments as BillingPaymentItem[]) ?? []);
      setSummary((data.summary as BillingSummary) ?? null);
      setAmountInputs((current) => {
        const next = { ...current };
        for (const billing of loadedBillings) {
          if (next[billing.exhibitorId] === undefined && billing.amount > 0) {
            next[billing.exhibitorId] = String(billing.amount);
          }
        }
        return next;
      });
      setTypeInputs((current) => {
        const next = { ...current };
        for (const billing of loadedBillings) {
          if (next[billing.exhibitorId] === undefined) {
            next[billing.exhibitorId] = billing.billingType;
          }
        }
        return next;
      });
      setLoadMessage('');
    } catch (e) {
      setLoadMessage(e instanceof Error ? e.message : adminText(locale, 'loadFailed'));
    }
  }, [user, eventId, callApi, locale]);

  const loadEventName = useCallback(async () => {
    if (!user) return;
    try {
      const data = await callApi(`/api/events/${eventId}`);
      if (typeof data.event?.name === 'string') setEventName(data.event.name);
    } catch {
      // 名前が読み込めなくても課金は止めない
    }
  }, [user, eventId, callApi]);

  useEffect(() => {
    if (user) void loadSettings();
  }, [user, loadSettings]);

  useEffect(() => {
    if (user && optionOff === false) {
      void loadBillings();
      void loadEventName();
    }
  }, [user, optionOff, loadBillings, loadEventName]);

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

  const handleSaveSettings = async () => {
    const patch: { secretKey?: string; webhookSecret?: string } = {};
    if (secretKeyInput.trim()) patch.secretKey = secretKeyInput.trim();
    if (webhookSecretInput.trim()) patch.webhookSecret = webhookSecretInput.trim();
    if (!patch.secretKey && !patch.webhookSecret) {
      setSettingsMessage(adminText(locale, 'billingKeyKeepNote'));
      return;
    }
    setSettingsSaving(true);
    setSettingsMessage('');
    try {
      const data = await callApi('/api/billing/settings', {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      setSettings(data as StripeSettingsState);
      // 保存したキーは画面に残さない（入力欄は常に空で出す）
      setSecretKeyInput('');
      setWebhookSecretInput('');
      setSettingsMessage(adminText(locale, 'billingSettingsSaved'));
    } catch (e) {
      setSettingsMessage(
        e instanceof Error ? e.message : adminText(locale, 'billingSettingsSaveFailed'),
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      // クリップボードが使えない環境では URL を選択して手でコピーしてもらう
    }
  };

  const handleIssue = async (exhibitorId: string) => {
    const amount = Number(amountInputs[exhibitorId] ?? '');
    const billingType = typeInputs[exhibitorId] ?? 'subscription';
    setIssuingId(exhibitorId);
    setRowMessages((current) => ({ ...current, [exhibitorId]: '' }));
    try {
      const data = await callApi(
        `/api/events/${eventId}/shop-billings/${exhibitorId}`,
        { method: 'POST', body: JSON.stringify({ amount, billingType }) },
      );
      const billing = data.billing as ShopBillingItem;
      setBillings((current) => [
        ...current.filter((item) => item.exhibitorId !== exhibitorId),
        billing,
      ]);
      setRowMessages((current) => ({
        ...current,
        [exhibitorId]: adminText(locale, 'billingIssued'),
      }));
    } catch (e) {
      setRowMessages((current) => ({
        ...current,
        [exhibitorId]:
          e instanceof Error ? e.message : adminText(locale, 'billingIssueFailed'),
      }));
    } finally {
      setIssuingId(null);
    }
  };

  const handleCancel = async (exhibitorId: string) => {
    if (!window.confirm(adminText(locale, 'billingConfirmCancel'))) return;
    setCancelingId(exhibitorId);
    setRowMessages((current) => ({ ...current, [exhibitorId]: '' }));
    try {
      const data = await callApi(
        `/api/events/${eventId}/shop-billings/${exhibitorId}/cancel`,
        { method: 'POST', body: JSON.stringify({}) },
      );
      const billing = data.billing as ShopBillingItem;
      setBillings((current) => [
        ...current.filter((item) => item.exhibitorId !== exhibitorId),
        billing,
      ]);
      setRowMessages((current) => ({
        ...current,
        [exhibitorId]: adminText(locale, 'billingCanceledDone'),
      }));
    } catch (e) {
      setRowMessages((current) => ({
        ...current,
        [exhibitorId]:
          e instanceof Error ? e.message : adminText(locale, 'billingCancelFailed'),
      }));
    } finally {
      setCancelingId(null);
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

  const billingByExhibitor = new Map(billings.map((b) => [b.exhibitorId, b]));
  const exhibitorName = (id: string) =>
    exhibitors.find((e) => e.id === id)?.name ?? id;

  return (
    <AdminShell
      locale={locale}
      email={user.email}
      onLogout={() => void signOut(auth)}
      languageSelect={<AdminLanguageSelect locale={locale} onChange={setLocale} />}
      nav={<AdminNav eventId={eventId} eventName={eventName} current="④" locale={locale} />}
    >
      <h1 style={adminPageTitleStyle}>{adminText(locale, 'billingPageTitle')}</h1>
      <CapWarningBanner locale={locale} />

      {optionOff === null && (
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 16 }}>
          {uiText(locale, 'loading')}
        </p>
      )}

      {optionOff === true && (
        <section style={{ ...cardStyle, marginTop: 22, padding: 24 }}>
          <h2 style={sectionTitleStyle}>{adminText(locale, 'billingOptionOffTitle')}</h2>
          <p style={{ fontSize: 13.5, color: '#475569', marginTop: 10, lineHeight: 1.7 }}>
            {adminText(locale, 'billingOptionOffNote')}
          </p>
        </section>
      )}

      {optionOff === false && (
        <>
          <section style={{ marginTop: 22 }}>
            <h2 style={sectionTitleStyle}>{adminText(locale, 'billingStripeTitle')}</h2>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 5, lineHeight: 1.7 }}>
              {adminText(locale, 'billingStripeNote')}
            </p>
            <div style={{ ...cardStyle, marginTop: 12, padding: 24 }}>
              <label style={labelStyle}>
                {adminText(locale, 'billingSecretKeyLabel')}
                {settings && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                      color: settings.secretKeyConfigured ? '#15803d' : '#b45309',
                      backgroundColor: settings.secretKeyConfigured ? '#dcfce7' : '#fef3c7',
                    }}
                  >
                    {settings.secretKeyConfigured
                      ? adminText(locale, 'billingKeyConfigured')
                      : adminText(locale, 'billingKeyNotConfigured')}
                  </span>
                )}
                <input
                  style={inputStyle}
                  type="password"
                  value={secretKeyInput}
                  onChange={(e) => setSecretKeyInput(e.target.value)}
                  placeholder="sk_live_..."
                  autoComplete="off"
                />
              </label>
              <label style={labelStyle}>
                {adminText(locale, 'billingWebhookSecretLabel')}
                {settings && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                      color: settings.webhookSecretConfigured ? '#15803d' : '#b45309',
                      backgroundColor: settings.webhookSecretConfigured ? '#dcfce7' : '#fef3c7',
                    }}
                  >
                    {settings.webhookSecretConfigured
                      ? adminText(locale, 'billingKeyConfigured')
                      : adminText(locale, 'billingKeyNotConfigured')}
                  </span>
                )}
                <input
                  style={inputStyle}
                  type="password"
                  value={webhookSecretInput}
                  onChange={(e) => setWebhookSecretInput(e.target.value)}
                  placeholder="whsec_..."
                  autoComplete="off"
                />
              </label>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>
                {adminText(locale, 'billingKeyKeepNote')}
              </p>
              <button
                onClick={() => void handleSaveSettings()}
                disabled={settingsSaving}
                style={{ ...primaryButtonStyle, marginTop: 12 }}
              >
                <span style={adminButtonContentStyle}>
                  {settingsSaving && <ButtonSpinner />}
                  {adminText(locale, 'billingSaveButton')}
                </span>
              </button>
              {settingsMessage && <p style={adminFeedbackStyle}>{settingsMessage}</p>}
              {settings && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {adminText(locale, 'billingWebhookUrlLabel')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      marginTop: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <code
                      style={{
                        fontSize: 12.5,
                        backgroundColor: '#f5f3ff',
                        border: '1px solid #D9D4EC',
                        borderRadius: 8,
                        padding: '8px 10px',
                        wordBreak: 'break-all',
                        flex: 1,
                        minWidth: 240,
                      }}
                    >
                      {settings.webhookUrl}
                    </code>
                    <button
                      onClick={() => void handleCopy(settings.webhookUrl)}
                      style={secondaryButtonStyle}
                    >
                      {copiedUrl === settings.webhookUrl
                        ? adminText(locale, 'billingCopied')
                        : adminText(locale, 'billingCopyButton')}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 8, lineHeight: 1.7 }}>
                    {adminText(locale, 'billingWebhookEventsNote')}
                  </p>
                </div>
              )}
            </div>
          </section>

          {summary && (
            <section style={{ marginTop: 32 }}>
              <h2 style={sectionTitleStyle}>{adminText(locale, 'billingSummaryTitle')}</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <div style={{ ...cardStyle, padding: 20 }}>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    {adminText(locale, 'billingThisMonth', { month: summary.currentMonthKey })}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>
                    {adminText(locale, 'billingYen', {
                      amount: summary.currentMonthTotal.toLocaleString(),
                    })}
                  </div>
                </div>
                <div style={{ ...cardStyle, padding: 20 }}>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    {adminText(locale, 'billingLastMonth', { month: summary.previousMonthKey })}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>
                    {adminText(locale, 'billingYen', {
                      amount: summary.previousMonthTotal.toLocaleString(),
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section style={{ marginTop: 32 }}>
            <h2 style={sectionTitleStyle}>{adminText(locale, 'billingShopsTitle')}</h2>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 5, lineHeight: 1.7 }}>
              {adminText(locale, 'billingShopsNote')}
            </p>
            {loadMessage && <p style={adminErrorTextStyle}>{loadMessage}</p>}
            {exhibitors.length === 0 && (
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 12 }}>
                {adminText(locale, 'billingNoShops')}
              </p>
            )}
            {exhibitors.map((exhibitor) => {
              const billing = billingByExhibitor.get(exhibitor.id);
              const status = billing?.status ?? 'none';
              const badge = STATUS_BADGE[status];
              const hasSubscription =
                !!billing?.stripeSubscriptionId && status !== 'canceled';
              const isOneTimePaid =
                billing?.billingType === 'one-time' && status === 'paid';
              const selectedType: ShopBillingType =
                typeInputs[exhibitor.id] ?? billing?.billingType ?? 'subscription';
              const canIssue = !hasSubscription && !isOneTimePaid;
              return (
                <div key={exhibitor.id} style={{ ...cardStyle, marginTop: 12, padding: 20 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{exhibitor.name}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 999,
                        color: badge.color,
                        backgroundColor: badge.backgroundColor,
                      }}
                    >
                      {adminText(locale, badge.key)}
                    </span>
                    {billing && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 999,
                          color: '#5b21b6',
                          backgroundColor: '#ede9fe',
                        }}
                      >
                        {billing.billingType === 'one-time'
                          ? adminText(locale, 'billingTypeOneTime')
                          : adminText(locale, 'billingTypeSubscription')}
                      </span>
                    )}
                    {billing && billing.amount > 0 && (
                      <span style={{ fontSize: 13, color: '#475569' }}>
                        {billing.billingType === 'one-time'
                          ? adminText(locale, 'billingOneTimeAmountLabel')
                          : adminText(locale, 'billingAmountLabel')}
                        :{' '}
                        {adminText(locale, 'billingYen', {
                          amount: billing.amount.toLocaleString(),
                        })}
                      </span>
                    )}
                    {billing?.currentPeriodEnd &&
                      billing.billingType === 'subscription' &&
                      status === 'active' && (
                        <span style={{ fontSize: 12.5, color: '#64748b' }}>
                          {adminText(locale, 'billingPeriodEndLabel', {
                            date: formatDate(billing.currentPeriodEnd, locale),
                          })}
                        </span>
                      )}
                  </div>

                  {canIssue && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {adminText(locale, 'billingTypeLabel')}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          marginTop: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        {(
                          [
                            ['subscription', 'billingTypeSubscription'],
                            ['one-time', 'billingTypeOneTime'],
                          ] as Array<[ShopBillingType, AdminTextKey]>
                        ).map(([type, key]) => (
                          <label
                            key={type}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 14,
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="radio"
                              name={`billing-type-${exhibitor.id}`}
                              checked={selectedType === type}
                              onChange={() =>
                                setTypeInputs((current) => ({
                                  ...current,
                                  [exhibitor.id]: type,
                                }))
                              }
                            />
                            {adminText(locale, key)}
                          </label>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'flex-end',
                          marginTop: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <label style={{ ...labelStyle, marginBottom: 0, flex: '0 1 200px' }}>
                          {selectedType === 'one-time'
                            ? adminText(locale, 'billingOneTimeAmountLabel')
                            : adminText(locale, 'billingAmountLabel')}
                          <input
                            style={inputStyle}
                            type="number"
                            min={50}
                            step={10}
                            inputMode="numeric"
                            value={amountInputs[exhibitor.id] ?? ''}
                            onChange={(e) =>
                              setAmountInputs((current) => ({
                                ...current,
                                [exhibitor.id]: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <button
                          onClick={() => void handleIssue(exhibitor.id)}
                          disabled={issuingId === exhibitor.id}
                          style={primaryButtonStyle}
                        >
                          <span style={adminButtonContentStyle}>
                            {issuingId === exhibitor.id && <ButtonSpinner />}
                            {adminText(locale, 'billingIssueButton')}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {billing?.checkoutUrl && canIssue && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {adminText(locale, 'billingCheckoutUrlLabel')}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          marginTop: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <code
                          style={{
                            fontSize: 12.5,
                            backgroundColor: '#f5f3ff',
                            border: '1px solid #D9D4EC',
                            borderRadius: 8,
                            padding: '8px 10px',
                            wordBreak: 'break-all',
                            flex: 1,
                            minWidth: 240,
                          }}
                        >
                          {billing.checkoutUrl}
                        </code>
                        <button
                          onClick={() => void handleCopy(billing.checkoutUrl!)}
                          style={secondaryButtonStyle}
                        >
                          {copiedUrl === billing.checkoutUrl
                            ? adminText(locale, 'billingCopied')
                            : adminText(locale, 'billingCopyButton')}
                        </button>
                      </div>
                    </div>
                  )}

                  {hasSubscription && (
                    <div style={{ marginTop: 14 }}>
                      <button
                        onClick={() => void handleCancel(exhibitor.id)}
                        disabled={cancelingId === exhibitor.id}
                        style={dangerButtonStyle}
                      >
                        <span style={adminButtonContentStyle}>
                          {cancelingId === exhibitor.id && <ButtonSpinner />}
                          {adminText(locale, 'billingCancelButton')}
                        </span>
                      </button>
                    </div>
                  )}

                  {isOneTimePaid && (
                    <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 12, lineHeight: 1.7 }}>
                      {adminText(locale, 'billingOneTimePaidNote')}
                    </p>
                  )}

                  {rowMessages[exhibitor.id] && (
                    <p style={adminFeedbackStyle}>{rowMessages[exhibitor.id]}</p>
                  )}
                </div>
              );
            })}
          </section>

          <section style={{ marginTop: 32 }}>
            <h2 style={sectionTitleStyle}>{adminText(locale, 'billingPaymentsTitle')}</h2>
            {payments.length === 0 ? (
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 12 }}>
                {adminText(locale, 'billingPaymentsEmpty')}
              </p>
            ) : (
              <div style={{ ...cardStyle, marginTop: 12, padding: '6px 20px' }}>
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: '1px solid #f1f5f9',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {exhibitorName(payment.exhibitorId)}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {formatDateTime(payment.paidAt ?? payment.occurredAt, locale)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>
                        {adminText(locale, 'billingYen', {
                          amount: payment.amount.toLocaleString(),
                        })}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 999,
                          color: payment.status === 'paid' ? '#15803d' : '#b91c1c',
                          backgroundColor:
                            payment.status === 'paid' ? '#dcfce7' : '#fee2e2',
                        }}
                      >
                        {payment.status === 'paid'
                          ? adminText(locale, 'billingPaymentPaid')
                          : adminText(locale, 'billingPaymentFailed')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
