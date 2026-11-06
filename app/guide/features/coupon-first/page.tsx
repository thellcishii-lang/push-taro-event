// app/guide/features/coupon-first/page.tsx
import type { Metadata } from 'next';
import CouponFirstClient from './CouponFirstClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '店舗の初回クーポンはQRコードで自動配布｜新規顧客を逃さない仕組み｜Push-taro',
  description:
    '「一度来たお客様が再来店しない」とお悩みの店舗様へ。QRコードを読み取るだけで初回クーポンを自動配布。SMS認証による1人1回の制限でクーポンの使い回しを防ぎ、確実に次回の来店（リピーター化）へ繋げます。LINE公式アカウントの代わりとしても選ばれる、実店舗向けクーポンアプリです。',
  keywords: [
    '初回クーポン',
    '新規顧客 獲得',
    '新規顧客 リピーター',
    '店舗 クーポン 配布',
    'QRコード クーポン',
    'LINE 初回クーポン 代わり',
    'クーポン 使い回し 防止',
    'SMS認証 クーポン',
    '店舗 クーポン アプリ',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/features/coupon-first' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '店舗の初回クーポンはQRコードで自動配布｜Push-taro',
    description: 'QRコード読み取りで初回クーポンを自動配布。使い回しを防ぎ、リピーター獲得に繋げます。',
    url: '/guide/features/coupon-first',
    siteName: 'Push-taro',
  },
  // ...
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
  headline: '店舗の初回クーポンはQRコードで自動配布｜新規顧客を逃さない仕組み',
  description: 'QRコードを読み取るだけで初回クーポンを自動配布。SMS認証で使い回しを防ぎ、確実に次回の来店へ繋げます。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/coupon-first` },
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
    { '@type': 'ListItem', position: 4, name: '初回クーポン', item: `${appUrl}/guide/features/coupon-first` },
  ],
};

export default function Page() {
  return (
    <>
      <CouponFirstClient />
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
