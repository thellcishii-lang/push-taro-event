// app/guide/features/referral/page.tsx
import type { Metadata } from 'next';
import ReferralClient from './ReferralClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '紹介報酬の仕組みと確認方法｜他店舗を紹介して毎月報酬を受け取る｜Push-taro',
  description:
    'Push-taroのPROプラン契約者が、他店舗を紹介することで毎月報酬を受け取れる「紹介報酬」制度の解説。Aプラン（無制限10%）とBプラン（PRO2件まで20%）の違いや、報酬の確認方法、振込申請の手順までを図解します。',
  keywords: [
    '紹介報酬 仕組み',
    'アフィリエイト 店舗',
    'SaaS 紹介 報酬',
    'Push-taro 紹介',
    '継続報酬 ストック',
    'PROプラン 特典',
  ],
  alternates: { canonical: '/guide/features/referral' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '紹介報酬の仕組みと確認方法｜Push-taro',
    description: '他店舗を紹介して毎月報酬を受け取る仕組み。AプランとBプランの違いを解説。',
    url: '/guide/features/referral',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '紹介報酬の仕組みと確認方法｜Push-taro',
    description: '他店舗を紹介して毎月報酬を受け取る仕組み。',
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

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '紹介報酬の仕組みと確認方法',
  description: 'Push-taroのPROプラン契約者が、他店舗を紹介することで毎月報酬を受け取れる制度の解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-19',
  dateModified: '2026-10-19',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/referral` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: '紹介報酬', item: `${appUrl}/guide/features/referral` },
  ],
};

export default function Page() {
  return (
    <>
      <ReferralClient />
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
