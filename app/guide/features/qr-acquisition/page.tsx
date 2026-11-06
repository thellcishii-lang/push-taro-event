// app/guide/features/qr-acquisition/page.tsx
import type { Metadata } from 'next';
import QrAcquisitionClient from './QrAcquisitionClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '店舗のQRコード集客｜アプリ不要で顧客リストを自動構築する方法｜Push-taro',
  description:
    '店頭POPにQRコードを置くだけで、お客様はスマホで読み取るだけ。アプリのインストール不要で通知登録が完了する「QRコード顧客獲得」の機能解説。SMS認証による不正利用防止の仕組みや、QRコード設置のコツも解説します。',
  keywords: [
    '店舗 QRコード 集客',
    'QRコード 顧客獲得',
    'アプリ不要 会員登録',
    'LINE 友だち追加 代わり',
    '店頭 POP QRコード',
    '実店舗 デジタル会員証',
    'Push-taro 機能',
  ],
  alternates: { canonical: '/guide/features/qr-acquisition' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '店舗のQRコード集客｜アプリ不要で顧客リストを自動構築｜Push-taro',
    description: '店頭QRを読み取るだけ。アプリ不要で通知登録が完了します。',
    url: '/guide/features/qr-acquisition',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '店舗のQRコード集客｜アプリ不要で顧客リストを自動構築｜Push-taro',
    description: 'アプリ不要で通知登録が完了。顧客リストを自動構築します。',
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
  headline: '店舗のQRコード集客｜アプリ不要で顧客リストを自動構築する方法',
  description: '店頭POPにQRコードを置くだけで、お客様はスマホで読み取るだけ。アプリのインストール不要で通知登録が完了します。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/qr-acquisition` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: 'QRコード顧客獲得', item: `${appUrl}/guide/features/qr-acquisition` },
  ],
};

export default function Page() {
  return (
    <>
      <QrAcquisitionClient />
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
