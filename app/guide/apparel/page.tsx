// app/guide/apparel/page.tsx
import type { Metadata } from 'next';
import ApparelClient from './ApparelClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'アパレル・雑貨店のためのプッシュ通知活用術｜ビジュアルで、来店を促す｜Push-taro',
  description:
    'アパレル・雑貨は、ビジュアルが命。商品画像だけでは伝わらない「着回し」「使用風景」を、Instagramと連携して届ける。新作入荷・SNSバズり再現・季節セール・限定アイテム——4つの型で、来店の習慣を作る。実践ノウハウを解説。',
  keywords: [
    'アパレル 集客',
    '雑貨店 集客',
    'アパレル プッシュ通知',
    'アパレル インスタ',
    'アパレル クーポン',
    '雑貨 マーケティング',
    '新作入荷 告知',
    'セール 告知',
    'アパレル リピート',
  ],
  alternates: { canonical: '/guide/apparel' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'アパレル・雑貨店のためのプッシュ通知活用術｜Push-taro',
    description:
      'ビジュアルが命のアパレル・雑貨。Instagramと連携して、新作・セール・限定アイテムを届ける。',
    url: '/guide/apparel',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'アパレル・雑貨店のためのプッシュ通知活用術｜Push-taro',
    description: 'ビジュアルで、来店を促す。',
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
  headline: 'アパレル・雑貨店のためのプッシュ通知活用術',
  description:
    'アパレル・雑貨は、ビジュアルが命。商品画像だけでは伝わらない「着回し」「使用風景」を、Instagramと連携して届ける。新作入荷・SNSバズり再現・季節セール・限定アイテム。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-16',
  dateModified: '2026-11-04',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/apparel` },
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
    { '@type': 'ListItem', position: 3, name: 'アパレル・雑貨', item: `${appUrl}/guide/apparel` },
  ],
};

export default function Page() {
  return (
    <>
      <ApparelClient />

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
