// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupported: vi.fn(),
  getMessaging: vi.fn(),
  onMessage: vi.fn(),
}));

vi.mock('../../lib/firebase-client', () => ({
  firebaseApp: {},
  auth: { currentUser: null },
  requestFCMToken: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: () => () => {},
  RecaptchaVerifier: vi.fn(),
  signInWithPhoneNumber: vi.fn(),
}));
vi.mock('firebase/messaging', () => mocks);
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => <div data-qr={value} />,
}));

import SubscribePage from './page';

const shop = {
  success: true,
  name: 'Test shop',
  linkUrl: 'https://shop.example.com/menu',
  coupon: { enabled: true, title: 'First offer' },
  normalCoupon: { enabled: true, title: 'Normal offer', couponId: 'normal-1' },
  loyaltyCoupon: { enabled: true, title: 'Loyalty offer' },
  proCoupons: {
    birthday: { enabled: true, title: 'Birthday offer' },
    dormant: { enabled: true, title: 'Dormant offer' },
    repeat: { enabled: true, title: 'Repeat offer' },
    stepUp: { enabled: true, steps: [{ title: 'Step one' }, { title: 'Step two' }] },
  },
  scheduledCoupons: [{ id: 'scheduled-1', title: 'Scheduled offer' }],
};

describe('customer coupon redemption display', () => {
  let container: HTMLDivElement;
  let root: Root;
  let status: Record<string, unknown>;
  let statusResponse: () => Response;
  let fetchMock: ReturnType<typeof vi.fn>;
  let couponHistories: Array<{ id: string; title: string; usedAt: string }>;
  let shopResponse: Record<string, unknown>;

  const qrTypes = () => [...container.querySelectorAll('[data-qr]')]
    .map((element) => JSON.parse(element.getAttribute('data-qr')!).couponType);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-25T12:00:00+09:00'));
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    window.history.replaceState({}, '', '/subscribe?s=shop-1');
    localStorage.clear();
    localStorage.setItem('push_taro_token_shop-1', 'customer-token');
    vi.stubGlobal('indexedDB', { open: () => ({}) });
    mocks.isSupported.mockResolvedValue(false);
    mocks.getMessaging.mockReturnValue({});
    mocks.onMessage.mockReturnValue(vi.fn());
    status = {
      success: true, registered: true, loyaltyCouponAvailable: true,
      birthdayNotifiedYear: String(new Date().getFullYear()),
      dormantNotifiedAt: new Date().toISOString(),
    };
    statusResponse = () => Response.json(status);
    couponHistories = [];
    shopResponse = structuredClone(shop);
    fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith('/api/shop-info')) return Response.json(shopResponse);
      if (url === '/api/customer-session') return Response.json({ sessionToken: 'session' });
      if (url.startsWith('/api/subscribe-status')) return statusResponse();
      if (url.startsWith('/api/coupon-history')) return Response.json({ histories: couponHistories });
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  async function mount() {
    await act(async () => root.render(<SubscribePage />));
  }

  it('removes all timestamped used coupons the next day without affecting available coupons', async () => {
    const usedAt = '2026-10-25T09:00:00+09:00';
    status = {
      ...status,
      normalCouponUsed: true, normalCouponUsedAt: usedAt,
      birthdayCouponUsed: true, birthdayCouponUsedAt: usedAt,
      dormantCouponUsed: true, dormantCouponUsedAt: usedAt,
      scheduledCouponUsedIds: ['scheduled-1'],
      scheduledCouponUsedAt: { 'scheduled-1': usedAt },
    };
    await mount();
    expect(container.querySelectorAll('section[aria-label] button')).toHaveLength(4);
    expect(qrTypes().sort()).toEqual(['first', 'loyalty', 'repeat', 'step-up']);

    vi.setSystemTime(new Date('2026-10-26T00:00:00+09:00'));
    await act(async () => window.dispatchEvent(new Event('focus')));
    for (const title of ['Normal offer', 'Birthday offer', 'Dormant offer', 'Scheduled offer']) {
      expect(container.textContent).not.toContain(title);
    }
    expect(qrTypes().sort()).toEqual(['first', 'loyalty', 'repeat', 'step-up']);
  });

  it('hides used and expired coupons at JST midnight while the page stays open, without relying on status polling', async () => {
    const usedAt = '2026-10-25T09:00:00+09:00';
    status = { ...status, normalCouponUsed: true, normalCouponUsedAt: usedAt };
    shopResponse.coupon = { ...shop.coupon, expiresAt: '2026-10-25' };
    await mount();
    expect(container.textContent).toContain('Normal offer');
    expect(qrTypes()).toContain('first');

    // 画面を非表示扱いにして状態取得のポーリングを止め、時刻の更新だけで日付変更が反映されることを確認する
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    try {
      vi.setSystemTime(new Date('2026-10-25T23:58:00+09:00'));
      await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
      const statusCallsBefore = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/subscribe-status')).length;
      expect(container.textContent).toContain('Normal offer');

      await act(async () => { await vi.advanceTimersByTimeAsync(120_000); });
      expect(fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/subscribe-status'))).toHaveLength(statusCallsBefore);
      expect(container.textContent).not.toContain('Normal offer');
      expect(container.textContent).not.toContain('First offer');
      expect(qrTypes()).not.toContain('first');
      expect(qrTypes()).toContain('loyalty');
    } finally {
      visibility.mockRestore();
    }
  });

  it('gives expired relative-date coupons a delete button, persists deletion, and allows new issues', async () => {
    const expiredAt = '2026-10-25T10:00:00+09:00';
    shopResponse.proCoupons = {
      ...shop.proCoupons,
      dormant: { ...shop.proCoupons.dormant, expireDays: 1 },
      stepUp: { ...shop.proCoupons.stepUp, steps: [{ title: 'Step one', expireType: 'days', expireDays: 1 }] },
      repeat: { ...shop.proCoupons.repeat, expireType: 'days' },
    };
    shopResponse.loyaltyCoupon = { ...shop.loyaltyCoupon, expireType: 'days', expireDays: 1 };
    shopResponse.scheduledCoupons = [{ ...shop.scheduledCoupons[0], expiresAt: expiredAt }];
    status = {
      ...status,
      dormantNotifiedAt: '2026-10-24T10:00:00+09:00',
      stepUpIndexAppearedAt: '2026-10-24T10:00:00+09:00',
      loyaltyAchievedAt: '2026-10-24T10:00:00+09:00',
      repeatCouponActiveUntil: expiredAt,
    };
    await mount();
    expect(container.querySelectorAll('section[aria-label] button')).toHaveLength(5);
    expect(qrTypes().sort()).toEqual(['birthday', 'first', 'normal']);
    const dormantCard = container.querySelector('section[aria-label="Dormant offer"]')!;
    await act(async () => (dormantCard.querySelector('button') as HTMLButtonElement).click());
    expect(container.textContent).not.toContain('Dormant offer');
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    expect(container.textContent).not.toContain('Dormant offer');

    status = { ...status, dormantNotifiedAt: '2026-10-25T12:00:00+09:00' };
    await act(async () => window.dispatchEvent(new Event('focus')));
    expect(container.textContent).toContain('Dormant offer');
    expect(qrTypes()).toContain('dormant');
  });

  it('automatically removes expired coupons while the page stays open and after reloading', async () => {
    const expiredAt = '2026-10-25T10:00:00+09:00';
    shopResponse.proCoupons = {
      ...shop.proCoupons,
      dormant: { ...shop.proCoupons.dormant, expireDays: 1 },
      stepUp: { ...shop.proCoupons.stepUp, steps: [{ title: 'Step one', expireType: 'days', expireDays: 1 }] },
      repeat: { ...shop.proCoupons.repeat, expireType: 'days' },
    };
    shopResponse.loyaltyCoupon = { ...shop.loyaltyCoupon, expireType: 'days', expireDays: 1 };
    shopResponse.scheduledCoupons = [{ ...shop.scheduledCoupons[0], expiresAt: expiredAt }];
    status = {
      ...status,
      dormantNotifiedAt: '2026-10-24T10:00:00+09:00',
      stepUpIndexAppearedAt: '2026-10-24T10:00:00+09:00',
      loyaltyAchievedAt: '2026-10-24T10:00:00+09:00',
      repeatCouponActiveUntil: expiredAt,
    };
    await mount();
    vi.setSystemTime(new Date('2026-10-26T00:00:00+09:00'));
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(container.querySelectorAll('section[aria-label] button')).toHaveLength(0);
    expect(qrTypes().sort()).toEqual(['birthday', 'first', 'normal']);
    for (const title of ['Dormant offer', 'Step one', 'Repeat offer', 'Loyalty offer', 'Scheduled offer']) {
      expect(container.textContent).not.toContain(title);
    }
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    expect(qrTypes().sort()).toEqual(['birthday', 'first', 'normal']);
  });

  it('hides coupons with a fixed expiry date on the following JST day', async () => {
    shopResponse.coupon = { ...shop.coupon, expiresAt: '2026-10-25' };
    shopResponse.normalCoupon = { ...shop.normalCoupon, expiresAt: '2026-10-25' };
    shopResponse.proCoupons = {
      ...shop.proCoupons,
      stepUp: { ...shop.proCoupons.stepUp, steps: [{ title: 'Step one', expireType: 'date', expireDate: '2026-10-25' }] },
      repeat: { ...shop.proCoupons.repeat, expireType: 'date', expireDate: '2026-10-25' },
    };
    shopResponse.loyaltyCoupon = { ...shop.loyaltyCoupon, expireType: 'date', expireDate: '2026-10-25' };
    await mount();
    expect(qrTypes()).toContain('first');
    vi.setSystemTime(new Date('2026-10-26T00:00:00+09:00'));
    await act(async () => window.dispatchEvent(new Event('focus')));
    expect(qrTypes().sort()).toEqual(['birthday', 'dormant', 'scheduled']);
    for (const title of ['First offer', 'Normal offer', 'Step one', 'Repeat offer', 'Loyalty offer']) {
      expect(container.textContent).not.toContain(title);
    }
  });

  it('keeps the next-day repeat offer available instead of deleting it as used', async () => {
    status = { ...status, repeatCouponUsed: true };
    await mount();
    expect(container.textContent).toContain('本日は使用済みです');
    expect(qrTypes()).not.toContain('repeat');
    vi.setSystemTime(new Date('2026-10-26T00:00:00+09:00'));
    status = { ...status, repeatCouponUsed: false, stepUpIndex: 1 };
    await act(async () => window.dispatchEvent(new Event('focus')));
    expect(qrTypes()).toContain('repeat');
    expect(container.textContent).toContain('Step two');
  });

  it('refreshes all coupon types even when messaging is unsupported and reuses the session', async () => {
    await mount();
    expect(qrTypes().sort()).toEqual(['birthday', 'dormant', 'first', 'loyalty', 'normal', 'repeat', 'scheduled', 'step-up']);
    expect(mocks.getMessaging).not.toHaveBeenCalled();

    status = {
      ...status, firstCouponUsed: true, normalCouponUsed: true,
      loyaltyCouponAvailable: false, stepUpIndex: 1, repeatCouponUsed: true,
      birthdayCouponUsed: true, dormantCouponUsed: true,
      scheduledCouponUsedIds: ['scheduled-1'],
    };
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(container.textContent).not.toContain('First offer');
    expect(container.textContent).not.toContain('Loyalty offer');
    expect(container.textContent).not.toContain('Step one');
    expect(container.textContent).toContain('Step two');
    expect(qrTypes()).toEqual(['step-up']);
    expect(container.textContent).toContain('本日は使用済みです');

    status = { ...status, stepUpIndex: 2, repeatCouponUsed: false };
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(qrTypes()).toEqual(['repeat']);
    await act(async () => { await vi.advanceTimersByTimeAsync(600_000); });
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/customer-session')).toHaveLength(1);
  });

  it('does not redisplay a used first coupon on reload', async () => {
    status = { ...status, firstCouponUsed: true };
    await mount();
    expect(container.textContent).not.toContain('First offer');
    expect(qrTypes()).not.toContain('first');
  });

  it('keeps polling after messaging initialization fails and refreshes on focus', async () => {
    mocks.isSupported.mockResolvedValue(true);
    mocks.getMessaging.mockImplementationOnce(() => { throw new Error('Messaging unavailable'); });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await mount();
      status = { ...status, firstCouponUsed: true };
      await act(async () => { window.dispatchEvent(new Event('focus')); });
      expect(qrTypes()).not.toContain('first');
      expect(error).toHaveBeenCalledWith('通知受信の初期化エラー:', expect.any(Error));
    } finally {
      error.mockRestore();
    }
  });

  it('keeps coupons on a transient failure, honors Retry-After, and recovers', async () => {
    await mount();
    statusResponse = () => Response.json({ error: 'Too Many Requests' }, {
      status: 429, headers: { 'Retry-After': '30' },
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
      expect(container.querySelector('[role="alert"]')).toBeNull();
      expect(qrTypes()).toContain('normal');
      const calls = fetchMock.mock.calls.length;
      status = { ...status, firstCouponUsed: true };
      statusResponse = () => Response.json(status);
      await act(async () => { await vi.advanceTimersByTimeAsync(20_000); });
      expect(fetchMock.mock.calls).toHaveLength(calls);
      await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
      expect(qrTypes()).toContain('normal');
      expect(qrTypes()).not.toContain('first');
    } finally {
      error.mockRestore();
    }
  });

  it('warns only after repeated failures and clears the warning on recovery', async () => {
    await mount();
    statusResponse = () => Response.json({ error: 'boom' }, { status: 500 });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await act(async () => { await vi.advanceTimersByTimeAsync(20_000); });
      expect(container.querySelector('[role="alert"]')).toBeNull();
      await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
      expect(container.querySelector('[role="alert"]')).not.toBeNull();
      expect(qrTypes()).toContain('normal');
      statusResponse = () => Response.json(status);
      await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
      expect(container.querySelector('[role="alert"]')).toBeNull();
    } finally {
      error.mockRestore();
    }
  });

  it('shows an error when the first status check fails', async () => {
    statusResponse = () => Response.json({ error: 'boom' }, { status: 500 });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await mount();
      expect(container.querySelector('[role="alert"]')).not.toBeNull();
      expect(qrTypes()).toEqual([]);
    } finally {
      error.mockRestore();
    }
  });

  it('reuses the stored session across reloads and reissues it after expiry', async () => {
    await mount();
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    const sessionCalls = () => fetchMock.mock.calls.filter(([url]) => url === '/api/customer-session').length;
    expect(sessionCalls()).toBe(1);

    let expired = true;
    statusResponse = () => expired
      ? Response.json({ success: false }, { status: 401 })
      : Response.json(status);
    fetchMock.mockImplementation(async (url: string) => {
      if (url.startsWith('/api/shop-info')) return Response.json(shop);
      if (url === '/api/customer-session') { expired = false; return Response.json({ sessionToken: 'session-2' }); }
      if (url.startsWith('/api/subscribe-status')) return statusResponse();
      throw new Error(`Unexpected request: ${url}`);
    });
    status = { ...status, firstCouponUsed: true };
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(sessionCalls()).toBe(2);
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('token=session-2'), expect.anything());
    expect(qrTypes()).not.toContain('first');
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('backs off session issuance after a failure instead of retrying every poll', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.startsWith('/api/shop-info')) return Response.json(shop);
      if (url === '/api/customer-session') return Response.json({ error: 'Too Many Requests' }, { status: 429, headers: { 'Retry-After': '120' } });
      if (url.startsWith('/api/subscribe-status')) return statusResponse();
      throw new Error(`Unexpected request: ${url}`);
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await mount();
      await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/customer-session')).toHaveLength(1);
      expect(qrTypes()).toContain('normal');
    } finally {
      error.mockRestore();
    }
  });

  it('shows only the selected history and refreshes coupon history after redemption', async () => {
    await mount();
    const tab = (name: string) => [...container.querySelectorAll('[role=tab]')]
      .find((element) => element.textContent?.includes(name)) as HTMLButtonElement;
    const panel = () => container.querySelector('[role=tabpanel]')!.textContent;

    expect(panel()).toContain('受信した通知はまだありません');
    expect(fetchMock.mock.calls.some(([url]) => String(url).startsWith('/api/coupon-history'))).toBe(false);

    await act(async () => { tab('クーポン使用').click(); });
    expect(tab('クーポン使用').getAttribute('aria-selected')).toBe('true');
    expect(panel()).toContain('まだクーポンを使用していません');
    expect(panel()).not.toContain('通知');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/coupon-history?shopId=shop-1&token=session'), expect.anything());

    couponHistories = [{ id: 'log-1', title: 'First offer', usedAt: '2026-10-25T04:00:00.000Z' }];
    status = { ...status, firstCouponUsed: true };
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(panel()).toContain('First offer');
    expect(panel()).toContain('に使用');

    await act(async () => { tab('通知').click(); });
    expect(panel()).not.toContain('First offer');
    expect(panel()).toContain('受信した通知はまだありません');
  });
  it('opens the shop site inside the page with a return button', async () => {
    await mount();
    const link = [...container.querySelectorAll('a')].find((a) => a.textContent?.includes('サイトはこちらから'))!;
    expect(link.getAttribute('target')).toBeNull();
    const url = new URL(link.getAttribute('href')!, window.location.origin);
    expect(url.pathname).toBe('/notification-link');
    expect(url.searchParams.get('target')).toBe('https://shop.example.com/menu');
    expect(url.searchParams.get('returnTo')).toBe('/subscribe?s=shop-1');
  });

  it.each([
    [429, { 'Retry-After': '300' }, '約5分後に自動で再確認します。（429）'],
    [403, {}, '通知登録が見つからない'],
    [500, {}, 'サーバーでエラーが発生したため'],
  ])('tells the customer why the status check failed (%s)', async (code, headers, text) => {
    statusResponse = () => Response.json({ success: false, error: 'x' }, { status: code, headers });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await mount();
      expect(container.querySelector('[role="alert"]')?.textContent).toContain(text);
    } finally {
      error.mockRestore();
    }
  });
});
