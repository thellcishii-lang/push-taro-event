// app/guide/features/coupon-normal/page.tsx
import type { Metadata } from 'next';
import CouponNormalClient from './CouponNormalClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '店舗の通常クーポン（常設クーポン）の設定方法｜LINEの友だち特典の代わりに｜Push-taro',
  description:
    '登録者全員が何度でも使える「通常クーポン」の機能解説。新規獲得からリピートまで、LINE公式アカウントの「友だち特典」と同じ役割を実現します。有効期限の設定や、Push-taroならではの「配信通数にカウントされない」メリットを解説。',
  keywords: [
    '常設クーポン 設定',
    '店舗 クーポン 配布 方法',
    'LINE 友だち特典 代わり',
    '通常クーポン 作り方',
    '会員特典 クーポン',
    'Push-taro 機能',
  ],
  alternates: { canonical: '/guide/features/coupon-normal' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '店舗の通常クーポン（常設クーポン）の設定方法｜Push-taro',
    description: '何度でも使える常設クーポンの作り方。LINEの友だち特典の代わりとしてリピートを促進します。',
    url: '/guide/features/coupon-normal',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '店舗の通常クーポン（常設クーポン）の設定方法｜Push-taro',
    description: '何度でも使える常設クーポンの作り方。リピートを促進します。',
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
  headline: '店舗の通常クーポン（常設クーポン）の設定方法',
  description: '登録者全員が何度でも使える「通常クーポン」の機能解説。LINEの友だち特典の代わりとしてリピートを促進します。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/coupon-normal` },
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
    { '@type': 'ListItem', position: 4, name: '通常クーポン', item: `${appUrl}/guide/features/coupon-normal` },
  ],
};

export default function Page() {
  return (
    <>
      <CouponNormalClient />
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
