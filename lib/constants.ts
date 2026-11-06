// lib/constants.ts

// ============================================================
// プラン月額（税別）
// ============================================================
export const PLAN_PRICES: Record<string, number> = {
  light: 1980,
  standard: 3800,
  pro: 10000,
};

// ============================================================
// プラン配信上限
// ============================================================
export const PLAN_LIMITS: Record<string, number> = {
  light: 5000,
  standard: 15000,
  pro: 5000000, // 実質無制限
};

export const PLAN_LIMIT_LABELS: Record<string, string> = {
  light: '5,000通',
  standard: '15,000通',
  pro: '無制限',
};

// ============================================================
// 代理店 報酬率（源泉前）
// ============================================================
export const AGENCY_RATE_PRO_TIERS = [
  { maxActivePro: 100,   rate: 0.30 },
  { maxActivePro: 200,   rate: 0.36 },
  { maxActivePro: Infinity, rate: 0.45 },
] as const;

export const AGENCY_RATE_OTHER = 0.18; // STANDARD / LIGHT

// ============================================================
// PRO紹介 報酬率（源泉前）
// ============================================================
export const PRO_REFERRAL_RATE = 0.10;

// ============================================================
// アフィリエイト 報酬率（源泉前）
// ============================================================
export const AFFILIATE_RECURRING_RATE = 0.05;

// 初年度優遇率（紹介から12ヶ月間・13ヶ月目から通常率に切り替え）
export const AFFILIATE_RECURRING_RATE_FIRST_YEAR = 0.08;
export const AFFILIATE_FIRST_YEAR_MONTHS = 12;

// 単発型の固定報酬額（源泉前）
export const AFFILIATE_ONE_TIME_REWARDS: Record<string, number> = {
  light: 1000,
  standard: 2000,
  pro: 5000,
};

// ============================================================
// 源泉徴収率（インボイス未登録時に適用）
// ============================================================
export const WITHHOLDING_RATE = 0.10;

// ============================================================
// affilishop（実店舗向けアフィリエイト）報酬率（源泉前）
// ============================================================
// 全プラン一律7%。初年度（紹介から12ヶ月間）は10%、13ヶ月目より7%。
export const AFFILISHOP_RATE = 0.07;
export const AFFILISHOP_RATE_FIRST_YEAR = 0.10;
export const AFFILISHOP_FIRST_YEAR_MONTHS = 12;

// 実績0件が続いた場合の自動退会までの月数
export const AFFILISHOP_AUTO_WITHDRAW_MONTHS = 3;

// ============================================================
// 代理店費用
// ============================================================
export const AGENCY_INITIAL_FEE = 300000;
export const AGENCY_MONTHLY_FEE = 30000;

// ============================================================
// プラン表示用ラベル
// ============================================================
export const PLAN_LABELS: Record<string, string> = {
  light: 'LIGHT',
  standard: 'STANDARD',
  pro: 'PRO',
};
