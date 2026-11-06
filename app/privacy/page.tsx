// app/privacy/page.tsx
import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'プライバシーポリシー｜Push-taro',
  description: '「Push-taro（プッシュタロー）」における個人情報の取り扱いについて定めたプライバシーポリシーです。当サービスは電話番号以外の個人情報を取得しない設計を追求し、適切な管理に努めています。',
  alternates: { canonical: '/privacy' },
  robots: {
    index: true,
    follow: true,
  },
};

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'プライバシーポリシー｜Push-taro',
  description: '「Push-taro」における個人情報の取り扱いに関するプライバシーポリシー。',
  url: `${appUrl}/privacy`,
  inLanguage: 'ja-JP',
  publisher: { '@id': `${appUrl}/#organization` },
};

export default function Page() {
  return (
    <>
      <PrivacyClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
    </>
  );
}
