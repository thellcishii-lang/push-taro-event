import { describe, expect, it } from 'vitest';
import type { EventConfig } from './event';
import {
  isUsageTargetEvent,
  readTempCapFields,
  toUsageEvent,
} from './provisioning-usage';

function eventWith(status: EventConfig['status']): EventConfig {
  return {
    id: 'event-1',
    name: 'テスト展示会',
    ownerUid: 'uid-1',
    startDate: '2026-12-01',
    endDate: '2026-12-03',
    resetMode: 'full-daily',
    resetTime: '00:00',
    subscriberCap: 50000,
    defaultLocale: 'ja',
    admissionQrEnabled: false,
    couponCap: 100,
    backupRetentionDays: 30,
    status,
    lastResetDate: null,
    finalizedAt: null,
    createdAt: '',
    updatedAt: '',
  };
}

describe('isUsageTargetEvent', () => {
  it('draft と live は対象', () => {
    expect(isUsageTargetEvent(eventWith('draft'))).toBe(true);
    expect(isUsageTargetEvent(eventWith('live'))).toBe(true);
  });
  it('ended は対象外', () => {
    expect(isUsageTargetEvent(eventWith('ended'))).toBe(false);
  });
});

describe('toUsageEvent', () => {
  it('照会レスポンスの形に整える', () => {
    expect(toUsageEvent(eventWith('live'), 1234)).toEqual({
      eventId: 'event-1',
      name: 'テスト展示会',
      status: 'live',
      subscriberCount: 1234,
      subscriberCap: 50000,
      couponCap: 100,
    });
  });
});

describe('readTempCapFields', () => {
  it('両方あればそのまま読む', () => {
    expect(
      readTempCapFields({
        tempSubscriberCapUntil: '2026-12-31T14:59:59.000Z',
        restoredSubscriberCap: 50000,
      }),
    ).toEqual({
      tempSubscriberCapUntil: '2026-12-31T14:59:59.000Z',
      restoredSubscriberCap: 50000,
    });
  });
  it('旧レコード（フィールドなし）は null', () => {
    expect(readTempCapFields({})).toEqual({
      tempSubscriberCapUntil: null,
      restoredSubscriberCap: null,
    });
  });
  it('明示的な null は null のまま', () => {
    expect(
      readTempCapFields({
        tempSubscriberCapUntil: null,
        restoredSubscriberCap: null,
      }),
    ).toEqual({ tempSubscriberCapUntil: null, restoredSubscriberCap: null });
  });
  it('型が合わない値は null に倒す', () => {
    expect(
      readTempCapFields({
        tempSubscriberCapUntil: 123,
        restoredSubscriberCap: '50000',
      }),
    ).toEqual({ tempSubscriberCapUntil: null, restoredSubscriberCap: null });
  });
});
