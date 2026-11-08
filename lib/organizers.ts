// 契約者（主催者）レコードの読み書き層（Admin SDK）。
//
// データ配置:
// - organizers/{contractId}: 契約者情報。ドキュメントID = 本家の契約ID（冪等キー）
// - 連携APIキーは lib/api-keys.ts、連携ログは provisioningLogs（本ファイル末尾）
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';
import { DEFAULT_SUBSCRIBER_CAP, MAX_COUPONS_PER_EVENT } from './event';

const ORGANIZERS_COLLECTION = 'organizers';
const PROVISIONING_LOGS_COLLECTION = 'provisioningLogs';

export type OrganizerStatus = 'active' | 'suspended';

export interface Organizer {
  /** 本家の契約ID（ドキュメントID） */
  contractId: string;
  /** ログインID（メールアドレス） */
  email: string;
  companyName: string;
  address: string;
  phone: string;
  /** 紐づく Firebase Auth ユーザーの uid。未作成なら null */
  ownerUid: string | null;
  /**
   * 初回ログイン時のパスワード変更が必須かどうか。
   * プロビジョニングでの新規作成時のみ true になる。
   * 旧レコード（フィールド自体が無い）は false 扱い。
   */
  mustChangePassword: boolean;
  status: OrganizerStatus;
  /** 使用開始日（決済完了日, 'YYYY-MM-DD'） */
  startDate: string;
  /** 契約枠（運営が決める。イベント作成時の既定値になる） */
  subscriberCap: number;
  couponCap: number;
  /** 代理店コード（保持のみ。集計は本家側） */
  agencyCode: string | null;
  createdAt: string;
  updatedAt: string;
}

function toOrganizer(id: string, data: FirebaseFirestore.DocumentData): Organizer {
  return {
    contractId: id,
    email: String(data.email ?? ''),
    companyName: String(data.companyName ?? ''),
    address: String(data.address ?? ''),
    phone: String(data.phone ?? ''),
    ownerUid: (data.ownerUid as string | null) ?? null,
    mustChangePassword: data.mustChangePassword === true,
    status: data.status === 'suspended' ? 'suspended' : 'active',
    startDate: String(data.startDate ?? ''),
    subscriberCap:
      typeof data.subscriberCap === 'number' ? data.subscriberCap : DEFAULT_SUBSCRIBER_CAP,
    couponCap: typeof data.couponCap === 'number' ? data.couponCap : MAX_COUPONS_PER_EVENT,
    agencyCode: (data.agencyCode as string | null) ?? null,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? '',
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? '',
  };
}

export async function getOrganizer(contractId: string): Promise<Organizer | null> {
  const snap = await db.collection(ORGANIZERS_COLLECTION).doc(contractId).get();
  if (!snap.exists) return null;
  return toOrganizer(snap.id, snap.data()!);
}

/** ログイン中ユーザーの契約者レコードを ownerUid から引く。無ければ null。 */
export async function findOrganizerByOwnerUid(ownerUid: string): Promise<Organizer | null> {
  const snap = await db
    .collection(ORGANIZERS_COLLECTION)
    .where('ownerUid', '==', ownerUid)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toOrganizer(doc.id, doc.data());
}

/**
 * パスワード変更ゲートの判定（純粋関数）。
 * 契約者レコードがあり mustChangePassword が立っている場合のみブロックする。
 * レコードが無いユーザー（運営アカウント等）はブロックしない。
 */
export function shouldBlockForPasswordChange(
  organizer: Pick<Organizer, 'mustChangePassword'> | null,
): boolean {
  return organizer?.mustChangePassword === true;
}

export async function listOrganizers(): Promise<Organizer[]> {
  const snap = await db
    .collection(ORGANIZERS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((doc) => toOrganizer(doc.id, doc.data()));
}

/** 契約枠と状態の運営側変更。存在しなければ false。 */
export async function updateOrganizer(
  contractId: string,
  patch: { subscriberCap?: number; couponCap?: number; status?: OrganizerStatus },
): Promise<boolean> {
  const ref = db.collection(ORGANIZERS_COLLECTION).doc(contractId);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
  return true;
}

export interface CreateOrganizerData {
  email: string;
  companyName: string;
  address: string;
  phone: string;
  ownerUid: string;
  startDate: string;
  subscriberCap?: number;
  couponCap?: number;
  agencyCode?: string | null;
  mustChangePassword?: boolean;
}

export async function createOrganizerRecord(
  contractId: string,
  data: CreateOrganizerData,
): Promise<void> {
  await db
    .collection(ORGANIZERS_COLLECTION)
    .doc(contractId)
    .set({
      email: data.email,
      companyName: data.companyName,
      address: data.address,
      phone: data.phone,
      ownerUid: data.ownerUid,
      mustChangePassword: data.mustChangePassword ?? false,
      status: 'active' as OrganizerStatus,
      startDate: data.startDate,
      subscriberCap: data.subscriberCap ?? DEFAULT_SUBSCRIBER_CAP,
      couponCap: data.couponCap ?? MAX_COUPONS_PER_EVENT,
      agencyCode: data.agencyCode ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

/** 途中まで進んだ登録（レコードはあるが ownerUid 未設定）を完了させる。 */
export async function completeOrganizerRecord(
  contractId: string,
  patch: Partial<CreateOrganizerData> & { ownerUid: string },
): Promise<void> {
  await db
    .collection(ORGANIZERS_COLLECTION)
    .doc(contractId)
    .update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
}

/** プロビジョニングの「更新」で書き換えてよい項目（認証情報は含めない）。 */
export interface ProvisioningProfilePatch {
  companyName?: string;
  address?: string;
  phone?: string;
  subscriberCap?: number;
  couponCap?: number;
}

/**
 * 本家のプラン変更などに伴う契約者情報の更新。
 * email / パスワード / ownerUid などの認証情報には一切触れない。
 */
export async function applyProvisioningUpdate(
  contractId: string,
  patch: ProvisioningProfilePatch,
): Promise<void> {
  await db
    .collection(ORGANIZERS_COLLECTION)
    .doc(contractId)
    .update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
}

/** 初回パスワード変更の完了を記録する（フラグを下ろす）。 */
export async function clearMustChangePassword(contractId: string): Promise<void> {
  await db
    .collection(ORGANIZERS_COLLECTION)
    .doc(contractId)
    .update({ mustChangePassword: false, updatedAt: FieldValue.serverTimestamp() });
}

// ─── 連携ログ ───

export type ProvisioningResult = 'created' | 'replayed' | 'updated' | 'failed';

/**
 * 連携処理の結果を記録する。パスワードは絶対に記録しない
 * （引数にも含めない設計にして、混入自体を防ぐ）。
 */
export async function logProvisioning(entry: {
  contractId: string;
  email: string;
  result: ProvisioningResult;
  error?: string;
}): Promise<void> {
  await db.collection(PROVISIONING_LOGS_COLLECTION).add({
    contractId: entry.contractId,
    email: entry.email,
    result: entry.result,
    ...(entry.error ? { error: entry.error } : {}),
    at: FieldValue.serverTimestamp(),
  });
}
