import { describe, expect, it } from 'vitest';
import { decideProvisioning } from './provisioning';

describe('decideProvisioning', () => {
  it('レコードが無ければ create', () => {
    expect(decideProvisioning(null)).toBe('create');
  });
  it('ownerUid 未設定（途中状態）なら create で続きから', () => {
    expect(decideProvisioning({ ownerUid: null })).toBe('create');
  });
  it('ownerUid 設定済みなら replay（冪等）', () => {
    expect(decideProvisioning({ ownerUid: 'uid-123' })).toBe('replay');
  });
});
