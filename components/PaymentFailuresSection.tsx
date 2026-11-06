'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase-client';

interface Props {
  referrerId: string;
  referrerType: 'pro' | 'agency' | 'affiliate';
}

export default function PaymentFailuresSection({ referrerId, referrerType }: Props) {
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    if (!referrerId) return;

    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }
        const idToken = await user.getIdToken();
        const res = await fetch(
          `/api/referrals/payment-failures?referrerId=${referrerId}&referrerType=${referrerType}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setShops(data.shops || []);
        }
      } catch (err) {
        console.error('決済不履行取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [referrerId, referrerType]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      failure_1:         { label: '不履行1',   bg: '#fef3c7', color: '#92400e' },
      failure_2:         { label: '不履行2',   bg: '#fed7aa', color: '#9a3412' },
      failure_3_stopped: { label: '停止中',    bg: '#fecaca', color: '#991b1b' },
      recovering:        { label: '復活中',    bg: '#dbeafe', color: '#1e40af' },
      canceled:          { label: '退会処理',  bg: '#e2e8f0', color: '#475569' },
    };
    const s = map[status] || { label: status, bg: '#f1f5f9', color: '#475569' };
    return (
      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: 0 }}>読み込み中...</p>
      </div>
    );
  }

  // 不履行なしなら表示しない
  if (shops.length === 0) {
    return null;
  }

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '2px solid #fecaca', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#991b1b' }}>
            ⚠️ 配下店舗の決済不履行
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            あなたが紹介した店舗で決済不履行が発生しています
          </p>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b' }}>{shops.length} 件</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>店舗名</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>プラン</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>状態</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>最終更新</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{s.name}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                    background: s.plan === 'pro' ? '#fef3c7' : s.plan === 'standard' ? '#dbeafe' : '#f1f5f9',
                    color: s.plan === 'pro' ? '#b45309' : s.plan === 'standard' ? '#1d4ed8' : '#475569',
                  }}>
                    {s.plan.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{getStatusBadge(s.paymentStatus)}</td>
                <td style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>
                  {s.lastUpdatedAt ? new Date(s.lastUpdatedAt).toLocaleString('ja-JP') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
        ※ 復旧には管理者による対応が必要です
      </p>
    </div>
  );
}
