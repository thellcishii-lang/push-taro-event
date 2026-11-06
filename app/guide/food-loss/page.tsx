// app/guide/food-loss/page.tsx
import type { Metadata } from 'next';
import FoodLossClient from './FoodLossClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'コンビニ・スーパーのフードロス削減｜プッシュ通知とmottECOパッケージで「廃棄」を「売上」に変える',
  description:
    '賞味期限間近の商品を廃棄していませんか？Push-taroのプッシュ通知でタイムセールを即時配信し、売れ残りを利益に変える仕組みを解説。さらに、環境省推奨のmottECOロゴ入り持ち帰り用パッケージの活用で、食べ残しゼロの店舗づくりを。',
  keywords: [
    'フードロス 対策 スーパー',
    'コンビニ 食品ロス 削減',
    '食品ロス プッシュ通知',
    'タイムセール 通知 アプリ',
    'mottECO モッテコ',
    '環境省 推奨 パッケージ',
    '食品ロス削減 取り組み',
    'Push-taro',
  ],
  alternates: { canonical: '/guide/food-loss' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'コンビニ・スーパーのフードロス削減｜Push-taro',
    description: 'プッシュ通知でのタイムセール配信と、mottECOパッケージの活用で「廃棄」を「売上」に変える。',
    url: '/guide/food-loss',
    siteName: 'Push-taro',
  },
  robots: { index: true, follow: true },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'コンビニ・スーパーのフードロス削減｜プッシュ通知とmottECOパッケージで「廃棄」を「売上」に変える',
  description: 'Push-taroのプッシュ通知と、環境省推奨のmottECOパッケージで、店舗のフードロス問題を解決する方法を解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-22',
  dateModified: '2026-10-22',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/food-loss` },
};

export default function Page() {
  return (
    <>
      <FoodLossClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </>
  );
}
