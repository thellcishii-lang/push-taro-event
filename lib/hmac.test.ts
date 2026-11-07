import { describe, expect, it } from 'vitest';
import { computeSignature, isTimestampFresh, verifySignature } from './hmac';

const SECRET = 'test-secret-key';
const NOW = 1_800_000_000;

describe('computeSignature / verifySignature', () => {
  it('正しい署名は検証を通る', () => {
    const ts = String(NOW);
    const body = '{"contractId":"c1"}';
    const signature = computeSignature(SECRET, ts, body);
    expect(
      verifySignature({ secret: SECRET, timestamp: ts, rawBody: body, signature, nowSec: NOW }),
    ).toBe(true);
  });

  it('本文が改ざんされていたら拒否する', () => {
    const ts = String(NOW);
    const signature = computeSignature(SECRET, ts, '{"amount":100}');
    expect(
      verifySignature({
        secret: SECRET,
        timestamp: ts,
        rawBody: '{"amount":999}',
        signature,
        nowSec: NOW,
      }),
    ).toBe(false);
  });

  it('キーが違えば拒否する', () => {
    const ts = String(NOW);
    const body = '{}';
    const signature = computeSignature('another-secret', ts, body);
    expect(
      verifySignature({ secret: SECRET, timestamp: ts, rawBody: body, signature, nowSec: NOW }),
    ).toBe(false);
  });

  it('古いタイムスタンプはリプレイとして拒否する', () => {
    const ts = String(NOW - 301);
    const body = '{}';
    const signature = computeSignature(SECRET, ts, body);
    expect(
      verifySignature({ secret: SECRET, timestamp: ts, rawBody: body, signature, nowSec: NOW }),
    ).toBe(false);
  });

  it('署名の形式が壊れていても例外なく false', () => {
    expect(
      verifySignature({
        secret: SECRET,
        timestamp: String(NOW),
        rawBody: '{}',
        signature: 'not-hex',
        nowSec: NOW,
      }),
    ).toBe(false);
  });
});

describe('isTimestampFresh', () => {
  it('許容範囲内は true、範囲外と不正値は false', () => {
    expect(isTimestampFresh(String(NOW), NOW)).toBe(true);
    expect(isTimestampFresh(String(NOW - 300), NOW)).toBe(true);
    expect(isTimestampFresh(String(NOW + 300), NOW)).toBe(true);
    expect(isTimestampFresh(String(NOW - 301), NOW)).toBe(false);
    expect(isTimestampFresh('abc', NOW)).toBe(false);
    expect(isTimestampFresh('', NOW)).toBe(false);
  });
});
