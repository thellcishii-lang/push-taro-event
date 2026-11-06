// app/guide/existing-customers/page.tsx
import type { Metadata } from 'next';
import ExistingCustomersClient from './ExistingCustomersClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '既存客の囲い込みとは？実店舗の売上が頭打ちになる本当の理由｜Push-taro',
  description:
    '売上を伸ばす王道は認知拡大と新規開拓。でも広告費は使えない、SNSも限定的。「既存客の囲い込み」にたどり着く背景と、1回→3回への持ち込みと3回以上の回転率という2つの課題を整理します。',
  keywords: [
    '既存客 囲い込み',
    '既存客 リピート',
    '新規客 リピーター',
    '3回来店 リピーター',
    '実店舗 売上 頭打ち',
    'SNS 集客 限界',
    '実店舗 クーポンアプリ',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/existing-customers' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '既存客の囲い込みとは？実店舗の売上が頭打ちになる本当の理由｜Push-taro',
    description:
      '認知拡大・新規開拓の限界と、既存客の囲い込みに至る背景。1回→3回への持ち込みと3回以上の回転率という2つの課題を整理します。',
    url: '/guide/existing-customers',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '既存客の囲い込みとは？｜Push-taro',
    description: '実店舗の売上が頭打ちになる本当の理由。',
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
  headline: '既存客の囲い込みとは？実店舗の売上が頭打ちになる本当の理由',
  description:
    '売上を伸ばす王道は認知拡大と新規開拓。でも広告費は使えない、SNSも限定的。「既存客の囲い込み」にたどり着く背景と、2つの課題を整理します。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-01',
  dateModified: '2026-10-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/existing-customers` },
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
    { '@type': 'ListItem', position: 3, name: '既存客の囲い込み', item: `${appUrl}/guide/existing-customers` },
  ],
};

export default function Page() {
  return (
    <>
      <ExistingCustomersClient />

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
