'use client';

// components/CapWarningBanner.tsx
// 一時上げのリバートで購読者枠が戻る際、開催中イベントの登録者数が
// 戻し先の枠をすでに超えている場合に表示する警告バナー。
// 警告が無い（または取得に失敗した）場合は何も描画しない。
// 延長操作は EVENT 側では行わず、本家のプラン画面へ誘導する。
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { adminText } from '@/lib/ui-text';
import type { Locale } from '@/lib/i18n';
import type { CapWarning } from '@/lib/cap-warning';

const HONKE_SHOP_URL = 'https://push-taro.com/event-account';

const DATE_LOCALES: Record<Locale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  zh: 'zh-CN',
  ko: 'ko-KR',
};

function formatDate(value: string, locale: Locale): string {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(time));
}

const bannerStyle: React.CSSProperties = {
  marginTop: 16,
  padding: '16px 18px',
  backgroundColor: '#fffbeb',
  border: '1px solid #f59e0b',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(60, 30, 120, 0.07)',
  color: '#92400e',
};

const extendButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: 10,
  padding: '9px 18px',
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 12,
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  textDecoration: 'none',
};

export function CapWarningBanner({ locale }: { locale: Locale }) {
  const [warning, setWarning] = useState<CapWarning | null>(null);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      void (async () => {
        try {
          const idToken = await user.getIdToken();
          const res = await fetch('/api/event-admin/cap-warning', {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!res.ok) return;
          const data = await res.json().catch(() => ({}));
          if (!cancelled) setWarning(data.warning ?? null);
        } catch {
          // 警告が取得できなくても管理画面自体は使えるようにする。
        }
      })();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  if (!warning) return null;

  return (
    <section role="alert" style={bannerStyle}>
      <div style={{ fontWeight: 800, fontSize: 14 }}>
        ⚠ {adminText(locale, 'capWarningTitle')}
      </div>
      <p style={{ fontSize: 13, margin: '6px 0 0', lineHeight: 1.6 }}>
        {adminText(locale, 'capWarningBody', {
          date: formatDate(warning.revertDate, locale),
          cap: warning.restoredSubscriberCap.toLocaleString(),
        })}
      </p>
      <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
        {warning.events.map((event) => (
          <li key={event.eventId}>
            {adminText(locale, 'capWarningEventLine', {
              name: event.name,
              count: event.subscriberCount.toLocaleString(),
            })}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 13, margin: '8px 0 0', lineHeight: 1.6 }}>
        {adminText(locale, 'capWarningGuidance')}
      </p>
      <a
        href={HONKE_SHOP_URL}
        target="_blank"
        rel="noreferrer"
        style={extendButtonStyle}
      >
        {adminText(locale, 'capWarningExtendButton')}
      </a>
    </section>
  );
}
