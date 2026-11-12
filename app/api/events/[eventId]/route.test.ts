// app/api/events/[eventId]/route.test.ts
// DELETE が「主催者本人の確認（requireEventOwner）」を通し、
// 削除できる状態（下書き・終了）でのみ完全削除を実行することを検証する。
// 開催中は 409 で止まり、削除は一切呼ばれない。
import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireEventOwner: vi.fn(),
  deleteEventCompletely: vi.fn(),
}));

vi.mock('@/lib/event-auth', () => ({
  getUidFromRequest: vi.fn(),
  passwordChangeBlock: vi.fn(),
  requireEventOwner: mocks.requireEventOwner,
}));
vi.mock('@/lib/event-store', () => ({
  getEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEventCompletely: mocks.deleteEventCompletely,
}));

import { DELETE } from './route';

const EVENT_ID = 'event-1';

function deleteRequest() {
  return new Request(`http://localhost/api/events/${EVENT_ID}`, {
    method: 'DELETE',
  });
}

function guardWith(status: string) {
  mocks.requireEventOwner.mockResolvedValue({
    uid: 'owner-1',
    event: { id: EVENT_ID, status },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.deleteEventCompletely.mockResolvedValue(undefined);
});

describe('DELETE /api/events/[eventId]', () => {
  it('本人確認で弾かれたらそのエラーを返し、削除しない', async () => {
    mocks.requireEventOwner.mockResolvedValue({
      error: NextResponse.json({ error: '権限がありません' }, { status: 403 }),
    });
    const response = await DELETE(deleteRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID }),
    });
    expect(response.status).toBe(403);
    expect(mocks.deleteEventCompletely).not.toHaveBeenCalled();
  });

  it('開催中は 409 で削除できない', async () => {
    guardWith('live');
    const response = await DELETE(deleteRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID }),
    });
    expect(response.status).toBe(409);
    expect(mocks.deleteEventCompletely).not.toHaveBeenCalled();
  });

  it('下書きは削除できる', async () => {
    guardWith('draft');
    const response = await DELETE(deleteRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(mocks.deleteEventCompletely).toHaveBeenCalledWith(EVENT_ID);
  });

  it('終了したイベントは削除できる', async () => {
    guardWith('ended');
    const response = await DELETE(deleteRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID }),
    });
    expect(response.status).toBe(200);
    expect(mocks.deleteEventCompletely).toHaveBeenCalledWith(EVENT_ID);
  });

  it('削除処理が失敗したら 500 を返す', async () => {
    guardWith('draft');
    mocks.deleteEventCompletely.mockRejectedValue(new Error('storage error'));
    const response = await DELETE(deleteRequest(), {
      params: Promise.resolve({ eventId: EVENT_ID }),
    });
    expect(response.status).toBe(500);
  });
});
