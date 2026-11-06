// app/guide/super/page.tsx
import type { Metadata } from 'next';
import SuperClient from './SuperClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'スーパー・小売店のためのプッシュ通知活用術｜チラシを、プッシュ通知に置き換える｜Push-taro',
  description:
    'スーパーの最大コストは、チラシ。印刷費・折込費で月100〜500万円かかっています。特設ページ + プッシュ通知 + クーポンで、チラシを置き換える。ポイントカードも不要に。新聞購読者が減り、スマホが普及した今、地域密着型スーパーの新しい集客を解説します。',
  keywords: [
    'スーパー 集客',
    'スーパー チラシ 廃止',
    'スーパー プッシュ通知',
    'スーパー クーポン',
    'スーパー ポイントカード 廃止',
    '小売店 集客',
    '地域密着 スーパー',
    'チラシ デジタル化',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/super' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'スーパー・小売店のためのプッシュ通知活用術｜Push-taro',
    description:
      'チラシを、プッシュ通知に置き換える。特設ページ + クーポン + ポイントカード廃止。地域密着型スーパーの新しい集客。',
    url: '/guide/super',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スーパー・小売店のためのプッシュ通知活用術｜Push-taro',
    description: 'チラシを、プッシュ通知に置き換える。',
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
  headline: 'スーパー・小売店のためのプッシュ通知活用術',
  description:
    'スーパーの最大コストは、チラシ。特設ページ + プッシュ通知 + クーポンで、チラシを置き換える。ポイントカードも不要に。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-16',
  dateModified: '2026-10-16',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/super` },
  inLanguage: 'ja-JP',
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
    { '@type': 'ListItem', position: 3, name: 'スーパー・小売店', item: `${appUrl}/guide/super` },
  ],
};

export default function Page() {
  return (
    <>
      <SuperClient />

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
