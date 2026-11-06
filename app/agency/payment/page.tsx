'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AgencyPaymentPage() {
  const searchParams = useSearchParams();
  const agencyId = searchParams.get('agencyId');
  const type = searchParams.get('type');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!agencyId || (type !== 'initial' && type !== 'monthly')) {
      setError('決済情報が正しくありません。メール内のリンクからアクセスしてください。');
      setChecking(false);
      return;
    }

    fetch(`/api/agency/payment-status?agencyId=${encodeURIComponent(agencyId)}&type=${type}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '決済状況を確認できませんでした。');
        if (data.paid) {
          setChecking(false);
          return;
        }
        window.location.assign(data.paymentUrl);
      })
      .catch((requestError) => {
        setError(requestError.message);
        setChecking(false);
      });
  }, [agencyId, type]);

  if (error) {
    return <main style={{ maxWidth: '560px', margin: '80px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}><h1>確認エラー</h1><p>{error}</p></main>;
  }

  if (checking) {
    return <main style={{ maxWidth: '560px', margin: '80px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}><h1>決済状況を確認中...</h1><p>しばらくお待ちください。</p></main>;
  }

  return <main style={{ maxWidth: '560px', margin: '80px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}><h1>お支払いは完了しています</h1><p>この決済はすでに完了しているため、追加のお支払いは不要です。</p></main>;
}