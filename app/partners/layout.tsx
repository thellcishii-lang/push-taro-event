// app/partners/layout.tsx
import type { Metadata } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '【公式】販売代理店パートナー募集｜在庫ゼロで始めるストックビジネス｜Push-taro',
  description:
    '実店舗のリピート施策を「プッシュ通知×クーポンアプリ」で自動化するPush-taroの販売パートナー募集。紹介店舗の月額から最大45%の継続報酬。在庫・店舗・スタッフ不要、初期費用30万円（キャンペーン）で始められるストックビジネスです。',
  keywords: [
    'ストックビジネス',
    '代理店募集',
    '副業',
    '在宅ビジネス',
    'SaaS代理店',
    'プッシュ通知 代理店',
    'Push-taro パートナー',
    '紹介報酬',
    '継続報酬',
    'ストック収入',
    '店舗DX',
    '実店舗 クーポンアプリ',
  ],
  alternates: { canonical: '/partners' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: '【公式】販売代理店パートナー募集｜Push-taro',
    description:
      '在庫ゼロ・店舗ゼロ・スタッフゼロ。紹介店舗の月額から最大45%の継続報酬。300店舗で月122万円のストック収益を目指せます。',
    url: '/partners',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '【公式】販売代理店パートナー募集｜Push-taro',
    description:
      '実店舗のリピート施策を仕組み化するSaaSの代理店募集。紹介店舗の月額から最大45%の継続報酬。',
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

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
