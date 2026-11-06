// app/terms/page.tsx
import type { Metadata } from 'next';
import TermsClient from './TermsClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '利用規約｜Push-taro',
  description: '実店舗向けプッシュ通知＆クーポン配信SaaS「Push-taro（プッシュタロー）」の利用規約です。本サービスの利用条件、アカウント登録、禁止事項、免責事項について定めています。',
  alternates: { canonical: '/terms' },
  robots: {
    index: true,
    follow: true,
  },
};

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '利用規約｜Push-taro',
  description: '実店舗向けプッシュ通知＆クーポン配信SaaS「Push-taro」の利用規約。',
  url: `${appUrl}/terms`,
  inLanguage: 'ja-JP',
  publisher: { '@id': `${appUrl}/#organization` },
};

export default function Page() {
  return (
    <>
      <TermsClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
    </>
  );
}
