// app/developers/pos-api/page.tsx
import type { Metadata } from 'next';
import PosApiClient from './PosApiClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'POS連携 API リファレンス｜Push-taro',
  description:
    'Push-taroのPOSレジ連携APIの技術仕様。クーポンの有効性確認、消込確定、クーポン一覧取得のエンドポイントを公開しています。',
  keywords: [
    'POS API',
    'プッシュ通知 API',
    'クーポン 消込 API',
    'Push-taro 開発者',
    'レジ 連携 API',
  ],
  alternates: { canonical: '/developers/pos-api' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: 'POS連携 API リファレンス｜Push-taro',
    description:
      'Push-taroのPOSレジ連携APIの技術仕様。エンドポイント、認証、リクエスト/レスポンス例を掲載。',
    url: '/developers/pos-api',
    siteName: 'Push-taro',
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

export default function Page() {
  return <PosApiClient />;
}
