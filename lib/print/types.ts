export type PrintMaterialType =
  | 'trifold'
  | 'leaflet-a5'
  | 'leaflet-a4'
  | 'card'
  | 'business-card';

export type PartnerRole = 'agency' | 'affilishop' | 'affiliate';

export interface PartnerPrintData {
  role: PartnerRole;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  invoiceNumber?: string;

  referralCode: string;
  referralUrl: string;

  logoUrl?: string;
}

export interface PrintMaterialMeta {
  type: PrintMaterialType;
  label: string;
  description: string;
  sizeText: string;
  pagesText: string;
}
// ============================================================
// 店頭ポップ用データ（店舗側）
// ============================================================
export interface ShopPopData {
  shopId: string;
  shopName: string;
  subscribeUrl: string;
  plan: 'light' | 'standard' | 'pro';

  /** 初回クーポン（有効時のみ表示） */
  firstCoupon?: {
    enabled: boolean;
    title?: string;
    description?: string;
  };
}
