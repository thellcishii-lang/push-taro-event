'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentCheckContent() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId') || searchParams.get('s');
  const [isActive, setIsActive] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/shop');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔑 店舗IDが存在しない場合
    if (!shopId) {
      setErrorMessage('店舗ID（URLパラメータ ?s=店舗ID）が指定されていません。正しいリンクからアクセスしてください。');
      setLoading(false);
      return;
    }

    // キャッシュを効かせずに最新の Firestore 状態を取得
    fetch(`/api/shop-info?s=${shopId}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setErrorMessage(data.error || '店舗情報の取得に失敗しました。');
          setLoading(false);
          return;
        }

        // ============================================================
        // 🔑 【絶対最優先】アップグレード完了済み（completed）のチェック
        // APIレスポンスに upgradeStatus: "completed" があれば即座に通過して終了
        // ============================================================
        if (data.upgradeStatus === 'completed' ) {
          setIsActive(true);
          setRedirectPath(data.plan === 'pro' ? '/pro-shop' : '/shop');
          setLoading(false);
          return;
        }

        // ============================================================
        // 🔑 【リダイレクト判定1】アップグレード未決済（pending_payment）
        // ============================================================
        if (data.upgradeStatus === 'pending_payment') {
  const targetPlan = data.upgradeTargetPlan || data.targetPlan || 'standard';
  let paymentUrl = '';

  if (targetPlan === 'standard') {
    paymentUrl = process.env.NEXT_PUBLIC_SQUARE_LINK_STANDARD || '';
  } else if (targetPlan === 'pro') {
    paymentUrl = process.env.NEXT_PUBLIC_SQUARE_LINK_PRO || '';
  }

  if (!paymentUrl) {
    setErrorMessage('決済リンクが設定されていません。管理者にお問い合わせください。');
    setLoading(false);
    return;
  }

  window.location.href = paymentUrl;
  return;
}

        // ============================================================
        // 🔑 【優先判定】新規登録決済完了（active）のチェック
        // ============================================================
        if (data.status === 'active' ) {
          setIsActive(true);
          setRedirectPath(data.plan === 'pro' ? '/pro-shop' : '/shop');
          setLoading(false);
          return;
        }

        // ============================================================
        // 🔑 【リダイレクト判定2】新規登録未決済（pending_payment）
        // ============================================================
        if (data.status === 'pending_payment') {
  const plan = data.plan || 'light';
  let paymentUrl = '';

  if (plan === 'light') {
    paymentUrl = process.env.NEXT_PUBLIC_SQUARE_LINK_LIGHT || '';
  } else if (plan === 'standard') {
    paymentUrl = process.env.NEXT_PUBLIC_SQUARE_LINK_STANDARD || '';
  } else if (plan === 'pro') {
    paymentUrl = process.env.NEXT_PUBLIC_SQUARE_LINK_PRO || '';
  }

  if (!paymentUrl) {
    setErrorMessage('決済リンクが設定されていません。管理者にお問い合わせください。');
    setLoading(false);
    return;
  }

  window.location.href = paymentUrl;
  return;
}

        // ============================================================
        // 🔑 【フォールバック】完了扱いにする
        // ============================================================
        setIsActive(true);
        setRedirectPath(data.plan === 'pro' ? '/pro-shop' : '/shop');
        setLoading(false);
      })
      .catch((err) => {
        console.error('[PaymentCheck] エラー:', err);
        setErrorMessage('通信エラーが発生しました。ネットワーク接続を確認してください。');
        setLoading(false);
      });
  }, [shopId]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h3>決済ステータスを確認中...</h3>
        <p style={{ fontSize: 13, color: '#666' }}>しばらくお待ちください</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 500, margin: '0 auto', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, color: '#e11d48', marginBottom: 12 }}>確認エラー</h2>
        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{errorMessage}</p>
      </div>
    );
  }

    if (isActive) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 500, margin: '0 auto', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, color: '#1e293b', marginBottom: 12 }}>お支払いは完了しています</h2>
        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
          この度はご登録ありがとうございます。<br />
          すでに本登録・決済手続きが完了しておりますので、追加の決済は不要です。
        </p>
         <a
          href={redirectPath}
          style={{
            display: 'inline-block',
            marginTop: 24,
            padding: '14px 28px',
            background: '#ff4500',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: 16,
            boxShadow: '0 4px 12px rgba(255, 69, 0, 0.3)',
          }}
        >
          管理画面へログインする
        </a>

        {/* ★ ここから追加：申込書・利用規約のダウンロード */}
        {shopId && (
          <div style={{
            marginTop: 32,
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            textAlign: 'left',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#4a5568', fontWeight: 700 }}>
              📄 申込書・利用規約のダウンロード
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* shopId パラメータは付けず localStorage の申込データを参照させる。
                  （機密情報を含むため、URL だけでは取得できない設計） */}
              <a
                href="/print/application?type=shop"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  background: '#e2e8f0',
                  color: '#2d3748',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                📥 申込書をダウンロード
              </a>
              <a
                href={`/print/terms?type=shop`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  background: '#e2e8f0',
                  color: '#2d3748',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                📥 利用規約をダウンロード
              </a>
            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
}
