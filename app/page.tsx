// app/page.tsx
// EVENT 専用デプロイのルート。公開向けの紹介ページは本家 push-taro.com/event に集約し、
// ここはアプリの入口としての最小限の案内だけを置く。
import type { Metadata } from 'next';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = {
  title: 'Push-taro.EVENT｜展示会向けプッシュ通知 × クーポン',
  description:
    'Push-taro.EVENT は展示会・大型イベント向けのプッシュ通知 × クーポン基盤です。来場者の方は会場のQRコードからアクセスしてください。',
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        textAlign: 'center',
      }}
    >
      <BrandLogo />
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '24px 0 12px' }}>
        Push-taro.EVENT
      </h1>
      <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.9, maxWidth: '520px', marginBottom: '32px' }}>
        このドメインは、展示会・大型イベント向けアプリ「Push-taro.EVENT」専用です。
        <br />
        来場者の方は、会場に掲示されたQRコードからアクセスしてください。
        <br />
        サービスの紹介は本家サイトに掲載しています。
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/event-admin"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #ff4500, #f97316)',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '15px',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(255,69,0,0.3)',
          }}
        >
          主催者ログイン（管理画面）
        </Link>
        <a
          href="https://push-taro.com/event"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: '#fff',
            color: '#0f172a',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '15px',
            textDecoration: 'none',
            border: '2px solid #e2e8f0',
          }}
        >
          サービスの紹介を見る
        </a>
      </div>
    </main>
  );
}
