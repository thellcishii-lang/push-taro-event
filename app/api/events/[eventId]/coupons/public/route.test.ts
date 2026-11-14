// app/api/events/[eventId]/coupons/public/route.test.ts
// 来場者向けクーポンカタログ: 課金停止中（billingSuspended）の出店者の
// クーポンはサーバー側で除外され、クライアントに渡らないことを検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getEvent: vi.fn(),
  listCoupons: vi.fn(),
  listExhibitors: vi.fn(),
}));

vi.mock('@/lib/event-store', () => ({
  getEvent: mocks.getEvent,
}));

vi.mock('@/lib/event-coupon', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-coupon')>();
  return {
    ...actual,
    listCoupons: mocks.listCoupons,
    listExhibitors: mocks.listExhibitors,
  };
});

const { GET } = await import('./route');

function request() {
  return new Request('http://localhost/api/events/event-1/coupons/public');
}

function params() {
  return { params: Promise.resolve({ eventId: 'event-1' }) };
}

function coupon(id: string, exhibitorId: string, active = true) {
  return {
    id,
    exhibitorId,
    exhibitorName: `出店者${exhibitorId}`,
    title: `クーポン${id}`,
    description: '',
    titleI18n: {},
    descriptionI18n: {},
    keywords: [],
    active,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getEvent.mockResolvedValue({ id: 'event-1', defaultLocale: 'ja' });
  mocks.listCoupons.mockResolvedValue([
    coupon('c1', 'shop-1'),
    coupon('c2', 'shop-2'),
    coupon('c3', 'shop-1', false),
  ]);
  mocks.listExhibitors.mockResolvedValue([
    { id: 'shop-1', name: '出店者A', email: 'a@example.com', billingSuspended: false },
    { id: 'shop-2', name: '出店者B', email: 'b@example.com', billingSuspended: true },
  ]);
});

describe('GET /api/events/[eventId]/coupons/public（課金停止の除外）', () => {
  it('停止中出店者のクーポンはカタログから消え、停止していない店の分だけ返る', async () => {
    const res = await GET(request(), params());
    expect(res.status).toBe(200);
    const body = await res.json();
    const ids = body.coupons.map((c: { id: string }) => c.id);
    expect(ids).toEqual(['c1']); // c2 は停止中、c3 は非公開
  });

  it('誰も停止していなければ従来どおり有効なクーポン全件が返る', async () => {
    mocks.listExhibitors.mockResolvedValue([
      { id: 'shop-1', name: '出店者A', email: 'a@example.com', billingSuspended: false },
      { id: 'shop-2', name: '出店者B', email: 'b@example.com', billingSuspended: false },
    ]);
    const res = await GET(request(), params());
    const body = await res.json();
    const ids = body.coupons.map((c: { id: string }) => c.id);
    expect(ids).toEqual(['c1', 'c2']);
  });
});
