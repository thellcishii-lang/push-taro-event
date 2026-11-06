// app/guide/push-notification-roi/page.tsx
import type { Metadata } from 'next';
import PushNotificationRoiClient from './PushNotificationRoiClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'プッシュ通知のCVR（コンバージョン率）を最大化する配信頻度｜LINEの上限と登録者の目安｜Push-taro',
  description:
    'プッシュ通知で成果を出すための「配信頻度」と「登録者数」の黄金律を解説。CVR4%がボーダーライン、体感できるのは1000人以上から。LINE公式の配信上限（LITEプラン月5,000通）の壁と、Push-taroの料金体系（配信無制限）を比較します。',
  keywords: [
    'プッシュ通知 配信頻度',
    'プッシュ通知 CVR',
    'プッシュ通知 登録者数 目安',
    'LINE公式 配信上限',
    'LINE LITE 5000通',
    'プッシュ通知 ROI',
    'Push-taro 配信無制限',
  ],
  alternates: { canonical: '/guide/push-notification-roi' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'プッシュ通知のCVR（コンバージョン率）を最大化する配信頻度｜Push-taro',
    description: '配信頻度と登録者数の黄金律。LINEの上限との比較とPush-taroの料金体系を解説。',
    url: '/guide/push-notification-roi',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プッシュ通知のCVR（コンバージョン率）を最大化する配信頻度｜Push-taro',
    description: '配信頻度と登録者数の黄金律。LINEの上限との比較。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'プッシュ通知のCVR（コンバージョン率）を最大化する配信頻度｜LINEの上限と登録者の目安',
  description: 'プッシュ通知で成果を出すための配信頻度と登録者数の黄金律を解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-28',
  dateModified: '2026-10-28',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/push-notification-roi` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: 'プッシュ通知が効く業種・向いていない業種', item: `${appUrl}/guide/industry-fit` },
    { '@type': 'ListItem', position: 4, name: 'CVRを最大化する配信頻度', item: `${appUrl}/guide/push-notification-roi` },
  ],
};

export default function Page() {
  return (
    <>
      <PushNotificationRoiClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
