import { describe, expect, it } from 'vitest';
import {
  computeAddedCoupons,
  computeNewCouponCap,
  decideCouponOption,
  validateCouponOptionInput,
} from './coupon-options';

describe('validateCouponOptionInput', () => {
  it('正しいボディを通し、前後の空白を落とす', () => {
    expect(
      validateCouponOptionInput({
        contractId: ' shop-1 ',
        eventId: ' event-1 ',
        units: 2,
        paymentId: ' pay-1 ',
      }),
    ).toEqual({
      ok: true,
      input: {
        contractId: 'shop-1',
        eventId: 'event-1',
        units: 2,
        paymentId: 'pay-1',
      },
    });
  });

  it('オブジェクトでないボディは形式不正', () => {
    expect(validateCouponOptionInput(null).ok).toBe(false);
    expect(validateCouponOptionInput('x').ok).toBe(false);
    expect(validateCouponOptionInput([1, 2]).ok).toBe(false);
  });

  it('contractId が無い・空ならエラー', () => {
    expect(
      validateCouponOptionInput({ eventId: 'e', units: 1, paymentId: 'p' }),
    ).toEqual({ ok: false, error: 'contractId が必要です' });
    expect(
      validateCouponOptionInput({
        contractId: '  ',
        eventId: 'e',
        units: 1,
        paymentId: 'p',
      }),
    ).toEqual({ ok: false, error: 'contractId が必要です' });
  });

  it('eventId が無いとエラー', () => {
    expect(
      validateCouponOptionInput({ contractId: 'c', units: 1, paymentId: 'p' }),
    ).toEqual({ ok: false, error: 'eventId が必要です' });
  });

  it('paymentId が無い・空だとエラー（冪等キーが要る）', () => {
    expect(
      validateCouponOptionInput({ contractId: 'c', eventId: 'e', units: 1 }),
    ).toEqual({ ok: false, error: 'paymentId が必要です' });
    expect(
      validateCouponOptionInput({
        contractId: 'c',
        eventId: 'e',
        units: 1,
        paymentId: '',
      }),
    ).toEqual({ ok: false, error: 'paymentId が必要です' });
  });

  it('units は1以上の整数のみ通す', () => {
    const base = { contractId: 'c', eventId: 'e', paymentId: 'p' };
    for (const units of [0, -1, 1.5, '2', Number.NaN, undefined]) {
      expect(validateCouponOptionInput({ ...base, units })).toEqual({
        ok: false,
        error: 'units は1以上の整数で指定してください',
      });
    }
    expect(validateCouponOptionInput({ ...base, units: 1 }).ok).toBe(true);
    expect(validateCouponOptionInput({ ...base, units: 5 }).ok).toBe(true);
  });
});

describe('computeAddedCoupons / computeNewCouponCap', () => {
  it('1単位 = 100件', () => {
    expect(computeAddedCoupons(1)).toBe(100);
    expect(computeAddedCoupons(3)).toBe(300);
  });
  it('現在の枠に加算する', () => {
    expect(computeNewCouponCap(100, 1)).toBe(200);
    expect(computeNewCouponCap(250, 3)).toBe(550);
  });
});

describe('decideCouponOption', () => {
  it('適用記録が無ければ apply', () => {
    expect(decideCouponOption(false)).toBe('apply');
  });
  it('適用記録があれば already-applied（二重加算しない）', () => {
    expect(decideCouponOption(true)).toBe('already-applied');
  });
});
