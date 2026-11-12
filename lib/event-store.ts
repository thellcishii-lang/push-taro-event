// lib/event-store.ts
// イベント設定の Firestore 読み書き層（Admin SDK）。
// データ配置: events/{eventId} にイベント設定を持ち、
// 購読者・クーポン等は events/{eventId} 配下のサブコレクションに置く
// （イベント単位で名前空間を分け、障害や削除が他イベントに波及しないようにする）。
import { FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { db } from './firebase-admin';
import { DEFAULT_LOCALE, isLocale, normalizeLocale } from './i18n';
import {
  CreateEventInput,
  DEFAULT_BACKUP_RETENTION_DAYS,
  DEFAULT_RESET_MODE,
  DEFAULT_RESET_TIME,
  DEFAULT_SUBSCRIBER_CAP,
  EventConfig,
  MAX_COUPONS_PER_EVENT,
  isValidResetTime,
  normalizeEventLinks,
  parseEventLinks,
  receivesCapsPropagation,
} from './event';

const EVENTS_COLLECTION = 'events';

type EventDocData = Omit<EventConfig, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

function toEventConfig(id: string, data: FirebaseFirestore.DocumentData): EventConfig {
  return {
    id,
    name: data.name,
    ownerUid: data.ownerUid,
    startDate: data.startDate,
    endDate: data.endDate,
    resetMode: data.resetMode,
    resetTime: data.resetTime,
    subscriberCap: data.subscriberCap,
    defaultLocale: normalizeLocale(data.defaultLocale),
    // 入場用QRは既定オフ。導入前に作られたイベントには項目自体が無い
    admissionQrEnabled: data.admissionQrEnabled === true,
    // 主催者リンクは導入前のイベントには項目自体が無い
    links: parseEventLinks(data.links),
    couponCap: data.couponCap ?? MAX_COUPONS_PER_EVENT,
    backupRetentionDays: data.backupRetentionDays ?? DEFAULT_BACKUP_RETENTION_DAYS,
    status: data.status,
    lastResetDate: data.lastResetDate ?? null,
    finalizedAt: data.finalizedAt ?? null,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? '',
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? '',
  };
}

export async function createEvent(input: CreateEventInput): Promise<EventConfig> {
  if (input.endDate < input.startDate) {
    throw new Error('終了日は開始日以降を指定してください');
  }
  const resetTime = input.resetTime ?? DEFAULT_RESET_TIME;
  if (!isValidResetTime(resetTime)) {
    throw new Error('リセット時刻の形式が不正です（HH:MM）');
  }
  if (input.defaultLocale !== undefined && !isLocale(input.defaultLocale)) {
    throw new Error('対応していない言語です（ja / en / zh / ko）');
  }

  const ref = db.collection(EVENTS_COLLECTION).doc();
  const data: EventDocData = {
    name: input.name,
    ownerUid: input.ownerUid,
    startDate: input.startDate,
    endDate: input.endDate,
    resetMode: input.resetMode ?? DEFAULT_RESET_MODE,
    resetTime,
    subscriberCap: input.subscriberCap ?? DEFAULT_SUBSCRIBER_CAP,
    defaultLocale: input.defaultLocale ?? DEFAULT_LOCALE,
    admissionQrEnabled: input.admissionQrEnabled ?? false,
    links: normalizeEventLinks(input.links),
    couponCap: input.couponCap ?? MAX_COUPONS_PER_EVENT,
    backupRetentionDays:
      input.backupRetentionDays ?? DEFAULT_BACKUP_RETENTION_DAYS,
    status: input.status ?? 'draft',
    lastResetDate: null,
    finalizedAt: null,
  };
  await ref.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const created = await getEvent(ref.id);
  if (!created) throw new Error('イベントの作成に失敗しました');
  return created;
}

export async function getEvent(eventId: string): Promise<EventConfig | null> {
  const snap = await db.collection(EVENTS_COLLECTION).doc(eventId).get();
  if (!snap.exists) return null;
  return toEventConfig(snap.id, snap.data()!);
}

export async function listEventsByOwner(ownerUid: string): Promise<EventConfig[]> {
  const snap = await db
    .collection(EVENTS_COLLECTION)
    .where('ownerUid', '==', ownerUid)
    .get();
  return snap.docs
    .map((doc) => toEventConfig(doc.id, doc.data()))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** スケジューラが「開催中イベント」を拾うための一覧。件数は最大でも数十件想定。 */
export async function listLiveEvents(): Promise<EventConfig[]> {
  const snap = await db
    .collection(EVENTS_COLLECTION)
    .where('status', '==', 'live')
    .get();
  return snap.docs.map((doc) => toEventConfig(doc.id, doc.data()));
}

/** 終了処理の候補（未 finalized の全イベント）。due 判定は isFinalizationDue で行う。 */
export async function listUnfinalizedEvents(): Promise<EventConfig[]> {
  const snap = await db
    .collection(EVENTS_COLLECTION)
    .where('finalizedAt', '==', null)
    .get();
  return snap.docs.map((doc) => toEventConfig(doc.id, doc.data()));
}

/** Firestore のバッチ上限（500）に対する安全側のチャンクサイズ。event-reset.ts と同じ値。 */
const UPDATE_CHUNK_SIZE = 450;

export interface CapsPropagationResult {
  /** 枠を反映できたイベントID */
  updatedEventIds: string[];
  /** 反映に失敗したイベントと理由（1件の失敗で全体は止めない） */
  failed: { eventId: string; error: string }[];
}

/**
 * 契約枠の変更を、その主催者の「終わっていない」イベント
 * （下書き・開催中。receivesCapsPropagation 参照）へ伝播する。
 *
 * 冪等: 同じ枠の再送でも結果は同じ（絶対値で上書きする）。
 * 失敗の局所化: チャンク（450件）単位のバッチで書き、チャンクが
 * 失敗したら1件ずつに落として失敗したイベントだけを結果に集める。
 * 呼び出し側は failed を見て記録すればよく、この関数自体は
 * 個別イベントの失敗では throw しない。
 */
export async function propagateCapsToOwnerEvents(
  ownerUid: string,
  caps: { subscriberCap?: number; couponCap?: number },
): Promise<CapsPropagationResult> {
  const patch: { subscriberCap?: number; couponCap?: number } = {};
  if (caps.subscriberCap !== undefined) patch.subscriberCap = caps.subscriberCap;
  if (caps.couponCap !== undefined) patch.couponCap = caps.couponCap;

  const result: CapsPropagationResult = { updatedEventIds: [], failed: [] };
  if (Object.keys(patch).length === 0) return result;

  const events = await listEventsByOwner(ownerUid);
  const targets = events.filter(receivesCapsPropagation);

  for (let i = 0; i < targets.length; i += UPDATE_CHUNK_SIZE) {
    const chunk = targets.slice(i, i + UPDATE_CHUNK_SIZE);
    try {
      const batch = db.batch();
      for (const event of chunk) {
        batch.update(db.collection(EVENTS_COLLECTION).doc(event.id), {
          ...patch,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      result.updatedEventIds.push(...chunk.map((event) => event.id));
    } catch {
      // チャンク単位で失敗したら1件ずつに落として、失敗を局所化する。
      for (const event of chunk) {
        try {
          await updateEvent(event.id, patch);
          result.updatedEventIds.push(event.id);
        } catch (error) {
          result.failed.push({
            eventId: event.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }
  return result;
}

export type UpdateEventInput = Partial<
  Pick<
    EventConfig,
    | 'name'
    | 'startDate'
    | 'endDate'
    | 'resetMode'
    | 'resetTime'
    | 'subscriberCap'
    | 'defaultLocale'
    | 'admissionQrEnabled'
    | 'links'
    | 'couponCap'
    | 'backupRetentionDays'
    | 'status'
    | 'lastResetDate'
    | 'finalizedAt'
  >
>;

export async function updateEvent(
  eventId: string,
  patch: UpdateEventInput,
): Promise<void> {
  if (patch.resetTime !== undefined && !isValidResetTime(patch.resetTime)) {
    throw new Error('リセット時刻の形式が不正です（HH:MM）');
  }
  if (patch.defaultLocale !== undefined && !isLocale(patch.defaultLocale)) {
    throw new Error('対応していない言語です（ja / en / zh / ko）');
  }
  if (
    patch.admissionQrEnabled !== undefined &&
    typeof patch.admissionQrEnabled !== 'boolean'
  ) {
    throw new Error('入場用QR設定の形式が不正です');
  }
  // 主催者リンクは検証してから正規化した形で保存する
  const links =
    patch.links !== undefined ? normalizeEventLinks(patch.links) : undefined;
  if (
    patch.startDate !== undefined &&
    patch.endDate !== undefined &&
    patch.endDate < patch.startDate
  ) {
    throw new Error('終了日は開始日以降を指定してください');
  }
  await db
    .collection(EVENTS_COLLECTION)
    .doc(eventId)
    .update({
      ...patch,
      ...(links !== undefined ? { links } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

/** Firestore のバッチ上限（500）に対する安全側のチャンクサイズ。event-reset.ts と同じ値。 */
const DELETE_CHUNK_SIZE = 450;

/** コレクションを先頭からチャンク削除し、空になるまで繰り返す。 */
async function drainCollectionCompletely(
  collectionRef: FirebaseFirestore.CollectionReference,
): Promise<void> {
  for (;;) {
    const snap = await collectionRef.limit(DELETE_CHUNK_SIZE).get();
    if (snap.empty) return;
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    if (snap.size < DELETE_CHUNK_SIZE) return;
  }
}

/**
 * イベントを完全に削除する（主催者の削除操作用）。
 *
 * 対象は events/{eventId} 本体と、その配下の全サブコレクション
 * （subscribers / members / claims / redemptions / exhibitors / coupons /
 * campaigns / dailyStats / infoPdfs など、実在するものを listCollections で拾う）、
 * および Storage 上の実ファイル（現行形式 organizers/{ownerUid}/events/{eventId}/
 * 配下と、移行前の旧形式 events/{eventId}/ 配下の両方）。
 * 最終レポート（event_reports）と運営用バックアップ（event_report_backups）は
 * 別コレクションにあり、ここでは一切触らない。
 *
 * 終了処理（finalization）と違い、こちらはイベントドキュメント自体も消す。
 * 想定する対象は下書きと終了済みで、終了済みは終了処理で主要サブコレクションが
 * 既に消えており、下書きは来場者データを持たないため、一括で消し切れる。
 * 途中で失敗しても、本体を最後に消すため再実行で残りを消せる（冪等）。
 * 削除可否（状態チェック）は呼び出し側で行うこと。
 */
export async function deleteEventCompletely(eventId: string): Promise<void> {
  const ref = db.collection(EVENTS_COLLECTION).doc(eventId);
  // 1. Storage の実ファイル（案内 PDF・宣伝ファイル等）。
  //    保存済みパスは現行形式（organizers/{uid}/events/{eventId}/）と
  //    移行前の旧形式（events/{eventId}/）が混在しうるので両方を消す。
  const bucket = getStorage().bucket();
  await bucket.deleteFiles({ prefix: `events/${eventId}/` });
  const snap = await ref.get();
  const ownerUid = snap.exists ? String(snap.data()?.ownerUid ?? '') : '';
  if (ownerUid) {
    await bucket.deleteFiles({
      prefix: `organizers/${ownerUid}/events/${eventId}/`,
    });
  }
  // 2. サブコレクションをすべてチャンク削除する。
  const collections = await ref.listCollections();
  for (const collection of collections) {
    await drainCollectionCompletely(collection);
  }
  // 3. イベント本体。
  await ref.delete();
}
