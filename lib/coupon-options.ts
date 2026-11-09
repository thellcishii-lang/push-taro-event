// クーポンオプション（イベント単位の買い切り枠追加）の受付処理。
//
// 本家で決済が完了したイベントについて、対象イベントの couponCap を
// 100件 × units だけ増やす。加算分はイベント側だけに持つ（契約側の
// couponCap はプロビジョニング再送で絶対値上書きされるため、そこに
// 加算分を持たせるとプラン変更のたびに消える）。
//
// 冪等性: 適用記録を couponOptionApplications/{paymentId} に、枠の加算と
// 同じトランザクションで書く。本家からの再送や二重通知で同じ paymentId が
// 再び来ても、記録があれば加算せず 'already-applied' を返す。
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';
import { MAX_COUPONS_PER_EVENT } from './event';
import { getEvent } from './event-store';
import { getOrganizer } from './organizers';

const EVENTS_COLLECTION = 'events';
export const COUPON_OPTION_APPLICATIONS_COLLECTION = 'couponOptionApplications';

/** オプション1単位あたりの追加クーポン件数。 */
export const COUPONS_PER_OPTION_UNIT = 100;

export interface CouponOptionInput {
  contractId: string;
  eventId: string;
  /** +100件のブロック数（1以上の整数） */
  units: number;
  /** 本家側の決済識別子（冪等キー） */
  paymentId: string;
}

export type CouponOptionValidation =
  | { ok: true; input: CouponOptionInput }
  | { ok: false; error: string };

/** リクエストボディの検証と正規化（純粋関数）。 */
export function validateCouponOptionInput(body: unknown): CouponOptionValidation {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'リクエスト形式が不正です' };
  }
  const record = body as Record<string, unknown>;

  const contractId =
    typeof record.contractId === 'string' ? record.contractId.trim() : '';
  if (!contractId) return { ok: false, error: 'contractId が必要です' };

  const eventId = typeof record.eventId === 'string' ? record.eventId.trim() : '';
  if (!eventId) return { ok: false, error: 'eventId が必要です' };

  const paymentId =
    typeof record.paymentId === 'string' ? record.paymentId.trim() : '';
  if (!paymentId) return { ok: false, error: 'paymentId が必要です' };

  const units = record.units;
  if (typeof units !== 'number' || !Number.isInteger(units) || units < 1) {
    return { ok: false, error: 'units は1以上の整数で指定してください' };
  }

  return { ok: true, input: { contractId, eventId, units, paymentId } };
}

/** units から追加件数を出す（純粋関数）。 */
export function computeAddedCoupons(units: number): number {
  return units * COUPONS_PER_OPTION_UNIT;
}

/** 加算後の couponCap（純粋関数）。 */
export function computeNewCouponCap(currentCap: number, units: number): number {
  return currentCap + computeAddedCoupons(units);
}

/** 適用記録の有無から、加算するか冪等応答にするかを決める（純粋関数）。 */
export function decideCouponOption(
  alreadyApplied: boolean,
): 'apply' | 'already-applied' {
  return alreadyApplied ? 'already-applied' : 'apply';
}

export type ApplyCouponOptionResult =
  | { ok: true; status: 'applied' | 'already-applied'; couponCap: number }
  | { ok: false; status: number; error: string };

/**
 * クーポンオプションを対象イベントに適用する。
 * 契約者が無い・イベントが無い・イベントが契約者の所有でない場合は 404
 * （所有関係の詳細は漏らさない）。
 */
export async function applyCouponOption(
  input: CouponOptionInput,
): Promise<ApplyCouponOptionResult> {
  const organizer = await getOrganizer(input.contractId);
  if (!organizer || !organizer.ownerUid) {
    return { ok: false, status: 404, error: '契約者が見つかりません' };
  }
  const event = await getEvent(input.eventId);
  if (!event || event.ownerUid !== organizer.ownerUid) {
    return { ok: false, status: 404, error: 'イベントが見つかりません' };
  }

  const applicationRef = db
    .collection(COUPON_OPTION_APPLICATIONS_COLLECTION)
    .doc(input.paymentId);
  const eventRef = db.collection(EVENTS_COLLECTION).doc(input.eventId);

  const outcome = await db.runTransaction(async (tx) => {
    const [applicationSnap, eventSnap] = await Promise.all([
      tx.get(applicationRef),
      tx.get(eventRef),
    ]);
    if (!eventSnap.exists) {
      return { kind: 'missing' as const, couponCap: 0 };
    }
    const rawCap = eventSnap.data()?.couponCap;
    const currentCap =
      typeof rawCap === 'number' ? rawCap : MAX_COUPONS_PER_EVENT;
    if (decideCouponOption(applicationSnap.exists) === 'already-applied') {
      return { kind: 'already-applied' as const, couponCap: currentCap };
    }
    const newCap = computeNewCouponCap(currentCap, input.units);
    tx.update(eventRef, {
      couponCap: newCap,
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.set(applicationRef, {
      contractId: input.contractId,
      eventId: input.eventId,
      units: input.units,
      addedCoupons: computeAddedCoupons(input.units),
      paymentId: input.paymentId,
      appliedAt: FieldValue.serverTimestamp(),
    });
    return { kind: 'applied' as const, couponCap: newCap };
  });

  if (outcome.kind === 'missing') {
    return { ok: false, status: 404, error: 'イベントが見つかりません' };
  }
  return { ok: true, status: outcome.kind, couponCap: outcome.couponCap };
}
