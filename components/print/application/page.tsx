'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PrintApplicationPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'affiliate';
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`${type}_signup_data`);
    if (stored) {
      try { setData(JSON.parse(stored)); } catch {}
    }
  }, [type]);

  // データがない場合、API から取得するフォールバックも可能
  if (!data) {
    return <main style={{ padding: 40, textAlign: 'center' }}>読み込み中...</main>;
  }

  const typeLabel =
    type === 'affiliate' ? 'アフィリエイト' :
    type === 'affilishop' ? 'affilishop' :
    '代理店';

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      {/* ツールバー */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff', borderBottom: '1px solid #cbd5e1',
        padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 800 }}>
          📄 {typeLabel}申込書
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => window.history.back()} style={{
            padding: '9px 18px', border: '1px solid #cbd5e1',
            background: '#fff', borderRadius: '6px',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
          }}>← 戻る</button>
          <button onClick={() => window.print()} style={{
            padding: '9px 18px', background: '#ff4500', color: '#fff',
            border: 'none', borderRadius: '6px',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
          }}>🖨️ 印刷 / PDF保存</button>
        </div>
      </div>

      {/* 申込書本体 */}
      <div className="print-doc">
        <div className="p-page doc-page">
          {/* ヘッダー */}
          <header className="doc-header">
            <div>
              <h1 className="doc-title">{typeLabel}申込書</h1>
              <p className="doc-subtitle">Push-taro Partner Program</p>
            </div>
            <div className="doc-date">{today}</div>
          </header>

          {/* 基本情報 */}
          <section className="doc-section">
            <h2 className="doc-section-title">基本情報</h2>
            <table className="doc-table">
              <tbody>
                <tr><th>事業形態</th><td>{data.businessType === 'corporation' ? '法人' : '個人'}</td></tr>
                {data.companyName && <tr><th>会社名 / 屋号</th><td>{data.companyName}</td></tr>}
                <tr><th>お名前</th><td>{data.ownerName || data.name || '—'}</td></tr>
                <tr><th>メールアドレス</th><td>{data.email}</td></tr>
                <tr><th>電話番号</th><td>{data.phone || '—'}</td></tr>
                <tr><th>住所</th><td>{data.address || '—'}</td></tr>
                {data.invoiceNumber && <tr><th>インボイス番号</th><td>{data.invoiceNumber}</td></tr>}
              </tbody>
            </table>
          </section>

          {/* 報酬タイプ */}
          {type === 'affiliate' && data.rewardType && (
            <section className="doc-section">
              <h2 className="doc-section-title">報酬タイプ</h2>
              <table className="doc-table">
                <tbody>
                  <tr>
                    <th>選択タイプ</th>
                    <td>
                      {data.rewardType === 'recurring'
                        ? '継続課金型（初年度8%・13ヶ月目以降5%）'
                        : '一括報酬型（PRO:¥5,000 / Standard:¥2,000 / Light:¥1,000）'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {/* 振込先口座 */}
          <section className="doc-section">
            <h2 className="doc-section-title">振込先口座情報</h2>
            <table className="doc-table">
              <tbody>
                <tr><th>金融機関名</th><td>{data.bankAccount?.bankName || '—'}</td></tr>
                <tr><th>支店名</th><td>{data.bankAccount?.branchName || '—'}</td></tr>
                <tr><th>預金種目</th><td>{data.bankAccount?.accountType === 'savings' ? '普通' : '当座'}</td></tr>
                <tr><th>口座番号</th><td>{data.bankAccount?.accountNumber || '—'}</td></tr>
                <tr><th>口座名義</th><td>{data.bankAccount?.accountHolder || '—'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* 署名欄 */}
          <section className="doc-signature">
            <div className="doc-signature-label">署名欄</div>
            <div className="doc-signature-box"></div>
          </section>

          <footer className="doc-footer">
            Push-taro Partner Program ｜ 本書はお申し込み内容の控えです。
          </footer>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; margin: 0; padding: 0; }
          @page { margin: 0; size: A4; }
        }
        .print-doc {
          background: #e2e8f0;
          min-height: 100vh;
          padding: 32px 16px;
          display: flex;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif;
        }
        .doc-page {
          width: 210mm;
          min-height: 297mm;
          background: #fff;
          padding: 20mm 18mm;
          box-sizing: border-box;
          color: #1a202c;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          position: relative;
        }
        .doc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 12px;
          border-bottom: 2px solid #0f172a;
          margin-bottom: 24px;
        }
        .doc-title {
          font-size: 22pt;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0 0 4px;
        }
        .doc-subtitle {
          font-size: 9pt;
          color: #64748b;
          margin: 0;
          font-weight: 700;
        }
        .doc-date {
          font-size: 10pt;
          color: #1a202c;
        }
        .doc-section {
          margin-bottom: 22px;
        }
        .doc-section-title {
          font-size: 11pt;
          font-weight: 900;
          color: #ff4500;
          padding-bottom: 6px;
          border-bottom: 1px solid #fed7aa;
          margin: 0 0 12px;
        }
        .doc-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #cbd5e1;
        }
        .doc-table th {
          width: 30%;
          padding: 10px 12px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 700;
          font-size: 9pt;
          text-align: left;
          color: #475569;
        }
        .doc-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10pt;
        }
        .doc-table tr:last-child th,
        .doc-table tr:last-child td { border-bottom: none; }
        .doc-signature {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
        }
        .doc-signature-box {
          width: 60mm;
          height: 25mm;
          border: 1px solid #cbd5e1;
          position: relative;
        }
        .doc-signature-label {
          position: absolute;
          right: 68mm;
          bottom: 22mm;
          font-size: 9pt;
          color: #64748b;
        }
        .doc-footer {
          position: absolute;
          bottom: 12mm;
          left: 18mm;
          right: 18mm;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 8pt;
          color: #94a3b8;
        }
      `}</style>
    </>
  );
}
