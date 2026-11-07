// 契約者（主催者）レコードと連携APIキーの読み書き層（Admin SDK）。
//
// データ配置:
// - organizers/{contractId}: 契約者情報。ドキュメントID = 本家の契約ID（冪等キー）
// - apiKeys/{keyId}: 本家連携用APIキー。クライアントからは読めない
//   （firestore.rules の catch-all で運営 admin のみ許可、通常は Admin SDK 経由のみ）
//
// HMAC 署名の検証には鍵そのものが要るため、apiKeys には鍵を保持する。
// 鍵の発行・失効・ローテーションは PR-B で管理画面／APIを用意する。
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';
import { DEFAULT_SUBSCRIBER_CAP, MAX_COUPONS_PER_EVENT } from './event';

const ORGANIZERS_COLLECTION = 'organizers';
const API_KEYS_COLLECTION = 'apiKeys';
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

// ─── 連携APIキー ───

export interface ApiKeyRecord {
  id: string;
  secret: string;
  label: string;
  revoked: boolean;
}

/** 署名検証用にキーを引く。存在しない・失効済みなら null。 */
export async function findActiveApiKey(keyId: string): Promise<ApiKeyRecord | null> {
  if (!keyId) return null;
  const snap = await db.collection(API_KEYS_COLLECTION).doc(keyId).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (data.revoked === true) return null;
  if (typeof data.secret !== 'string' || !data.secret) return null;
  return {
    id: snap.id,
    secret: data.secret,
    label: String(data.label ?? ''),
    revoked: false,
  };
}

// ─── 連携ログ ───

export type ProvisioningResult = 'created' | 'replayed' | 'failed';

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
