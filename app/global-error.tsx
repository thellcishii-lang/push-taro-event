'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ブラウザのエラーをサーバーに送信（任意）
    fetch('/api/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontSize: '22px', color: '#1a202c', marginBottom: '12px' }}>
            エラーが発生しました
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            ご不便をおかけして申し訳ございません。<br />
            問題が解決しない場合は、お手数ですが管理者までご連絡ください。
          </p>
          <button
            onClick={reset}
            style={{
              padding: '12px 32px',
              background: '#ff4500',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
