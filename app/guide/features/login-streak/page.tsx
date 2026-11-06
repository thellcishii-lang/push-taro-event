// app/guide/features/login-streak/page.tsx
import type { Metadata } from 'next';
import LoginStreakClient from './LoginStreakClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '連続ログイン特典の使い方｜アプリを開く習慣をつけてクーポンをプレゼント｜Push-taro',
  description:
    'Push-taroのPROプランで使える「連続ログイン特典」の解説。アプリを開くたびにスタンプが貯まり、目標日数の達成でクーポンを獲得できます。毎日夕方18時のリマインド通知で、お客様の継続を後押しします。',
  keywords: [
    '連続ログイン 特典',
    'ログインボーナス 仕組み',
    'スタンプカード デジタル',
    'アプリ 習慣化',
    'Push-taro 連続ログイン',
  ],
  alternates: { canonical: '/guide/features/login-streak' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: '連続ログイン特典の使い方｜Push-taro',
    description: 'アプリを開くたびにスタンプが貯まり、目標日数の達成でクーポンを獲得。',
    url: '/guide/features/login-streak',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '連続ログイン特典の使い方｜Push-taro',
    description: 'アプリを開く習慣をつけて、クーポンをプレゼント。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '連続ログイン特典の使い方｜アプリを開く習慣をつけてクーポンをプレゼント',
  description: 'Push-taroのPROプランで使える「連続ログイン特典」の解説。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-28',
  dateModified: '2026-10-28',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/features/login-streak` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: '機能別ガイド', item: `${appUrl}/guide/features` },
    { '@type': 'ListItem', position: 4, name: '連続ログイン特典', item: `${appUrl}/guide/features/login-streak` },
  ],
};

export default function Page() {
  return (
    <>
      <LoginStreakClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
