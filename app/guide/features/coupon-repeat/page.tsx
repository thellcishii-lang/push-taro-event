// app/guide/features/coupon-repeat/page.tsx
import type { Metadata } from 'next';
import CouponRepeatClient from './CouponRepeatClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '連続クーポンの設定方法｜来店サイクルを短縮してリピート率を上げる｜Push-taro',
  description:
    'クーポンの消込と同時に、次回使えるクーポンを自動発行する「連続クーポン」の機能解説。お客様の「次はいつ行こう」を自動で解決し、来店サイクルを短縮します。有効期限の設定や、他のクーポンとの併用可否も選べます。',
  keywords: [
    '連続クーポン 設定',
    'リピート率 上げる クーポン',
    '来店サイクル 短縮',
    '次回クーポン 自動発行',
    '店舗 リピーター 育成',
    'Push-taro 機能',
  ],
  alternates: { canonical: '/guide/features/coupon-repeat' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '連続クーポンの設定方法｜来店サイクルを短縮してリピート率を上げる｜Push-taro',
    description: '消込と同時に次回クーポンを自動発行。来店サイクルを短縮し、リピート率を高めます。',
    url: '/guide/features/coupon-repeat',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '連続クーポンの設定方法｜Push-taro',
    description: '消込と同時に次回クーポンを自動発行。リピート率を高めます。',
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
  headline: '連続クーポンの設定方法｜来店サイクルを短縮してリピート率を上げる',
  description: 'クーポンの消込と同時に、次回使えるクーポンを自動発行する「連続クーポン」の機能解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/coupon-repeat` },
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
    { '@type': 'ListItem', position: 4, name: '連続クーポン', item: `${appUrl}/guide/features/coupon-repeat` },
  ],
};

export default function Page() {
  return (
    <>
      <CouponRepeatClient />
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
