'use client';

// app/event-admin/page.tsx
// Push-taro EVENT の主催者向けイベント設定画面。
// イベントの一覧・作成・編集（開催期間／リセット方式／リセット時刻／上限／バックアップ保持日数／状態）。
// 作成は「下書きで作成」と「登録（開催中として作成）」の2ボタンで状態を明示する。
// 下書きはカードの「開催中にする」から公開でき、下書きと終了はカードから
// 削除できる（開催中は削除不可。削除は DELETE /api/events/[eventId]）。
// 編集はカードの「編集」ボタン（またはイベント名クリック）で選択して
// フォームへスクロール。イベント内の画面のサイドバーにあるイベント名は
// ?edit=<eventId> 付きで戻り、この画面が読み取って同じ編集を開く。
// 削除はカードと編集フォームの両方からできる（下書き・終了のみ）。
// 契約まわりの導線として、一覧の上にプラン変更（本家の契約管理への
// リンク）、各カードにクーポン追加購入（本家の購入ページへのリンク）を置く。
// 将来の管理画面3分割（プッシュ＋消込／予約／クーポン管理）の土台として、
// まずはイベント設定に絞った単独画面にしている。
// 同時に仕込めるイベントは3つまで（下書き＋開催中。終了は数えない）で、
// 上限の判定は lib/event.ts の canCreateAnotherEvent、強制は POST /api/events 側。
// 初回ログイン時（プロビジョニング直後）はパスワード変更が必須で、
// 変更が終わるまでこの画面自体をパスワード変更フォームに差し替える
// （判定は GET /api/organizers/me、変更系API側にも同じゲートがある）。
// 画面の固定文は4言語辞書（lib/ui-text.ts）。主催者の表示言語は
// この端末に保存される個人の選択（components/AdminLocale.tsx）。
// 見た目は承認済みモック準拠。ログイン後は共通シェル（components/AdminShell）
// を使い、PC は左サイドバー固定の2カラム、スマホはブランドバー＋
// メニュー開閉ボタンのアコーディオンになる。
// フィードバック文は、それを起こした操作のすぐ近くに出す
// （読込エラーは一覧の上、保存結果はフォーム内）。
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import PasswordInput from '@/components/PasswordInput';
import { AdminLanguageSelect, useAdminLocale } from '@/components/AdminLocale';
import { CapWarningBanner } from '@/components/CapWarningBanner';
import { AdminShell } from '@/components/AdminShell';
import { VisitorQr } from '@/components/VisitorQr';
import { AdminNav } from './[eventId]/AdminNav';
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
  admissionQrEnabled: boolean;
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
  admissionQrEnabled: false,
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
    admissionQrEnabled: event.admissionQrEnabled,
    subscriberCap: String(event.subscriberCap),
    backupRetentionDays: String(event.backupRetentionDays),
    status: event.status === 'live' ? 'live' : 'draft',
  };
}

const VIOLET = '#6D28D9';

// 契約まわりの手続きは本家（push-taro.com）側にある。クーポン管理画面と同値。
const HONKE_SHOP_URL = 'https://push-taro.com/shop';
const HONKE_COUPON_OPTION_URL = 'https://push-taro.com/event-option';
const COUPON_OPTION_MAX_CAP = 500;

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

const logoutButtonStyle: React.CSSProperties = {
  padding: '7px 14px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 999,
  border: '1px solid #E3DEF2',
  backgroundColor: '#ffffff',
  color: '#3F3D56',
  cursor: 'pointer',
};

const userEmailStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#64748b',
};

const cardActionBaseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 16px',
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 12,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const cardActionSolidStyle: React.CSSProperties = {
  ...cardActionBaseStyle,
  backgroundColor: VIOLET,
  color: '#ffffff',
  boxShadow: '0 3px 10px rgba(109, 40, 217, 0.25)',
};

const cardActionOutlineStyle: React.CSSProperties = {
  ...cardActionBaseStyle,
  backgroundColor: '#ffffff',
  border: '1.5px solid #C4B5FD',
  color: VIOLET,
};

