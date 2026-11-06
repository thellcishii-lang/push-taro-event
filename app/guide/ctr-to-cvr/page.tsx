// app/guide/ctr-to-cvr/page.tsx
import type { Metadata } from 'next';
import CtrToCvrClient from './CtrToCvrClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'CTRを、CVRに繋げる方法｜プッシュ通知の「衝動タップ」を来店に変える設計｜Push-taro',
  description:
    'プッシュ通知はCTRが高い。でも、そのタップには「衝動的なタップ」も含まれます。CTRをCVRに繋げるには、通知とリンク先の一貫性、1タップで使えるクーポン、期限の設計が欠かせません。実店舗の来店CVRを上げる具体的な方法を解説します。',
  keywords: [
    'CTR CVR 違い',
    'CTR CVR 改善',
    'プッシュ通知 CVR',
    'プッシュ通知 来店率',
    'クーポン 設計',
    '実店舗 マーケティング',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/ctr-to-cvr' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'CTRを、CVRに繋げる方法｜Push-taro',
    description:
      'プッシュ通知の「衝動タップ」を、実際の来店に変えるための設計を解説。',
    url: '/guide/ctr-to-cvr',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CTRを、CVRに繋げる方法｜Push-taro',
    description: 'プッシュ通知の「衝動タップ」を、実際の来店に変えるための設計。',
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
  headline: 'CTRを、CVRに繋げる方法',
  description:
    'プッシュ通知のCTRをCVRに繋げるには、通知とリンク先の一貫性、1タップで使えるクーポン、期限の設計が欠かせません。実店舗の来店CVRを上げる具体的な方法を解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-13',
  dateModified: '2026-10-13',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${appUrl}/guide/ctr-to-cvr`,
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
      name: 'CTRを、CVRに繋げる方法',
      item: `${appUrl}/guide/ctr-to-cvr`,
    },
  ],
};

export default function Page() {
  return (
    <>
      <CtrToCvrClient />

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
