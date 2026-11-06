// app/guide/features/page.tsx
import type { Metadata } from 'next';
import FeaturesClient from './FeaturesClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '機能別ガイド｜店舗向けプッシュ通知・クーポン・POS連携機能一覧｜Push-taro',
  description:
    'Push-taroの全機能を解説する機能別ガイド。プッシュ通知、QRコード顧客獲得、店頭POP印刷、初回・通常・連続・休眠復活クーポン、連続ログイン特典、予約配信、POS連携など、実店舗のリピート施策に必要な機能の使い方と設定方法をまとめています。',
  keywords: [
    '店舗 プッシュ通知 機能',
    '店舗 クーポン 機能',
    'Push-taro 機能一覧',
    'QRコード 顧客獲得',
    '店頭POP 印刷',
    '休眠復活 クーポン',
    '連続ログイン 特典',
    '予約配信 機能',
    'POSレジ 連携',
    '店舗 クーポンアプリ 機能',
  ],
  alternates: { canonical: '/guide/features' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: '機能別ガイド｜店舗向けプッシュ通知・クーポン機能一覧｜Push-taro',
    description: '実店舗のリピート施策に必要な機能の使い方と設定方法をまとめています。',
    url: '/guide/features',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '機能別ガイド｜店舗向けプッシュ通知・クーポン機能一覧｜Push-taro',
    description: '実店舗のリピート施策に必要な機能の使い方と設定方法。',
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
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
  ],
};

/* ============================================================
   JSON-LD: CollectionPage
   ============================================================ */
const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '機能別ガイド｜店舗向けプッシュ通知・クーポン機能一覧',
  description: 'Push-taroの全機能を解説する機能別ガイド。',
  url: `${appUrl}/guide/features`,
  inLanguage: 'ja-JP',
  publisher: { '@id': `${appUrl}/#organization` },
  hasPart: [
    { '@type': 'Article', name: 'プッシュ通知', url: `${appUrl}/guide/features/push-notification` },
    { '@type': 'Article', name: '予約配信・定期配信', url: `${appUrl}/guide/features/scheduled-push` },
    { '@type': 'Article', name: 'QRコード顧客獲得', url: `${appUrl}/guide/features/qr-acquisition` },
    { '@type': 'Article', name: '店頭POP印刷', url: `${appUrl}/guide/features/store-pop` },
    { '@type': 'Article', name: '初回クーポン', url: `${appUrl}/guide/features/coupon-first` },
    { '@type': 'Article', name: '通常クーポン', url: `${appUrl}/guide/features/coupon-normal` },
    { '@type': 'Article', name: '特別達成クーポン', url: `${appUrl}/guide/features/coupon-loyalty` },
    { '@type': 'Article', name: 'ステップアップクーポン', url: `${appUrl}/guide/features/coupon-stepup` },
    { '@type': 'Article', name: '連続クーポン', url: `${appUrl}/guide/features/coupon-repeat` },
    { '@type': 'Article', name: '記念日・誕生日クーポン', url: `${appUrl}/guide/features/coupon-birthday` },
    { '@type': 'Article', name: '休眠復活クーポン', url: `${appUrl}/guide/features/coupon-dormant` },
    { '@type': 'Article', name: '連続ログイン特典', url: `${appUrl}/guide/features/login-streak` },
    { '@type': 'Article', name: '紹介報酬', url: `${appUrl}/guide/features/referral` },
    { '@type': 'Article', name: 'POSレジ連携', url: `${appUrl}/guide/pos-integration` },
  ],
};

export default function Page() {
  return (
    <>
      <FeaturesClient />
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
