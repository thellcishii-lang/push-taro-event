'use client';

import Link from 'next/link';

const SHOP_POP_MATERIALS = [
  {
    type: 'a4',
    label: '店頭ポップ A4',
    description: 'レジ横・カウンターに立てる大きめサイズ。店舗QRコード入り。',
    sizeText: 'A4（210×297mm）／片面',
    pagesText: '1面',
  },
  {
    type: 'b5', // 👈 'a5' から 'b5' に変更
    label: '店頭ポップ B5', // 👈 A5 から B5 に変更
    description: 'コンパクトに置ける小さめサイズ。店舗QRコード入り。',
    sizeText: 'B5（182×257mm）／片面', // 👈 B5の寸法に修正
    pagesText: '1面',
  },
] as const;

interface ShopPopSectionProps {
  shopId: string;
  returnTo: string;
}

export default function ShopPopSection({ shopId, returnTo }: ShopPopSectionProps) {
  if (!shopId) return null;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: 20,
      marginTop: 24,
    }}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#0f172a' }}>
        📄 店頭ポップ（印刷用）
      </h3>
      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0' }}>
        レジ横やカウンターに置ける、店舗QRコード入りのポップです。
        お客様はQRを読み取るだけで通知登録できます。
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {SHOP_POP_MATERIALS.map((m) => (
          <Link
            key={m.type}
            href={`/shop/print/pop?s=${shopId}&size=${m.type}&returnTo=${encodeURIComponent(returnTo)}`}
            target="_blank"
            rel="noopener noreferrer"
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
