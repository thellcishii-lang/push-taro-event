'use client';

// app/event-admin/[eventId]/AdminNav.tsx
// 管理画面①②③とイベント設定の間の共通ナビ。
// AdminShell のサイドバー（PC）とアコーディオン（スマホ）の中に置かれる。
// plain=true のときはサイドバー用にカード枠なし、通常はスマホ用に
// 白カードの中にアイコン付きメニューを縦に並べる。
// 現在地はどちらもバイオレットの塗りつぶしで示す（承認済みモック準拠）。
// 構造: 先頭は常に「イベント設定」（= 主催者トップ。イベント一覧がTOP）。
// イベント内の画面では、その下にイベント名（そのイベントの編集フォーム
// への入口）→ プッシュ＋消込 → 予約配信 → クーポン管理 → 課金 → 設定 と並び、
// 今どのイベントの中にいるかがサイドバーで分かるようにする。
// eventId が無い場合（主催者トップ）はイベント設定のみを現在地として出す。
// 上限警告バナー（CapWarningBanner）は各画面のコンテンツ側で描画する。
import type { ReactNode } from 'react';
import { adminText } from '@/lib/ui-text';
import type { Locale } from '@/lib/i18n';
import { ADMIN_CARD_BORDER, ADMIN_CARD_SHADOW, ADMIN_VIOLET } from '@/components/AdminBrand';

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

const eventIcon = (
  <NavIcon>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </NavIcon>
);

const settingsIcon = (
  <NavIcon>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 4.6v2.6M12 16.8v2.6M4.6 12h2.6M16.8 12h2.6M6.8 6.8l1.8 1.8M15.4 15.4l1.8 1.8M17.2 6.8l-1.8 1.8M8.6 15.4l-1.8 1.8" />
  </NavIcon>
);

const pushIcon = (
  <NavIcon>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </NavIcon>
);

const scheduleIcon = (
  <NavIcon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </NavIcon>
);

const couponsIcon = (
  <NavIcon>
    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6z" />
    <path d="M13 5v2M13 11v2M13 17v2" />
  </NavIcon>
);

const billingIcon = (
  <NavIcon>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </NavIcon>
);

const gearIcon = (
  <NavIcon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </NavIcon>
);

const itemBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 14px',
  fontSize: 15,
  fontWeight: 700,
  borderRadius: 12,
  textDecoration: 'none',
};

const itemLinkStyle: React.CSSProperties = {
  ...itemBaseStyle,
  color: '#26233B',
};

const itemCurrentStyle: React.CSSProperties = {
  ...itemBaseStyle,
  backgroundColor: ADMIN_VIOLET,
  color: '#ffffff',
  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.30)',
};

const cardNavStyle: React.CSSProperties = {
  marginTop: 18,
  backgroundColor: '#ffffff',
  border: `1px solid ${ADMIN_CARD_BORDER}`,
  borderRadius: 18,
  boxShadow: ADMIN_CARD_SHADOW,
  padding: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const plainNavStyle: React.CSSProperties = {
  marginTop: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

export function AdminNav({
  eventId,
  eventName,
  current,
  locale,
  plain = false,
}: {
  eventId?: string;
  /** イベント内の画面で、そのイベント名を編集への入口として出す。 */
  eventName?: string;
  current: string;
  locale: Locale;
  /** サイドバー内ではカード枠なしにする（AdminShell が指定）。 */
  plain?: boolean;
}) {
  const items = [
    { key: '設定', href: '/event-admin', label: adminText(locale, 'navSettings'), icon: settingsIcon },
    ...(eventId && eventName
      ? [
          {
            key: 'イベント名',
            // そのイベントの編集フォームへ直接戻れる入口（一覧側が
            // ?edit= を読み取って選択＋スクロールする）。
            href: `/event-admin?edit=${eventId}`,
            label: eventName,
            icon: eventIcon,
          },
        ]
      : []),
    ...(eventId
      ? [
          { key: '①', href: `/event-admin/${eventId}/push`, label: adminText(locale, 'navPush'), icon: pushIcon },
          { key: '②', href: `/event-admin/${eventId}/schedule`, label: adminText(locale, 'navSchedule'), icon: scheduleIcon },
          { key: '③', href: `/event-admin/${eventId}/coupons`, label: adminText(locale, 'navCoupons'), icon: couponsIcon },
          // 課金は別料金オプション。ナビは常時出し、オプション OFF の
          // 契約では課金ページ側で案内文を出す（API が 404 を返す）。
          { key: '④', href: `/event-admin/${eventId}/billing`, label: adminText(locale, 'navBilling'), icon: billingIcon },
          { key: '⑤', href: `/event-admin/${eventId}/settings`, label: adminText(locale, 'navConfig'), icon: gearIcon },
        ]
      : []),
  ];
  return (
    <nav style={plain ? plainNavStyle : cardNavStyle}>
      {items.map((item) =>
        item.key === current ? (
          <span key={item.href} style={itemCurrentStyle} aria-current="page">
            <span style={{ display: 'flex', color: '#ffffff' }}>{item.icon}</span>
            {item.label}
          </span>
        ) : (
          <a key={item.href} href={item.href} style={itemLinkStyle}>
            <span style={{ display: 'flex', color: ADMIN_VIOLET }}>{item.icon}</span>
            {item.label}
          </a>
        ),
      )}
    </nav>
  );
}
