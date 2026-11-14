// app/api/admin/organizers/[contractId]/route.test.ts
// 運営 PATCH: 課金オプション（billingOptionEnabled）の ON/OFF が
// できること、boolean 以外は 400 になることを検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyAdmin: vi.fn(),
  getOrganizer: vi.fn(),
  updateOrganizer: vi.fn(),
}));

vi.mock('@/lib/admin-auth', () => ({
  verifyAdmin: mocks.verifyAdmin,
}));

vi.mock('@/lib/organizers', () => ({
  getOrganizer: mocks.getOrganizer,
  updateOrganizer: mocks.updateOrganizer,
}));

vi.mock('@/lib/event-store', () => ({
  listEventsByOwner: vi.fn().mockResolvedValue([]),
}));

const { PATCH } = await import('./route');

function request(body: unknown) {
  return new Request('http://localhost/api/admin/organizers/contract-1', {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer admin-token',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function params() {
  return { params: Promise.resolve({ contractId: 'contract-1' }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyAdmin.mockResolvedValue('admin-uid');
  mocks.getOrganizer.mockResolvedValue({
    contractId: 'contract-1',
    ownerUid: 'owner-1',
    billingOptionEnabled: false,
  });
  mocks.updateOrganizer.mockResolvedValue(true);
});

describe('PATCH /api/admin/organizers/[contractId]（課金オプション）', () => {
  it('運営でなければ 403', async () => {
    mocks.verifyAdmin.mockResolvedValue(null);
    const res = await PATCH(request({ billingOptionEnabled: true }), params());
    expect(res.status).toBe(403);
  });

  it('billingOptionEnabled を ON にできる', async () => {
    const res = await PATCH(request({ billingOptionEnabled: true }), params());
    expect(res.status).toBe(200);
    expect(mocks.updateOrganizer).toHaveBeenCalledWith('contract-1', {
      billingOptionEnabled: true,
    });
  });

  it('billingOptionEnabled を OFF にもできる', async () => {
    const res = await PATCH(request({ billingOptionEnabled: false }), params());
    expect(res.status).toBe(200);
    expect(mocks.updateOrganizer).toHaveBeenCalledWith('contract-1', {
      billingOptionEnabled: false,
    });
  });

  it('boolean 以外は 400 で更新しない', async () => {
    const res = await PATCH(request({ billingOptionEnabled: 'yes' }), params());
    expect(res.status).toBe(400);
    expect(mocks.updateOrganizer).not.toHaveBeenCalled();
  });
});
