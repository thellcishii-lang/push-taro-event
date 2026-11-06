// app/guide/features/store-pop/page.tsx
import type { Metadata } from 'next';
import StorePopClient from './StorePopClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '店頭POP印刷の使い方｜A4/B5のQRコードポップを管理画面から印刷｜Push-taro',
  description:
    'Push-taroのSTANDARD以上で使える「店頭POP印刷」機能の解説。レジ横やカウンターに置くQRコードポップを、管理画面からA4/B5サイズで印刷できます。お客様がスマホで読み取るだけで通知登録が完了し、その場で初回クーポンが使えます。',
  keywords: [
    '店頭POP 印刷',
    'QRコード ポップ',
    '店舗 QRコード 集客',
    'レジ横 ポップ',
    'Push-taro 店頭POP',
    'QRコード 登録',
  ],
  alternates: { canonical: '/guide/features/store-pop' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '店頭POP印刷の使い方｜Push-taro',
    description: 'レジ横に置くだけ。管理画面からQRコードポップを印刷して、お客様の登録ハードルを下げます。',
    url: '/guide/features/store-pop',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '店頭POP印刷の使い方｜Push-taro',
    description: 'レジ横に置くだけ。管理画面からQRコードポップを印刷。',
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
  headline: '店頭POP印刷の使い方｜A4/B5のQRコードポップを管理画面から印刷',
  description: 'Push-taroのSTANDARD以上で使える「店頭POP印刷」機能の解説。お客様の登録ハードルを下げる店頭施策。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-28',
  dateModified: '2026-10-28',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/store-pop` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: '店頭POP印刷', item: `${appUrl}/guide/features/store-pop` },
  ],
};

export default function Page() {
  return (
    <>
      <StorePopClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
