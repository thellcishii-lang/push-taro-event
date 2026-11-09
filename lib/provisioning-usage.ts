// 契約者の利用状況の照会（本家の「枠超過の警告」判定用）。
//
// 本家は EVENT 側の開催中イベントの登録者数を保持していないため、
// プラン変更（一時上げの自動リバート等）の前にこの照会で実態を確認する。
//
// - 対象イベントは draft / live（終了・終了処理済みは含めない）。
//   警告に出すかどうかは本家側が決めるので、ステータスも一緒に返す。
// - 登録者数は登録フローが上限判定に使うのと同じ subscribers
//   サブコレクションの件数（Firestore の count 集計）。
// - 一時上げまわりの項目（tempSubscriberCapUntil / restoredSubscriberCap）は
//   旧レコードには存在しないことがあるため、生ドキュメントから防御的に読み、
//   無ければ null を返す。
import { db } from './firebase-admin';
import {
  EVENT_SUBCOLLECTIONS,
  type EventConfig,
  type EventStatus,
} from './event';
import { getOrganizer } from './organizers';
import { listEventsByOwner } from './event-store';

const ORGANIZERS_COLLECTION = 'organizers';
const EVENTS_COLLECTION = 'events';

export interface UsageEvent {
  eventId: string;
  name: string;
  status: EventStatus;
  /** 現在の登録者数（subscribers の件数） */
  subscriberCount: number;
  subscriberCap: number;
  couponCap: number;
}

export interface OrganizerUsage {
  contractId: string;
  /** 契約枠 */
  subscriberCap: number;
  couponCap: number;
  /** 一時上げの終了日時（ISO文字列）。未設定・旧レコードでは null */
  tempSubscriberCapUntil: string | null;
  /** 一時上げ終了後に戻る購読者枠。未設定・旧レコードでは null */
  restoredSubscriberCap: number | null;
  /** draft / live のイベント（キー名は連携仕様上の liveEvents） */
  liveEvents: UsageEvent[];
}

/** 照会対象のイベントかどうか（純粋関数）。終了したイベントは含めない。 */
export function isUsageTargetEvent(
  event: Pick<EventConfig, 'status'>,
): boolean {
  return event.status === 'draft' || event.status === 'live';
}

/** イベントと登録者数から照会レスポンスの1件を作る（純粋関数）。 */
export function toUsageEvent(event: EventConfig, subscriberCount: number): UsageEvent {
  return {
    eventId: event.id,
    name: event.name,
    status: event.status,
    subscriberCount,
    subscriberCap: event.subscriberCap,
    couponCap: event.couponCap,
  };
}

/**
 * 一時上げまわりの項目を生ドキュメントから防御的に読む（純粋関数）。
 * 型が合わない・存在しない場合は null に倒す。
 */
export function readTempCapFields(data: FirebaseFirestore.DocumentData): {
  tempSubscriberCapUntil: string | null;
  restoredSubscriberCap: number | null;
} {
  return {
    tempSubscriberCapUntil:
      typeof data.tempSubscriberCapUntil === 'string'
        ? data.tempSubscriberCapUntil
        : null,
    restoredSubscriberCap:
      typeof data.restoredSubscriberCap === 'number' &&
      Number.isFinite(data.restoredSubscriberCap)
        ? data.restoredSubscriberCap
        : null,
  };
}

/** 契約者の利用状況を組み立てる。契約者が無ければ null。 */
export async function getOrganizerUsage(
  contractId: string,
): Promise<OrganizerUsage | null> {
  const organizer = await getOrganizer(contractId);
  if (!organizer) return null;

  const rawSnap = await db
    .collection(ORGANIZERS_COLLECTION)
    .doc(contractId)
    .get();
  const tempFields = readTempCapFields(rawSnap.data() ?? {});

  let liveEvents: UsageEvent[] = [];
  if (organizer.ownerUid) {
    const events = (await listEventsByOwner(organizer.ownerUid)).filter(
      isUsageTargetEvent,
    );
    liveEvents = await Promise.all(
      events.map(async (event) => {
        const countSnap = await db
          .collection(EVENTS_COLLECTION)
          .doc(event.id)
          .collection(EVENT_SUBCOLLECTIONS.subscribers)
          .count()
          .get();
        return toUsageEvent(event, countSnap.data().count);
      }),
    );
  }

  return {
    contractId: organizer.contractId,
    subscriberCap: organizer.subscriberCap,
    couponCap: organizer.couponCap,
    ...tempFields,
    liveEvents,
  };
}
