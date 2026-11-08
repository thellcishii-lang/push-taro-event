'use client';

// components/AdminLocale.tsx
// 主催者 管理画面の表示言語（個人の選択）。
// 主催者にはサーバー側のプロフィール置き場が無いため、この端末の
// localStorage に保存する。全管理画面で共通のキーを使う。
import { useEffect, useState } from 'react';
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  normalizeLocale,
  type Locale,
} from '@/lib/i18n';
import { uiText } from '@/lib/ui-text';

const STORAGE_KEY = 'event-admin-locale';

export function useAdminLocale(): [Locale, (next: Locale) => void] {
  const [locale, setLocaleState] = useState<Locale>('ja');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLocaleState(normalizeLocale(stored));
    } catch {
      // 保存が読めなくても日本語で続行する
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存できなくても画面の切替は有効にする
    }
  };

  return [locale, setLocale];
}

export function AdminLanguageSelect({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (next: Locale) => void;
}) {
  return (
    <select
      aria-label={uiText(locale, 'language')}
      value={locale}
      onChange={(e) => onChange(e.target.value as Locale)}
      style={{
        padding: '6px 10px',
        fontSize: 14,
        borderRadius: 999,
        border: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
