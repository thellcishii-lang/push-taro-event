// EVENT の多言語基盤（ja / en / zh / ko）。
//
// 言語の決まり方:
// - イベントごとにデフォルト言語があり、主催者が設定する（EventConfig.defaultLocale）
// - 主催者・出店者・購読者は各自の言語を持て、デフォルトを上書きする（個人の選択が優先）
// - プッシュ本文のような言語別コンテンツは、無い言語ではデフォルト言語→日本語の順にフォールバックする

export type Locale = 'ja' | 'en' | 'zh' | 'ko';

export const SUPPORTED_LOCALES: readonly Locale[] = ['ja', 'en', 'zh', 'ko'];

export const DEFAULT_LOCALE: Locale = 'ja';

export const LOCALE_LABELS: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
  zh: '中文',
  ko: '한국어',
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/** 不正な値はフォールバック（既定は日本語）に倒す。 */
export function normalizeLocale(
  value: unknown,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  return isLocale(value) ? value : fallback;
}

/**
 * 実効言語を決める：個人の選択 > イベントのデフォルト > 日本語。
 * 引数は未検証の値でもよい（内部で正規化する）。
 */
export function resolveLocale(personal?: unknown, eventDefault?: unknown): Locale {
  if (isLocale(personal)) return personal;
  return normalizeLocale(eventDefault);
}

/**
 * 言語別の文言マップから実効言語に合う文言を選ぶ。
 * 実効言語 → イベントのデフォルト → 日本語 → その他、の順に探し、
 * 空文字・未設定は無いものとして次へ進む。
 */
export function pickLocalizedText(
  texts: Partial<Record<Locale, string>>,
  locale: Locale,
  eventDefault?: unknown,
): string {
  const candidates: Locale[] = [
    locale,
    normalizeLocale(eventDefault),
    DEFAULT_LOCALE,
    ...SUPPORTED_LOCALES,
  ];
  for (const candidate of candidates) {
    const text = texts[candidate];
    if (typeof text === 'string' && text.trim()) return text;
  }
  return '';
}
