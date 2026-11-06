'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function NotificationLinkContent() {
  const searchParams = useSearchParams();
  const rawTarget = searchParams.get('target') || '';
  const rawReturnTo = searchParams.get('returnTo') || '';
  const rawLabel = searchParams.get('label') || '戻る';

  let target = '';
  try {
    const parsed = new URL(rawTarget);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') target = parsed.toString();
  } catch {}

  const returnTo = rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//') ? rawReturnTo : '/';
  const label = `← ${rawLabel}`;

  return (
    <main style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ flex: '0 0 auto', padding: 'calc(10px + env(safe-area-inset-top)) 12px 10px', background: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.08)', zIndex: 1 }}>
        <a
          href={returnTo}
          style={{ display: 'inline-flex', alignItems: 'center', minHeight: '40px', padding: '0 16px', background: '#1e293b', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', boxSizing: 'border-box', touchAction: 'manipulation' }}
        >
          {label}
        </a>
      </header>
      {target ? (
        <iframe
          src={target}
          title="リンク先"
          style={{ flex: '1 1 auto', width: '100%', minHeight: 0, border: 0 }}
          allow="fullscreen"
        />
      ) : (
        <div role="alert" style={{ margin: 'auto', padding: '24px', color: '#c53030', textAlign: 'center' }}>
          リンク先が正しくありません。
        </div>
      )}
    </main>
  );
}

export default function NotificationLinkPage() {
  return (
    <Suspense fallback={<main style={{ padding: '40px', textAlign: 'center' }}>読み込み中...</main>}>
      <NotificationLinkContent />
    </Suspense>
  );
}
