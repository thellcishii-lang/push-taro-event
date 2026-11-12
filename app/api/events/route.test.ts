// app/api/events/route.test.ts
// POST の作成時状態指定（下書き／開催中）が createEvent へ渡ることと、
// 不正な状態指定・同時上限では作成されないことを検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUidFromRequest: vi.fn(),
  passwordChangeBlock: vi.fn(),
  createEvent: vi.fn(),
  listEventsByOwner: vi.fn(),
  findOrganizerByOwnerUid: vi.fn(),
  resolveEffectiveCaps: vi.fn(),
}));

vi.mock('@/lib/event-auth', () => ({
  getUidFromRequest: mocks.getUidFromRequest,
  passwordChangeBlock: mocks.passwordChangeBlock,
}));
vi.mock('@/lib/event-store', () => ({
  createEvent: mocks.createEvent,
  listEventsByOwner: mocks.listEventsByOwner,
}));
vi.mock('@/lib/organizers', () => ({
  findOrganizerByOwnerUid: mocks.findOrganizerByOwnerUid,
  resolveEffectiveCaps: mocks.resolveEffectiveCaps,
}));

import { POST } from './route';

function postRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const baseBody = {
  name: 'テストイベント',
  startDate: '2026-11-20',
  endDate: '2026-11-21',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUidFromRequest.mockResolvedValue('owner-1');
  mocks.passwordChangeBlock.mockResolvedValue(null);
  mocks.listEventsByOwner.mockResolvedValue([]);
  mocks.findOrganizerByOwnerUid.mockResolvedValue(null);
  mocks.resolveEffectiveCaps.mockReturnValue({
    subscriberCap: 50000,
    couponCap: 100,
  });
  mocks.createEvent.mockResolvedValue({ id: 'event-1', status: 'draft' });
});

describe('POST /api/events', () => {
  it('状態未指定なら下書きで作成する', async () => {
    const response = await POST(postRequest(baseBody));
    expect(response.status).toBe(201);
    expect(mocks.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' }),
    );
  });

  it('状態に live を指定すると開催中として作成する', async () => {
    const response = await POST(postRequest({ ...baseBody, status: 'live' }));
    expect(response.status).toBe(201);
    expect(mocks.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'live' }),
    );
  });

  it('状態に draft を指定すると下書きで作成する', async () => {
    const response = await POST(postRequest({ ...baseBody, status: 'draft' }));
    expect(response.status).toBe(201);
    expect(mocks.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' }),
    );
  });

  it('状態に ended を指定したら 400 で作成しない', async () => {
    const response = await POST(postRequest({ ...baseBody, status: 'ended' }));
    expect(response.status).toBe(400);
    expect(mocks.createEvent).not.toHaveBeenCalled();
  });

  it('下書き＋開催中が上限（3件）に達していたら 400 で作成しない', async () => {
    mocks.listEventsByOwner.mockResolvedValue([
      { status: 'draft' },
      { status: 'live' },
      { status: 'draft' },
    ]);
    const response = await POST(postRequest({ ...baseBody, status: 'live' }));
    expect(response.status).toBe(400);
    expect(mocks.createEvent).not.toHaveBeenCalled();
  });

  it('未認証なら 401', async () => {
    mocks.getUidFromRequest.mockResolvedValue(null);
    const response = await POST(postRequest(baseBody));
    expect(response.status).toBe(401);
    expect(mocks.createEvent).not.toHaveBeenCalled();
  });
});
