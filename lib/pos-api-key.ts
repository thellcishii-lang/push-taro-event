// lib/pos-api-key.ts
import crypto from 'crypto';

const KEY_PREFIX = 'pt_live_';
const KEY_BYTES = 16;          // 16 bytes = 32 hex chars
const SALT_BYTES = 16;
const HASH_BYTES = 64;
const PREFIX_DISPLAY_LEN = 12; // "pt_live_" + 4桁を表示用に保持

/**
 * 新しいAPIキーを生成する。
 * 戻り値の `key`（平文）は発行時にしか返さない。DBには `keyHash` と `keyPrefix` のみ保存する。
 */
export function generatePosApiKey(): {
  key: string;
  keyHash: string;
  keyPrefix: string;
} {
  const key = KEY_PREFIX + crypto.randomBytes(KEY_BYTES).toString('hex');
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = crypto.scryptSync(key, salt, HASH_BYTES);
  const keyHash = `${salt.toString('hex')}:${hash.toString('hex')}`;
  const keyPrefix = key.slice(0, PREFIX_DISPLAY_LEN);
  return { key, keyHash, keyPrefix };
}

/**
 * 平文キーと保存済みハッシュを照合する。
 * タイミング攻撃を避けるため、timingSafeEqual を使用。
 */
export function verifyPosApiKey(key: string, storedHash: string): boolean {
  if (typeof key !== 'string' || typeof storedHash !== 'string') return false;
  if (!key.startsWith(KEY_PREFIX)) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  try {
    const salt = Buffer.from(parts[0], 'hex');
    const expectedHash = Buffer.from(parts[1], 'hex');
    if (salt.length !== SALT_BYTES || expectedHash.length !== HASH_BYTES) return false;
    const actualHash = crypto.scryptSync(key, salt, expectedHash.length);
    return (
      actualHash.length === expectedHash.length &&
      crypto.timingSafeEqual(actualHash, expectedHash)
    );
  } catch {
    return false;
  }
}
