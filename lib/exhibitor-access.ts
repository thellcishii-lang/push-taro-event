// lib/exhibitor-access.ts
// 出店者ログインの「イベント専用アクセスコード」基盤。
//
// 決定（2026-11-10 Ishii、仕様メモ「出店者ログインの作り直し」）:
// 出店者は Firebase Auth に入れない。Auth のアカウントは契約者（主催者）
// だけ。出店者の頭の中は「イベントごと・主催者ごと」なので、ログイン資格も
// イベントごとに独立させる:
// - 出店者は events/{eventId}/exhibitors/{id} ドキュメントにメールアドレスと
// アクセスコード（ハッシュ化して accessCode フィールドに保存）を持つ。
// 画面上の表記は「パスワード」。
// - 登録時にイベント専用コードを発行し、メールで出店者へ渡す。同じ人が別
// イベントに出店すれば別ドキュメント・別コードで、互いに影響しない。
// - ログインはメール＋コードをサーバーで照合し、通ればそのイベント専用の
// カスタムトークン（合成 uid + クレーム）でセッション化する。
// - 再発行はフィールドの書き換えだけ。旧コードはその場で失効する。
// - イベント終了時はコレクションごとリセット（Auth 側の削除作業なし）。
//
// 旧方式（PR #36: Auth アカウント自動作成＋パスワード設定リンク招待、
// lib/exhibitor-account.ts）はこの方式に置き換えて廃止した。
import {
randomBytes,
scrypt,
timingSafeEqual,
} from 'node:crypto';
import { FieldValue} from 'firebase-admin/firestore';
import { db} from './firebase-admin';
import {
EVENT_EXHIBITORS_COLLECTION,
createExhibitor,
type EventExhibitor,
} from './event-coupon';
import { resolveLocale, type Locale} from './i18n';
import { sendEmail} from './mailer';

