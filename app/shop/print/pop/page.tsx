'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ShopPop from '@/components/print/ShopPop';
import type { ShopPopData } from '@/lib/print/types';
import '@/app/print/print.css';

function PopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shopId = searchParams.get('s') || '';
  const sizeParam = searchParams.get('size');
  const size: 'a4' | 'b5' = sizeParam === 'b5' ? 'b5' : 'a4';

  const [data, setData] = useState<ShopPopData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shopId) {
      setError('店舗IDが指定されていません。');
      return;
    }

    fetch(`/api/shop-info?s=${encodeURIComponent(shopId)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) throw new Error(res.error || '店舗情報の取得に失敗しました');

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

        setData({
          shopId: res.shopId,
          shopName: res.name || '店舗',
          subscribeUrl: `${appUrl}/subscribe?s=${res.shopId}`,
          plan: (res.plan || 'light') as ShopPopData['plan'],
          firstCoupon: res.coupon
            ? {
                enabled: res.coupon.enabled === true,
                title: res.coupon.title || '',
                description: res.coupon.description || '',
              }
            : undefined,
        });
      })
      .catch((e) => setError(e.message));
  }, [shopId]);

  if (error) {
    return (
      <main style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button onClick={() => window.close()}>← 閉じる</button>
      </main>
    );
  }

  // 👇 ここで null チェックを確実に行う（これでビルドエラーが消えます）
  if (!data) {
    return <main style={{ padding: 40, textAlign: 'center' }}>読み込み中...</main>;
  }

  const switchSize = (nextSize: 'a4' | 'b5') => {
    router.replace(`/shop/print/pop?s=${shopId}&size=${nextSize}`);
  };

  const returnTo = searchParams.get('returnTo') || '/shop';

  const handleClose = () => {
    window.close();
    setTimeout(() => { window.location.href = returnTo; }, 200);
  };

  return (
    <>
      {/* 👇 店頭ポップ専用のスタイル（他ページに影響させない） */}
      <style jsx global>{`
        /* スマホ用の縮小設定 */
        @media screen and (max-width: 600px) {
          .shop-pop-preview-wrap > .shop-pop {
            zoom: 0.45; /* transformではなくzoomを使うことで、余白の残りを防ぐ */
          }
        }
        @media screen and (min-width: 601px) and (max-width: 900px) {
          .shop-pop-preview-wrap > .shop-pop {
            zoom: 0.65;
          }
        }
        
        /* 印刷用の設定（2ページになるのを防ぐ） */
        @media print {
          @page {
            margin: 0; /* ブラウザの余白を消す */
          }
          .shop-pop-preview-wrap {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .shop-pop-preview-wrap > .shop-pop {
            zoom: 1 !important; /* 印刷時は等倍に戻す */
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="print-wrap">
        <div className="print-toolbar no-print">
          <div className="print-toolbar-info">
            <strong>店頭ポップ（{size === 'a4' ? 'A4 縦' : 'B5 縦'}）</strong>
            <span>{size === 'a4' ? '210×297mm' : '182×257mm'}／店頭掲示用</span>
          </div>
          <div className="print-toolbar-actions">
            <button onClick={() => switchSize(size === 'a4' ? 'b5' : 'a4')}>
              📐 {size === 'a4' ? 'B5に切り替え' : 'A4に切り替え'}
            </button>
            <button className="primary" onClick={() => setTimeout(() => window.print(), 100)}>
              🖨️ 印刷 / PDF保存
            </button>
            <button onClick={handleClose}>← 閉じる</button>
          </div>
        </div>

        <div className="print-note no-print">
          💡 「PDFに保存」を選ぶと、コンビニのマルチコピー機でも印刷できます。
        </div>
        <div className="print-note no-print" style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '8px' }}>
        ⚠️ お使いのブラウザやプリンターの設定により、端が切れたりはみ出したりする場合があります。その場合は、印刷プレビュー画面の「倍率（拡大/縮小）」を 95%〜90% 程度に下げるか、「余白」を「なし」に設定して調整してください。
      </div>

        {/* 👇 専用のクラス名を付ける */}
        <div className="print-doc shop-pop-preview-wrap">
          <ShopPop data={data} size={size} />
        </div>
      </div>
    </>
  );
}

export default function ShopPopPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>読み込み中...</div>}>
      <PopContent />
    </Suspense>
  );
}
