// app/sitemap.ts
import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ① LP・主要CV系（priority 1.0）
  const core = [
    { path: '/', priority: 1.0, freq: 'weekly' as const },
    { path: '/guide', priority: 0.9, freq: 'weekly' as const },
    { path: '/partners', priority: 0.9, freq: 'weekly' as const },
    { path: '/signup', priority: 0.8, freq: 'monthly' as const },
    { path: '/contact', priority: 0.6, freq: 'monthly' as const },
  ];

  // ② ガイド配下（priority 0.7）
  const guides = [
    // --- 機能別 ---
    '/guide/features',
    '/guide/features/push-notification',
    '/guide/features/qr-acquisition',
    '/guide/features/coupon-first',
    '/guide/features/coupon-normal',
    '/guide/features/coupon-loyalty',
    '/guide/features/coupon-stepup',
    '/guide/features/coupon-repeat',
    '/guide/features/coupon-birthday',
    '/guide/features/coupon-dormant',
    '/guide/features/scheduled-push',
    '/guide/features/referral',
    '/guide/features/login-streak',
    '/guide/features/store-pop',

    // --- 運用ノウハウ ---
    '/guide/case-studies',
    '/guide/ctr-to-cvr',
    '/guide/event-marketing',
    '/guide/existing-customers',
    '/guide/food-loss',
    '/guide/industry-fit',
    '/guide/line-comparison',
    '/guide/ng-actions',
    '/guide/pos-integration',
    '/guide/push-notification-metrics',
    '/guide/push-notification-roi',
    '/guide/security',
    '/guide/segmentation',
    '/guide/store-marketing',
    '/guide/super',
    '/guide/what-is-pwa',

    // --- 業種別 ---
    '/guide/bakery',
    '/guide/cafe',
    '/guide/snack',
    '/guide/apparel',
    '/guide/apparel-ai-video',
  ].map((path) => ({ path, priority: 0.7, freq: 'monthly' as const }));

  // ③ 開発者向け（priority 0.5）
  const developers = [
    '/developers/pos-api',
  ].map((path) => ({ path, priority: 0.5, freq: 'monthly' as const }));

  // ④ 取扱説明書（priority 0.5）
  const manual = [
    '/torisetsu',
    '/torisetsu/light-standard',
    '/torisetsu/pro',
  ].map((path) => ({ path, priority: 0.5, freq: 'monthly' as const }));

  // ⑤ 法務・補助（priority 0.3）
  const legal = [
    '/privacy',
    '/terms',
    '/tokusho',
  ].map((path) => ({ path, priority: 0.3, freq: 'yearly' as const }));

  // ★ 除外（ログイン後画面 / 決済フロー / API）
  //   /pro-shop /shop /agency /affiliate /affilishop
  //   /subscribe /notification-link /payment
  //   /system-admin /print /api /reset-password /upgrade /test
  //   → sitemap に含めない

  return [...core, ...guides, ...developers, ...manual, ...legal].map((p) => ({
    url: new URL(p.path, appUrl).toString(),
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
