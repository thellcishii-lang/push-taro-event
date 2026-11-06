// @vitest-environment jsdom
import { act, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CouponDisplay, { couponExpiry } from './CouponDisplay';

describe('coupon display cleanup', () => {
  let root: Root;
  let container: HTMLDivElement;
  const today = new Date('2026-10-25T12:00:00+09:00').getTime();
  const tomorrow = new Date('2026-10-26T00:00:00+09:00').getTime();
  const expiredAt = new Date('2026-10-25T10:00:00+09:00').getTime();

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    localStorage.clear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function render(props: Partial<ComponentProps<typeof CouponDisplay>> = {}) {
    await act(async () => root.render(
      <CouponDisplay key={props.storageKey || 'coupon'} storageKey="coupon" shopId="shop" title="Offer" now={today} {...props}>
        <div data-qr>Available coupon</div>
      </CouponDisplay>,
    ));
  }

  it('keeps valid coupons available without a delete button', async () => {
    await render({ expiresAt: tomorrow });
    expect(container.querySelector('[data-qr]')).not.toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it.each(['used', 'expired'] as const)('offers deletion for %s coupons and hides their QR code', async (state) => {
    await render(state === 'used'
      ? { used: true, usedAt: new Date(expiredAt).toISOString() }
      : { expiresAt: expiredAt });
    expect(container.querySelector('[data-qr]')).toBeNull();
    expect(container.textContent).toContain(state === 'used' ? '使用済み' : '有効期限切れ');
    expect(container.querySelector('button')?.textContent).toBe('削除');
    await act(async () => container.querySelector('button')!.click());
    expect(container.textContent).toBe('');
    await act(async () => root.unmount());
    root = createRoot(container);
    await render({ used: true });
    expect(container.textContent).toBe('');
  });

  it.each(['used', 'expired'] as const)('automatically hides %s coupons at the next JST midnight without deletion', async (state) => {
    const props = state === 'used'
      ? { used: true, usedAt: new Date(expiredAt).toISOString() }
      : { expiresAt: expiredAt };
    await render({ ...props, now: tomorrow - 1 });
    expect(container.querySelector('button')).not.toBeNull();
    await render({ ...props, now: tomorrow });
    expect(container.textContent).toBe('');
  });

  it('removes date-limited coupons at midnight after their last valid date', async () => {
    const expiresAt = couponExpiry({ expireType: 'date', expireDate: '2026-10-25' }, null);
    await render({ expiresAt, now: tomorrow - 1 });
    expect(container.querySelector('[data-qr]')).not.toBeNull();
    await render({ expiresAt, now: tomorrow });
    expect(container.textContent).toBe('');
  });

  it('uses the earlier of consumption and expiry to remove a coupon', async () => {
    await render({
      used: true, usedAt: '2026-10-24T15:30:00+09:00', expiresAt: expiredAt,
    });
    expect(container.textContent).toBe('');
  });

  it('immediately hides old used records without a consumption timestamp', async () => {
    await render({ used: true });
    expect(container.textContent).toBe('');
    await act(async () => root.unmount());
    root = createRoot(container);
    await render({ used: true, now: tomorrow });
    expect(container.textContent).toBe('');
  });

  it('does not apply deletion to a reissued coupon or a different customer', async () => {
    await render({ storageKey: 'customer:campaign-1', expiresAt: expiredAt });
    await act(async () => container.querySelector('button')!.click());
    await render({ storageKey: 'customer:campaign-2' });
    expect(container.querySelector('[data-qr]')).not.toBeNull();
    await render({ storageKey: 'other-customer:campaign-1' });
    expect(container.querySelector('[data-qr]')).not.toBeNull();
  });

  it('continues to respect deletion of legacy coupon IDs', async () => {
    localStorage.setItem('push_taro_hidden_coupons_shop', JSON.stringify(['normal:old']));
    await render({ legacyHiddenKey: 'normal:old' });
    expect(container.textContent).toBe('');
    await render({ legacyHiddenKey: 'normal:new', storageKey: 'normal:new' });
    expect(container.querySelector('[data-qr]')).not.toBeNull();
  });

  it('calculates relative expiry from the original appearance time, not the time the page opens', () => {
    const start = '2026-10-20T13:20:00+09:00';
    expect(couponExpiry({ expireType: 'days', expireDays: 3 }, start)).toBe(
      new Date('2026-10-23T13:20:00+09:00').getTime(),
    );
    expect(couponExpiry({ expireType: 'days' }, start, 14)).toBe(
      new Date('2026-11-03T13:20:00+09:00').getTime(),
    );
    expect(couponExpiry({ expireType: 'days', expireDays: 3 }, null)).toBeNull();
  });
});
