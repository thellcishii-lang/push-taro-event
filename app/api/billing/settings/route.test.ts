// app/api/billing/settings/route.test.ts
// 出店者課金の Stripe 設定 API: 認証必須、オプション OFF・契約なしは
// 404（findEnabledBillingOrganizer が null）、保存されたキー本体は
// レスポンスに絶対に含めないことを検証する。
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUidFromRequest: vi.fn(),
  passwordChangeBlock: vi.fn(),
  findEnabledBillingOrganizer: vi.fn(),
  getStripeBillingSettingsState: vi.fn(),
  saveStripeBillingSettings: vi.fn(),
}));

vi.mock('@/lib/event-auth', () => ({
  getUidFromRequest: mocks.getUidFromRequest,
  passwordChangeBlock: mocks.passwordChangeBlock,
}));

vi.mock('@/lib/firebase-admin', () => ({
  db: {},
}));

vi.mock('@/lib/event-billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/event-billing')>();
  return {
    ...actual,
    findEnabledBillingOrganizer: mocks.findEnabledBillingOrganizer,
    getStripeBillingSettingsState: mocks.getStripeBillingSettingsState,
    saveStripeBillingSettings: mocks.saveStripeBillingSettings,
  };
});

vi.mock('@/lib/app-origin', () => ({
  resolveAppOrigin: () => 'https://example.com',
}));

const { GET, PUT } = await import('./route');

function request(body?: unknown) {
  return new Request('http://localhost/api/billing/settings', {
    method: body === undefined ? 'GET' : 'PUT',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUidFromRequest.mockResolvedValue('owner-1');
  mocks.passwordChangeBlock.mockResolvedValue(null);
  mocks.findEnabledBillingOrganizer.mockResolvedValue({
    contractId: 'contract-1',
    ownerUid: 'owner-1',
    billingOptionEnabled: true,
  });
  mocks.getStripeBillingSettingsState.mockResolvedValue({
    secretKeyConfigured: true,
    webhookSecretConfigured: false,
  });
  mocks.saveStripeBillingSettings.mockResolvedValue(undefined);
});

describe('GET /api/billing/settings', () => {
  it('未ログインは 401', async () => {
    mocks.getUidFromRequest.mockResolvedValue(null);
    const res = await GET(request());
    expect(res.status).toBe(401);
  });

  it('契約が無い・オプション OFF は 404', async () => {
    mocks.findEnabledBillingOrganizer.mockResolvedValue(null);
    const res = await GET(request());
    expect(res.status).toBe(404);
    expect(mocks.getStripeBillingSettingsState).not.toHaveBeenCalled();
  });

  it('設定状態と Webhook URL を返し、キー本体は含まない', async () => {
    const res = await GET(request());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      secretKeyConfigured: true,
      webhookSecretConfigured: false,
      webhookUrl: 'https://example.com/api/billing/webhook/contract-1',
    });
    expect(JSON.stringify(body)).not.toContain('sk_');
    expect(JSON.stringify(body)).not.toContain('whsec_');
  });
});

describe('PUT /api/billing/settings', () => {
  it('パスワード変更が未完了ならブロックされる', async () => {
    mocks.passwordChangeBlock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'パスワード変更が必要です' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const res = await PUT(request({ secretKey: 'sk_live_abcdefghijklmnop' }));
    expect(res.status).toBe(403);
    expect(mocks.saveStripeBillingSettings).not.toHaveBeenCalled();
  });

  it('オプション OFF の契約は 404 で保存しない', async () => {
    mocks.findEnabledBillingOrganizer.mockResolvedValue(null);
    const res = await PUT(request({ secretKey: 'sk_live_abcdefghijklmnop' }));
    expect(res.status).toBe(404);
    expect(mocks.saveStripeBillingSettings).not.toHaveBeenCalled();
  });

  it('妥当なキーを契約配下に保存し、状態を返す', async () => {
    const res = await PUT(request({ secretKey: 'sk_live_abcdefghijklmnop' }));
    expect(res.status).toBe(200);
    expect(mocks.saveStripeBillingSettings).toHaveBeenCalledWith(expect.anything(), 'contract-1', {
      secretKey: 'sk_live_abcdefghijklmnop',
    });
    const body = await res.json();
    expect(body.secretKeyConfigured).toBe(true);
  });

  it('形式が不正なキーは 400', async () => {
    const res = await PUT(request({ secretKey: 'not-a-key' }));
    expect(res.status).toBe(400);
    expect(mocks.saveStripeBillingSettings).not.toHaveBeenCalled();
  });
});
