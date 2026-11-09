// 本家決済完了 → EVENT への契約者自動登録（プロビジョニング）の本体。
//
// 冪等性: 契約ID（contractId）をキーにする create-or-update。
// - 契約が無ければ「新規作成」: Auth ユーザーを作り、契約者レコードを作る。
//   初期パスワードのまま使わせないため mustChangePassword を立てる
//   （初回ログインで変更するまで管理画面/APIは使えない）。
// - 契約があり ownerUid 設定済みなら「更新」: 本家のプラン変更（枠の変更）に追随し、
//   送られた項目（契約枠・会社情報）だけを反映する。パスワード等の認証情報には
//   一切触れない（送られてきても無視する）。
// - Auth ユーザー作成後に落ちても、再送時にメールアドレスで既存ユーザーを
//   引き直して続きを完了させる。
// - パスワードは Auth に渡すだけで、ログ・レコードのどこにも残さない。
import { authAdmin } from './firebase-admin';
import { propagateCapsToOwnerEvents } from './event-store';
import {
  applyProvisioningUpdate,
  completeOrganizerRecord,
  createOrganizerRecord,
  getOrganizer,
  logProvisioning,
  type Organizer,
  type ProvisioningProfilePatch,
} from './organizers';

export interface ProvisionOrganizerInput {
  contractId: string;
  email: string;
  /** 新規作成時のみ必須。更新時は送られても無視する */
  password?: string;
  companyName: string;
  address?: string;
  phone?: string;
  /** 使用開始日（決済完了日, 'YYYY-MM-DD'）。新規作成時のみ使う */
  startDate: string;
  subscriberCap?: number;
  couponCap?: number;
  /**
   * 一時的な枠上げの期限（ISO日付文字列）。任意項目:
   * 送られなければ既存値を変えない。null は明示的なクリア。
   * 警告バナー（復帰時の枠超過）用の材料として保持するだけ。
   */
  tempSubscriberCapUntil?: string | null;
  /** 一時上げの期限後に戻る購読者枠。任意項目（意味は上と同じ）。 */
  restoredSubscriberCap?: number | null;
  agencyCode?: string | null;
}

export type ProvisionOrganizerResult =
  | { ok: true; status: 'created' | 'updated'; ownerUid: string }
  | { ok: false; error: string; status?: number };

/**
 * 冪等判定（純粋関数）:
 * レコードがあり ownerUid 設定済みなら登録は完了しているので 'update'。
 * それ以外（未登録・途中状態）は 'create' として続きから処理する。
 */
export function decideProvisioning(
  existing: Pick<Organizer, 'ownerUid'> | null,
): 'create' | 'update' {
  return existing?.ownerUid ? 'update' : 'create';
}

const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

/**
 * 一時上げ期限の無害化（純粋関数）。任意項目なので、変な値で
 * リクエスト全体を落とさず「無かったこと」に倒す:
 * - undefined（未送信）→ undefined（既存値を変えない）
 * - null → null（明示的なクリア）
 * - ISO日付として読める文字列 → そのまま
 * - それ以外 → undefined（無視）
 */
function sanitizeTempSubscriberCapUntil(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== 'string') return undefined;
  if (!ISO_DATE_PREFIX.test(value) || Number.isNaN(Date.parse(value))) return undefined;
  return value;
}

/**
 * 復帰枠の無害化（純粋関数）。考え方は sanitizeTempSubscriberCapUntil と同じ:
 * 有限の0以上の数か null だけを通し、それ以外は無視する。
 */
function sanitizeRestoredSubscriberCap(
  value: number | null | undefined,
): number | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return undefined;
  return value;
}

/**
 * 更新で反映する項目の抽出（純粋関数）。
 * 送られた項目だけを patch に含める。email / startDate / agencyCode と
 * 認証情報（パスワード）は更新対象に含めない。
 * 一時上げまわりの任意項目は無害化してから含める（不正値は無視）。
 */
