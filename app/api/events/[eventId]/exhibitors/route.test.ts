// app/api/events/[eventId]/exhibitors/route.test.ts
// 登録 POST が lib の mailSent（パスワードメールの送信成否）を捨てずに
// レスポンスへ返すことを検証する。画面側は mailSent=false のとき成功文と
// 別に警告を出すため、この受け渡しが要る。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireEventOwner: vi.fn(),
  listExhibitors: vi.fn(),
  registerExhibitor: vi.fn(),
}));

vi.mock('@/lib/event-auth', () => ({
  requireEventOwner: mocks.requireEventOwner,
}));
vi.mock('@/lib/event-coupon', () => ({
  listExhibitors: mocks.listExhibitors,
}));
vi.mock('@/lib/exhibitor-access', () => ({
  ExhibitorAccessError: class ExhibitorAccessError extends Error {
    status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.status = status;
    }
  },
  registerExhibitor: mocks.registerExhibitor,
}));

import { POST } from './route';

const EVENT_ID = 'event-1';
const EMAIL = 'exhibitor@example.com';

function postRequest() {
  return new Request(`http://localhost/api/events/${EVENT_ID}/exhibitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'テスト出店者', email: EMAIL }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireEventOwner.mockResolvedValue({
    uid: 'owner-1',
    event: { name: 'テストイベント', defaultLocale: 'ja' },
  });
  mocks.listExhibitors.mockResolvedValue([
    { id: 'exh-1', name: 'テスト出店者', email: EMAIL, hasAccessCode: true, lang: 'ja' },
  ]);
});

describe('POST /api/events/[eventId]/exhibitors', () => {
  it('メール送信成功時は mailSent=true を返す', async () => {
    mocks.registerExhibitor.mockResolvedValue({
      exhibitorId: 'exh-1',
      email: EMAIL,
      mailSent: true,
    });
    const response = await POST(postRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID }),
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.mailSent).toBe(true);
    expect(body.exhibitor.id).toBe('exh-1');
    // コード自体はレスポンスに含めない。
    expect(body).not.toHaveProperty('accessCode');
    expect(body.exhibitor).not.toHaveProperty('accessCode');
  });

  it('メール送信失敗でも登録は 201 で成立し、mailSent=false を返す', async () => {
    mocks.registerExhibitor.mockResolvedValue({
      exhibitorId: 'exh-1',
      email: EMAIL,
      mailSent: false,
    });
    const response = await POST(postRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID }),
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.mailSent).toBe(false);
    expect(body.exhibitor.id).toBe('exh-1');
  });
});
