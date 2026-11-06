// app/guide/segmentation/page.tsx
import type { Metadata } from 'next';
import SegmentationClient from './SegmentationClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'セグメント配信とは？実店舗では「使えない」理由を数字で解説｜Push-taro',
  description:
    'セグメント配信を実店舗で使いこなすには、最低1,000人、理想は1万人の通知登録者が必要です。数百人規模の実店舗では、維持の手間に対してリターンが見合いません。ECサイトで成立する理由と、実店舗に合わない理由を数字で解説します。',
  keywords: [
    'セグメント配信 とは',
    'セグメント配信 実店舗',
    'セグメント配信 必要',
    'A/Bテスト 小規模',
    'プッシュ通知 セグメント',
    'プッシュ通知 クーポン 配信',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/segmentation' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'セグメント配信とは？実店舗では「使えない」理由を数字で解説｜Push-taro',
    description:
      'セグメント配信が機能する条件と、実店舗に合わない理由を数字で解説。',
    url: '/guide/segmentation',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'セグメント配信とは？実店舗では「使えない」理由｜Push-taro',
    description: 'セグメント配信が機能する条件と、実店舗に合わない理由。',
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
  headline: 'セグメント配信とは？実店舗では「使えない」理由を数字で解説',
  description:
    'セグメント配信を実店舗で使いこなすには、最低1,000人、理想は1万人の通知登録者が必要です。数百人規模の実店舗では、維持の手間に対してリターンが見合いません。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-09-30',
  dateModified: '2026-09-30',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/segmentation` },
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
      name: 'セグメント配信は無料で使えるのですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LINE公式アカウントの場合、セグメント配信の機能自体は追加費用なしで使えます。ただし、配信通数は「人数×回数」でカウントされるため、セグメントを分けても通数は消費されます。',
      },
    },
    {
      '@type': 'Question',
      name: '通知登録者100人でもセグメント配信は意味がありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '属性での絞り込みは100人以上が目安です。ただし、セグメントを分けると1グループあたりの人数が減り、反応が数件しか出ない規模では「分けすぎ」です。実店舗では、まず「全員に同じ」から始めるのが現実的です。',
      },
    },
    {
      '@type': 'Question',
      name: 'セグメント配信を維持するのはどれくらい大変ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'セグメント定義は3〜6ヶ月で腐敗します。自動更新を仕組まないと、定義と実態がズレていきます。これに気づかず放置すると、「セグメントを分けたが反応率は変わらない」状態に陥ります。',
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
    { '@type': 'ListItem', position: 3, name: 'セグメント配信とは', item: `${appUrl}/guide/segmentation` },
  ],
};

export default function Page() {
  return (
    <>
      <SegmentationClient />

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
