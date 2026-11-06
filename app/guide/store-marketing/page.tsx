// app/guide/store-marketing/page.tsx
import type { Metadata } from 'next';
import StoreMarketingClient from './StoreMarketingClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '実店舗の集客には何をするべきか。｜Push-taro',
  description:
    '広告、ポータル、LP、SNS、LINE。どれも必要で、全てをやる時代です。でも、それだけでは足りない。1回来店してくれたお客様への施策が、ほとんどの店舗で抜けています。LINE Businessの配信上限という壁と、Push-taroがその壁をどう外したかを解説します。',
  keywords: [
    '実店舗 集客',
    '実店舗 リピート施策',
    'LINE Business 配信上限',
    'LINE 公式アカウント 埋もれる',
    '店舗 マーケティング',
    'CVR 改善',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/store-marketing' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '実店舗の集客、全部やるのは当たり前。問題は、その「後」。｜Push-taro',
    description:
      '広告、ポータル、LP、SNS、LINE。全部やる時代に、抜けているものがある。1回目の来店客を、どう2回目に繋げるか。',
    url: '/guide/store-marketing',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '実店舗の集客、全部やるのは当たり前。問題は、その「後」。｜Push-taro',
    description:
      '1回目の来店客を、どう2回目に繋げるか。LINE Businessの配信上限という壁を、Push-taroはどう外したか。',
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
  headline: '実店舗の集客、全部やるのは当たり前。問題は、その「後」。',
  description:
    '広告、ポータル、LP、SNS、LINE。どれも必要で、全部やる時代です。でも、それだけでは足りない。1回来店してくれたお客様への施策が、ほとんどの店舗で抜けています。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-13',
  dateModified: '2026-10-13',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${appUrl}/guide/store-marketing`,
  },
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
    {
      '@type': 'ListItem',
      position: 3,
      name: '実店舗の集客、その「後」',
      item: `${appUrl}/guide/store-marketing`,
    },
  ],
};

export default function Page() {
  return (
    <>
      <StoreMarketingClient />

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
