// lib/coupon-groups.ts
// 来場者画面のクーポンカタログ表示用の純粋関数。
// - filterCatalogCoupons: 会社名・タイトル・説明・キーワードでの絞り込み。
//   判定はサーバー側（lib/event-coupon.ts の filterCoupons）と揃えてある。
//   画面側は表示言語に翻訳済みの文で絞り込むため、見る文そのまま探せる。
// - groupCouponsByExhibitor: 出店者（会社）ごとのグループ化。
//   グループの並びとグループ内の並びは、元の出現順をそのまま保持する。

export interface CatalogCoupon {
  id: string;
  title: string;
  description: string;
  exhibitorName: string;
  keywords: string[];
}

export interface CouponGroup<T extends CatalogCoupon = CatalogCoupon> {
  exhibitorName: string;
  coupons: T[];
}

export function filterCatalogCoupons<T extends CatalogCoupon>(
  coupons: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return coupons;
  return coupons.filter((coupon) => {
    const haystack = [
      coupon.title,
      coupon.description,
      coupon.exhibitorName,
      ...coupon.keywords,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function groupCouponsByExhibitor<T extends CatalogCoupon>(
  coupons: T[],
): CouponGroup<T>[] {
  const groups: CouponGroup<T>[] = [];
  const byName = new Map<string, CouponGroup<T>>();
  for (const coupon of coupons) {
    let group = byName.get(coupon.exhibitorName);
    if (!group) {
      group = { exhibitorName: coupon.exhibitorName, coupons: [] };
      byName.set(coupon.exhibitorName, group);
      groups.push(group);
    }
    group.coupons.push(coupon);
  }
  return groups;
}

/** 検索で絞り込んでから出店者ごとにまとめた、カタログ表示用の形を返す。 */
export function buildCouponGroups<T extends CatalogCoupon>(
  coupons: T[],
  query: string,
): CouponGroup<T>[] {
  return groupCouponsByExhibitor(filterCatalogCoupons(coupons, query));
}
