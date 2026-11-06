// app/reset-password/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') || 'affiliate';
  const role = ['shop', 'agency', 'affiliate', 'affilishop'].includes(roleParam) ? roleParam : 'affiliate';
  const requestedReturnTo = searchParams.get('returnTo');
  const allowedReturnPaths = ['/shop', '/pro-shop', '/pro-shop/dashboard', '/agency/dashboard', '/affiliate/dashboard', '/affilishop/dashboard'];
  const defaultReturnPath = role === 'shop'
    ? '/shop'
    : role === 'agency'
      ? '/agency/dashboard'
      : role === 'affilishop'
        ? '/affilishop/dashboard'
        : '/affiliate/dashboard';
  const returnPath = requestedReturnTo && allowedReturnPaths.includes(requestedReturnTo)
    ? requestedReturnTo
    : defaultReturnPath;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const roleLabel =
    role === 'shop' ? '店舗' : role === 'agency' ? '代理店' : role === 'affilishop' ? 'affilishop' : 'アフィリエイト';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '送信に失敗しました');
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}>
        {sent ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✉️</div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1a202c', margin: '0 0 12px 0' }}>
                メールを送信しました
              </h1>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.7 }}>
                ご入力のメールアドレスが登録されている場合、<br />
                パスワード再設定用のメールをお送りします。<br />
                メールをご確認ください。
              </p>
            </div>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link
                href={returnPath}
                style={{ color: '#3182ce', fontSize: '13px', textDecoration: 'none' }}
              >
                ← ログイン画面に戻る
              </Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1a202c', margin: '0 0 8px 0' }}>
                パスワード再設定
              </h1>
              <p style={{ color: '#718096', fontSize: '13px', margin: 0 }}>
                {roleLabel}アカウントのパスワードを再設定します
              </p>
            </div>

            {error && (
              <div style={{
                background: '#fff5f5',
                border: '1px solid #feb2b2',
                color: '#c53030',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '6px' }}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e0',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#94a3b8' : '#3182ce',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? '送信中...' : '再設定メールを送信'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
              <Link
                href={returnPath}
                style={{ color: '#64748b', textDecoration: 'none' }}
              >
                ← ログイン画面に戻る
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>読み込み中...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
