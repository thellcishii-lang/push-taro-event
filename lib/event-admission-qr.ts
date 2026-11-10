// lib/event-admission-qr.ts
// 来場者の「入場用QRの取り込み」。
//
// 主催者側の既存システム（事前登録・チケット等）が発行した入場用QRは、
// 申込・支払いと紐づいた静的QRであることがほとんどで、Push-taro 側で
// 連携開発をしなくても、来場者が自分の画面で読み込んで預けておければ
// 入場時にそのまま提示できる。ここではその保存・取得・削除だけを担う。
//
// - 保存先は購読者レコード（events/{eventId}/subscribers/{memberId}）の
//   admissionQrContent。専用コレクションは作らないので、日次リセットと
//   イベント終了処理（データ消去）のライフサイクルにそのまま乗る。
// - 内容は「そのまま」保存するだけで、解釈・検証は一切しない
//   （何のQRかは主催者側システムの領分）。
// - 機能自体はイベント設定 admissionQrEnabled がオンのときだけ有効。
//   オフの間は保存・削除を拒否し、状態取得でも保存済み内容を返さない。
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';
import { EVENT_SUBCOLLECTIONS, type EventConfig } from './event';
import { getEvent } from './event-store';

/** 入場用QRとして保存できる内容の最大長（文字数）。 */
export const MAX_ADMISSION_QR_CONTENT_LENGTH = 1024;

/**
 * 保存内容の検証（純粋関数）。
 * 文字列であること、空白だけではないこと、上限以内であることだけを見る。
 * 前後の空白は貼り付け時の混入が目的なので取り除いて保存する
 * （QRの内容自体に意味のある前後空白はまず無い）。
 */
export function validateAdmissionQrContent(
  raw: unknown,
): { ok: true; content: string } | { ok: false; error: string } {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'QRコードの内容が不正です' };
  }
  const content = raw.trim();
  if (!content) {
    return { ok: false, error: 'QRコードの内容が空です' };
  }
  if (content.length > MAX_ADMISSION_QR_CONTENT_LENGTH) {
    return {
      ok: false,
      error: `QRコードの内容が長すぎます（${MAX_ADMISSION_QR_CONTENT_LENGTH}文字まで）`,
    };
  }
  return { ok: true, content };
}

/** このモジュールが使う保存層の最小インターフェース（テストで差し替え可能にする）。 */
export interface AdmissionQrStore {
  loadEvent(
    eventId: string,
  ): Promise<Pick<EventConfig, 'admissionQrEnabled'> | null>;
  loadSubscriber(
    eventId: string,
    memberId: string,
  ): Promise<{ admissionQrContent?: unknown } | null>;
  writeAdmissionQr(
    eventId: string,
    memberId: string,
    content: string,
  ): Promise<void>;
  clearAdmissionQr(eventId: string, memberId: string): Promise<void>;
}

function subscriberRef(eventId: string, memberId: string) {
  return db
    .collection('events')
    .doc(eventId)
    .collection(EVENT_SUBCOLLECTIONS.subscribers)
    .doc(memberId);
}

/** Firestore 実装。購読者レコードの項目として読み書きする。 */
export const firestoreAdmissionQrStore: AdmissionQrStore = {
  async loadEvent(eventId) {
    return getEvent(eventId);
  },
  async loadSubscriber(eventId, memberId) {
    const snap = await subscriberRef(eventId, memberId).get();
    return snap.exists ? (snap.data() ?? {}) : null;
  },
  async writeAdmissionQr(eventId, memberId, content) {
    await subscriberRef(eventId, memberId).update({
      admissionQrContent: content,
      admissionQrSavedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  },
  async clearAdmissionQr(eventId, memberId) {
    await subscriberRef(eventId, memberId).update({
      admissionQrContent: FieldValue.delete(),
      admissionQrSavedAt: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  },
};

export type AdmissionQrStateResult =
  | { ok: true; enabled: boolean; stored: boolean; content: string | null }
  | { ok: false; status: number; error: string };

export type AdmissionQrMutationResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

const NOT_ENABLED_ERROR = 'このイベントでは入場用QRは有効になっていません';

/**
 * 来場者本人の入場用QRの状態を返す。
 * オフのイベントでは、保存済みの内容があっても状態に含めない
 * （来場者画面に一切出さないための担保）。
 */
export async function getAdmissionQrState(
  store: AdmissionQrStore,
  eventId: string,
  memberId: string,
): Promise<AdmissionQrStateResult> {
  const event = await store.loadEvent(eventId);
  if (!event) {
    return { ok: false, status: 404, error: 'イベントが見つかりません' };
  }
  if (!event.admissionQrEnabled) {
    return { ok: true, enabled: false, stored: false, content: null };
  }
  const subscriber = await store.loadSubscriber(eventId, memberId);
  const content =
    subscriber && typeof subscriber.admissionQrContent === 'string'
      ? subscriber.admissionQrContent
      : '';
  return {
    ok: true,
    enabled: true,
    stored: content.length > 0,
    content: content.length > 0 ? content : null,
  };
}

/** 入場用QRを保存する（既存があれば上書き）。 */
export async function saveAdmissionQr(
  store: AdmissionQrStore,
  eventId: string,
  memberId: string,
  rawContent: unknown,
): Promise<AdmissionQrMutationResult> {
  const event = await store.loadEvent(eventId);
  if (!event) {
    return { ok: false, status: 404, error: 'イベントが見つかりません' };
  }
  if (!event.admissionQrEnabled) {
    return { ok: false, status: 403, error: NOT_ENABLED_ERROR };
  }
  const validated = validateAdmissionQrContent(rawContent);
  if (!validated.ok) {
    return { ok: false, status: 400, error: validated.error };
  }
  const subscriber = await store.loadSubscriber(eventId, memberId);
  if (!subscriber) {
    return { ok: false, status: 404, error: '登録が見つかりません' };
  }
  await store.writeAdmissionQr(eventId, memberId, validated.content);
  return { ok: true };
}

/** 入場用QRを削除する。未保存でも成功扱い（冪等）。 */
export async function deleteAdmissionQr(
  store: AdmissionQrStore,
  eventId: string,
  memberId: string,
): Promise<AdmissionQrMutationResult> {
  const event = await store.loadEvent(eventId);
  if (!event) {
    return { ok: false, status: 404, error: 'イベントが見つかりません' };
  }
  if (!event.admissionQrEnabled) {
    return { ok: false, status: 403, error: NOT_ENABLED_ERROR };
  }
  const subscriber = await store.loadSubscriber(eventId, memberId);
  if (!subscriber) {
    return { ok: false, status: 404, error: '登録が見つかりません' };
  }
  await store.clearAdmissionQr(eventId, memberId);
  return { ok: true };
}
