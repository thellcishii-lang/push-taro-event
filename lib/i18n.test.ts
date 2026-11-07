import { describe, expect, it } from 'vitest';
import {
  isLocale,
  normalizeLocale,
  pickLocalizedText,
  resolveLocale,
} from './i18n';

describe('isLocale', () => {
  it('対応言語のみ true', () => {
    expect(isLocale('ja')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('zh')).toBe(true);
    expect(isLocale('ko')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('JA')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(1)).toBe(false);
  });
});

describe('normalizeLocale', () => {
  it('不正な値はフォールバックになる', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('fr')).toBe('ja');
    expect(normalizeLocale(undefined)).toBe('ja');
    expect(normalizeLocale('fr', 'ko')).toBe('ko');
  });
});

describe('resolveLocale', () => {
  it('個人の選択が最優先', () => {
    expect(resolveLocale('ko', 'en')).toBe('ko');
  });
  it('個人が無ければイベントのデフォルト', () => {
    expect(resolveLocale(undefined, 'en')).toBe('en');
    expect(resolveLocale('fr', 'zh')).toBe('zh');
  });
  it('どちらも無ければ日本語', () => {
    expect(resolveLocale()).toBe('ja');
    expect(resolveLocale(undefined, 'xx')).toBe('ja');
  });
});

describe('pickLocalizedText', () => {
  const texts = { ja: 'こんにちは', en: 'Hello' };
  it('実効言語の文言を返す', () => {
    expect(pickLocalizedText(texts, 'en', 'ja')).toBe('Hello');
    expect(pickLocalizedText(texts, 'ja', 'en')).toBe('こんにちは');
  });
  it('実効言語が無ければデフォルト言語へ', () => {
    expect(pickLocalizedText(texts, 'ko', 'en')).toBe('Hello');
  });
  it('デフォルトも無ければ日本語へ', () => {
    expect(pickLocalizedText(texts, 'ko', 'zh')).toBe('こんにちは');
  });
  it('空文字は無いものとして扱う', () => {
    expect(pickLocalizedText({ ja: 'x', en: '  ' }, 'en', 'ja')).toBe('x');
  });
  it('全て無ければ空文字', () => {
    expect(pickLocalizedText({}, 'en', 'en')).toBe('');
  });
});
