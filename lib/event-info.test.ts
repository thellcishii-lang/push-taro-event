// lib/event-info.test.ts
import { describe, expect, it } from 'vitest';
import { isInfoPdfCapReached, isInfoPdfStoragePath } from './event-info';

describe('isInfoPdfStoragePath', () => {
  const valid = 'organizers/owner1/events/ev1/info-pdfs/abc.pdf';

  it('所有者本人の現行形式パスを受け付ける', () => {
    expect(isInfoPdfStoragePath('owner1', 'ev1', valid)).toBe(true);
  });
  it('他人の uid や他イベントのパスは受け付けない', () => {
    expect(
      isInfoPdfStoragePath('owner1', 'ev1', 'organizers/someone-else/events/ev1/info-pdfs/abc.pdf'),
    ).toBe(false);
    expect(
      isInfoPdfStoragePath('owner1', 'ev1', 'organizers/owner1/events/ev2/info-pdfs/abc.pdf'),
    ).toBe(false);
  });
  it('移行前の旧形式パスは登録では受け付けない', () => {
    expect(isInfoPdfStoragePath('owner1', 'ev1', 'events/ev1/info-pdfs/abc.pdf')).toBe(false);
  });
  it('サブディレクトリや PDF 以外は受け付けない', () => {
    expect(
      isInfoPdfStoragePath('owner1', 'ev1', 'organizers/owner1/events/ev1/info-pdfs/sub/abc.pdf'),
    ).toBe(false);
    expect(
      isInfoPdfStoragePath('owner1', 'ev1', 'organizers/owner1/events/ev1/info-pdfs/abc.png'),
    ).toBe(false);
    expect(isInfoPdfStoragePath('owner1', 'ev1', '')).toBe(false);
    expect(isInfoPdfStoragePath('owner1', 'ev1', null)).toBe(false);
    expect(isInfoPdfStoragePath('owner1', 'ev1', undefined)).toBe(false);
  });
});

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
