// lib/coupon-list-sheet.ts
// 主催者向け「出店者・クーポン一覧」シート（印刷用）の組み立て。
//
// クーポン管理画面の出店者一覧とクーポン一覧を、別々に書き出すと
// 紛らわしいため、1枚の表に統合する（左 = 出店者、右 = その出店者の
// クーポン）。左だけ読めば出店者一覧、右だけ読めばクーポン一覧になる。
// この関数は並び替えとグループ化だけを行う純粋関数。

/** シートに載せる出店者の最小形（EventExhibitor と構造互換）。 */
export interface SheetExhibitor {
  id: string;
  name: string;
  /** 消込ログイン用メールアドレス。未登録（旧データ）は null */
  email: string | null;
}

/** シートに載せるクーポンの最小形（EventCoupon と構造互換）。 */
export interface SheetCoupon {
  id: string;
  exhibitorId: string;
  /** 出店者が一覧に無い場合の表示名フォールバック */
  exhibitorName: string;
  title: string;
  active: boolean;
}

/** シートの1ブロック: 出店者1社と、その全クーポン（0件もありうる）。 */
export interface ExhibitorCouponGroup {
  exhibitor: SheetExhibitor;
  coupons: SheetCoupon[];
}

/**
 * 全出店者と全クーポンを、出店者ごとのグループにまとめる。
 * - 出店者の並びは入力順を保持し、クーポンが0件の出店者も必ず含める。
 * - クーポンの並びは各出店者内で入力順を保持する。
 * - 出店者一覧に存在しない exhibitorId のクーポン（データ不整合時の
 *   フォールバック）も落とさず、クーポン側の出店者名で末尾にまとめる。
 */
export function buildExhibitorCouponGroups(
  exhibitors: SheetExhibitor[],
  coupons: SheetCoupon[],
): ExhibitorCouponGroup[] {
  const byExhibitor = new Map<string, SheetCoupon[]>();
  for (const coupon of coupons) {
    const list = byExhibitor.get(coupon.exhibitorId);
    if (list) list.push(coupon);
    else byExhibitor.set(coupon.exhibitorId, [coupon]);
  }

  const groups: ExhibitorCouponGroup[] = exhibitors.map((exhibitor) => ({
    exhibitor,
    coupons: byExhibitor.get(exhibitor.id) ?? [],
  }));

  const knownIds = new Set(exhibitors.map((e) => e.id));
  const orphanOrder: string[] = [];
  const orphans = new Map<string, SheetCoupon[]>();
  for (const coupon of coupons) {
    if (knownIds.has(coupon.exhibitorId)) continue;
    const list = orphans.get(coupon.exhibitorId);
    if (list) list.push(coupon);
    else {
      orphans.set(coupon.exhibitorId, [coupon]);
      orphanOrder.push(coupon.exhibitorId);
    }
  }
  for (const exhibitorId of orphanOrder) {
    const list = orphans.get(exhibitorId) ?? [];
    groups.push({
      exhibitor: {
        id: exhibitorId,
        name: list[0]?.exhibitorName ?? '',
        email: null,
      },
      coupons: list,
    });
  }

  return groups;
}
