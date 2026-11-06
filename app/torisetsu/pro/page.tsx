// app/torisetsu/pro/page.tsx
import type { Metadata } from 'next';
import TorisetsuProClient from './TorisetsuProClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'Push-taro PRO機能 設定マニュアル｜連続クーポン・予約配信の使い方',
  description:
    'Push-taro PROプランの全機能設定マニュアル。配信無制限の活用法から、ステップアップ・連続・記念日誕生日・休眠復活クーポンの詳細な設定手順、予約配信のスケジュール方法、紹介報酬の確認までを図解で解説。PRO機能を使いこなしてリピート率を最大化します。',
  keywords: [
    'Push-taro PRO 使い方',
    '配信無制限 設定',
    '連続クーポン 設定 方法',
    'ステップアップクーポン 使い方',
    '休眠復活クーポン 設定',
    '誕生日クーポン 配信 方法',
    '予約配信 やり方',
    '定期配信 設定',
    'Push-taro 紹介報酬 確認',
  ],
  alternates: { canonical: '/torisetsu/pro' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'Push-taro PRO機能 設定マニュアル｜全クーポン・予約配信の使い方',
    description: '配信無制限、連続クーポン、予約配信など、PRO限定機能の設定手順を図解します。',
    url: '/torisetsu/pro',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Push-taro PRO機能 設定マニュアル',
    description: '配信無制限、連続クーポン、予約配信など、PRO限定機能の設定手順を図解。',
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
  headline: 'PROプラン 取扱説明書｜配信無制限・全クーポン機能の使い方',
  description: 'Push-taroのPROプラン管理画面操作マニュアル。配信無制限の設定、全クーポン機能、予約配信、紹介報酬の確認方法。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/torisetsu/pro` },
};

/* ============================================================
   JSON-LD: HowTo（操作手順）
   ============================================================ */
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Push-taro PRO機能の設定方法',
  description: '連続クーポンや予約配信など、PRO限定機能の設定手順。',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'PRO機能タブを開く',
      text: '管理画面の「PRO機能」タブを開きます。',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '連続クーポン設定',
      text: '連続クーポンを有効にし、次回特典のタイトルと有効日数を設定します。',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '予約配信設定',
      text: '「予約」タブから配信日時と内容を指定し、予約をセットします。',
    }
  ]
};

/* ============================================================
   JSON-LD: BreadcrumbList
   ============================================================ */
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '取扱説明書', item: `${appUrl}/torisetsu` },
    { '@type': 'ListItem', position: 3, name: 'PRO版', item: `${appUrl}/torisetsu/pro` },
  ],
};

export default function Page() {
  return (
    <>
      <TorisetsuProClient />
      
      {/* 構造化データの出力 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
