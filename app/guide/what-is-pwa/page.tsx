// app/guide/what-is-pwa/page.tsx
import type { Metadata } from 'next';
import PwaClient from './PwaClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '実店舗のためのPWA入門｜なぜiPhoneで「ホーム画面に追加」が必要なのか？｜Push-taro',
  description:
    '2023年のiOSアップデートで、iPhoneでもWebアプリのプッシュ通知が可能になりました。しかし、Safariの通常タブからは通知を受け取れず、「ホーム画面に追加」が必須です。PWAの仕組み、AndroidとiPhoneの違い、顧客の登録ハードルを下げる方法を解説します。',
  keywords: [
    'PWA とは',
    'PWA プッシュ通知',
    'iPhone ホーム画面に追加 プッシュ通知',
    'iOS 16.4 プッシュ通知',
    'Webアプリ プッシュ通知',
    'PWA 導入 実店舗',
    'Android プッシュ通知',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/what-is-pwa' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '実店舗のためのPWA入門｜なぜiPhoneで「ホーム画面に追加」が必要なのか？｜Push-taro',
    description:
      '2023年のiOSアップデートで変わったWebプッシュ通知の常識。PWAの仕組みと実店舗での活用方法を解説。',
    url: '/guide/what-is-pwa',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '実店舗のためのPWA入門｜Push-taro',
    description: 'なぜiPhoneで「ホーム画面に追加」が必要なのか？',
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
   JSON-LD: Article & FAQPage
   ============================================================ */
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '実店舗のためのPWA入門｜なぜiPhoneで「ホーム画面に追加」が必要なのか？',
  description:
    '2023年のiOSアップデートで、iPhoneでもWebアプリのプッシュ通知が可能になりました。しかし、Safariの通常タブからは通知を受け取れず、「ホーム画面に追加」が必須です。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-18',
  dateModified: '2026-10-18',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/what-is-pwa` },
  inLanguage: 'ja-JP',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'PWAとは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PWA（Progressive Web Apps）とは、Webサイトをスマホのアプリのように動作させる技術です。アプリストアからダウンロードする必要がなく、ホーム画面にアイコンを追加するだけで、プッシュ通知の受信やオフラインでの閲覧が可能になります。',
      },
    },
    {
      '@type': 'Question',
      name: 'iPhoneでプッシュ通知を受け取るにはどうすればいいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'iOS 16.4以降の場合、Safariでサイトを開き、共有ボタンから「ホーム画面に追加」を選択してください。ホーム画面のアイコンから開いた状態でのみ、プッシュ通知を許可することができます。',
      },
    },
    {
      '@type': 'Question',
      name: 'Androidでもホーム画面に追加は必要ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AndroidのChromeブラウザの場合、ホーム画面に追加しなくても、ブラウザ上で直接プッシュ通知を許可することが可能です。ただし、アプリのようにアイコンを置くことで、よりスムーズに開けるようになります。',
      },
    },
    {
      '@type': 'Question',
      name: 'アプリストアからダウンロードする必要はありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'いいえ、必要ありません。App StoreやGoogle Playを経由せず、ブラウザから直接ホーム画面に追加するだけです。顧客にとって、ダウンロードの手間がないことが最大のメリットです。',
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: 'PWA入門', item: `${appUrl}/guide/what-is-pwa` },
  ],
};

export default function Page() {
  return (
    <>
      <PwaClient />
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
