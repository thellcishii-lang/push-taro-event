// app/tokusho/page.tsx
import type { Metadata } from 'next';
import TokushoClient from './TokushoClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記｜Push-taro',
  description: '実店舗向けリピート自動化ツール「Push-taro（プッシュタロー）」の特定商取引法（特商法）に基づく表記です。運営者情報、販売価格、お支払い方法、キャンセル・解約に関する規定を掲載しています。',
  alternates: { canonical: '/tokusho' },
  robots: {
    index: true,
    follow: true,
  },
};

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '特定商取引法に基づく表記｜Push-taro',
  description: '実店舗向けリピート自動化ツール「Push-taro」の特定商取引法に基づく表記。',
  url: `${appUrl}/tokusho`,
  inLanguage: 'ja-JP',
  publisher: { '@id': `${appUrl}/#organization` },
};

export default function Page() {
  return (
    <>
      <TokushoClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
    </>
  );
}
