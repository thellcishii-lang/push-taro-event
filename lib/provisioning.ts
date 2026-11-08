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

/**
 * 更新で反映する項目の抽出（純粋関数）。
 * 送られた項目だけを patch に含める。email / startDate / agencyCode と
 * 認証情報（パスワード）は更新対象に含めない。
 */
export function buildProvisioningUpdate(
  input: Pick<
    ProvisionOrganizerInput,
    'companyName' | 'address' | 'phone' | 'subscriberCap' | 'couponCap'
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
