'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { PRINT_MATERIALS } from '@/lib/print/constants';
import type { PartnerPrintData, PrintMaterialType } from '@/lib/print/types';
import TrifoldBrochure from '@/components/print/TrifoldBrochure';
import LeafletA5 from '@/components/print/LeafletA5';
import LeafletA4 from '@/components/print/LeafletA4';
import BusinessCard from '@/components/print/BusinessCard';
import Card from '@/components/print/Card';
import '../print.css';

const VALID_TYPES: PrintMaterialType[] = [
  'trifold',
  'leaflet-a5',
  'leaflet-a4',
  'card',
  'business-card',
];

export default function PrintPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const type = String(params.type || '') as PrintMaterialType;

  const [data, setData] = useState<PartnerPrintData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const m = PRINT_MATERIALS.find((x) => x.type === type);
    if (m) document.title = `${m.label} | Push-taro`;
    return () => {
      document.title = 'Push-taro';
    };
  }, [type]);

  useEffect(() => {
    if (!VALID_TYPES.includes(type)) {
      setError('不明なテンプレートです。');
      return;
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/');
        return;
      }
      try {
        const idToken = await u.getIdToken();
        const res = await fetch('/api/print-materials', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          setError('パートナー情報の取得に失敗しました。');
          return;
        }
        setData(await res.json());
      } catch {
        setError('通信エラーが発生しました。');
      }
    });

    return () => unsub();
  }, [type, router]);

  if (error) {
    return (
      <main style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button onClick={() => router.back()}>← 戻る</button>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>読み込み中...</p>
      </main>
    );
  }

  const meta = PRINT_MATERIALS.find((m) => m.type === type)!;

  let Template: ReactNode;
  if (type === 'trifold') {
    Template = <TrifoldBrochure data={data} />;
  } else if (type === 'leaflet-a5') {
    Template = <LeafletA5 data={data} />;
  } else if (type === 'leaflet-a4') {
    Template = <LeafletA4 data={data} />;
  } else if (type === 'card') {
    Template = <Card data={data} />;
  } else {
    Template = <BusinessCard data={data} />;
  }

  return (
    <div className="print-wrap">
      {/* 画面上部のツールバー（印刷時は非表示） */}
      <div className="print-toolbar no-print">
        <div className="print-toolbar-info">
          <strong>{meta.label}</strong>
          <span>
            {meta.sizeText}／{meta.pagesText}
          </span>
        </div>
        <div className="print-toolbar-actions">
          <button onClick={() => router.back()}>← 戻る</button>
          <button className="primary" onClick={() => window.print()}>
            🖨️ 印刷 / PDF保存
          </button>
        </div>
      </div>

      <div className="print-note no-print">
        💡 「PDFに保存」を選ぶと、東京カラー印刷にそのまま入稿できます（塗り足し3mm込み）。
      </div>

      {/* 実際の印刷物 */}
      <div className="print-doc">{Template}</div>
    </div>
  );
}
