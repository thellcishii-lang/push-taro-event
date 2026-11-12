import { describe, expect, it } from 'vitest';
import {
  buildExhibitorCouponGroups,
  type SheetCoupon,
  type SheetExhibitor,
} from './coupon-list-sheet';

const exhibitor = (partial: Partial<SheetExhibitor>): SheetExhibitor => ({
  id: 'e1',
  name: 'テスト出店者',
  email: 'shop@example.com',
  ...partial,
});

const coupon = (partial: Partial<SheetCoupon>): SheetCoupon => ({
  id: 'c1',
  exhibitorId: 'e1',
  exhibitorName: 'テスト出店者',
  title: 'テストクーポン',
  active: true,
  ...partial,
});

describe('buildExhibitorCouponGroups', () => {
  it('出店者の並びを保持し、クーポンを出店者ごとにまとめる', () => {
    const groups = buildExhibitorCouponGroups(
      [exhibitor({ id: 'e2', name: 'B社' }), exhibitor({ id: 'e1', name: 'A社' })],
      [
        coupon({ id: '1', exhibitorId: 'e1' }),
        coupon({ id: '2', exhibitorId: 'e2' }),
        coupon({ id: '3', exhibitorId: 'e1' }),
      ],
    );
    expect(groups.map((g) => g.exhibitor.id)).toEqual(['e2', 'e1']);
    expect(groups[0].coupons.map((c) => c.id)).toEqual(['2']);
    expect(groups[1].coupons.map((c) => c.id)).toEqual(['1', '3']);
  });

  it('クーポンが0件の出店者も空グループとして含める', () => {
    const groups = buildExhibitorCouponGroups(
      [exhibitor({ id: 'e1' }), exhibitor({ id: 'e2', name: 'B社' })],
      [coupon({ id: '1', exhibitorId: 'e1' })],
    );
    expect(groups).toHaveLength(2);
    expect(groups[1].exhibitor.id).toBe('e2');
    expect(groups[1].coupons).toEqual([]);
  });

  it('出店者一覧に無いクーポンは、出店者名を使って末尾にまとめる', () => {
    const groups = buildExhibitorCouponGroups(
      [exhibitor({ id: 'e1' })],
      [
        coupon({ id: '1', exhibitorId: 'e1' }),
        coupon({ id: '2', exhibitorId: 'ghost', exhibitorName: '不明な出店者' }),
        coupon({ id: '3', exhibitorId: 'ghost', exhibitorName: '不明な出店者' }),
      ],
    );
    expect(groups).toHaveLength(2);
    expect(groups[1].exhibitor).toEqual({
      id: 'ghost',
      name: '不明な出店者',
      email: null,
    });
    expect(groups[1].coupons.map((c) => c.id)).toEqual(['2', '3']);
  });

  it('空入力なら空配列を返す', () => {
    expect(buildExhibitorCouponGroups([], [])).toEqual([]);
  });
});
