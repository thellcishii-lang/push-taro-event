// 本家連携用APIキーの発行・一覧・失効（Admin SDK）。
//
// 配置: apiKeys/{keyId}
// - HMAC 署名の検証には鍵そのものが要るため、ドキュメントには鍵を保持する。
//   クライアントからは読めない（firestore.rules の catch-all で運営 admin のみ、
//   通常の読み書きは Admin SDK 経由だけ）。
// - 鍵は複数同時に有効にできる（ローテーション時は新旧を並行運用してから旧を失効）。
// - 一覧では鍵そのものを絶対に返さない。発行時のレスポンスでのみ一度だけ返す。
import { randomBytes } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';

const API_KEYS_COLLECTION = 'apiKeys';

export interface ApiKeyMaterial {
  keyId: string;
  secret: string;
}

/** 新しいキーの素材を生成する（純粋関数）。 */
export function generateApiKeyMaterial(): ApiKeyMaterial {
  return {
    keyId: `key_${randomBytes(9).toString('hex')}`,
    secret: randomBytes(32).toString('base64url'),
  };
}

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

export interface ApiKeySummary {
  id: string;
  label: string;
  revoked: boolean;
  createdAt: string;
}

/** ドキュメントから「鍵を含まない」概要を作る（純粋関数）。 */
export function toApiKeySummary(
  id: string,
  data: FirebaseFirestore.DocumentData,
): ApiKeySummary {
  return {
    id,
    label: String(data.label ?? ''),
    revoked: data.revoked === true,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? '',
  };
}

/** キーを発行する。戻り値の secret はこの一度だけ表示する前提。 */
export async function createApiKey(
  label: string,
): Promise<ApiKeyMaterial & { label: string }> {
  const material = generateApiKeyMaterial();
  const trimmed = label.trim();
  await db.collection(API_KEYS_COLLECTION).doc(material.keyId).set({
    secret: material.secret,
    label: trimmed,
    revoked: false,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ...material, label: trimmed };
}

export async function listApiKeys(): Promise<ApiKeySummary[]> {
  const snap = await db
    .collection(API_KEYS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((doc) => toApiKeySummary(doc.id, doc.data()));
}

/** キーを失効させる。存在しなければ false。 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  const ref = db.collection(API_KEYS_COLLECTION).doc(keyId);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.update({ revoked: true, revokedAt: FieldValue.serverTimestamp() });
  return true;
}