const cardActionButtonStyle: React.CSSProperties = {
  ...cardActionOutlineStyle,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const cardActionDangerStyle: React.CSSProperties = {
  ...cardActionBaseStyle,
  backgroundColor: '#ffffff',
  border: '1.5px solid #F3B4B4',
  color: '#B91C1C',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '12px 22px',
  fontWeight: 700,
  fontSize: 15,
  backgroundColor: '#ffffff',
  color: VIOLET,
  border: '1.5px solid #C4B5FD',
  borderRadius: 12,
  cursor: 'pointer',
};

const qrButtonStyle: React.CSSProperties = {
  ...cardActionOutlineStyle,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const noticeStyle: React.CSSProperties = {
  border: '1px solid #fcd34d',
  backgroundColor: '#fffbeb',
  color: '#92400e',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 13,
};

function statusBadgeColors(status: EventConfig['status']): {
  bg: string;
  color: string;
  dot: string;
} {
  if (status === 'live') return { bg: '#D9F5E3', color: '#15803d', dot: '#22C55E' };
  if (status === 'ended') return { bg: '#E8EAF1', color: '#5B6472', dot: '#94A3B8' };
  return { bg: '#ECECF1', color: '#55565F', dot: '#9CA3AF' };
}

function PlaneIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </svg>
  );
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
  const [loadMessage, setLoadMessage] = useState('');
  const [busy, setBusy] = useState(false);
  // イベントフォームの送信中状態（保存／下書きで作成／登録で作成を区別する）。
  const [formBusy, setFormBusy] = useState<null | 'save' | 'draft' | 'live'>(null);
  // カード上のアクション（開催中にする／削除）の処理中と結果表示。
  const [cardBusy, setCardBusy] = useState<{ id: string; action: 'publish' | 'delete' } | null>(null);
  const [cardFeedback, setCardFeedback] = useState<{ id: string; text: string; error: boolean } | null>(null);
  // 初回パスワード変更ゲートの状態（unknown の間は管理画面を出さない）。
  const [passwordGate, setPasswordGate] = useState<'unknown' | 'required' | 'clear'>('unknown');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [gateMessage, setGateMessage] = useState('');

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
      setLoadMessage('');
    } catch (e) {
      setLoadMessage(e instanceof Error ? e.message : adminText(locale, 'loadFailed'));
    }
  }, [user, callApi, locale]);

  // ログインしたら初回パスワード変更が必要かどうかを確認する。
  useEffect(() => {
    if (!user) {
      setPasswordGate('unknown');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await callApi('/api/organizers/me');
        if (!cancelled) {
          setPasswordGate(data.mustChangePassword ? 'required' : 'clear');
        }
      } catch {
        // 判定に失敗しても管理画面は開けるようにする
        // （変更系API側のゲートが担保になっている）。
        if (!cancelled) setPasswordGate('clear');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, callApi]);

  useEffect(() => {
    if (user && passwordGate === 'clear') void loadEvents();
  }, [user, passwordGate, loadEvents]);

  // 編集フォーム（#event-form）までスクロールする。カードの「編集」と
  // イベント名クリック、?edit= ディープリンクで共用する。
  const scrollToEventForm = useCallback(() => {
    requestAnimationFrame(() => {
      document
        .getElementById('event-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // イベント内の画面の「イベント設定」から ?edit=<eventId> で戻ってきたら、
  // そのイベントを選択して編集フォームを開く（初回のみ）。
  const editParamApplied = useRef(false);
  useEffect(() => {
    if (editParamApplied.current || events.length === 0) return;
    editParamApplied.current = true;
    const editId = new URLSearchParams(window.location.search).get('edit');
    if (!editId) return;
    const target = events.find((e) => e.id === editId);
    if (!target) return;
    setSelectedId(target.id);
    setForm(toForm(target));
    setMessage('');
    scrollToEventForm();
  }, [events, scrollToEventForm]);

  const handlePasswordChange = async () => {
    if (!user) return;
    setGateMessage('');
    if (newPassword.length < 6) {
      setGateMessage(adminText(locale, 'passwordTooShort'));
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setGateMessage(adminText(locale, 'passwordMismatch'));
      return;
    }
    setBusy(true);
    try {
      await updatePassword(user, newPassword);
      await callApi('/api/organizers/me/password-changed', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      const code =
        e && typeof e === 'object' && 'code' in e
          ? String((e as { code?: unknown }).code ?? '')
          : '';
      if (code === 'auth/requires-recent-login') {
        setGateMessage(adminText(locale, 'passwordChangeRelogin'));
      } else if (code.startsWith('auth/')) {
        setGateMessage(adminText(locale, 'passwordChangeFailed'));
      } else if (e instanceof Error && e.message) {
        setGateMessage(e.message);
      } else {
        setGateMessage(adminText(locale, 'passwordChangeFailed'));
      }
      setBusy(false);
    }
  };

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

  const buildPayload = () => ({
    name: form.name,
    startDate: form.startDate,
    endDate: form.endDate,
    resetMode: form.resetMode,
    resetTime: form.resetTime,
    defaultLocale: form.defaultLocale,
    admissionQrEnabled: form.admissionQrEnabled,
    // 購読者上限は契約枠（料金の軸）なので主催者からは送信しない。運営側のみ変更可。
    backupRetentionDays: Number(form.backupRetentionDays),
  });

  const handleSave = async () => {
    if (!selectedId) return;
    setFormBusy('save');
    setMessage('');
    try {
      await callApi(`/api/events/${selectedId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...buildPayload(), status: form.status }),
      });
      setMessage(adminText(locale, 'savedMessage'));
      await loadEvents();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'saveFailed'));
    } finally {
      setFormBusy(null);
    }
  };

  // 新規作成は「下書き」と「登録（開催中として作成）」の2ボタンから、
  // 作りたい状態を明示して作る（以前は常に下書きで作られていた）。
  const handleCreate = async (status: 'draft' | 'live') => {
    setFormBusy(status);
    setMessage('');
    try {
      const data = await callApi('/api/events', {
        method: 'POST',
        body: JSON.stringify({ ...buildPayload(), status }),
      });
      setSelectedId(data.event.id);
      setMessage(
        adminText(locale, status === 'live' ? 'createdLiveMessage' : 'createdMessage'),
      );
      await loadEvents();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : adminText(locale, 'saveFailed'));
    } finally {
      setFormBusy(null);
    }
  };

  // 下書きカードの「開催中にする」。既存の更新 API で状態だけを変え、
  // 成功したらカード表示を即時に切り替える。失敗理由はカードの近くに出す。
  const handlePublish = async (event: EventConfig) => {
    setCardBusy({ id: event.id, action: 'publish' });
    setCardFeedback(null);
    try {
      const data = await callApi(`/api/events/${event.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'live' }),
      });
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? (data.event as EventConfig) : e)),
      );
      setCardFeedback({
        id: event.id,
        text: adminText(locale, 'publishedMessage'),
        error: false,
      });
    } catch (e) {
      setCardFeedback({
        id: event.id,
        text: e instanceof Error ? e.message : adminText(locale, 'publishFailed'),
        error: true,
      });
    } finally {
      setCardBusy(null);
    }
  };

  // 下書き・終了イベントの削除。確認ダイアログ（イベント名＋復元不可の明示）を
  // 挟み、成功したら一覧から取り除く。編集中のイベントを消した場合は
  // フォームを新規作成の状態に戻す。
  const handleDelete = async (event: EventConfig) => {
    if (!window.confirm(adminText(locale, 'deleteConfirm', { name: event.name }))) return;
    setCardBusy({ id: event.id, action: 'delete' });
    setCardFeedback(null);
    try {
      await callApi(`/api/events/${event.id}`, { method: 'DELETE' });
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      if (selectedId === event.id) {
        setSelectedId(null);
        setForm(emptyForm);
        setMessage(adminText(locale, 'deletedMessage'));
      }
    } catch (e) {
      setCardFeedback({
        id: event.id,
        text: e instanceof Error ? e.message : adminText(locale, 'deleteFailed'),
        error: true,
      });
    } finally {
      setCardBusy(null);
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
            <PasswordInput style={inputStyle} value={password} onChange={setPassword} autoComplete="current-password" />
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

  if (passwordGate === 'unknown') {
    return <main style={containerStyle}>{uiText(locale, 'loading')}</main>;
  }

  if (passwordGate === 'required') {
    return (
      <main style={{ ...containerStyle, maxWidth: 480 }}>
        <AdminBrandBar
          right={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={userEmailStyle}>{user.email}</span>
              <AdminLanguageSelect locale={locale} onChange={setLocale} />
              <button onClick={() => void signOut(auth)} style={logoutButtonStyle}>
                {adminText(locale, 'logoutButton')}
              </button>
            </div>
          }
        />
        <section style={{ ...cardStyle, padding: 24, marginTop: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>
            {adminText(locale, 'passwordChangeTitle')}
          </h2>
          <p style={{ fontSize: 14, color: '#475569', margin: '0 0 16px' }}>
            {adminText(locale, 'passwordChangeBody')}
          </p>
          <label style={labelStyle}>
            {adminText(locale, 'newPasswordLabel')}
            <PasswordInput style={inputStyle} value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
          </label>
          <label style={labelStyle}>
            {adminText(locale, 'newPasswordConfirmLabel')}
            <PasswordInput style={inputStyle} value={newPasswordConfirm} onChange={setNewPasswordConfirm} autoComplete="new-password" />
          </label>
          <button onClick={handlePasswordChange} disabled={busy} style={{ ...primaryButtonStyle, width: '100%' }}>
            <span style={adminButtonContentStyle}>
              {busy && <ButtonSpinner />}
              {adminText(locale, 'passwordChangeButton')}
            </span>
          </button>
          {gateMessage && <p style={{ color: '#b91c1c', marginTop: 12, fontSize: 14 }}>{gateMessage}</p>}
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
    <AdminShell
      locale={locale}
      email={user.email}
      onLogout={() => void signOut(auth)}
      languageSelect={<AdminLanguageSelect locale={locale} onChange={setLocale} />}
      nav={<AdminNav current="設定" locale={locale} />}
    >
      <h1 style={adminPageTitleStyle}>{adminText(locale, 'adminTitle')}</h1>

      <CapWarningBanner locale={locale} />

      {/* 契約まわりの導線: プラン変更は本家の契約管理へリンクする */}
      <section
        style={{
          ...cardStyle,
          marginTop: 16,
          padding: '16px 20px',
          backgroundColor: '#F5F3FF',
          border: '1px solid #DDD6FE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
          {adminText(locale, 'contractActionsNote')}
        </p>
        <a
          href={HONKE_SHOP_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            ...primaryButtonStyle,
            display: 'inline-block',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {adminText(locale, 'planChangeButton')}
        </a>
      </section>

      <section style={{ marginTop: 22 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{adminText(locale, 'eventsListTitle')}</h2>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 5 }}>
              ⓘ{' '}
              {adminText(locale, 'concurrentCapNote', {
                cap: String(MAX_CONCURRENT_EVENTS),
                active: String(activeCount),
              })}
            </p>
          </div>
          {capReached && (
            <p style={{ ...noticeStyle, margin: 0 }}>
              {adminText(locale, 'concurrentCapReached', { cap: String(MAX_CONCURRENT_EVENTS) })}
            </p>
          )}
        </div>
        {loadMessage && <p style={adminErrorTextStyle}>{loadMessage}</p>}
        {events.length === 0 && <p style={{ fontSize: 13, color: '#64748b' }}>{adminText(locale, 'noEvents')}</p>}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '14px 0 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '22px 14px',
          }}
        >
          {events.map((event) => {
            const badge = statusBadgeColors(event.status);
            return (
              <li
                key={event.id}
                style={{
                  ...cardStyle,
                  position: 'relative',
                  padding: '22px 20px 18px',
                  ...(event.id === selectedId
                    ? { border: '2px solid #6D28D9' }
                    : null),
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: -11,
                    right: 16,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 999,
                    backgroundColor: badge.bg,
                    color: badge.color,
                    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.12)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: badge.dot,
                    }}
                  />
                  {statusText(event.status)}
                </span>
                <button
                  onClick={() => {
                    setSelectedId(event.id);
                    setForm(toForm(event));
                    setMessage('');
                    scrollToEventForm();
                  }}
                  style={{
                    fontWeight: 800,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 19,
                    color: '#0f172a',
                    padding: 0,
                    textAlign: 'left',
                    letterSpacing: -0.3,
                  }}
                >
                  {event.name}
                </button>
                <div
                  style={{
                    border: '1px solid #E7E3F4',
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginTop: 12,
                  }}
                >
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
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
                  <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
                    <span style={{ fontWeight: 600 }}>{adminText(locale, 'subscriberCapLabel')}</span>{' '}
                    {Number(event.subscriberCap).toLocaleString('ja-JP')}
                    {adminText(locale, 'peopleSuffix')}
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={`/event-admin/${event.id}/push`} style={cardActionSolidStyle}>
                    <PlaneIcon />
                    {adminText(locale, 'navPush')}
                  </a>
                  <a href={`/event-admin/${event.id}/schedule`} style={cardActionOutlineStyle}>
                    {adminText(locale, 'navSchedule')}
                  </a>
                  <a href={`/event-admin/${event.id}/coupons`} style={cardActionOutlineStyle}>
                    {adminText(locale, 'navCoupons')}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(event.id);
                      setForm(toForm(event));
                      setMessage('');
                      scrollToEventForm();
                    }}
                    style={cardActionButtonStyle}
                  >
                    {adminText(locale, 'editButton')}
                  </button>
                  {event.couponCap < COUPON_OPTION_MAX_CAP && (
                    <a
                      href={`${HONKE_COUPON_OPTION_URL}?eventId=${event.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={cardActionOutlineStyle}
                    >
                      {adminText(locale, 'couponPurchaseButton')}
                    </a>
                  )}
                </div>
                {(event.status === 'draft' || event.status === 'ended') && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {event.status === 'draft' && (
                      <button
                        onClick={() => void handlePublish(event)}
                        disabled={cardBusy?.id === event.id}
                        style={cardActionButtonStyle}
                      >
                        <span style={adminButtonContentStyle}>
                          {cardBusy?.id === event.id && cardBusy.action === 'publish' && (
                            <ButtonSpinner />
                          )}
                          {adminText(locale, 'publishButton')}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => void handleDelete(event)}
                      disabled={cardBusy?.id === event.id}
                      style={cardActionDangerStyle}
                    >
                      <span style={adminButtonContentStyle}>
                        {cardBusy?.id === event.id && cardBusy.action === 'delete' && (
                          <ButtonSpinner />
                        )}
                        {adminText(locale, 'deleteButton')}
                      </span>
                    </button>
                  </div>
                )}
                {cardFeedback?.id === event.id && (
                  <p
                    style={{
                      fontSize: 13,
                      margin: '10px 0 0',
                      color: cardFeedback.error ? '#b91c1c' : '#15803d',
                    }}
                  >
                    {cardFeedback.text}
                  </p>
                )}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: '1px solid #E7E3F4',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#475569',
                      textAlign: 'center',
                    }}
                  >
                    {adminText(locale, 'visitorQrTitle')}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <VisitorQr
                      eventId={event.id}
                      locale={locale}
                      size={112}
                      buttonStyle={qrButtonStyle}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="event-form" style={{ ...cardStyle, marginTop: 28, padding: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 14px' }}>
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
        <fieldset style={{ border: '1px solid #E7E3F4', borderRadius: 12, padding: '12px 14px', margin: '0 0 12px', backgroundColor: '#F7F5FD' }}>
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
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={form.admissionQrEnabled}
              onChange={(e) => setForm({ ...form, admissionQrEnabled: e.target.checked })}
            />{' '}
            {adminText(locale, 'admissionQrLabel')}
          </label>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {adminText(locale, 'admissionQrNote')}
          </span>
        </div>
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
        {selected ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleSave}
              disabled={formBusy !== null}
              style={primaryButtonStyle}
            >
              <span style={adminButtonContentStyle}>
                {formBusy === 'save' && <ButtonSpinner />}
                {adminText(locale, 'saveButton')}
              </span>
            </button>
            {(selected.status === 'draft' || selected.status === 'ended') && (
              <button
                type="button"
                onClick={() => void handleDelete(selected)}
                disabled={cardBusy?.id === selected.id}
                style={{
                  ...secondaryButtonStyle,
                  border: '1.5px solid #F3B4B4',
                  color: '#B91C1C',
                }}
              >
                <span style={adminButtonContentStyle}>
                  {cardBusy?.id === selected.id && cardBusy.action === 'delete' && (
                    <ButtonSpinner />
                  )}
                  {adminText(locale, 'deleteEventButton')}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => void handleCreate('draft')}
              disabled={formBusy !== null || capReached}
              style={secondaryButtonStyle}
            >
              <span style={adminButtonContentStyle}>
                {formBusy === 'draft' && <ButtonSpinner />}
                {adminText(locale, 'createDraftButton')}
              </span>
            </button>
            <button
              onClick={() => void handleCreate('live')}
              disabled={formBusy !== null || capReached}
              style={primaryButtonStyle}
            >
              <span style={adminButtonContentStyle}>
                {formBusy === 'live' && <ButtonSpinner />}
                {adminText(locale, 'createLiveButton')}
              </span>
            </button>
          </div>
        )}
        {message && <p style={adminFeedbackStyle}>{message}</p>}
      </section>
    </AdminShell>
  );
}
