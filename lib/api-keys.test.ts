import { describe, expect, it } from 'vitest';
import { generateApiKeyMaterial, toApiKeySummary } from './api-keys';

describe('generateApiKeyMaterial', () => {
  it('keyId は key_ 始まり、secret は十分な長さ', () => {
    const m = generateApiKeyMaterial();
    expect(m.keyId).toMatch(/^key_[0-9a-f]{18}$/);
    expect(m.secret.length).toBeGreaterThanOrEqual(40);
  });
  it('毎回異なる素材を生成する', () => {
    const a = generateApiKeyMaterial();
    const b = generateApiKeyMaterial();
    expect(a.keyId).not.toBe(b.keyId);
    expect(a.secret).not.toBe(b.secret);
  });
});

describe('toApiKeySummary', () => {
  it('鍵そのものを含まない概要を返す', () => {
    const summary = toApiKeySummary('key_x', {
      label: '本家連携',
      secret: 'must-not-leak',
      revoked: false,
      createdAt: { toDate: () => new Date('2026-11-07T00:00:00Z') },
    });
    expect(summary).toEqual({
      id: 'key_x',
      label: '本家連携',
      revoked: false,
      createdAt: '2026-11-07T00:00:00.000Z',
    });
    expect(JSON.stringify(summary)).not.toContain('must-not-leak');
  });
  it('revoked の解釈と createdAt 欠落時のフォールバック', () => {
    expect(toApiKeySummary('k', { revoked: true }).revoked).toBe(true);
    expect(toApiKeySummary('k', {}).revoked).toBe(false);
    expect(toApiKeySummary('k', {}).createdAt).toBe('');
  });
});
