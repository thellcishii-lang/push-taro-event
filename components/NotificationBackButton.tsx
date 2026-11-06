'use client';

import { useEffect, useState } from 'react';

export default function NotificationBackButton() {
  const [returnTo, setReturnTo] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('returnTo') || '';
    if (target.startsWith('/subscribe?')) setReturnTo(target);
  }, []);

  if (!returnTo) return null;

  return (
    <a
      href={returnTo}
      style={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        padding: '11px 18px',
        background: '#1e293b',
        color: '#fff',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,.2)',
        whiteSpace: 'nowrap',
        touchAction: 'manipulation',
      }}
    >
      ← 顧客画面へ戻る
    </a>
  );
}