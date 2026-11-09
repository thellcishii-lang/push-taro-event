// 主催者向け「枠超過の警告」（一時上げのリバート予告）の判定と組み立て。
//
// 契約が一時的に上位プランへ上がっている間、契約枠は大きくなるが、
// リバート日（tempSubscriberCapUntil）に restoredSubscriberCap まで戻る。
// 開催中イベントの登録者数がすでに戻し先の枠を超えていると、リバート後に
// そのイベントへの新規登録が止まってしまうため、管理画面のバナーで
// 事前に知らせる（延長操作は本家のプラン画面で行う）。
//
// 登録者数はプロビジョニング照会（lib/provisioning-usage.ts）と同じく
// subscribers サブコレクションの count 集計を使う（上限判定と同一の実数）。
import { db } from './firebase-admin';
import { EVENT_SUBCOLLECTIONS, type EventStatus } from './event';
import { findOrganizerByOwnerUid, type Organizer } from './organizers';
import { listEventsByOwner } from './event-store';

const EVENTS_COLLECTION = 'events';

export interface CapWarningEvent {
  eventId: string;
  name: string;
  subscriberCount: number;
}

export interface CapWarning {
  /** リバート予定日（tempSubscriberCapUntil の値） */
  revertDate: string;
  /** リバート後の購読者枠 */
  restoredSubscriberCap: number;
  /** 戻し先の枠を超えている開催中イベント */
  events: CapWarningEvent[];
}

export interface CapWarningCandidate {
  eventId: string;
  name: string;
  status: EventStatus;
  subscriberCount: number;
}

/**
 * 警告を出すかどうかの判定（純粋関数）。
 * 契約者レコードが無い、または一時上げの情報（リバート日／戻し先の枠）が
 * 無ければ警告なし。対象は開催中（live）で登録者数が戻し先の枠を
 * 「超えて」いるイベントのみ（枠ちょうどは新規登録がまだ可能なため対象外）。
 */
export function buildCapWarning(
  organizer: Pick<
    Organizer,
    'tempSubscriberCapUntil' | 'restoredSubscriberCap'
  > | null,
  candidates: CapWarningCandidate[],
): CapWarning | null {
  if (!organizer) return null;
  const { tempSubscriberCapUntil, restoredSubscriberCap } = organizer;
  if (!tempSubscriberCapUntil || restoredSubscriberCap === null) return null;
  const events = candidates
    .filter(
      (c) => c.status === 'live' && c.subscriberCount > restoredSubscriberCap,
    )
    .map((c) => ({
      eventId: c.eventId,
      name: c.name,
      subscriberCount: c.subscriberCount,
    }));
  if (events.length === 0) return null;
  return {
    revertDate: tempSubscriberCapUntil,
    restoredSubscriberCap,
    events,
  };
}

/** ログイン中主催者の警告を組み立てる。該当が無ければ null。 */
export async function getCapWarningForOwner(
  ownerUid: string,
): Promise<CapWarning | null> {
  const organizer = await findOrganizerByOwnerUid(ownerUid);
  if (!organizer) return null;
  // 一時上げの情報が無い契約ではイベントの走査自体が不要。
  if (
    !organizer.tempSubscriberCapUntil ||
    organizer.restoredSubscriberCap === null
  ) {
    return null;
  }
  const events = await listEventsByOwner(ownerUid);
  const candidates: CapWarningCandidate[] = await Promise.all(
    events
      .filter((event) => event.status === 'live')
      .map(async (event) => {
        const countSnap = await db
          .collection(EVENTS_COLLECTION)
          .doc(event.id)
          .collection(EVENT_SUBCOLLECTIONS.subscribers)
          .count()
          .get();
        return {
          eventId: event.id,
          name: event.name,
          status: event.status,
          subscriberCount: countSnap.data().count,
        };
      }),
  );
  return buildCapWarning(organizer, candidates);
}
