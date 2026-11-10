// lib/event-auth.ts
// EVENT の API 用認証ヘルパー。
// 既存の店舗向け API（coupon-history 等）と同じ方式:
// Authorization: Bearer <Firebase IDトークン> を検証して uid を返す。
import { authAdmin } from './firebase-admin';
import { exhibitorSessionUid } from './exhibitor-access';

export async function getUidFromRequest(
  request: Request,
): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
    return decoded.uid;
  } catch {
    return null;
  }
}

/** 出店者セッション（カスタムトークン）のクレームから復元した所属。 */
export interface ExhibitorSession {
  eventId: string;
  exhibitorId: string;
}

export interface RequestAuth {
  uid: string;
  /** 出店者セッションなら所属イベントと出店者 ID。通常ログインは null。 */
  exhibitor: ExhibitorSession | null;
}

/**
 * ID トークンを検証し、uid と出店者セッション情報を返す。
 * 出店者セッションは、ログイン API が発行したカスタムトークン由来のものだけを
 * 認める：role クレームが 'exhibitor' で、eventId / exhibitorId クレームと
 * 合成 uid が一致する場合に限る（自称クレームだけでは通さない）。
 */
export async function getRequestAuth(
  request: Request,
): Promise<RequestAuth | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
    const claims = decoded as unknown as Record<string, unknown>;
    let exhibitor: ExhibitorSession | null = null;
    const claimEventId = claims.eventId;
    const claimExhibitorId = claims.exhibitorId;
    if (
      claims.role === 'exhibitor' &&
      typeof claimEventId === 'string' &&
      typeof claimExhibitorId === 'string' &&
      decoded.uid === exhibitorSessionUid(claimEventId, claimExhibitorId)
    ) {
      exhibitor = { eventId: claimEventId, exhibitorId: claimExhibitorId };
    }
    return { uid: decoded.uid, exhibitor };
  } catch {
    return null;
  }
}

import { NextResponse } from 'next/server';
import { EventConfig } from './event';
import { getEvent } from './event-store';
import { findOrganizerByOwnerUid, shouldBlockForPasswordChange } from './organizers';

/**
 * 初回パスワード変更ゲート。
 * 契約者レコードがあり mustChangePassword が立っている間は、
 * 変更系 API を 403 で止める。契約者レコードが無いユーザー
 * （運営アカウント、手動作成のアカウント）は対象外。
 * ブロックすべき場合は NextResponse を、そうでなければ null を返す。
 */
export async function passwordChangeBlock(
  uid: string,
): Promise<NextResponse | null> {
  const organizer = await findOrganizerByOwnerUid(uid);
  if (!shouldBlockForPasswordChange(organizer)) return null;
  return NextResponse.json(
    { error: 'パスワード変更が必要です' },
    { status: 403 },
  );
}

/**
 * 主催者本人のイベントだけを対象にする API 用ガード。
 * 認証なし=401、イベントなし=404、他人のイベント=403 を返す。
 * 本人確認のあと、初回パスワード変更が未完了なら 403 で止める。
 */
export async function requireEventOwner(
  request: Request,
  eventId: string,
): Promise<
  | { uid: string; event: EventConfig }
  | { error: NextResponse }
> {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return { error: NextResponse.json({ error: '認証が必要です' }, { status: 401 }) };
  }
  const event = await getEvent(eventId);
  if (!event) {
    return { error: NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 }) };
  }
  if (event.ownerUid !== uid) {
    return { error: NextResponse.json({ error: '権限がありません' }, { status: 403 }) };
  }
  const block = await passwordChangeBlock(uid);
  if (block) return { error: block };
  return { uid, event };
}