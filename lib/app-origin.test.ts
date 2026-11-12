import { describe, expect, it } from 'vitest';
import { APP_ORIGIN, eventVisitorUrl, resolveAppOrigin } from './app-origin';

const EVENT_ID = 'evt_abc123';

describe('来場者ページ URL', () => {
  it('既定では本番 origin の /e/{eventId} になる', () => {
    expect(resolveAppOrigin()).toBe(APP_ORIGIN);
    expect(eventVisitorUrl(EVENT_ID)).toBe(`${APP_ORIGIN}/e/${EVENT_ID}`);
  });

  it('NEXT_PUBLIC_APP_ORIGIN があればそちらを優先し、末尾スラッシュを除く', () => {
    const original = process.env.NEXT_PUBLIC_APP_ORIGIN;
    process.env.NEXT_PUBLIC_APP_ORIGIN = 'https://example.com/';
    try {
      expect(eventVisitorUrl(EVENT_ID)).toBe(
        `https://example.com/e/${EVENT_ID}`,
      );
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_APP_ORIGIN;
      else process.env.NEXT_PUBLIC_APP_ORIGIN = original;
    }
  });
});
