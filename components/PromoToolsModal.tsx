'use client';

import { useState, useEffect } from 'react';
import type { PrintMaterialType } from '@/lib/print/types';
import { PRINT_MATERIALS } from '@/lib/print/constants';
import { SAMPLE_DATA } from '@/lib/print/sample-data';

import TrifoldBrochure from '@/components/print/TrifoldBrochure';
import LeafletA5 from '@/components/print/LeafletA5';
import LeafletA4 from '@/components/print/LeafletA4';
import BusinessCard from '@/components/print/BusinessCard';
import Card from '@/components/print/Card';

import '@/app/print/print.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/* 各ツールの縮小倍率（モーダル内に収める） */
const SCALE_BY_TYPE: Record<PrintMaterialType, number> = {
  'trifold':       0.52,  // A4ヨコ（297mm × 210mm）→ 画面幅に収める
  'leaflet-a4':    0.48,  // A4（210mm × 297mm）→ 縦長なので小さめに
  'leaflet-a5':    0.65,  // A5（148mm × 210mm）
  'card':          1.0,   // 91mm × 55mm（実寸でOK）
  'business-card': 1.0,   // 91mm × 55mm
};

export default function PromoToolsModal({ isOpen, onClose }: Props) {
  const [activeType, setActiveType] = useState<PrintMaterialType>('trifold');

  // ESC キーで閉じる & 背景スクロール防止
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderPreview = () => {
    switch (activeType) {
      case 'trifold':       return <TrifoldBrochure data={SAMPLE_DATA} />;
      case 'leaflet-a4':    return <LeafletA4 data={SAMPLE_DATA} />;
      case 'leaflet-a5':    return <LeafletA5 data={SAMPLE_DATA} />;
      case 'business-card': return <BusinessCard data={SAMPLE_DATA} />;
      case 'card':          return <Card data={SAMPLE_DATA} />;
      default:              return null;
    }
  };

  const scale = SCALE_BY_TYPE[activeType];

  return (
    <div className="ptm-overlay" onClick={onClose}>
      <div className="ptm-modal" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="ptm-head">
          <div>
            <h2 className="ptm-title">販促ツール サンプル</h2>
            <p className="ptm-sub">
              あなたの会社名・紹介コード入りで、こう仕上がります。
            </p>
          </div>
          <button className="ptm-close" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>

        {/* タブ */}
        <div className="ptm-tabs">
          {PRINT_MATERIALS.map((m) => (
            <button
              key={m.type}
              className={`ptm-tab ${activeType === m.type ? 'is-active' : ''}`}
              onClick={() => setActiveType(m.type)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* プレビュー */}
         <div className="ptm-body">
          <div className="ptm-preview-outer">
            <div
              className="ptm-preview-scaler"
              style={{ zoom: scale } as React.CSSProperties}
            >
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="ptm-foot">
          <p>※ 実際のダウンロードは、代理店管理画面から行えます。</p>
        </div>
      </div>

      <style jsx global>{`
        /* ============================================================
           オーバーレイ
        ============================================================ */
        .ptm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: ptmFadeIn 0.2s ease;
        }
        @keyframes ptmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ============================================================
           モーダル本体
        ============================================================ */
        .ptm-modal {
          background: #f8fafc;
          border-radius: 16px;
          width: 100%;
          max-width: 1100px;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
          animation: ptmSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes ptmSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ============================================================
           ヘッダー
        ============================================================ */
        .ptm-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 28px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
          gap: 16px;
        }
        .ptm-title {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }
        .ptm-sub {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .ptm-close {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #f1f5f9;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #64748b;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .ptm-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* ============================================================
           タブ
        ============================================================ */
        .ptm-tabs {
          display: flex;
          gap: 4px;
          padding: 0 28px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
          flex-shrink: 0;
        }
        .ptm-tab {
          padding: 12px 16px;
          background: transparent;
          border: none;
          font-size: 13px;
          font-weight: 800;
          color: #64748b;
          cursor: pointer;
          white-space: nowrap;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          font-family: inherit;
        }
        .ptm-tab:hover {
          color: #0f172a;
        }
        .ptm-tab.is-active {
          color: #ff4500;
          border-bottom-color: #ff4500;
        }

        /* ============================================================
           プレビュー
        ============================================================ */
        .ptm-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #e2e8f0;
  padding: 32px 24px;
  display: flex;
  justify-content: center;
  /* min-height を指定して、内容が少なくてもある程度の高さを確保 */
  min-height: 400px;
}
        .ptm-preview-outer {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  padding: 0 8px;
}
        .ptm-preview-scaler {
  /* zoom がレイアウトごと縮小するので、transform関連は不要 */
  display: inline-block;
}

        /* print.css の .print-doc 内で余白が入るので、モーダル内では最小化 */
        .ptm-preview-scaler .print-doc {
          padding: 0;
          gap: 24px;
        }
        .ptm-preview-scaler .p-page {
  overflow: visible;
}

        /* ============================================================
           フッター
        ============================================================ */
        .ptm-foot {
          padding: 12px 28px;
          background: #fff;
          border-top: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .ptm-foot p {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
          text-align: center;
        }

        /* ============================================================
           レスポンシブ
        ============================================================ */
        @media (max-width: 768px) {
          .ptm-overlay { padding: 0; }
          .ptm-modal {
            max-width: 100%;
            max-height: 100vh;
            border-radius: 0;
          }
          .ptm-head,
          .ptm-tabs,
          .ptm-foot { padding-left: 16px; padding-right: 16px; }
          .ptm-body { padding: 20px 12px; }
          .ptm-title { font-size: 16px; }
          .ptm-tab { padding: 10px 12px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
