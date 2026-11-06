// app/guide/industry-fit/page.tsx
import type { Metadata } from 'next';
import IndustryFitClient from './IndustryFitClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '【業種別】集客にプッシュ通知が効く店舗・向いていない店舗の特徴｜Push-taro',
  description:
    '実店舗の集客において、プッシュ通知が劇的に効く業種と、そうでない業種の違いを解説。チラシ配布からの脱却、飲食店・小売・アパレルの活用例から、不動産・予約制サロンなど向かない理由まで、導入前の判断基準をまとめました。',
  keywords: [
    'プッシュ通知 効く業種',
    'プッシュ通知 向いてない業種',
    '実店舗 集客 プッシュ通知',
    '店舗 アプリ 集客',
    'チラシ 代替 アプリ',
    'Push-taro 業種別',
  ],
  alternates: { canonical: '/guide/industry-fit' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '【業種別】集客にプッシュ通知が効く店舗・向いていない店舗の特徴',
    description: 'プッシュ通知が劇的に効く業種と、そうでない業種の決定的な違いを解説します。',
    url: '/guide/industry-fit',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '【業種別】集客にプッシュ通知が効く店舗・向いていない店舗の特徴',
    description: 'プッシュ通知が劇的に効く業種と、そうでない業種の違い。',
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
  headline: '【業種別】集客にプッシュ通知が効く店舗・向いていない店舗の特徴',
  description: 'プッシュ通知が劇的に効く業種と、そうでない業種の決定的な違いを解説します。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-28',
  dateModified: '2026-10-28',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/industry-fit` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: 'プッシュ通知が効く業種・向いていない業種', item: `${appUrl}/guide/industry-fit` },
  ],
};

export default function Page() {
  return (
    <>
      <IndustryFitClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