export function buildProvisioningUpdate(
  input: Pick<
    ProvisionOrganizerInput,
    | 'companyName'
    | 'address'
    | 'phone'
    | 'subscriberCap'
    | 'couponCap'
    | 'tempSubscriberCapUntil'
    | 'restoredSubscriberCap'
  >,
): ProvisioningProfilePatch {
  const patch: ProvisioningProfilePatch = {};
  if (typeof input.companyName === 'string' && input.companyName.trim()) {
    patch.companyName = input.companyName;
  }
  if (typeof input.address === 'string') patch.address = input.address;
  if (typeof input.phone === 'string') patch.phone = input.phone;
  if (typeof input.subscriberCap === 'number' && Number.isFinite(input.subscriberCap)) {
    patch.subscriberCap = input.subscriberCap;
  }
  if (typeof input.couponCap === 'number' && Number.isFinite(input.couponCap)) {
    patch.couponCap = input.couponCap;
  }
  const tempUntil = sanitizeTempSubscriberCapUntil(input.tempSubscriberCapUntil);
  if (tempUntil !== undefined) patch.tempSubscriberCapUntil = tempUntil;
  const restoredCap = sanitizeRestoredSubscriberCap(input.restoredSubscriberCap);
  if (restoredCap !== undefined) patch.restoredSubscriberCap = restoredCap;
  return patch;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 新規作成時の入力チェック。問題があればエラーメッセージを返す。 */
export function validateCreateInput(input: ProvisionOrganizerInput): string | null {
  if (!input.email || !input.email.includes('@')) return '有効な email が必要です';
  if (!input.password || input.password.length < 6) {
    return 'password は6文字以上が必要です';
  }
  if (!input.companyName) return 'companyName が必要です';
  if (!DATE_PATTERN.test(input.startDate)) {
    return 'startDate は YYYY-MM-DD 形式で指定してください';
  }
  return null;
}

function authErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

/** Auth ユーザーを作る。既に同じメールがあればそのユーザーを返す（再送時の復旧）。 */
async function createOrReuseAuthUser(
  email: string,
  password: string,
): Promise<string> {
  try {
    const user = await authAdmin.createUser({ email, password });
    return user.uid;
  } catch (error) {
    if (authErrorCode(error) === 'auth/email-already-exists') {
      const existing = await authAdmin.getUserByEmail(email);
      return existing.uid;
    }
    throw error;
  }
}

export async function provisionOrganizer(
  input: ProvisionOrganizerInput,
): Promise<ProvisionOrganizerResult> {
  const existing = await getOrganizer(input.contractId);

  if (decideProvisioning(existing) === 'update') {
    // 更新: 送られた項目だけを反映する。認証情報には触れない。
    const patch = buildProvisioningUpdate(input);
    if (Object.keys(patch).length > 0) {
      await applyProvisioningUpdate(input.contractId, patch);
    }
    // 枠が変わったら、終わっていないイベント（下書き・開催中）にも
    // 同じ枠を伝播させる。終了済みイベントの枠は履歴として触らない。
    // 伝播の失敗で更新自体を失敗にはしない（失敗はログに残す）。
    if (patch.subscriberCap !== undefined || patch.couponCap !== undefined) {
      try {
        const propagation = await propagateCapsToOwnerEvents(existing!.ownerUid!, {
          subscriberCap: patch.subscriberCap,
          couponCap: patch.couponCap,
        });
        if (propagation.failed.length > 0) {
          await logProvisioning({
            contractId: input.contractId,
            email: existing!.email,
            result: 'updated',
            error: `caps-propagation-failed: ${propagation.failed
              .map((f) => f.eventId)
              .join(',')}`,
          });
        }
      } catch (error) {
        console.error('[provisioning] 枠の伝播に失敗:', error);
        await logProvisioning({
          contractId: input.contractId,
          email: existing!.email,
          result: 'updated',
          error: 'caps-propagation-error',
        }).catch(() => undefined);
      }
    }
    await logProvisioning({
      contractId: input.contractId,
      email: existing!.email,
      result: 'updated',
    });
    return { ok: true, status: 'updated', ownerUid: existing!.ownerUid! };
  }

  const validationError = validateCreateInput(input);
  if (validationError) {
    return { ok: false, error: validationError, status: 400 };
  }

  let ownerUid: string;
  try {
    ownerUid = await createOrReuseAuthUser(input.email, input.password!);
  } catch {
    await logProvisioning({
      contractId: input.contractId,
      email: input.email,
      result: 'failed',
      error: 'auth-user-creation-failed',
    });
    return { ok: false, error: 'ログインユーザーの作成に失敗しました' };
  }

  const record = {
    email: input.email,
    companyName: input.companyName,
    address: input.address ?? '',
    phone: input.phone ?? '',
    startDate: input.startDate,
    subscriberCap: input.subscriberCap,
    couponCap: input.couponCap,
    // 一時上げまわりの任意項目は、無害化した値だけを保持する。
    tempSubscriberCapUntil:
      sanitizeTempSubscriberCapUntil(input.tempSubscriberCapUntil) ?? null,
    restoredSubscriberCap:
      sanitizeRestoredSubscriberCap(input.restoredSubscriberCap) ?? null,
    agencyCode: input.agencyCode ?? null,
    // 初期パスワードは初回ログインで必ず変更させる。
    mustChangePassword: true,
  };

  if (existing) {
    await completeOrganizerRecord(input.contractId, { ...record, ownerUid });
  } else {
    await createOrganizerRecord(input.contractId, { ...record, ownerUid });
  }

  await logProvisioning({
    contractId: input.contractId,
    email: input.email,
    result: 'created',
  });
  return { ok: true, status: 'created', ownerUid };
}
