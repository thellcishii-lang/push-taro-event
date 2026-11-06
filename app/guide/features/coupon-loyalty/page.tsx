// app/guide/features/coupon-loyalty/page.tsx
import type { Metadata } from 'next';
import CouponLoyaltyClient from './CouponLoyaltyClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '特別達成クーポンの使い方｜累計来店N回で自動解放される特別報酬｜Push-taro',
  description:
    'Push-taroの「特別達成クーポン」機能の解説。累計N回来店したお客様に自動で解放される特別報酬で、ポイントカードのデジタル版として常連客のファン化を促進。達成回数・特典・有効期限を自由に設定でき、繰り返し達成にも対応します。',
  keywords: [
    '特別達成クーポン',
    'ポイントカード デジタル化',
    '常連客 ファン化',
    '来店回数 特典',
    'ロイヤルティ プログラム 店舗',
    'Push-taro クーポン',
  ],
  alternates: { canonical: '/guide/features/coupon-loyalty' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '特別達成クーポンの使い方｜Push-taro',
    description:
      '累計N回来店で自動解放される特別報酬。ポイントカードのデジタル版として常連客のファン化を促進します。',
    url: '/guide/features/coupon-loyalty',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '特別達成クーポンの使い方｜Push-taro',
    description: '累計N回来店で自動解放される特別報酬。',
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
  headline: '特別達成クーポンの使い方',
  description:
    '累計N回来店したお客様に自動で解放される特別報酬。ポイントカードのデジタル版として常連客のファン化を促進します。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/coupon-loyalty` },
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
    { '@type': 'ListItem', position: 3, name: '機能一覧', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: '特別達成クーポン', item: `${appUrl}/guide/features/coupon-loyalty` },
  ],
};

export default function Page() {
  return (
    <>
      <CouponLoyaltyClient />

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
