// app/guide/snack/page.tsx
import type { Metadata } from 'next';
import SnackClient from './SnackClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'スナック・パブのためのプッシュ通知活用術｜キャスト5人以上なら、Push-taro｜Push-taro',
  description:
    'スナックは「人と人」のビジネス。顧客200人以下・キャスト1〜2人なら、LINEライトプランで十分です。Push-taroが真価を発揮するのは、キャスト5人以上・顧客500人以上の規模。「今日のキャスト」配信で、来店率を最大化する方法を解説します。',
  keywords: [
    'スナック 集客',
    'スナック LINE',
    'スナック プッシュ通知',
    'スナック キャスト',
    'スナック クーポン',
    'パブ 集客',
    'キャスト 配信',
    'スナック 常連',
  ],
  alternates: { canonical: '/guide/snack' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'スナック・パブのためのプッシュ通知活用術｜Push-taro',
    description:
      'キャスト5人以上・顧客500人以上なら、Push-taro。「今日のキャスト」配信で、来店率を最大化。',
    url: '/guide/snack',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スナック・パブのためのプッシュ通知活用術｜Push-taro',
    description: 'キャスト5人以上なら、Push-taro。',
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
  headline: 'スナック・パブのためのプッシュ通知活用術',
  description:
    'スナックは「人と人」のビジネス。顧客200人以下・キャスト1〜2人なら、LINEライトプランで十分。Push-taroが真価を発揮するのは、キャスト5人以上・顧客500人以上の規模。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-17',
  dateModified: '2026-10-17',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/snack` },
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
    { '@type': 'ListItem', position: 3, name: 'スナック・パブ', item: `${appUrl}/guide/snack` },
  ],
};

export default function Page() {
  return (
    <>
      <SnackClient />

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
