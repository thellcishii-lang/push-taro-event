// app/contact/page.tsx
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'お問い合わせ｜Push-taro',
  description:
    'Push-taroへのお問い合わせはこちらから。導入のご相談、料金プラン、代理店プログラム、技術的なご質問など、お気軽にお問い合わせください。',
  keywords: [
    'Push-taro お問い合わせ',
    'プッシュ通知 クーポンアプリ 相談',
    '実店舗 リピート施策 相談',
    '代理店 問い合わせ',
  ],
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: 'お問い合わせ｜Push-taro',
    description: '導入のご相談、料金プラン、代理店プログラムなど、お気軽にお問い合わせください。',
    url: '/contact',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'お問い合わせ｜Push-taro',
    description: '導入のご相談、料金プラン、代理店プログラムなど、お気軽に。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: 'お問い合わせ', item: `${appUrl}/contact` },
  ],
};

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'お問い合わせ｜Push-taro',
  url: `${appUrl}/contact`,
  inLanguage: 'ja-JP',
  publisher: { '@id': `${appUrl}/#organization` },
};

export default function Page() {
  return (
    <>
      <ContactClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }} />
    </>
  );
}
