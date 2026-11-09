import { describe, expect, it } from 'vitest';
import {
  buildCapWarning,
  type CapWarningCandidate,
} from './cap-warning';

const organizerWithTemp = {
  tempSubscriberCapUntil: '2026-12-31',
  restoredSubscriberCap: 50000,
};

function candidate(
  overrides: Partial<CapWarningCandidate> = {},
): CapWarningCandidate {
  return {
    eventId: 'event-1',
    name: 'テスト展示会',
    status: 'live',
    subscriberCount: 60000,
    ...overrides,
  };
}

describe('buildCapWarning', () => {
  it('契約者レコードが無ければ警告なし', () => {
    expect(buildCapWarning(null, [candidate()])).toBeNull();
  });

  it('リバート日が無ければ警告なし', () => {
    expect(
      buildCapWarning(
        { tempSubscriberCapUntil: null, restoredSubscriberCap: 50000 },
        [candidate()],
      ),
    ).toBeNull();
  });

  it('戻し先の枠が無ければ警告なし', () => {
    expect(
      buildCapWarning(
        { tempSubscriberCapUntil: '2026-12-31', restoredSubscriberCap: null },
        [candidate()],
      ),
    ).toBeNull();
  });

  it('開催中で枠を超えているイベントがあれば警告を返す', () => {
    expect(buildCapWarning(organizerWithTemp, [candidate()])).toEqual({
      revertDate: '2026-12-31',
      restoredSubscriberCap: 50000,
      events: [
        { eventId: 'event-1', name: 'テスト展示会', subscriberCount: 60000 },
      ],
    });
  });

  it('枠ちょうど・枠未満は対象外', () => {
    expect(
      buildCapWarning(organizerWithTemp, [
        candidate({ subscriberCount: 50000 }),
      ]),
    ).toBeNull();
    expect(
      buildCapWarning(organizerWithTemp, [
        candidate({ subscriberCount: 49999 }),
      ]),
    ).toBeNull();
  });

  it('下書き・終了イベントは超えていても対象外', () => {
    expect(
      buildCapWarning(organizerWithTemp, [
        candidate({ eventId: 'event-d', status: 'draft' }),
        candidate({ eventId: 'event-e', status: 'ended' }),
      ]),
    ).toBeNull();
  });

  it('複数イベントでは超えているものだけを残す', () => {
    const warning = buildCapWarning(organizerWithTemp, [
      candidate({ eventId: 'event-1', subscriberCount: 80000 }),
      candidate({ eventId: 'event-2', subscriberCount: 10 }),
      candidate({ eventId: 'event-3', subscriberCount: 50001 }),
    ]);
    expect(warning?.events.map((e) => e.eventId)).toEqual([
      'event-1',
      'event-3',
    ]);
  });
});
