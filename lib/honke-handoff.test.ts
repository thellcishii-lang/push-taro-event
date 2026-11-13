import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import {
  HANDOFF_TTL_SECONDS,
  buildHonkeHandoffUrl,
  createHandoffToken,
} from './honke-handoff';

const SECRET = 'test-secret-value';
const NOW = 1_800_000_000;

function decodePayload(token: string): Record<string, unknown> {
  const [payloadPart] = token.split('.');
  return JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
}

describe('createHandoffToken', () => {
  it('builds a signed token the honke verifier format accepts', () => {
    const token = createHandoffToken(
      { contractId: 'shop-1', purpose: 'account', nonce: 'fixed-nonce' },
      SECRET,
      NOW
    );
    const [payloadPart, signature] = token.split('.');
    const expected = createHmac('sha256', SECRET).update(payloadPart).digest('base64url');
    expect(signature).toBe(expected);
    expect(decodePayload(token)).toEqual({
      v: 1,
      contractId: 'shop-1',
      purpose: 'account',
      exp: NOW + HANDOFF_TTL_SECONDS,
      nonce: 'fixed-nonce',
    });
  });

  it('includes the eventId for coupon-option tokens', () => {
    const token = createHandoffToken(
      { contractId: 'shop-1', purpose: 'coupon-option', eventId: 'ev-9', nonce: 'n' },
      SECRET,
      NOW
    );
    expect(decodePayload(token).eventId).toBe('ev-9');
  });

  it('generates a random nonce when not specified', () => {
    const a = createHandoffToken({ contractId: 's', purpose: 'account' }, SECRET, NOW);
    const b = createHandoffToken({ contractId: 's', purpose: 'account' }, SECRET, NOW);
    expect(decodePayload(a).nonce).not.toBe(decodePayload(b).nonce);
  });
});

describe('buildHonkeHandoffUrl', () => {
  it('points account links at /event-account', () => {
    const url = buildHonkeHandoffUrl({ contractId: 'shop-1', purpose: 'account' }, SECRET, NOW);
    expect(url.startsWith('https://push-taro.com/event-account?handoff=')).toBe(true);
  });

  it('points coupon-option links at /event-option with the eventId', () => {
    const url = buildHonkeHandoffUrl(
      { contractId: 'shop-1', purpose: 'coupon-option', eventId: 'ev 1' },
      SECRET,
      NOW
    );
    expect(url.startsWith('https://push-taro.com/event-option?eventId=ev%201&handoff=')).toBe(
      true
    );
  });
});
