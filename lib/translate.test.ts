import { describe, expect, it, vi } from 'vitest';
import {
  localeFromGoogleLanguage,
  translateIntoLocales,
  type TranslateDeps,
} from './translate';

type FakeItem = { translatedText: string; detectedSourceLanguage?: string };

/** target コードごとの応答を返すフェイク fetch。null なら HTTP エラー。 */
function fakeFetch(responder: (target: string) => FakeItem | null) {
  return vi.fn(async (_url: unknown, init?: { body?: string }) => {
    const target = JSON.parse(init?.body ?? '{}').target as string;
    const item = responder(target);
    if (!item) {
      return { ok: false, status: 500, json: async () => ({}) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ data: { translations: [item] } }),
    };
  });
}

function deps(fetchFn: unknown): TranslateDeps {
  return {
    fetchFn: fetchFn as unknown as TranslateDeps['fetchFn'],
    getAccessToken: async () => 'token',
  };
}

describe('localeFromGoogleLanguage', () => {
  it('zh-CN / zh-TW は zh に寄せる', () => {
    expect(localeFromGoogleLanguage('zh-CN')).toBe('zh');
    expect(localeFromGoogleLanguage('zh-TW')).toBe('zh');
  });
  it('対応言語はそのまま、対応外と不正値は null', () => {
    expect(localeFromGoogleLanguage('ja')).toBe('ja');
    expect(localeFromGoogleLanguage('ko')).toBe('ko');
    expect(localeFromGoogleLanguage('fr')).toBeNull();
    expect(localeFromGoogleLanguage(undefined)).toBeNull();
    expect(localeFromGoogleLanguage(42)).toBeNull();
  });
});

describe('translateIntoLocales', () => {
  it('空文字は翻訳せず空マップ', async () => {
    const fetchFn = fakeFetch(() => null);
    await expect(translateIntoLocales('  ', deps(fetchFn))).resolves.toEqual({});
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('日本語の原文は原文を ja に入れ、他言語を翻訳する', async () => {
    const fetchFn = fakeFetch((target) => {
      if (target === 'ja')
        return { translatedText: 'こんにちは', detectedSourceLanguage: 'ja' };
      if (target === 'en') return { translatedText: 'Hello' };
      if (target === 'zh-CN') return { translatedText: '你好' };
      if (target === 'ko') return { translatedText: '안녕하세요' };
      return null;
    });
    const result = await translateIntoLocales('こんにちは', deps(fetchFn));
    expect(result).toEqual({
      ja: 'こんにちは',
      en: 'Hello',
      zh: '你好',
      ko: '안녕하세요',
    });
  });

  it('英語の原文は検出後に en へのリクエストを送らない', async () => {
    const fetchFn = fakeFetch((target) => {
      if (target === 'ja')
        return { translatedText: 'こんにちは', detectedSourceLanguage: 'en' };
      if (target === 'zh-CN') return { translatedText: '你好' };
      if (target === 'ko') return { translatedText: '안녕하세요' };
      return { translatedText: 'SHOULD-NOT-BE-USED' };
    });
    const result = await translateIntoLocales('Hello', deps(fetchFn));
    expect(result).toEqual({
      en: 'Hello',
      ja: 'こんにちは',
      zh: '你好',
      ko: '안녕하세요',
    });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('中国語の原文（zh-CN 検出）は zh に原文を入れる', async () => {
    const fetchFn = fakeFetch((target) => {
      if (target === 'ja')
        return { translatedText: 'こんにちは', detectedSourceLanguage: 'zh-CN' };
      if (target === 'en') return { translatedText: 'Hello' };
      if (target === 'ko') return { translatedText: '안녕하세요' };
      return null;
    });
    const result = await translateIntoLocales('你好', deps(fetchFn));
    expect(result.zh).toBe('你好');
    expect(result.en).toBe('Hello');
  });

  it('全リクエスト失敗でも例外なく空マップ', async () => {
    const fetchFn = fakeFetch(() => null);
    await expect(
      translateIntoLocales('こんにちは', deps(fetchFn)),
    ).resolves.toEqual({});
  });

  it('トークン取得の失敗でも例外なく空マップ', async () => {
    const fetchFn = fakeFetch(() => null);
    const broken: TranslateDeps = {
      fetchFn: fetchFn as unknown as TranslateDeps['fetchFn'],
      getAccessToken: async () => {
        throw new Error('no credential');
      },
    };
    await expect(translateIntoLocales('こんにちは', broken)).resolves.toEqual({});
  });
});
