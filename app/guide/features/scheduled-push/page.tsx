// app/guide/features/scheduled-push/page.tsx
import type { Metadata } from 'next';
import ScheduledPushClient from './ScheduledPushClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'プッシュ通知の予約配信・定期配信の設定方法｜毎週自動で配信する仕組み｜Push-taro',
  description:
    '「毎週金曜18時」「毎月1日」など、任意のスケジュールで自動配信できる「予約配信・定期配信」機能の解説。一度設定すればずっと動き続けるため、配信の仕込みを自動化できます。1回のみの日付指定から定期配信まで対応。',
  keywords: [
    '予約配信 設定 方法',
    '定期配信 やり方',
    'プッシュ通知 自動送信',
    '毎週 金曜 配信',
    '配信 スケジュール 設定',
    'Push-taro 機能',
  ],
  alternates: { canonical: '/guide/features/scheduled-push' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'プッシュ通知の予約配信・定期配信の設定方法｜Push-taro',
    description: '任意のスケジュールで自動配信。配信の仕込みを自動化します。',
    url: '/guide/features/scheduled-push',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プッシュ通知の予約配信・定期配信の設定方法｜Push-taro',
    description: '任意のスケジュールで自動配信。配信の仕込みを自動化。',
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
  headline: 'プッシュ通知の予約配信・定期配信の設定方法',
  description: '「毎週金曜18時」「毎月1日」など、任意のスケジュールで自動配信できる機能の解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/scheduled-push` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: '予約配信・定期配信', item: `${appUrl}/guide/features/scheduled-push` },
  ],
};

export default function Page() {
  return (
    <>
      <ScheduledPushClient />
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
