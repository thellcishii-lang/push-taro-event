// lib/event-links.test.ts
// 主催者リンク（最大3件）の検証・正規化と、保存値の防御的読み取り。
import { describe, expect, it } from 'vitest';
import { normalizeEventLinks, parseEventLinks } from './event';

describe('normalizeEventLinks', () => {
  it('未指定は空配列', () => {
    expect(normalizeEventLinks(undefined)).toEqual([]);
    expect(normalizeEventLinks(null)).toEqual([]);
    expect(normalizeEventLinks([])).toEqual([]);
  });

  it('正常なリンクは前後の空白を除いて通す', () => {
    expect(
      normalizeEventLinks([
        { title: ' 公式サイト ', url: ' https://example.com ' },
        { title: 'アクセス', url: 'https://example.com/access' },
      ]),
    ).toEqual([
      { title: '公式サイト', url: 'https://example.com' },
      { title: 'アクセス', url: 'https://example.com/access' },
    ]);
  });

  it('両方空の枠は未指定として読み飛ばす', () => {
    expect(
      normalizeEventLinks([
        { title: '', url: '' },
        { title: '公式サイト', url: 'https://example.com' },
        { title: '  ', url: ' ' },
      ]),
    ).toEqual([{ title: '公式サイト', url: 'https://example.com' }]);
  });

  it('タイトルだけ・URLだけの枠はエラー', () => {
    expect(() => normalizeEventLinks([{ title: '公式サイト', url: '' }])).toThrow(
      'タイトルとURLは両方入力してください',
    );
    expect(() => normalizeEventLinks([{ title: '', url: 'https://example.com' }])).toThrow(
      'タイトルとURLは両方入力してください',
    );
  });

  it('https 以外の URL はエラー', () => {
    expect(() =>
      normalizeEventLinks([{ title: '公式サイト', url: 'http://example.com' }]),
    ).toThrow('https://');
    expect(() =>
      normalizeEventLinks([{ title: '公式サイト', url: 'example.com' }]),
    ).toThrow('https://');
  });

  it('4件以上はエラー', () => {
    const four = [1, 2, 3, 4].map((n) => ({
      title: `リンク${n}`,
      url: `https://example.com/${n}`,
    }));
    expect(() => normalizeEventLinks(four)).toThrow('最大3件');
  });

  it('配列でない入力・要素がオブジェクトでない場合はエラー', () => {
    expect(() => normalizeEventLinks('https://example.com')).toThrow('形式が不正');
    expect(() => normalizeEventLinks(['https://example.com'])).toThrow('形式が不正');
  });
});

describe('parseEventLinks', () => {
  it('項目が無い旧データは空配列', () => {
    expect(parseEventLinks(undefined)).toEqual([]);
    expect(parseEventLinks(null)).toEqual([]);
    expect(parseEventLinks('links')).toEqual([]);
  });

  it('不正な要素は落として有効なものだけ返す', () => {
    expect(
      parseEventLinks([
        { title: '公式サイト', url: 'https://example.com' },
        { title: 'タイトルのみ', url: '' },
        { title: 'http', url: 'http://example.com' },
        '文字列',
        { title: ' アクセス ', url: ' https://example.com/access ' },
      ]),
    ).toEqual([
      { title: '公式サイト', url: 'https://example.com' },
      { title: 'アクセス', url: 'https://example.com/access' },
    ]);
  });

  it('上限3件で切り詰める', () => {
    const four = [1, 2, 3, 4].map((n) => ({
      title: `リンク${n}`,
      url: `https://example.com/${n}`,
    }));
    expect(parseEventLinks(four)).toHaveLength(3);
  });
});
