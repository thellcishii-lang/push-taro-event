// app/guide/features/push-notification/page.tsx
import type { Metadata } from 'next';
import PushNotificationClient from './PushNotificationClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '店舗のプッシュ通知の送り方・設定方法｜メルマガの代わりに開封率3倍の一斉配信｜Push-taro',
  description:
    '登録済みのお客様全員に、一斉に通知を配信する基本機能。タイトル・本文・リンク先URLを自由に設定でき、開封率はメルマガの約3倍。セール告知や新商品入荷など、店舗の「今」をリアルタイムで届けます。',
  keywords: [
    '店舗 プッシュ通知 やり方',
    'プッシュ通知 送り方',
    '一斉配信 方法',
    'メルマガ 代わり 集客',
    '店舗 セール 告知',
    'リアルタイム 配信',
    'Push-taro 機能',
  ],
  alternates: { canonical: '/guide/features/push-notification' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '店舗のプッシュ通知の送り方・設定方法｜Push-taro',
    description: '登録者全員に一斉配信。開封率はメルマガの約3倍。店舗の「今」をリアルタイムで届けます。',
    url: '/guide/features/push-notification',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '店舗のプッシュ通知の送り方・設定方法｜Push-taro',
    description: '登録者全員に一斉配信。開封率はメルマガの約3倍。',
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

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '店舗のプッシュ通知の送り方・設定方法',
  description: '登録済みのお客様全員に、一斉に通知を配信する基本機能。開封率はメルマガの約3倍。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/push-notification` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: 'プッシュ通知', item: `${appUrl}/guide/features/push-notification` },
  ],
};

export default function Page() {
  return (
    <>
      <PushNotificationClient />
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
