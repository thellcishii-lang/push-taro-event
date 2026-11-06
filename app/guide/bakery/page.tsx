// app/guide/bakery/page.tsx
import type { Metadata } from 'next';
import BakeryClient from './BakeryClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'パン屋のためのプッシュ通知活用術｜25年の現場経験から導いた実践マニュアル｜Push-taro',
  description:
    'パン屋・ベーカリーのリピート率を劇的に上げるプッシュ通知活用術。毎日10時の焼き上がり告知、本日30個限定の数量限定販売、季節メニュー、テスト販売まで。25年の現場経験から導き出した実践ノウハウを公開。',
  keywords: [
    'パン屋 集客',
    'ベーカリー 集客',
    'パン屋 リピート',
    'パン屋 プッシュ通知',
    'パン屋 クーポンアプリ',
    '焼き立てパン 告知',
    'ベーカリー マーケティング',
    'パン屋 売上',
  ],
  alternates: { canonical: '/guide/bakery' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'パン屋のためのプッシュ通知活用術｜実践マニュアル',
    description:
      '毎日10時の焼き上がり告知、数量限定販売、季節メニュー。25年の現場経験から導いた実践ノウハウ。',
    url: '/guide/bakery',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'パン屋のためのプッシュ通知活用術｜Push-taro',
    description: '25年の現場経験から導いた、ベーカリーの実践マニュアル。',
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
  headline: 'パン屋のためのプッシュ通知活用術｜25年の現場経験から導いた実践マニュアル',
  description:
    'パン屋・ベーカリーのリピート率を上げるプッシュ通知活用術。毎日10時の焼き上がり告知、本日30個限定の数量限定販売、季節メニュー、テスト販売まで。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-09-27',
  dateModified: '2026-09-27',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/bakery` },
  inLanguage: 'ja-JP',
};

/* ============================================================
   JSON-LD: FAQPage
   ============================================================ */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'パン屋のプッシュ通知は毎日送ってもいいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '焼き上がり時間や本日のパンの告知であれば毎日配信しても効果があります。ただしクーポン配信は週2回までが適正です。',
      },
    },
    {
      '@type': 'Question',
      name: 'パン屋でプッシュ通知は何を送ればいいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '「本日30個限定 生チョコ食パン15時から」のような数量限定告知、焼き上がり時間、季節メニューが効果的です。',
      },
    },
    {
      '@type': 'Question',
      name: 'テスト販売にプッシュ通知は使えますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい。新商品を数量限定で告知し、反応を見てから本メニュー化する判断材料として活用できます。',
      },
    },
    {
      '@type': 'Question',
      name: 'LIGHT プランでも十分ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい。焼き上がり告知や本日のパン配信は、LIGHT / STANDARD プランで十分効果が出ます。',
      },
    },
    {
      '@type': 'Question',
      name: 'お客様はアプリをインストール必要ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '不要です。QRコードを読み取って通知を許可するだけ。名前や住所の登録もありません。',
      },
    },
  ],
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
    { '@type': 'ListItem', position: 3, name: 'パン屋・ベーカリー', item: `${appUrl}/guide/bakery` },
  ],
};

/* ============================================================
   Page
   ============================================================ */
export default function Page() {
  return (
    <>
      <BakeryClient />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
