// app/event-admin/[eventId]/AdminNav.tsx
// 管理画面①②③とイベント設定の間の共通ナビ。
export function AdminNav({ eventId, current }: { eventId: string; current: string }) {
  const items = [
    { key: '①', href: `/event-admin/${eventId}/push`, label: '① プッシュ＋消込' },
    { key: '②', href: `/event-admin/${eventId}/schedule`, label: '② 予約配信' },
    { key: '③', href: `/event-admin/${eventId}/coupons`, label: '③ クーポン管理' },
    { key: '設定', href: '/event-admin', label: 'イベント設定' },
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
