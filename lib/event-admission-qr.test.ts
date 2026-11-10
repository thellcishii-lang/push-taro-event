// lib/event-admission-qr.test.ts
import { describe, expect, it } from 'vitest';
import {
  MAX_ADMISSION_QR_CONTENT_LENGTH,
  deleteAdmissionQr,
  getAdmissionQrState,
  saveAdmissionQr,
  validateAdmissionQrContent,
  type AdmissionQrStore,
} from './event-admission-qr';

const EVENT_ID = 'event-1';
const MEMBER_ID = 'member-1';

interface FakeState {
  event: { admissionQrEnabled: boolean } | null;
  subscriber: { admissionQrContent?: unknown } | null;
  writes: string[];
  clears: number;
}

function fakeStore(initial: Partial<FakeState> = {}): {
  store: AdmissionQrStore;
  state: FakeState;
} {
  const state: FakeState = {
    event: { admissionQrEnabled: true },
    subscriber: {},
    writes: [],
    clears: 0,
    ...initial,
  };
  const store: AdmissionQrStore = {
    async loadEvent() {
      return state.event;
    },
    async loadSubscriber() {
      return state.subscriber;
    },
    async writeAdmissionQr(_eventId, _memberId, content) {
      state.writes.push(content);
      state.subscriber = { ...(state.subscriber ?? {}), admissionQrContent: content };
    },
    async clearAdmissionQr() {
      state.clears += 1;
      if (state.subscriber) delete state.subscriber.admissionQrContent;
    },
  };
  return { store, state };
}

describe('validateAdmissionQrContent', () => {
  it('通常の内容を通し、前後の空白は取り除く', () => {
    expect(validateAdmissionQrContent('  TICKET-123  ')).toEqual({
      ok: true,
      content: 'TICKET-123',
    });
  });
  it('空・空白だけ・文字列でないものは拒否する', () => {
    expect(validateAdmissionQrContent('')).toMatchObject({ ok: false });
    expect(validateAdmissionQrContent('   ')).toMatchObject({ ok: false });
    expect(validateAdmissionQrContent(undefined)).toMatchObject({ ok: false });
    expect(validateAdmissionQrContent(123)).toMatchObject({ ok: false });
  });
  it('上限ちょうどは通し、1文字超えは拒否する', () => {
    const atMax = 'a'.repeat(MAX_ADMISSION_QR_CONTENT_LENGTH);
    expect(validateAdmissionQrContent(atMax)).toEqual({ ok: true, content: atMax });
    expect(validateAdmissionQrContent(`${atMax}a`)).toMatchObject({ ok: false });
  });
});

describe('getAdmissionQrState', () => {
  it('イベントが無ければ 404', async () => {
    const { store } = fakeStore({ event: null });
    await expect(getAdmissionQrState(store, EVENT_ID, MEMBER_ID)).resolves.toEqual({
      ok: false,
      status: 404,
      error: 'イベントが見つかりません',
    });
  });
  it('オンで保存済みなら内容を返す', async () => {
    const { store } = fakeStore({ subscriber: { admissionQrContent: 'TICKET-123' } });
    await expect(getAdmissionQrState(store, EVENT_ID, MEMBER_ID)).resolves.toEqual({
      ok: true,
      enabled: true,
      stored: true,
      content: 'TICKET-123',
    });
  });
  it('オンで未保存（購読者レコード無し含む）なら stored=false', async () => {
    const noContent = fakeStore({ subscriber: {} });
    await expect(
      getAdmissionQrState(noContent.store, EVENT_ID, MEMBER_ID),
    ).resolves.toEqual({ ok: true, enabled: true, stored: false, content: null });
    const noSubscriber = fakeStore({ subscriber: null });
    await expect(
      getAdmissionQrState(noSubscriber.store, EVENT_ID, MEMBER_ID),
    ).resolves.toEqual({ ok: true, enabled: true, stored: false, content: null });
  });
  it('オフのときは保存済みでも状態に含めない', async () => {
    const { store } = fakeStore({
      event: { admissionQrEnabled: false },
      subscriber: { admissionQrContent: 'TICKET-123' },
    });
    await expect(getAdmissionQrState(store, EVENT_ID, MEMBER_ID)).resolves.toEqual({
      ok: true,
      enabled: false,
      stored: false,
      content: null,
    });
  });
});

describe('saveAdmissionQr', () => {
  it('オンなら保存され、状態取得にも反映される', async () => {
    const { store, state } = fakeStore();
    await expect(
      saveAdmissionQr(store, EVENT_ID, MEMBER_ID, 'https://example.jp/t/abc'),
    ).resolves.toEqual({ ok: true });
    expect(state.writes).toEqual(['https://example.jp/t/abc']);
    await expect(getAdmissionQrState(store, EVENT_ID, MEMBER_ID)).resolves.toEqual({
      ok: true,
      enabled: true,
      stored: true,
      content: 'https://example.jp/t/abc',
    });
  });
  it('オフなら 403 で拒否し、書き込まない', async () => {
    const { store, state } = fakeStore({ event: { admissionQrEnabled: false } });
    const result = await saveAdmissionQr(store, EVENT_ID, MEMBER_ID, 'TICKET-123');
    expect(result).toMatchObject({ ok: false, status: 403 });
    expect(state.writes).toEqual([]);
  });
  it('未登録（購読者レコード無し）なら 404 で書き込まない', async () => {
    const { store, state } = fakeStore({ subscriber: null });
    const result = await saveAdmissionQr(store, EVENT_ID, MEMBER_ID, 'TICKET-123');
    expect(result).toMatchObject({ ok: false, status: 404 });
    expect(state.writes).toEqual([]);
  });
  it('不正な内容は 400 で書き込まない', async () => {
    const { store, state } = fakeStore();
    const result = await saveAdmissionQr(store, EVENT_ID, MEMBER_ID, '   ');
    expect(result).toMatchObject({ ok: false, status: 400 });
    expect(state.writes).toEqual([]);
  });
});

describe('deleteAdmissionQr', () => {
  it('オンなら削除され、未保存でも成功する（冪等）', async () => {
    const { store, state } = fakeStore({ subscriber: { admissionQrContent: 'TICKET-123' } });
    await expect(deleteAdmissionQr(store, EVENT_ID, MEMBER_ID)).resolves.toEqual({
      ok: true,
    });
    expect(state.clears).toBe(1);
    await expect(getAdmissionQrState(store, EVENT_ID, MEMBER_ID)).resolves.toEqual({
      ok: true,
      enabled: true,
      stored: false,
      content: null,
    });
    await expect(deleteAdmissionQr(store, EVENT_ID, MEMBER_ID)).resolves.toEqual({
      ok: true,
    });
  });
  it('オフなら 403 で拒否し、削除しない', async () => {
    const { store, state } = fakeStore({
      event: { admissionQrEnabled: false },
      subscriber: { admissionQrContent: 'TICKET-123' },
    });
    const result = await deleteAdmissionQr(store, EVENT_ID, MEMBER_ID);
    expect(result).toMatchObject({ ok: false, status: 403 });
    expect(state.clears).toBe(0);
    expect(state.subscriber?.admissionQrContent).toBe('TICKET-123');
  });
});
