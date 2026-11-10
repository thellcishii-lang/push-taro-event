'use client';

// components/AdminShell.tsx
// 主催者管理画面（ログイン後）の共通シェル。承認済みモック準拠のレイアウト:
// - PC: 左サイドバー固定の2カラム。サイドバー上部にブランド、
//   その下にメニュー（AdminNav、現在地はバイオレット塗り）、
//   最下部にログイン中アカウントのカード＋言語切替＋ログアウト。
// - スマホ: サイドバーは畳み、ブランドバー＋メニュー開閉ボタンの
//   アコーディオンにする（展開するとメニューとアカウント操作が出る）。
// 出し分けのメディアクエリは app/globals.css の .admin-shell* にある。
// ログイン画面と初回パスワード変更ゲートはこのシェルを使わず、
// 従来どおり各画面側で描画する。
import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import { adminText } from '@/lib/ui-text';
import type { Locale } from '@/lib/i18n';
import { ADMIN_VIOLET, AdminBrandBar, AdminBrandMark } from './AdminBrand';

const sidebarLinkRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 4px',
  fontSize: 13.5,
  fontWeight: 600,
  color: '#3F3D56',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const logoutPillStyle: React.CSSProperties = {
  padding: '7px 14px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 999,
  border: '1px solid #E3DEF2',
  backgroundColor: '#ffffff',
  color: '#3F3D56',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const userEmailStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#64748b',
  wordBreak: 'break-all',
};

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

function avatarInitials(email: string | null): string {
  if (!email) return 'AD';
  const local = email.split('@')[0] ?? '';
  const chars = local.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
  return chars || 'AD';
}

export function AdminShell({
  locale,
  email,
  onLogout,
  languageSelect,
  nav,
  children,
}: {
  locale: Locale;
  email: string | null;
  onLogout: () => void;
  languageSelect: ReactNode;
  /** AdminNav の要素。サイドバー側は plain 指定で複製して使う。 */
  nav?: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // サイドバー内ではカード枠なし（plain）のメニューにする。
  const sidebarNav = isValidElement(nav)
    ? cloneElement(nav as ReactElement, { plain: true } as Record<string, unknown>)
    : nav;

  const accountRow = (
    <>
      <span style={userEmailStyle}>{email}</span>
      {languageSelect}
      <button onClick={onLogout} style={logoutPillStyle}>
        {adminText(locale, 'logoutButton')}
      </button>
    </>
  );

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '2px 6px 0' }}>
          <AdminBrandMark size={46} />
          <div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: '#17132B',
                letterSpacing: -0.3,
                lineHeight: 1.12,
              }}
            >
              Push-taro
              <br />
              EVENT
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: '#8A84A6',
                letterSpacing: 2.4,
                marginTop: 3,
              }}
            >
              ORGANIZER CONSOLE
            </div>
          </div>
        </div>

        {nav && (
          <>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#8A84A6',
                margin: '26px 6px 0',
              }}
            >
              {adminText(locale, 'menuLabel')}
            </div>
            {sidebarNav}
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#F1EEFA',
              borderRadius: 14,
              padding: '12px 14px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: ADMIN_VIOLET,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {avatarInitials(email)}
            </span>
            <span style={{ ...userEmailStyle, color: '#3F3D56' }}>{email}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            {languageSelect}
            <button onClick={onLogout} style={sidebarLinkRowStyle}>
              <LogoutIcon />
              {adminText(locale, 'logoutButton')}
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-shell__mobilebar">
        <AdminBrandBar
          right={
            nav ? (
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                style={{
                  ...logoutPillStyle,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: ADMIN_VIOLET,
                  border: '1px solid #C4B5FD',
                  fontWeight: 700,
                }}
              >
                <MenuIcon open={menuOpen} />
                {adminText(locale, 'menuLabel')}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {accountRow}
              </div>
            )
          }
        />
        {nav && menuOpen && (
          <div>
            {nav}
            <div
              style={{
                marginTop: 12,
                backgroundColor: '#ffffff',
                border: '1px solid #EAE7F5',
                borderRadius: 18,
                boxShadow: '0 2px 12px rgba(60, 30, 120, 0.07)',
                padding: '12px 14px',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {accountRow}
            </div>
          </div>
        )}
      </div>

      <main className="admin-shell__main">
        <div className="admin-shell__content">{children}</div>
      </main>
    </div>
  );
}
