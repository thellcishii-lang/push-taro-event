// app/api/events/[eventId]/exhibitors/[exhibitorId]/password/route.test.ts
// 主催者の再発行 POST が lib の mailSent（メール送信成否）をレスポンスへ
// 返すことの回帰テスト。画面側は mailSent=false のとき失敗が分かる
// メッセージを出す。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireEventOwner: vi.fn(),
  reissueExhibitorPassword: vi.fn(),
}));

vi.mock('@/lib/event-auth', () => ({
  requireEventOwner: mocks.requireEventOwner,
}));
vi.mock('@/lib/exhibitor-access', () => ({
  ExhibitorAccessError: class ExhibitorAccessError extends Error {
    status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.status = status;
    }
  },
  reissueExhibitorPassword: mocks.reissueExhibitorPassword,
}));

import { POST } from './route';

const EVENT_ID = 'event-1';
const EMAIL = 'exhibitor@example.com';

function postRequest() {
  return new Request(
    `http://localhost/api/events/${EVENT_ID}/exhibitors/exh-1/password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireEventOwner.mockResolvedValue({
    uid: 'owner-1',
    event: { name: 'テストイベント', defaultLocale: 'ja' },
  });
});

describe('POST /api/events/[eventId]/exhibitors/[exhibitorId]/password', () => {
  it('メール送信成功時は mailSent=true を返す', async () => {
    mocks.reissueExhibitorPassword.mockResolvedValue({
      email: EMAIL,
      mailSent: true,
    });
    const response = await POST(postRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID, exhibitorId: 'exh-1' }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ ok: true, email: EMAIL, mailSent: true });
  });

  it('メール送信失敗時は mailSent=false を返す（再発行自体は成立）', async () => {
    mocks.reissueExhibitorPassword.mockResolvedValue({
      email: EMAIL,
      mailSent: false,
    });
    const response = await POST(postRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID, exhibitorId: 'exh-1' }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ ok: true, email: EMAIL, mailSent: false });
  });
});
