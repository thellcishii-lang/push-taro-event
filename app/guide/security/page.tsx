import type { Metadata } from 'next';
import SecurityClient from './SecurityClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'なぜ、Push-taroは顧客情報を取らないのか｜電話番号だけで使えるクーポンアプリ｜Push-taro',
  description:
    '大手企業の情報流出が日常になる中、顧客情報を取れば取るほど、リスクは増えます。Push-taroが保存するのは、電話番号だけ。氏名・住所・購買履歴・クレジットカード情報は、一切取りません。漏洩時のリスクを最小化する設計思想を解説します。',
  keywords: [
    '顧客情報 漏洩 対策',
    'クーポンアプリ セキュリティ',
    '顧客情報 取らない',
    '個人情報保護',
    '電話番号 のみ',
    '情報流出 リスク',
    'Push-taro セキュリティ',
  ],
  alternates: { canonical: '/guide/security' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'なぜ、Push-taroは顧客情報を取らないのか｜Push-taro',
    description:
      '顧客情報を取れば取るほど、リスクは増える。Push-taroが保存するのは、電話番号だけ。',
    url: '/guide/security',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'なぜ、Push-taroは顧客情報を取らないのか｜Push-taro',
    description: '電話番号だけで使える、顧客情報を集めないクーポンアプリ。',
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
  headline: 'なぜ、Push-taroは顧客情報を取らないのか',
  description:
    '顧客情報を取れば取るほど、リスクは増える。Push-taroが保存するのは、電話番号だけ。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-16',
  dateModified: '2026-10-16',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/security` },
  inLanguage: 'ja-JP',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: 'セキュリティ', item: `${appUrl}/guide/security` },
  ],
};

export default function Page() {
  return (
    <>
      <SecurityClient />
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
