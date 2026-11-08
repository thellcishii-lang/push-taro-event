// lib/translate.ts
// 人が書く文（配信・クーポン）の自動翻訳。
//
// - 作成時に Cloud Translation API を呼び、翻訳を元のドキュメントへ
//   言語別マップ（例: titleI18n）として一緒に保存する。作成と同時に
//   翻訳が揃うので、即時プッシュでも翻訳待ちが起きない。
// - Firebase Extensions の Translate Text は 2027-03-31 で廃止
//   （インストール・編集不可）になるため使わない（2026-11-08 決定）。
// - 翻訳の失敗で本文の作成自体を止めない。失敗時は取れた分だけ
//   （または空マップ）を返し、原文で運用できるようにする。

import { getAdminAccessToken } from './firebase-admin';
import { isLocale, SUPPORTED_LOCALES, type Locale } from './i18n';

const TRANSLATE_URL =
  'https://translation.googleapis.com/language/translate/v2';

/** アプリの言語 → Google 翻訳の言語コード（中国語は簡体字 zh-CN を使う）。 */
const GOOGLE_LANGUAGE: Record<Locale, string> = {
  ja: 'ja',
  en: 'en',
  zh: 'zh-CN',
  ko: 'ko',
};

/** Google が返す検出言語コード → アプリの言語。対応外は null。 */
export function localeFromGoogleLanguage(code: unknown): Locale | null {
  if (typeof code !== 'string') return null;
  if (code === 'zh-CN' || code === 'zh-TW') return 'zh';
  return isLocale(code) ? code : null;
}

export interface TranslateDeps {
  fetchFn: typeof fetch;
  getAccessToken: () => Promise<string>;
}

interface TranslateApiResponse {
  data?: {
    translations?: Array<{
      translatedText?: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

/**
 * 原文を対応言語すべてへ翻訳し、言語別マップを返す。
 * 検出できた原文の言語には原文そのものを入れる（その言語への
 * 翻訳リクエストは検出後に送らない）。例外は投げない。
 */
export async function translateIntoLocales(
  text: string,
  deps: TranslateDeps,
): Promise<Partial<Record<Locale, string>>> {
  const source = text.trim();
  if (!source) return {};
  const result: Partial<Record<Locale, string>> = {};
  try {
    const token = await deps.getAccessToken();
    let detected: Locale | null = null;
    for (const target of SUPPORTED_LOCALES) {
      if (target === detected) continue;
      const response = await deps.fetchFn(TRANSLATE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: source,
          target: GOOGLE_LANGUAGE[target],
          format: 'text',
        }),
      });
      if (!response.ok) continue;
      const json = (await response.json()) as TranslateApiResponse;
      const item = json.data?.translations?.[0];
      if (!item?.translatedText) continue;
      if (detected === null) {
        detected = localeFromGoogleLanguage(item.detectedSourceLanguage);
        if (detected) result[detected] = source;
      }
      if (target !== detected) result[target] = item.translatedText;
    }
  } catch (error) {
    console.error('[translate] 翻訳に失敗しました', error);
  }
  return result;
}

/** 本番用の翻訳（サービスアカウントのトークン＋実 fetch）。 */
export async function translateText(
  text: string,
): Promise<Partial<Record<Locale, string>>> {
  return translateIntoLocales(text, {
    fetchFn: fetch,
    getAccessToken: getAdminAccessToken,
  });
}
