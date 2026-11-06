// app/guide/features/coupon-dormant/page.tsx
import type { Metadata } from 'next';
import CouponDormantClient from './CouponDormantClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '休眠顧客の呼び戻し（復活クーポン）の設定方法｜来なくなったお客様を自動で復帰｜Push-taro',
  description:
    '最終来店からN日以上経過したお客様を自動抽出し、特別な復帰クーポンを配信する「休眠復活クーポン」の機能解説。LINE公式のブロック（通知OFF）対策としても有効です。休眠判定の推奨日数や、自動配信の仕組みを図解で解説します。',
  keywords: [
    '休眠顧客 呼び戻し',
    '休眠客 対策',
    '来なくなった 客 呼び戻す',
    '復活クーポン 設定',
    'LINE ブロック 解除 対策',
    '離反顧客 防止',
    'Push-taro 機能',
  ],
  alternates: { canonical: '/guide/features/coupon-dormant' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '休眠顧客の呼び戻し（復活クーポン）の設定方法｜Push-taro',
    description: '最終来店からN日経過した顧客を自動抽出。特別な復帰クーポンで、離反顧客を呼び戻します。',
    url: '/guide/features/coupon-dormant',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '休眠顧客の呼び戻し（復活クーポン）の設定方法｜Push-taro',
    description: '来なくなったお客様を自動で呼び戻す仕組み。',
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
  headline: '休眠顧客の呼び戻し（復活クーポン）の設定方法',
  description: '最終来店からN日以上経過したお客様を自動抽出し、特別な復帰クーポンを配信する機能解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/coupon-dormant` },
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
    { '@type': 'ListItem', position: 4, name: '休眠復活クーポン', item: `${appUrl}/guide/features/coupon-dormant` },
  ],
};

export default function Page() {
  return (
    <>
      <CouponDormantClient />
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
