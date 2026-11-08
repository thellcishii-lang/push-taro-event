import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from './i18n';
import {
  REDEEM_TEXT,
  UI_TEXT,
  redeemText,
  uiText,
  type UiTextKey,
} from './ui-text';

describe('UI_TEXT / REDEEM_TEXT', () => {
  it('全キーに4言語すべての文が入っている', () => {
    for (const dict of [UI_TEXT, REDEEM_TEXT]) {
      for (const [key, entry] of Object.entries(dict)) {
        for (const locale of SUPPORTED_LOCALES) {
          const text = (entry as Record<string, string>)[locale];
          expect(typeof text, `${key}.${locale}`).toBe('string');
          expect(text.trim().length, `${key}.${locale}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('redeemText', () => {
  it('指定言語の文と差し込みが効く', () => {
    expect(redeemText('ko', 'loginButton')).toBe('로그인');
    expect(redeemText('en', 'exhibitorLine', { name: 'Acme' })).toContain('Acme');
  });
});

describe('uiText', () => {
  it('指定言語の文を返す', () => {
    expect(uiText('en', 'searchButton')).toBe('Search');
    expect(uiText('ja', 'searchButton')).toBe('検索');
  });
  it('{name} の差し込みを置換する', () => {
    expect(uiText('ja', 'period', { start: '2026-11-10', end: '2026-11-12' })).toBe(
      '開催期間: 2026-11-10 〜 2026-11-12',
    );
    expect(uiText('en', 'sendCodeFailed', { code: 'auth/x' })).toContain('auth/x');
  });
  it('型の外のキーは存在しない（網羅性は satisfies で担保）', () => {
    const keys = Object.keys(UI_TEXT) as UiTextKey[];
    expect(keys.length).toBeGreaterThan(30);
  });
});
