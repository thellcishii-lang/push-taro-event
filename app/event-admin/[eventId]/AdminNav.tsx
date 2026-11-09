'use client';

// app/event-admin/[eventId]/AdminNav.tsx
// 管理画面①②③とイベント設定の間の共通ナビ。
import { adminText } from '@/lib/ui-text';
import type { Locale } from '@/lib/i18n';
import { CapWarningBanner } from '@/components/CapWarningBanner';

const VIOLET = '#6D28D9';

const pillBaseStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '7px 14px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 999,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const pillLinkStyle: React.CSSProperties = {
  ...pillBaseStyle,
  backgroundColor: '#ffffff',
  border: '1px solid #ddd6fe',
  color: VIOLET,
};

const pillCurrentStyle: React.CSSProperties = {
  ...pillBaseStyle,
  backgroundColor: VIOLET,
  border: '1px solid #6D28D9',
  color: '#ffffff',
};

export function AdminNav({
  eventId,
  current,
  locale,
}: {
  eventId: string;
  current: string;
  locale: Locale;
}) {
  const items = [
    { key: '①', href: `/event-admin/${eventId}/push`, label: adminText(locale, 'navPush') },
    { key: '②', href: `/event-admin/${eventId}/schedule`, label: adminText(locale, 'navSchedule') },
    { key: '③', href: `/event-admin/${eventId}/coupons`, label: adminText(locale, 'navCoupons') },
    { key: '設定', href: '/event-admin', label: adminText(locale, 'navSettings') },
  ];
  return (
    <>
      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        {items.map((item) =>
          item.key === current ? (
            <span key={item.href} style={pillCurrentStyle} aria-current="page">
              {item.label}
            </span>
          ) : (
            <a key={item.href} href={item.href} style={pillLinkStyle}>
              {item.label}
            </a>
          ),
        )}
      </nav>
      <CapWarningBanner locale={locale} />
    </>
  );
}
