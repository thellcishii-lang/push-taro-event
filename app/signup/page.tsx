// app/signup/page.tsx
import type { Metadata } from 'next';
import SignupClient from './SignupClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '新規アカウント登録｜Push-taro',
  description: '実店舗向けプッシュ通知＆クーポン配信SaaS「Push-taro」の新規アカウント登録ページ。月額1,980円から始められるLIGHTプラン、全機能が使えるPROプランなど、店舗の規模に合わせてお選びいただけます。',
  alternates: { canonical: '/signup' },
  robots: {
    index: false, // ★ 申し込みページは検索結果に出さない（重複コンテンツ・低品質判定の回避）
    follow: true,
  },
};

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '新規アカウント登録｜Push-taro',
  description: '実店舗向けプッシュ通知＆クーポン配信SaaS「Push-taro」の新規アカウント登録ページ。',
  url: `${appUrl}/signup`,
  inLanguage: 'ja-JP',
  publisher: { '@id': `${appUrl}/#organization` },
};

export default function Page() {
  return (
    <>
      <SignupClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
    </>
  );
}
