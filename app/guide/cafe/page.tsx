// app/guide/cafe/page.tsx
import type { Metadata } from 'next';
import CafeClient from './CafeClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '飲食店・カフェのためのプッシュ通知活用術｜ランチ型とカフェ型、それぞれの集客｜Push-taro',
  description:
    '飲食店・カフェは「ランチで呼ぶ店」と「ランチ以外で呼ぶ店」に分かれます。ランチ型は毎朝10時に日替わりランチを配信。カフェは週の前半後半で特別スイーツを。さらに「バズりもの作ってみたシリーズ」で、来店の習慣を作る。実践ノウハウを解説。',
  keywords: [
    '飲食店 集客',
    'カフェ 集客',
    '定食屋 集客',
    '飲食店 プッシュ通知',
    'カフェ プッシュ通知',
    'ランチ 集客',
    '日替わりランチ',
    'バズりもの 再現',
    '飲食店 マーケティング',
  ],
  alternates: { canonical: '/guide/cafe' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '飲食店・カフェのためのプッシュ通知活用術｜Push-taro',
    description:
      'ランチ型は毎朝10時の日替わり配信。カフェ型は週の前半後半で特別スイーツ。「バズりもの作ってみたシリーズ」で、来店の習慣を作る。',
    url: '/guide/cafe',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '飲食店・カフェのためのプッシュ通知活用術｜Push-taro',
    description: 'ランチ型とカフェ型、それぞれの集客。',
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
  headline: '飲食店・カフェのためのプッシュ通知活用術',
  description:
    '飲食店・カフェは「ランチで呼ぶ店」と「ランチ以外で呼ぶ店」に分かれます。ランチ型は毎朝10時に日替わりランチを配信。カフェは週の前半後半で特別スイーツを。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-16',
  dateModified: '2026-10-16',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/cafe` },
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
    { '@type': 'ListItem', position: 3, name: '飲食店・カフェ', item: `${appUrl}/guide/cafe` },
  ],
};

export default function Page() {
  return (
    <>
      <CafeClient />

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
