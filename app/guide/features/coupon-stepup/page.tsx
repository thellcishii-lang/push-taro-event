// app/guide/features/coupon-stepup/page.tsx
import type { Metadata } from 'next';
import CouponStepupClient from './CouponStepupClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'ステップアップクーポンの設定方法｜ポイントカードの代わりに来店回数で特典アップ｜Push-taro',
  description:
    '来店回数に応じて段階的に特典が豪華になる「ステップアップクーポン」の機能解説。アプリ不要のデジタルポイントカードとして、お客様の「あと1回」の心理を後押しし、来店習慣を強力に促進します。最大10段階まで設定可能です。',
  keywords: [
    'ステップアップクーポン',
    'ポイントカード 代わり アプリ',
    '来店回数 特典',
    'デジタルポイントカード',
    '店舗 常連客 育成',
    '段階的 クーポン',
    'Push-taro 機能',
  ],
  alternates: { canonical: '/guide/features/coupon-stepup' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'ステップアップクーポンの設定方法｜Push-taro',
    description: '来店回数に応じて特典アップ。デジタルポイントカードとして来店習慣を促進します。',
    url: '/guide/features/coupon-stepup',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ステップアップクーポンの設定方法｜Push-taro',
    description: '来店回数に応じて特典アップ。デジタルポイントカードとして機能します。',
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
  headline: 'ステップアップクーポンの設定方法｜ポイントカードの代わりに来店回数で特典アップ',
  description: '来店回数に応じて段階的に特典が豪華になる「ステップアップクーポン」の機能解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/coupon-stepup` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: 'ステップアップクーポン', item: `${appUrl}/guide/features/coupon-stepup` },
  ],
};

export default function Page() {
  return (
    <>
      <CouponStepupClient />
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
