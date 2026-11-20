// app/api/events/[eventId]/registration-status/route.test.ts
// 登録状態の確認 API: 電話認証トークンから本人を特定し、
// 現在のリセット範囲で登録済みかどうかだけを返すことを検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  getVisitorRegistrationStatus: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => ({
  authAdmin: { verifyIdToken: mocks.verifyIdToken },
}));

vi.mock('@/lib/event-register', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-register')>();
  return {
    ...actual,
    getVisitorRegistrationStatus: mocks.getVisitorRegistrationStatus,
  };
});

const { GET } = await import('./route');
const { memberIdForPhone } = await import('@/lib/event-register');

const PHONE = '+819012345678';

function request(withAuth = true) {
  return new Request('http://localhost/api/events/event-1/registration-status', {
    headers: withAuth ? { Authorization: 'Bearer id-token' } : {},
  });
}

function params() {
  return { params: Promise.resolve({ eventId: 'event-1' }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyIdToken.mockResolvedValue({ phone_number: PHONE });
  mocks.getVisitorRegistrationStatus.mockResolvedValue({ ok: true, registered: true });
});

describe('GET /api/events/[eventId]/registration-status', () => {
  it('登録済みなら registered=true を返し、電話番号から導いた memberId で引く', async () => {
    const res = await GET(request(), params());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ registered: true });
    expect(mocks.getVisitorRegistrationStatus).toHaveBeenCalledWith(
      'event-1',
      memberIdForPhone(PHONE),
    );
  });

  it('未登録なら registered=false を返す', async () => {
    mocks.getVisitorRegistrationStatus.mockResolvedValue({ ok: true, registered: false });
    const res = await GET(request(), params());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ registered: false });
  });

  it('イベントが無ければ 404', async () => {
    mocks.getVisitorRegistrationStatus.mockResolvedValue({
      ok: false,
      status: 404,
      error: 'イベントが見つかりません',
    });
    const res = await GET(request(), params());
    expect(res.status).toBe(404);
  });

  it('Authorization ヘッダーが無ければ 401 で、状態確認は呼ばない', async () => {
    const res = await GET(request(false), params());
    expect(res.status).toBe(401);
    expect(mocks.getVisitorRegistrationStatus).not.toHaveBeenCalled();
  });

  it('電話番号を含まないトークンは 401', async () => {
    mocks.verifyIdToken.mockResolvedValue({ uid: 'anonymous-user' });
    const res = await GET(request(), params());
    expect(res.status).toBe(401);
    expect(mocks.getVisitorRegistrationStatus).not.toHaveBeenCalled();
  });

  it('トークン検証に失敗したら 401', async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error('expired'));
    const res = await GET(request(), params());
    expect(res.status).toBe(401);
    expect(mocks.getVisitorRegistrationStatus).not.toHaveBeenCalled();
  });
});
