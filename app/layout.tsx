// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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
  title: '店舗・テナント向け プッシュ通知 × クーポンアプリ｜Push-taro',
  description:
    'LINE公式アカウントの配信上限や従量課金に悩む実店舗のための、店舗向けプッシュ通知アプリ。Push-taroは、プッシュ通知とクーポンで実店舗のリピーターづくりを支援します。QRコード登録やクーポン自動配信に対応し、月額1,980円から。',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Push-taro',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        {children}

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QCJH31R4FJ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QCJH31R4FJ');
          `}
        </Script>
      </body>
    </html>
  );
}
