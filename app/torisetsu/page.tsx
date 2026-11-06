// app/torisetsu/page.tsx
import type { Metadata } from 'next';
import TorisetsuIndexClient from './TorisetsuIndexClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'Push-taro 取扱説明書｜管理画面の使い方・設定マニュアル｜店舗向けプッシュ通知',
  description:
    'Push-taroの管理画面（PROコンソール）の使い方を図解で解説。ログイン方法、プッシュ通知の送信、QRコードの消込、クーポンの設定から、PROプランの配信無制限・連続クーポン・予約配信まで、実際の画面をもとに操作手順をまとめています。',
  keywords: [
    'Push-taro 使い方',
    'Push-taro 設定',
    'Push-taro 取扱説明書',
    'プッシュ通知 設定 方法',
    'プッシュ通知 送り方 店舗',
    '店舗 クーポン 設定',
    'QRコード 消込 方法',
    'PROコンソール',
    '店舗 マニュアル',
  ],
  alternates: { canonical: '/torisetsu' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: 'Push-taro 取扱説明書｜管理画面の使い方・設定マニュアル',
    description: 'ログイン方法から通知送信、クーポン設定まで、実際の画面で図解します。',
    url: '/torisetsu',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Push-taro 取扱説明書｜管理画面の使い方',
    description: 'ログイン方法から通知送信、クーポン設定まで、実際の画面で図解します。',
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
  headline: 'Push-taro 取扱説明書｜プラン別の使い方・設定マニュアル',
  description: 'Push-taroの管理画面の使い方を図解で解説。ログインから通知送信、クーポン設定まで。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/torisetsu` },
  inLanguage: 'ja-JP',
};

/* ============================================================
   JSON-LD: HowTo（操作マニュアル）
   ============================================================ */
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Push-taroの基本的な操作手順',
  description: 'Push-taroの管理画面にログインし、クーポンを設定して通知を送信するまでの基本的な流れです。',
  totalTime: 'PT10M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'ログイン',
      text: 'ブラウザで /pro-shop を開き、登録したメールアドレスとパスワードでログインします。',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'クーポン設定',
      text: '「店舗・基本クーポン」タブから、初回クーポンや通常クーポンのタイトル、有効期限を設定します。',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'QRコード配布',
      text: '店頭POPにQRコードを印刷して設置し、お客様に読み取ってもらいます。',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '通知送信',
      text: '「即時通知」タブからタイトルと本文を入力し、プッシュ通知を送信します。',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: '消込',
      text: 'お客様が提示したクーポンQRコードをスキャンして消し込みます。',
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
    { '@type': 'ListItem', position: 2, name: '取扱説明書', item: `${appUrl}/torisetsu` },
  ],
};

export default function Page() {
  return (
    <>
      <TorisetsuIndexClient />
      
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
