// app/torisetsu/dashboard/page.tsx
import type { Metadata } from 'next';
import TorisetsuDashboardClient from './TorisetsuDashboardClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'Push-taro 紹介・報酬ダッシュボード 取扱説明書｜紹介コード・振込先・POS APIキー',
  description:
    'Push-taroの紹介・報酬ダッシュボードの使い方。ログイン方法から、紹介プランの選択、紹介コード・専用URLの発行、振込先口座の登録、紹介店舗一覧・報酬明細の確認、CSVダウンロード、POS連携APIキーの発行までを図解で解説します。',
  keywords: [
    'Push-taro 紹介報酬',
    'Push-taro ダッシュボード',
    '紹介コード 発行',
    '紹介報酬 振込先',
    '報酬明細 CSV',
    'POS APIキー 発行',
    'PRO 紹介制度',
  ],
  alternates: { canonical: '/torisetsu/dashboard' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'Push-taro 紹介・報酬ダッシュボード 取扱説明書',
    description: '紹介コード発行、振込先登録、報酬明細確認、POS APIキー発行までを図解。',
    url: '/torisetsu/dashboard',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Push-taro 紹介・報酬ダッシュボード 取扱説明書',
    description: '紹介コード発行、振込先登録、報酬明細確認、POS APIキー発行までを図解。',
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
  headline: '紹介・報酬ダッシュボード 取扱説明書',
  description: 'Push-taroの紹介・報酬ダッシュボードの操作マニュアル。紹介コード発行、振込先登録、報酬明細確認、POS APIキー発行の手順。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-27',
  dateModified: '2026-10-27',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/torisetsu/dashboard` },
};

/* ============================================================
   JSON-LD: HowTo（操作手順）
   ============================================================ */
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Push-taro 紹介・報酬ダッシュボードの使い方',
  description: '紹介コード発行、振込先登録、報酬明細確認、POS APIキー発行の手順。',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'ログイン', text: 'ダッシュボード専用ログイン画面でメールアドレスとパスワードを入力します。' },
    { '@type': 'HowToStep', position: 2, name: '紹介プラン選択', text: '初回ログイン時のみ、AプランまたはBプランを選択します。確定後の変更はできません。' },
    { '@type': 'HowToStep', position: 3, name: '紹介コード発行', text: '紹介コードと専用URLが自動発行されます。コピーして紹介先に共有します。' },
    { '@type': 'HowToStep', position: 4, name: '振込先口座登録', text: '報酬受取用の口座情報を登録します。' },
    { '@type': 'HowToStep', position: 5, name: 'POS APIキー発行', text: 'POS連携用のAPIキーを発行し、POSベンダーに渡します。' },
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
    { '@type': 'ListItem', position: 3, name: '紹介・報酬ダッシュボード', item: `${appUrl}/torisetsu/dashboard` },
  ],
};

export default function Page() {
  return (
    <>
      <TorisetsuDashboardClient />
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
