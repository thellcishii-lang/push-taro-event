// app/guide/line-comparison/page.tsx
import type { Metadata } from 'next';
import LineComparisonClient from './LineComparisonClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'LINE公式の配信上限に限界を感じたら｜無制限で使える代替ツール比較｜Push-taro',
  description:
    'LINE公式アカウントの無料・ライト・スタンダードプランの配信上限と料金を徹底比較。セグメント配信の限界を超え、月1万円で配信無制限になるPush-taroの違いを解説します。クーポン配信が通数にカウントされない仕組みも必見です。',
  keywords: [
    'LINE 配信上限',
    'LINE 配信制限 対策',
    'LINE公式 料金プラン',
    'LINE 配信数 上限',
    'LINE セグメント配信 限界',
    'LINE クーポン 配信 制限',
    'プッシュ通知 無制限',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/line-comparison' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'LINE公式の配信上限に限界を感じたら｜代替ツール比較｜Push-taro',
    description: 'LINEのプラン別配信上限と料金を比較。セグメント配信より簡単で、月1万円で配信無制限になるPush-taroの強みを解説。',
    url: '/guide/line-comparison',
    siteName: 'Push-taro',
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
  headline: 'LINE公式の配信上限に限界を感じたら｜無制限で使える代替ツール比較',
  description: 'LINE公式アカウントの配信上限と料金を徹底比較。セグメント配信の限界を超え、月1万円で配信無制限になるPush-taroの違いを解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-16',
  dateModified: '2026-10-22',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/line-comparison` },
  inLanguage: 'ja-JP',
};

/* ============================================================
   JSON-LD: FAQPage（AI検索・強調スニペット対策）
   ============================================================ */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'LINE公式アカウントの無料プランの配信上限は？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LINE公式アカウントのコミュニケーション（無料）プランの配信上限は、月200通です。友だちが200人いれば、全員に1回メッセージを送るだけで上限に達してしまいます。',
      },
    },
    {
      '@type': 'Question',
      name: 'LINE公式で配信上限を超えるとどうなりますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '月の配信上限を超えると、追加でメッセージを配信することができなくなります。翌月まで配信できないか、上位プランへアップグレードする必要があります。',
      },
    },
    {
      '@type': 'Question',
      name: 'LINE公式の配信上限を回避する方法はありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'セグメント配信を活用して配信対象を絞ることで、通数の消費を抑えられます。ただし、セグメントを分ける手間がかかり、実店舗では費用対効果が合いにくいという課題があります。根本的に解決するには、配信上限のないPush-taroなどのツールへの乗り換えが有効です。',
      },
    },
    {
      '@type': 'Question',
      name: 'Push-taroはLINEの代わりになりますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい。Push-taroはLINE公式アカウントと同様にプッシュ通知とクーポンを配信できるサービスです。PROプランなら月額1万円で配信無制限。さらにクーポンの配信は通数にカウントされないため、LINEの配信制限に悩む店舗様に選ばれています。',
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
    { '@type': 'ListItem', position: 3, name: 'LINE公式アカウントとの比較', item: `${appUrl}/guide/line-comparison` },
  ],
};

export default function Page() {
  return (
    <>
      <LineComparisonClient />
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
