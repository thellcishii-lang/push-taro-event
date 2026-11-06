// app/guide/case-studies/page.tsx
import type { Metadata } from 'next';
import CaseStudiesClient from './CaseStudiesClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '導入事例｜実際に成果を出した店舗のリピート率・売上改善例｜Push-taro',
  description:
    'Push-taroを導入し、リピート率・売上を大きく改善した店舗の事例を紹介。美容室・飲食店など、業種・規模・施策内容を参考に、あなたの店舗に合った店舗向けプッシュ通知アプリの活用方法が見つかります。',
  keywords: [
    'プッシュ通知 導入事例',
    '店舗アプリ 事例',
    'リピート率 改善 事例',
    '店舗 集客 成功事例',
    'クーポン 配信 事例',
    'Push-taro 事例',
  ],
  alternates: { canonical: '/guide/case-studies' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '導入事例｜実際に成果を出した店舗の事例｜Push-taro',
    description:
      'リピート率・売上を大きく改善した店舗の事例を紹介。業種・規模・施策内容を参考に、自店に合った活用方法が見つかります。',
    url: '/guide/case-studies',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '導入事例｜実際に成果を出した店舗の事例｜Push-taro',
    description: 'リピート率・売上を改善した店舗の事例を紹介。',
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
  headline: '実際に成果を出した店舗の導入事例',
  description:
    'Push-taroを導入し、リピート率・売上を大きく改善した店舗の事例を紹介。業種・規模・施策内容を参考に、自店に合った活用方法が見つかります。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/case-studies` },
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
    { '@type': 'ListItem', position: 3, name: '導入事例', item: `${appUrl}/guide/case-studies` },
  ],
};

export default function Page() {
  return (
    <>
      <CaseStudiesClient />

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
