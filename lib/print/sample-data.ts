import type { PartnerPrintData } from './types';

/**
 * 販促ツールのプレビュー用サンプルデータ
 * 実際の代理店の情報は含まず、あくまで「こう仕上がります」のイメージ用
 */
export const SAMPLE_DATA: PartnerPrintData = {
  role: 'agency',
  companyName: '株式会社サンプル',
  ownerName: '山田 太郎',
  email: 'taro@example.com',
  phone: '090-1234-5678',
  address: '〒100-0001 東京都千代田区千代田1-1-1',
  website: 'https://example.com',
  invoiceNumber: 'T1234567890123',

  referralCode: 'ABC12345',
  referralUrl: 'https://push-taro.com/r/ABC12345',

  logoUrl: undefined,
};
