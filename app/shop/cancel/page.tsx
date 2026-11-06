'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

// 1. メインのキャンセル画面コンポーネント
function CancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');

  const [user, setUser] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validUntil, setValidUntil] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && shopId) {
        try {
          const idToken = await u.getIdToken();
          const res = await fetch(`/api/admin/dashboard?shopId=${shopId}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.shop?.chargedThroughDate) {
              setValidUntil(data.shop.chargedThroughDate);
            } else {
              const now = new Date();
              const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              setValidUntil(lastDay.toISOString().slice(0, 10));
            }
          }
        } catch (err) {
          console.error('店舗情報取得エラー:', err);
        }
      }
    });
    return () => unsub();
  }, [shopId]);

  const handleCancel = async () => {
    if (!user || !shopId || !agreed) return;

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/cancel-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ shopId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('退会手続きが完了いたしました。');
        router.push('/shop');
      } else {
        alert('エラー: ' + data.error);
      }
    } catch (err: any) {
      alert('通信エラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#d32f2f', borderBottom: '2px solid #d32f2f', paddingBottom: '10px' }}>
        ⚠️ 店舗アカウントの退会（解約）手続き
      </h2>

      <div style={{ background: '#fff3f3', border: '1px solid #ffcdd2', padding: '16px', borderRadius: '8px', margin: '20px 0', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828' }}>
          【重要】退会に伴う注意事項
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#333' }}>
          <li>退会すると、既にある通知受取情報は全て破棄され、万が一再開される場合には最初からやり直すことになります。</li>
          {validUntil && (
            <li style={{ marginTop: '8px', fontWeight: 'bold', color: '#d32f2f' }}>
              現在の決済により、<strong>{validUntil}</strong> までご利用いただけます。
            </li>
          )}
        </ul>
      </div>

      <div style={{ margin: '25px 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          上記事項に同意して退会する
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => router.push('/shop')}
          style={{ flex: 1, padding: '12px', background: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          キャンセル（管理画面に戻る）
        </button>

        <button
          onClick={handleCancel}
          disabled={!agreed || loading}
          style={{
            flex: 1,
            padding: '12px',
            background: !agreed || loading ? '#ccc' : '#d32f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: !agreed || loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? '処理中...' : '退会を確定する'}
        </button>
      </div>
    </main>
  );
}

// 2. Suspense で囲んでエクスポート（ビルド時の Prerender エラー防止）
export default function CancelPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: 'center', padding: '40px' }}>読み込み中...</p>}>
      <CancelContent />
    </Suspense>
  );
}