function scryptAsync(
  secret: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(secret, salt, keylen, options, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

// ─── コードの生成 ───

// 読み間違えやすい文字（0/O、1/I/L）を除いた英数字。
export const ACCESS_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ACCESS_CODE_LENGTH = 10;

/**
* アクセスコードを生成する。アルファベット長で割り切れる範囲までの
* バイトだけを使って偏りを無くす（リジェクションサンプリング）。
*/
export function generateAccessCode(
random: (size: number) => Buffer = randomBytes,
): string {
const alphabet = ACCESS_CODE_ALPHABET;
const limit = 256 - (256 % alphabet.length);
let code = '';
while (code.length < ACCESS_CODE_LENGTH) {
const bytes = random(ACCESS_CODE_LENGTH - code.length + 8);
for (const byte of bytes) {
if (byte >= limit) continue;
code += alphabet[byte % alphabet.length];
if (code.length >= ACCESS_CODE_LENGTH) break;
}
}
return code;
}

/** 入力されたコードの正規化（前後空白を取り除き大文字に揃える）。 */
export function normalizeAccessCode(raw: string): string {
return raw.trim().toUpperCase();
}

// ─── ハッシュ化と照合 ───

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 32;
const SALT_BYTES = 16;

// 保存形式: scrypt$<N>$<r>$<p>$<salt base64url>$<hash base64url>
// パラメータも一緒に持たせ、将来の強度変更に耐える形にする。
export async function hashAccessCode(code: string): Promise<string> {
const salt = randomBytes(SALT_BYTES);
const derived = (await scryptAsync(code, salt, SCRYPT_KEYLEN, {
N: SCRYPT_N,
r: SCRYPT_R,
p: SCRYPT_P,
})) as Buffer;
return [
'scrypt',
String(SCRYPT_N),
String(SCRYPT_R),
String(SCRYPT_P),
salt.toString('base64url'),
derived.toString('base64url'),
].join('$');
}

/**
* 照合（タイミング安全な比較）。保存値が無い・壊れている場合は false。
* 保存値側のパラメータが想定外に大きい場合は DoS 回避のため照合しない。
*/
export async function verifyAccessCode(
code: string,
stored: string | null | undefined,
): Promise<boolean> {
if (!stored) return false;
const parts = stored.split('$');
if (parts.length!== 6 || parts[0]!== 'scrypt') return false;
const N = Number(parts[1]);
const r = Number(parts[2]);
const p = Number(parts[3]);
if (!Number.isInteger(N) || N <= 1 || N > 2 ** 20 || (N & (N - 1))!== 0) {
return false;
}
if (!Number.isInteger(r) || r < 1 || r > 16) return false;
if (!Number.isInteger(p) || p < 1 || p > 16) return false;
const salt = Buffer.from(parts[4], 'base64url');
const expected = Buffer.from(parts[5], 'base64url');
if (salt.length === 0 || salt.length > 64) return false;
if (expected.length === 0 || expected.length > 64) return false;
try {
const derived = (await scryptAsync(code, salt, expected.length, {
N,
r,
p,
})) as Buffer;
return timingSafeEqual(derived, expected);
} catch {
return false;
}
}

/**
* 出店者が存在しない場合のタイミング均一化用ダミー。照合時間の差で
* 「そのメールが登録されているか」を推測されないようにするためのもので、
* 実際のコードとは一致しない（生成時の入力は破棄済み）。
*/
const DUMMY_ACCESS_CODE_HASH =
'scrypt$16384$8$1$mmV4w7GCRl8JUvzfPkJDYw$jAhcM__gqKRn5yNkGFL4mVlGChUCkzzhadXAPOIzvpE';

// ─── メールアドレス ───

export function normalizeExhibitorEmail(raw: string): string {
return raw.trim().toLowerCase();
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidExhibitorEmail(email: string): boolean {
return email.length > 0 && email.length <= 254 && EMAIL_PATTERN.test(email);
}

// ─── セッション ───

/**
* 出店者セッション（カスタムトークン）の合成 uid。
* そのイベント配下だけを指す一時的な ID で、Auth のアカウントではない。
*/
export function exhibitorSessionUid(eventId: string, exhibitorId: string): string {
return `exhibitor:${eventId}:${exhibitorId}`;
}

// ─── エラー ───

/** ルート側でそのまま返せる日本語メッセージと HTTP ステータスを持つエラー。 */
export class ExhibitorAccessError extends Error {
readonly status: number;

constructor(message: string, status = 400) {
super(message);
this.name = 'ExhibitorAccessError';
this.status = status;
}
}

// ─── 保存層 ───

export interface StoredExhibitorAccess {
id: string;
name: string;
email: string | null;
/** エンコード済みハッシュ。未発行なら null。 */
accessCodeHash: string | null;
}

/** このモジュールが使う保存層の最小インターフェース（テストで差し替え可能にする）。 */
export interface ExhibitorAccessStore {
findByEmail(
eventId: string,
email: string,
): Promise<StoredExhibitorAccess | null>;
getById(
eventId: string,
exhibitorId: string,
): Promise<StoredExhibitorAccess | null>;
createExhibitor(
eventId: string,
input: { name: string; email: string; lang: Locale},
): Promise<{ id: string}>;
setAccessCodeHash(
eventId: string,
exhibitorId: string,
encodedHash: string,
): Promise<void>;
setEmail(eventId: string, exhibitorId: string, email: string): Promise<void>;
}

function exhibitorsRef(eventId: string) {
return db
.collection('events')
.doc(eventId)
.collection(EVENT_EXHIBITORS_COLLECTION);
}

function mapStored(
id: string,
data: Record<string, unknown>,
): StoredExhibitorAccess {
return {
id,
name: String(data.name?? ''),
email:
typeof data.email === 'string' && data.email
? normalizeExhibitorEmail(data.email)
: null,
accessCodeHash:
typeof data.accessCode === 'string' && data.accessCode
? data.accessCode
: null,
};
}

export const firestoreExhibitorAccessStore: ExhibitorAccessStore = {
async findByEmail(eventId, email) {
const snap = await exhibitorsRef(eventId)
.where('email', '==', email)
.limit(1)
.get();
if (snap.empty) return null;
const doc = snap.docs[0];
return mapStored(doc.id, doc.data());
},
async getById(eventId, exhibitorId) {
const doc = await exhibitorsRef(eventId).doc(exhibitorId).get();
if (!doc.exists) return null;
return mapStored(doc.id, doc.data()!);
},
async createExhibitor(eventId, input) {
const exhibitor: EventExhibitor = await createExhibitor(eventId, input);
return { id: exhibitor.id};
},
async setAccessCodeHash(eventId, exhibitorId, encodedHash) {
await exhibitorsRef(eventId)
.doc(exhibitorId)
.update({ accessCode: encodedHash, accessCodeUpdatedAt: FieldValue.serverTimestamp()});
},
async setEmail(eventId, exhibitorId, email) {
await exhibitorsRef(eventId).doc(exhibitorId).update({ email});
},
};

// ─── アプリの origin と消込ページ URL ───

/**
* 本番の App Hosting origin（本家側 lib/event-provisioning.ts の定数と同じ値）。
* 将来の独自ドメイン化に備え、環境変数 NEXT_PUBLIC_APP_ORIGIN があれば
* そちらを優先する（末尾のスラッシュは取り除く）。
*/
export const APP_ORIGIN =
'https://push-taro-event--push-taro-event.asia-east1.hosted.app';

export function resolveAppOrigin(): string {
const fromEnv = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim();
return (fromEnv || APP_ORIGIN).replace(/\/+$/, '');
}

/** 出店者の消込（ログイン）ページ URL。メール本文に載せて出店者に渡す。 */
export function exhibitorRedeemUrl(eventId: string): string {
return `${resolveAppOrigin()}/e/${encodeURIComponent(eventId)}/redeem`;
}

// ─── メール送信 ───

export type ExhibitorMailSender = (args: {
to: string;
subject: string;
html: string;
}) => Promise<{ success: boolean; error?: string}>;

export interface ExhibitorAccessDeps {
store: ExhibitorAccessStore;
sendMail: ExhibitorMailSender;
}

const defaultDeps: ExhibitorAccessDeps = {
store: firestoreExhibitorAccessStore,
sendMail: (args) => sendEmail(args),
};

function escapeHtml(value: string): string {
return value
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;');
}

function buildPasswordEmailHtml(input: {
exhibitorName: string;
eventName?: string | null;
code: string;
loginUrl: string;
reissued: boolean;
}): string {
const eventPart = input.eventName
? `イベント「${escapeHtml(input.eventName)}」`
: 'Push-taro EVENT のイベント';
const lead = input.reissued
? `<p>${eventPart}の消込ログイン用パスワードを再発行しました。今までのパスワードは使えなくなります。</p>`
: `<p>Push-taro EVENT の主催者により、${eventPart}の出店者として登録されました。</p>`;
return `
<p>${escapeHtml(input.exhibitorName)} 様</p>
${lead}
<p>クーポンの消し込みに使う、出店者ログインのパスワード（このイベント専用）をお知らせします。</p>
<p>ログインIDは ご登録のメールアドレスです</p>
<p>パスワード: <strong>${escapeHtml(input.code)}</strong></p>
<p>ログインURL: ${escapeHtml(input.loginUrl)}</p>
<p>消込ページで、このメールアドレスと上記のパスワードを入力してログインしてください。パスワードはイベントごとに異なります。</p>
<p>※パスワードは他の人に教えないでください。</p>
<p>※このメールに心当たりがない場合は、破棄していただいて構いません。</p>
`;
}

/** 登録時のパスワード通知メール。文面は日本語固定、表記は「パスワード」。 */
export function buildExhibitorPasswordEmail(input: {
exhibitorName: string;
eventName?: string | null;
eventId: string;
code: string;
}): { subject: string; html: string} {
return {
subject: '出店者ログイン用パスワードのお知らせ',
html: buildPasswordEmailHtml({
exhibitorName: input.exhibitorName,
eventName: input.eventName,
code: input.code,
loginUrl: exhibitorRedeemUrl(input.eventId),
reissued: false,
}),
};
}

/** 再発行時のパスワード通知メール。 */
export function buildExhibitorPasswordReissueEmail(input: {
exhibitorName: string;
eventName?: string | null;
eventId: string;
code: string;
}): { subject: string; html: string} {
return {
subject: '出店者ログイン用パスワード再発行のお知らせ',
html: buildPasswordEmailHtml({
exhibitorName: input.exhibitorName,
eventName: input.eventName,
code: input.code,
loginUrl: exhibitorRedeemUrl(input.eventId),
reissued: true,
}),
};
}

// ─── 登録 ───

export interface RegisterExhibitorResult {
exhibitorId: string;
email: string;
/** パスワード通知メールの送信に成功したか（失敗しても登録は成立する） */
mailSent: boolean;
}

/**
* 出店者を登録し、イベント専用パスワードを発行してメールで送る。
* - メール形式が不正なら 400。同一イベント内で同じメールが既にあれば 400。
* - コード自体は戻り値に含めない（メールでのみ出店者に渡る）。
* - メール送信の失敗は登録の失敗にしない（主催者は再発行で送り直せる）。
*/
export async function registerExhibitor(
input: {
eventId: string;
name: string;
email: string;
lang?: Locale;
eventName?: string | null;
},
deps: ExhibitorAccessDeps = defaultDeps,
): Promise<RegisterExhibitorResult> {
const name = input.name.trim();
if (!name) throw new ExhibitorAccessError('出店者名が必要です', 400);
const rawEmail = input.email.trim();
if (!rawEmail) throw new ExhibitorAccessError('メールアドレスが必要です', 400);
const email = normalizeExhibitorEmail(rawEmail);
if (!isValidExhibitorEmail(email)) {
throw new ExhibitorAccessError('メールアドレスの形式が正しくありません', 400);
}

const existing = await deps.store.findByEmail(input.eventId, email);
if (existing) {
throw new ExhibitorAccessError(
'そのメールアドレスはこのイベントで既に登録されています',
400,
);
}

const created = await deps.store.createExhibitor(input.eventId, {
name,
email,
lang: resolveLocale(input.lang),
});
const code = generateAccessCode();
await deps.store.setAccessCodeHash(
input.eventId,
created.id,
await hashAccessCode(code),
);

const mail = buildExhibitorPasswordEmail({
exhibitorName: name,
eventName: input.eventName,
eventId: input.eventId,
code,
});
let mailSent = false;
try {
const result = await deps.sendMail({
to: email,
subject: mail.subject,
html: mail.html,
});
mailSent = result.success;
if (!result.success) {
console.error('[exhibitor-access] password email failed:', result.error);
}
} catch (error) {
console.error('[exhibitor-access] password email error:', error);
}
return { exhibitorId: created.id, email, mailSent};
}

// ─── ログイン照合 ───

export interface AuthenticatedExhibitor {
exhibitorId: string;
name: string;
email: string;
}

/**
* メール＋コードの照合。成功時のみ出店者を返す。
* 存在しないメールでもダミーハッシュで照合して時間を均し、
* 「登録されているか」を応答時間から推測されないようにする。
*/
export async function authenticateExhibitor(
input: { eventId: string; email: string; code: string},
deps: ExhibitorAccessDeps = defaultDeps,
): Promise<AuthenticatedExhibitor | null> {
const email = normalizeExhibitorEmail(input.email);
const exhibitor = await deps.store.findByEmail(input.eventId, email);
const stored = exhibitor?.accessCodeHash?? DUMMY_ACCESS_CODE_HASH;
const ok = await verifyAccessCode(normalizeAccessCode(input.code), stored);
if (!exhibitor ||!exhibitor.accessCodeHash ||!ok) return null;
return { exhibitorId: exhibitor.id, name: exhibitor.name, email};
}

// ─── 再発行 ───

export interface ReissueExhibitorPasswordResult {
email: string;
mailSent: boolean;
}

/**
* パスワード再発行（主催者操作）。新コードに差し替え、登録メールへ送る。
* 旧コードはハッシュを上書きした時点で失効する。
* メール未登録の旧出店者（Auth 時代のドキュメント）は、email を渡せば
* その場で設定して発行できる。
*/
export async function reissueExhibitorPassword(
input: {
eventId: string;
exhibitorId: string;
email?: string | null;
eventName?: string | null;
},
deps: ExhibitorAccessDeps = defaultDeps,
): Promise<ReissueExhibitorPasswordResult> {
const exhibitor = await deps.store.getById(input.eventId, input.exhibitorId);
if (!exhibitor) throw new ExhibitorAccessError('出店者が見つかりません', 404);

let email = exhibitor.email;
const requested = input.email?.trim();
if (requested) {
const normalized = normalizeExhibitorEmail(requested);
if (!isValidExhibitorEmail(normalized)) {
throw new ExhibitorAccessError(
'メールアドレスの形式が正しくありません',
400,
);
}
if (normalized!== email) {
const duplicate = await deps.store.findByEmail(input.eventId, normalized);
if (duplicate && duplicate.id!== exhibitor.id) {
throw new ExhibitorAccessError(
'そのメールアドレスはこのイベントで既に登録されています',
400,
);
}
await deps.store.setEmail(input.eventId, exhibitor.id, normalized);
email = normalized;
}
}
if (!email) {
throw new ExhibitorAccessError(
'メールアドレスが登録されていないため、パスワードを再発行できません',
400,
);
}

const code = generateAccessCode();
await deps.store.setAccessCodeHash(
input.eventId,
exhibitor.id,
await hashAccessCode(code),
);
const mail = buildExhibitorPasswordReissueEmail({
exhibitorName: exhibitor.name,
eventName: input.eventName,
eventId: input.eventId,
code,
});
let mailSent = false;
try {
const result = await deps.sendMail({
to: email,
subject: mail.subject,
html: mail.html,
});
mailSent = result.success;
if (!result.success) {
console.error('[exhibitor-access] reissue email failed:', result.error);
}
} catch (error) {
console.error('[exhibitor-access] reissue email error:', error);
}
return { email, mailSent};
}

/**
* パスワード再発行（出店者の自己申請）。登録メールへ新コードを送る。
* メールが登録されているかどうかを外部に漏らさないため、存在しない場合も
* 例外なく正常に終わる（呼び出し側は常に汎用の完了文を返す）。
*/
export async function requestExhibitorPasswordReset(
input: { eventId: string; email: string; eventName?: string | null},
deps: ExhibitorAccessDeps = defaultDeps,
): Promise<void> {
const email = normalizeExhibitorEmail(input.email);
if (!isValidExhibitorEmail(email)) return;
const exhibitor = await deps.store.findByEmail(input.eventId, email);
if (!exhibitor) return;
await reissueExhibitorPassword(
{ eventId: input.eventId, exhibitorId: exhibitor.id, eventName: input.eventName},
deps,
);
}
