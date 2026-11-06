// app/guide/page.tsx
import type { Metadata } from 'next';
import GuideClient from './GuideClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '実店舗のプッシュ通知・クーポン活用ガイド｜業種別・機能別の実践ノウハウ｜Push-taro',
  description:
    'スーパー・パン屋・カフェ・アパレル・スナックなど業種別の活用法から、クーポン自動配信・休眠復活・連続ログイン・POS連携などの機能別マニュアルまで網羅。LINE公式の配信上限との比較、PWAの仕組み、顧客情報を取らないセキュリティ設計まで、実店舗のリピート施策に必要なノウハウを徹底解説します。',
  keywords: [
    '実店舗 プッシュ通知',
    'プッシュ通知 活用 ガイド',
    '店舗 集客 ノウハウ',
    'LINE 配信上限 比較',
    'PWA プッシュ通知',
    '店舗 クーポン 活用',
    'スーパー 集客',
    'パン屋 集客',
    'カフェ 集客',
    'アパレル 集客',
    'スナック 集客',
    '休眠復活 クーポン',
    '店頭POP 印刷',
    '連続ログイン 特典',
    'POSレジ 連携',
    'Push-taro',
  ],
  alternates: { canonical: '/guide' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: '実店舗のプッシュ通知・クーポン活用ガイド｜Push-taro',
    description:
      '業種別・機能別の実践マニュアル。LINE比較、PWA、セキュリティ、POS連携まで、実店舗のリピート施策に必要なノウハウを公開。',
    url: '/guide',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '実店舗のプッシュ通知・クーポン活用ガイド｜Push-taro',
    description: '業種別・機能別の実践マニュアル。現場から導いたノウハウ。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/* ============================================================
   JSON-LD: BreadcrumbList
   ============================================================ */
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
  ],
};

/* ============================================================
   JSON-LD: CollectionPage（ガイド一覧）
   ============================================================ */
const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '実店舗のためのプッシュ通知 活用ガイド',
  description: '業種別・機能別の実践マニュアル。現場から導いたノウハウを公開。',
  url: `${appUrl}/guide`,
  inLanguage: 'ja-JP',
  publisher: { '@id': `${appUrl}/#organization` },
  hasPart: [
    // 業種別ガイド
    { '@type': 'Article', name: 'スーパー・小売店', url: `${appUrl}/guide/super` },
    { '@type': 'Article', name: 'パン屋・ベーカリー', url: `${appUrl}/guide/bakery` },
    { '@type': 'Article', name: '飲食店・カフェ', url: `${appUrl}/guide/cafe` },
    { '@type': 'Article', name: 'アパレル・雑貨', url: `${appUrl}/guide/apparel` },
    { '@type': 'Article', name: 'マネキンの写真1枚で着用動画の作り方', url: `${appUrl}/guide/apparel-ai-video` },
    { '@type': 'Article', name: 'スナック・パブ', url: `${appUrl}/guide/snack` },
    { '@type': 'Article', name: 'フードロス削減', url: `${appUrl}/guide/food-loss` },

    // 機能別ガイド（全追加）
    { '@type': 'Article', name: 'プッシュ通知', url: `${appUrl}/guide/features/push-notification` },
    { '@type': 'Article', name: 'QRコード顧客獲得', url: `${appUrl}/guide/features/qr-acquisition` },
    { '@type': 'Article', name: '店頭POP印刷', url: `${appUrl}/guide/features/store-pop` },
    { '@type': 'Article', name: '初回クーポン', url: `${appUrl}/guide/features/coupon-first` },
    { '@type': 'Article', name: '通常クーポン', url: `${appUrl}/guide/features/coupon-normal` },
    { '@type': 'Article', name: '特別達成クーポン', url: `${appUrl}/guide/features/coupon-loyalty` },
    { '@type': 'Article', name: 'ステップアップクーポン', url: `${appUrl}/guide/features/coupon-stepup` },
    { '@type': 'Article', name: '連続クーポン', url: `${appUrl}/guide/features/coupon-repeat` },
    { '@type': 'Article', name: '記念日・誕生日クーポン', url: `${appUrl}/guide/features/coupon-birthday` },
    { '@type': 'Article', name: '休眠復活クーポン', url: `${appUrl}/guide/features/coupon-dormant` },
    { '@type': 'Article', name: '予約配信・定期配信', url: `${appUrl}/guide/features/scheduled-push` },
    { '@type': 'Article', name: '連続ログイン特典', url: `${appUrl}/guide/features/login-streak` },
    { '@type': 'Article', name: '紹介報酬', url: `${appUrl}/guide/features/referral` },
    { '@type': 'Article', name: 'POSレジ連携', url: `${appUrl}/guide/pos-integration` },

    // 運用ノウハウ
    { '@type': 'Article', name: '機能別ガイドTOP', url: `${appUrl}/guide/features` },
    { '@type': 'Article', name: 'イベント・展示会の活用', url: `${appUrl}/guide/event-marketing` },
    { '@type': 'Article', name: 'NG行為集', url: `${appUrl}/guide/ng-actions` },

    // 店舗マーケティングの本質
    { '@type': 'Article', name: '実店舗の集客、オススメの施策', url: `${appUrl}/guide/store-marketing` },
    { '@type': 'Article', name: 'LINE公式アカウントとの比較', url: `${appUrl}/guide/line-comparison` },
    { '@type': 'Article', name: 'プッシュ通知のCVRは、何%あればいいのか', url: `${appUrl}/guide/push-notification-metrics` },
    { '@type': 'Article', name: 'CTRを、CVRに繋げる方法', url: `${appUrl}/guide/ctr-to-cvr` },
    { '@type': 'Article', name: 'セグメント配信とは', url: `${appUrl}/guide/segmentation` },
    { '@type': 'Article', name: 'プッシュ通知が効く業種・向いていない業種', url: `${appUrl}/guide/industry-fit` },
　　　　　　　　{ '@type': 'Article', name: 'プッシュ通知のCVRを最大化する配信頻度', url: `${appUrl}/guide/push-notification-roi` },
    { '@type': 'Article', name: 'なぜ、顧客情報を取らないのか', url: `${appUrl}/guide/security` },
    { '@type': 'Article', name: '実店舗のためのPWA入門', url: `${appUrl}/guide/what-is-pwa` },
  ],
};

/* ============================================================
   Page
   ============================================================ */
export default function Page() {
  return (
    <>
      <GuideClient />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    </>
  );
}
