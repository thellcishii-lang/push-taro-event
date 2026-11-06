import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ get: vi.fn(), where: vi.fn(), update: vi.fn() }));
vi.mock('@/lib/firebase-admin', () => ({
  db: { collection: () => ({ where: mocks.where, doc: () => ({ update: mocks.update }) }) },
}));
import { generatePosApiKey, verifyPosApiKey } from './pos-api-key';
import { authenticatePosRequest } from './pos-api-auth';

const generated = generatePosApiKey();
const request = (key = generated.key, terminalId?: string) => new Request('https://example.com', {
  headers: { Authorization: `Bearer ${key}`, ...(terminalId ? { 'X-POS-Terminal-Id': terminalId } : {}) },
});

describe('POS key authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.where.mockReturnValue({ get: mocks.get });
    mocks.get.mockResolvedValue({ docs: [{ id: 'shop', data: () => ({ plan: 'pro', posApi: generated }) }] });
    mocks.update.mockResolvedValue(undefined);
  });

  it('generates verifiable keys and rejects wrong keys or malformed hashes', () => {
    expect(verifyPosApiKey(generated.key, generated.keyHash)).toBe(true);
    expect(verifyPosApiKey(generatePosApiKey().key, generated.keyHash)).toBe(false);
    expect(verifyPosApiKey(generated.key, ':')).toBe(false);
    expect(verifyPosApiKey(generated.key, 'bad:hash')).toBe(false);
  });

  it('queries by key prefix and records last use', async () => {
    expect(await authenticatePosRequest(request())).toMatchObject({ shopId: 'shop' });
    expect(mocks.where).toHaveBeenCalledWith('posApi.keyPrefix', '==', generated.keyPrefix);
    expect(mocks.update).toHaveBeenCalled();
  });

  it.each([
    { plan: 'standard', posApi: generated },
    { plan: 'pro', posApi: { ...generated, revokedAt: new Date() } },
  ])('rejects revoked or non-PRO keys', async (shop) => {
    mocks.get.mockResolvedValue({ docs: [{ id: 'shop', data: () => shop }] });
    expect(await authenticatePosRequest(request())).toMatchObject({ status: 401 });
  });

  it('accepts PRO shops whose plan is stored with different casing', async () => {
    mocks.get.mockResolvedValue({ docs: [{ id: 'shop', data: () => ({ plan: 'PRO', posApi: generated }) }] });
    expect(await authenticatePosRequest(request())).toMatchObject({ shopId: 'shop' });
  });

  it('rejects malformed keys before querying Firestore', async () => {
    expect(await authenticatePosRequest(request('pt_live_wrong'))).toMatchObject({ status: 401 });
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it('enforces configured terminals even when the header is missing', async () => {
    mocks.get.mockResolvedValue({ docs: [{ id: 'shop', data: () => ({
      plan: 'pro', posApi: { ...generated, terminals: ['register-01'] },
    }) }] });
    expect(await authenticatePosRequest(request())).toMatchObject({ status: 403 });
    expect(await authenticatePosRequest(request(generated.key, 'other'))).toMatchObject({ status: 403 });
    expect(await authenticatePosRequest(request(generated.key, 'register-01'))).toMatchObject({ shopId: 'shop' });
  });
});
