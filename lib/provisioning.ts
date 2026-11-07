// 本家決済完了 → EVENT への契約者自動登録（プロビジョニング）の本体。
//
// 冪等性: 契約ID（contractId）をキーにする。
// - 契約者レコードがあり ownerUid まで設定済みなら、同じ結果を返すだけ（replay）
// - Auth ユーザー作成後に落ちても、再送時にメールアドレスで既存ユーザーを引き直して続きを完了させる
// - パスワードは Auth に渡すだけで、ログ・レコードのどこにも残さない
import { authAdmin } from './firebase-admin';
import {
  completeOrganizerRecord,
  createOrganizerRecord,
  getOrganizer,
  logProvisioning,
  type Organizer,
} from './organizers';

export interface ProvisionOrganizerInput {
  contractId: string;
  email: string;
  password: string;
  companyName: string;
  address?: string;
  phone?: string;
  /** 使用開始日（決済完了日, 'YYYY-MM-DD'） */
  startDate: string;
  subscriberCap?: number;
  couponCap?: number;
  agencyCode?: string | null;
}

export type ProvisionOrganizerResult =
  | { ok: true; status: 'created' | 'replayed'; ownerUid: string }
  | { ok: false; error: string };

/**
 * 冪等判定（純粋関数）:
 * レコードがあり ownerUid 設定済みなら登録は完了しているので 'replay'。
 * それ以外（未登録・途中状態）は 'create' として続きから処理する。
 */
export function decideProvisioning(
  existing: Pick<Organizer, 'ownerUid'> | null,
): 'create' | 'replay' {
  return existing?.ownerUid ? 'replay' : 'create';
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

  if (decideProvisioning(existing) === 'replay') {
    await logProvisioning({
      contractId: input.contractId,
      email: input.email,
      result: 'replayed',
    });
    return { ok: true, status: 'replayed', ownerUid: existing!.ownerUid! };
  }

  let ownerUid: string;
  try {
    ownerUid = await createOrReuseAuthUser(input.email, input.password);
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
