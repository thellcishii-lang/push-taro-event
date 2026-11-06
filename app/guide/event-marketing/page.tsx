// app/guide/event-marketing/page.tsx
import type { Metadata } from 'next';
import EventMarketingClient from './EventMarketingClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'イベント・展示会の運営にプッシュ通知を活用する方法｜人件費削減と新たな収益源｜Push-taro',
  description:
    'フェスやBtoB展示会など2〜3日間の短期イベント運営にプッシュ通知を導入するメリットを解説。リアルタイムな人流コントロールによる人件費削減、出展社向けの広告枠販売によるマネタイズ、初期費用0円・月額制だからこそ実現できる短期運用のノウハウを紹介します。',
  keywords: [
    'イベント プッシュ通知',
    '展示会 集客 システム',
    'イベント 人件費 削減',
    'フェス 運営 効率化',
    '展示会 マネタイズ',
    'プッシュ通知 広告枠',
    'Push-taro イベント',
  ],
  alternates: { canonical: '/guide/event-marketing' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'イベント・展示会の運営にプッシュ通知を活用する方法｜Push-taro',
    description: 'リアルタイムな人流コントロールと広告枠販売で、短期イベントの運営を黒字化するノウハウ。',
    url: '/guide/event-marketing',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'イベント・展示会の運営にプッシュ通知を活用する方法｜Push-taro',
    description: 'リアルタイムな人流コントロールと広告枠販売で、短期イベントの運営を黒字化。',
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
  headline: 'イベント・展示会の運営にプッシュ通知を活用する方法｜人件費削減と新たな収益源',
  description: '短期イベント運営にプッシュ通知を導入するメリット。人流コントロール、広告枠販売、短期契約のノウハウを解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-28',
  dateModified: '2026-10-28',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/event-marketing` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: 'イベント・展示会の活用', item: `${appUrl}/guide/event-marketing` },
  ],
};

export default function Page() {
  return (
    <>
      <EventMarketingClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
