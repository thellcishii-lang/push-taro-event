// lib/event-info.test.ts
import { describe, expect, it } from 'vitest';
import { isInfoPdfCapReached } from './event-info';

describe('isInfoPdfCapReached', () => {
  it('5件未満は登録できる', () => {
    expect(isInfoPdfCapReached(0)).toBe(false);
    expect(isInfoPdfCapReached(4)).toBe(false);
  });
  it('5件で上限', () => {
    expect(isInfoPdfCapReached(5)).toBe(true);
    expect(isInfoPdfCapReached(6)).toBe(true);
  });
});
