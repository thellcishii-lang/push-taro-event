// app/guide/ng-actions/page.tsx
import type { Metadata } from 'next';
import NgActionsClient from './NgActionsClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'プッシュ通知がブロックされる理由と対策｜店舗がやってはいけないNG行為集｜Push-taro',
  description:
    '「プッシュ通知がうざい」「LINEのブロックが解除されない」と悩む前に。配信頻度、深夜の通知、過剰な割引など、顧客の通知OFF（ブロック）を招くNG行為とその解決策を解説。実店舗のリピート施策を失敗させないための運用ルールをまとめました。',
  keywords: [
    'プッシュ通知 ブロック 理由',
    'プッシュ通知 うざい',
    'LINE ブロック されない 方法',
    '店舗 メルマガ うざい',
    'プッシュ通知 配信 頻度',
    'クーポン 配信 スパム',
    '店舗 クーポンアプリ 運用',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/ng-actions' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'プッシュ通知がブロックされる理由と対策｜NG行為集｜Push-taro',
    description:
      '配信頻度、深夜の通知、過剰な割引など、顧客の通知OFF（ブロック）を招くNG行為とその解決策を解説。',
    url: '/guide/ng-actions',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プッシュ通知がブロックされる理由と対策｜Push-taro',
    description: '顧客の通知OFFを招くNG行為とその解決策。',
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
  headline: 'プッシュ通知がブロックされる理由と対策｜店舗がやってはいけないNG行為集',
  description:
    '配信頻度、深夜の通知、過剰な割引など、顧客の通知OFF（ブロック）を招くNG行為とその解決策を解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-18',
  dateModified: '2026-10-18',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/ng-actions` },
  inLanguage: 'ja-JP',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'プッシュ通知がブロックされる一番の理由は何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '一番の理由は「配信頻度が多すぎる」ことです。1日に何通も送ったり、深夜に送ったりすると、顧客は不快に感じて通知をOFFにしてしまいます。',
      },
    },
    {
      '@type': 'Question',
      name: 'ブロックされた顧客を解除する方法はありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '一度ブロック（通知OFF）された顧客を、店舗側から強制的に解除することはできません。再度登録してもらう必要があるため、ブロックされない運用を徹底することが最も重要です。',
      },
    },
    {
      '@type': 'Question',
      name: '適切なプッシュ通知の配信頻度はどのくらいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '週2〜3回が目安です。ただし、「今日の日替わり」など毎日配信が期待される情報は毎日でも問題ありません。クーポン配信は週2回までに抑えましょう。',
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
    { '@type': 'ListItem', position: 3, name: 'NG行為集', item: `${appUrl}/guide/ng-actions` },
  ],
};

export default function Page() {
  return (
    <>
      <NgActionsClient />
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
