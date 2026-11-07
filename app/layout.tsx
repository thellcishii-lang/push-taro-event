// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// 静的生成は意図的に無効化する。
// クライアント用 Firebase 初期化がモジュール評価時に NEXT_PUBLIC_* 環境変数を
// 必要とするため、これを外すとビルド時プリレンダーが auth/invalid-api-key で失敗する。
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const viewport: Viewport = {
  themeColor: '#ff6b6b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Push-taro.EVENT｜展示会向けプッシュ通知 × クーポン',
  description:
    'Push-taro.EVENTは、展示会・大型イベント向けのプッシュ通知 × クーポン基盤です。来場者は会場QRコードから登録し、出展者クーポンの取得・消込と、主催者からのプッシュ配信を行えます。',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Push-taro.EVENT',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        {children}

      </body>
    </html>
  );
}
