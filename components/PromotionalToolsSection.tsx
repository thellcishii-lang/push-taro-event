'use client';

import Link from 'next/link';
import { PRINT_MATERIALS } from '@/lib/print/constants';

export default function PromotionalToolsSection() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#0f172a' }}>
        📄 販促ツール（印刷用）
      </h3>
      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0' }}>
        東京カラー印刷にそのまま入稿できるPDFを作成できます。あなたの会社情報・紹介コードが自動で反映されます。
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {PRINT_MATERIALS.map((m) => (
          <Link
            key={m.type}
            href={`/print/${m.type}`}
            style={{
              display: 'block',
              padding: '14px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 6 }}>
              {m.description}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {m.sizeText}／{m.pagesText}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
