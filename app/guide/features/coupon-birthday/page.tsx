// app/guide/features/coupon-birthday/page.tsx
import type { Metadata } from 'next';
import CouponBirthdayClient from './CouponBirthdayClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '誕生日クーポン・記念日クーポンの設定方法｜お客様の特別な日に自動でお祝い配信｜Push-taro',
  description:
    'お客様の誕生日や記念日当日に、自動でお祝い通知と特別クーポンを配信する機能の解説。結婚記念日やペットの誕生日なども設定可能。お客様の「特別な日」を演出し、強力なファン化を促進します。SMS認証による不正利用防止の仕組みも解説。',
  keywords: [
    '誕生日クーポン 設定',
    '記念日クーポン 配信',
    'バースデー 特典 店舗',
    'LINE 誕生日 お祝い',
    '店舗 ファン化 施策',
    '特別な日 クーポン',
    'Push-taro 機能',
  ],
  alternates: { canonical: '/guide/features/coupon-birthday' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '誕生日クーポン・記念日クーポンの設定方法｜Push-taro',
    description: '誕生日や記念日に自動でお祝い配信。特別な日の演出でファン化を促進します。',
    url: '/guide/features/coupon-birthday',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '誕生日クーポン・記念日クーポンの設定方法｜Push-taro',
    description: '誕生日や記念日に自動でお祝い配信。ファン化を促進します。',
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
  headline: '誕生日クーポン・記念日クーポンの設定方法｜お客様の特別な日に自動でお祝い配信',
  description: 'お客様の誕生日や記念日当日に、自動でお祝い通知と特別クーポンを配信する機能の解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/coupon-birthday` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: '記念日・誕生日クーポン', item: `${appUrl}/guide/features/coupon-birthday` },
  ],
};

export default function Page() {
  return (
    <>
      <CouponBirthdayClient />
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
