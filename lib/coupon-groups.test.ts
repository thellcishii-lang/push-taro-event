import { describe, expect, it } from 'vitest';
import {
  buildCouponGroups,
  filterCatalogCoupons,
  groupCouponsByExhibitor,
  type CatalogCoupon,
} from './coupon-groups';

const coupon = (partial: Partial<CatalogCoupon>): CatalogCoupon => ({
  id: 'c1',
  title: 'テストクーポン',
  description: '',
  exhibitorName: 'テスト出店者',
  keywords: [],
  ...partial,
});

describe('groupCouponsByExhibitor', () => {
  it('出店者ごとにまとめ、出現順を保持する', () => {
    const groups = groupCouponsByExhibitor([
      coupon({ id: '1', exhibitorName: 'B社' }),
      coupon({ id: '2', exhibitorName: 'A社' }),
      coupon({ id: '3', exhibitorName: 'B社' }),
    ]);
    expect(groups.map((g) => g.exhibitorName)).toEqual(['B社', 'A社']);
    expect(groups[0].coupons.map((c) => c.id)).toEqual(['1', '3']);
    expect(groups[1].coupons.map((c) => c.id)).toEqual(['2']);
  });

  it('空配列なら空のグループ一覧', () => {
    expect(groupCouponsByExhibitor([])).toEqual([]);
  });
});

describe('filterCatalogCoupons', () => {
  const list = [
    coupon({ id: '1', title: 'コーヒー無料', exhibitorName: 'カフェ・ド・ルナ', keywords: ['ドリンク'] }),
    coupon({ id: '2', title: 'Sample gift', exhibitorName: 'TechGear Inc.', keywords: ['novelty'] }),
    coupon({ id: '3', title: 'おにぎり割引', description: '海苔が自慢', exhibitorName: 'サンプルフーズ', keywords: [] }),
  ];

  it('空クエリは全件返す', () => {
    expect(filterCatalogCoupons(list, '')).toHaveLength(3);
    expect(filterCatalogCoupons(list, '  ')).toHaveLength(3);
  });

  it('会社名・タイトル・説明・キーワードのいずれかに一致すれば残る', () => {
    expect(filterCatalogCoupons(list, 'ルナ').map((c) => c.id)).toEqual(['1']);
    expect(filterCatalogCoupons(list, 'おにぎり').map((c) => c.id)).toEqual(['3']);
    expect(filterCatalogCoupons(list, '海苔').map((c) => c.id)).toEqual(['3']);
    expect(filterCatalogCoupons(list, 'ドリンク').map((c) => c.id)).toEqual(['1']);
  });

  it('英字は大小を区別しない', () => {
    expect(filterCatalogCoupons(list, 'techgear').map((c) => c.id)).toEqual(['2']);
    expect(filterCatalogCoupons(list, 'SAMPLE').map((c) => c.id)).toEqual(['2']);
  });

  it('一致しなければ空', () => {
    expect(filterCatalogCoupons(list, '存在しない')).toEqual([]);
  });
});

describe('buildCouponGroups', () => {
  it('絞り込んだ結果だけをグループ化する', () => {
    const groups = buildCouponGroups(
      [
        coupon({ id: '1', exhibitorName: 'A社', keywords: ['食品'] }),
        coupon({ id: '2', exhibitorName: 'B社', keywords: ['雑貨'] }),
        coupon({ id: '3', exhibitorName: 'A社', keywords: ['食品', '試食'] }),
      ],
      '食品',
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].exhibitorName).toBe('A社');
    expect(groups[0].coupons.map((c) => c.id)).toEqual(['1', '3']);
  });
});
