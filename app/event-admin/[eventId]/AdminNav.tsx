'use client';

// app/event-admin/[eventId]/AdminNav.tsx
// 管理画面①②③とイベント設定の間の共通ナビ。
import { adminText } from '@/lib/ui-text';
import type { Locale } from '@/lib/i18n';

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
    <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 13 }}>
      {items.map((item) =>
        item.key === current ? (
          <strong key={item.href}>{item.label}</strong>
        ) : (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ),
      )}
    </nav>
  );
}
