// app/guide/push-notification-metrics/page.tsx
import type { Metadata } from 'next';
import PushNotificationMetricsClient from './PushNotificationMetricsClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'プッシュ通知のCVRは、何%あればいいのか｜CTRとCVRのベンチマーク｜Push-taro',
  description:
    'プッシュ通知のCTRとCVRのベンチマークを、業界調査データから解説。メールとの配信基準CTR比較、実店舗の来店CVR 3.88%、ECサイトのCVR 0.29%など、数字で見るプッシュ通知の実力と、改善の目安をまとめました。',
  keywords: [
    'プッシュ通知 CTR',
    'プッシュ通知 CVR',
    'CTR ベンチマーク',
    'CVR ベンチマーク',
    'プッシュ通知 効果測定',
    'プッシュ通知 開封率',
    '来店CVR',
    '実店舗 マーケティング',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/push-notification-metrics' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'プッシュ通知のCVRは、何%あればいいのか｜Push-taro',
    description:
      'CTRとCVRのベンチマークを、業界調査データから解説。実店舗の来店CVR 3.88%、ECサイトの0.29%など、数字で見るプッシュ通知の実力。',
    url: '/guide/push-notification-metrics',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プッシュ通知のCVRは、何%あればいいのか｜Push-taro',
    description: 'CTRとCVRのベンチマークを、業界調査データから解説。',
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
   JSON-LD: Article
   ============================================================ */
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'プッシュ通知のCVRは、何%あればいいのか',
  description:
    'プッシュ通知のCTRとCVRのベンチマークを、業界調査データから解説。メールとの配信基準CTR比較、実店舗の来店CVR、ECサイトのCVRを整理。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-13',
  dateModified: '2026-10-13',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${appUrl}/guide/push-notification-metrics`,
  },
  inLanguage: 'ja-JP',
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
    {
      '@type': 'ListItem',
      position: 3,
      name: 'プッシュ通知の指標',
      item: `${appUrl}/guide/push-notification-metrics`,
    },
  ],
};

export default function Page() {
  return (
    <>
      <PushNotificationMetricsClient />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
