// app/not-found.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ページが見つかりません｜Push-taro',
  description: 'お探しのページは見つかりませんでした。',
  robots: { index: false, follow: false },
};

export default function NotFound() {
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
      <div style={{ fontSize: '80px', fontWeight: 900, color: '#0f172a', letterSpacing: '-4px', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '24px 0 12px' }}>
        ページが見つかりません
      </h1>
      <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.9, marginBottom: '32px', maxWidth: '480px' }}>
        お探しのページは、削除されたか<br />
        URLが変更された可能性があります。
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
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
          トップページへ戻る
        </Link>
        <Link
          href="/guide"
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
          活用ガイドを見る
        </Link>
      </div>
    </main>
  );
}
