/**
 * shops.plan が PRO かどうかを判定する。
 * 'PRO' / 'Pro' など表記ゆれのある既存データも PRO として扱う（/pro-shop 管理画面と同じ基準）。
 */
export function isProPlan(plan: unknown): boolean {
  return String(plan ?? '').trim().toLowerCase() === 'pro';
}
