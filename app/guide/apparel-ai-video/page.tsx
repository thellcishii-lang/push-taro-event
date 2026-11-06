// app/guide/apparel-ai-video/page.tsx
import type { Metadata } from 'next';
import ApparelAiVideoClient from './ApparelAiVideoClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'マネキンの写真1枚で着用動画の作り方｜アパレル向けAI活用ガイド｜Push-taro',
  description:
    'モデル撮影は不要。マネキンに着せた写真1枚を、AIアシスタント「Muse」に渡して一言頼むだけで、歩く・回る着用イメージ動画（Instagramリール）が作れます。実際の作例とプロンプト全文、仕上げのプッシュ通知活用まで解説。',
  keywords: [
    'アパレル 集客',
    '着用動画 作り方',
    'AI動画 生成',
    'マネキン 写真',
    'Instagram リール',
    'アパレル SNS',
    'プッシュ通知',
    'セレクトショップ 集客',
  ],
  alternates: { canonical: '/guide/apparel-ai-video' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'マネキンの写真1枚で着用動画の作り方｜Push-taro',
    description:
      'マネキンの写真1枚＋AIへの一言で、着用イメージ動画が作れる。作例とプロンプトを公開。',
    url: '/guide/apparel-ai-video',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'マネキンの写真1枚で着用動画の作り方｜Push-taro',
    description: 'モデル撮影なし。写真1枚と、AIへの一言だけ。',
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
  headline: 'マネキンの写真1枚で着用動画の作り方',
  description:
    'マネキンに着せた写真1枚をAIアシスタント「Muse」に渡すだけで、着用イメージ動画（リール）が作れます。作例・プロンプト・プッシュ通知での届け方まで。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-11-04',
  dateModified: '2026-11-04',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/apparel-ai-video` },
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
    { '@type': 'ListItem', position: 3, name: 'AI着用動画の作り方', item: `${appUrl}/guide/apparel-ai-video` },
  ],
};

export default function Page() {
  return (
    <>
      <ApparelAiVideoClient />

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
