// app/torisetsu/light-standard/page.tsx
import type { Metadata } from 'next';
import TorisetsuBasicClient from './TorisetsuBasicClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'Push-taro 初期設定・使い方マニュアル｜通知送信とクーポン設定（LIGHT/STANDARD）',
  description:
    'Push-taroを初めてお使いの店舗オーナー様へ。管理画面へのログイン方法から、プッシュ通知の送信手順、お客様のQRコード消込、初回・通常・特別達成クーポンの設定までを画面付きで徹底解説。LIGHT/STANDARDプランの基本操作がこれ1つでわかります。',
  keywords: [
    'Push-taro 初期設定',
    'Push-taro 使い方 店舗',
    'プッシュ通知 送信 方法',
    'QRコード 読み取り 消込',
    '初回クーポン 設定 方法',
    '通常クーポン 設定',
    '特別達成クーポン 使い方',
    'Push-taro ログイン',
    '店舗 クーポン アプリ マニュアル',
  ],
  alternates: { canonical: '/torisetsu/light-standard' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'Push-taro 初期設定・使い方マニュアル（LIGHT/STANDARD）',
    description: 'ログインから通知送信、QR消込、クーポン設定まで。基本操作を画面付きで図解します。',
    url: '/torisetsu/light-standard',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Push-taro 初期設定・使い方マニュアル（LIGHT/STANDARD）',
    description: 'ログインから通知送信、QR消込、クーポン設定までを図解。',
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
  headline: 'LIGHT / STANDARDプラン 取扱説明書｜Push-taroの基本的な使い方',
  description: 'Push-taroのLIGHT・STANDARDプランの管理画面操作マニュアル。ログイン方法、プッシュ通知の送信、QRコード消込、クーポンの設定手順。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/torisetsu/light-standard` },
};

/* ============================================================
   JSON-LD: HowTo（操作手順）
   ============================================================ */
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Push-taroの基本操作（LIGHT/STANDARD）',
  description: 'ログインからクーポン設定、通知送信、消込までの基本フロー。',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'ログイン',
      text: 'ブラウザで管理画面を開き、メールアドレスとパスワードでログインします。',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '初回クーポン設定',
      text: '「店舗・基本クーポン」タブから、初回クーポンのタイトルと有効期限を設定します。',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '通知送信',
      text: '「即時通知」タブからタイトル・本文を入力し、プッシュ通知を送信します。',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'QR消込',
      text: 'お客様が提示したQRコードを読み取り、クーポンを消し込みます。',
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
    { '@type': 'ListItem', position: 3, name: 'LIGHT / STANDARD版', item: `${appUrl}/torisetsu/light-standard` },
  ],
};

export default function Page() {
  return (
    <>
      <TorisetsuBasicClient />
      
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
