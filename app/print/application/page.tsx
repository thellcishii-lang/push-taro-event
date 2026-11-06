'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import '../print.css';

type DocType = 'shop' | 'pro-shop' | 'affiliate' | 'affilishop' | 'agency';

const STORAGE_KEY: Record<DocType, string> = {
  shop: 'signup_data',
  'pro-shop': 'signup_data',
  affiliate: 'affiliate_signup_data',
  affilishop: 'affilishop_signup_data',
  agency: 'agency_signup_data',
};

const DOC_LABEL: Record<DocType, string> = {
  shop: '店舗利用申込書',
  'pro-shop': '店舗利用申込書（PRO）',
  affiliate: 'アフィリエイト申込書',
  affilishop: 'affilishop申込書',
  agency: '代理店申込書',
};

function ApplicationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const shopId = searchParams.get('shopId');
  const agencyId = searchParams.get('agencyId');
  const affiliateId = searchParams.get('affiliateId');
  const affilishopId = searchParams.get('affilishopId');
  const typeParam = (searchParams.get('type') || 'shop') as DocType;
  const type: DocType = STORAGE_KEY[typeParam] ? typeParam : 'shop';

  const [data, setData] = useState<any>(null);

  
useEffect(() => {
    // 申込受付メールのリンクに付与された署名付きトークン（機密情報取得に必要）
    const token = searchParams.get('token');
    const tokenQuery = token ? `&token=${encodeURIComponent(token)}` : '';

    // ============================================================
    // 優先度1：shopId があれば API から取得（後からでもOK）
    // ============================================================
    if (shopId) {
      fetch(`/api/shop-info?shopId=${encodeURIComponent(shopId)}${tokenQuery}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            setData({
              companyName: res.name || '',
              email: res.email || '',
              phone: res.phone || '',
              address: res.address || '',
              invoiceNumber: res.invoiceNumber || '',
              plan: res.plan || 'light',
              bankAccount: res.bankAccount || null,
            });
          } else {
            alert('申込データが見つかりません。お申し込み時のメールに記載されたリンクからアクセスしてください。');
            router.push('/');
          }
        })
        .catch(() => {
          alert('通信エラーが発生しました。');
          router.push('/');
        });
      return;
    }

    // ============================================================
    // 優先度1-b：agency / affiliate / affilishop は partner-info から取得
    // ============================================================
    if (agencyId || affiliateId || affilishopId) {
      const partnerType = agencyId ? 'agency' : affiliateId ? 'affiliate' : 'affilishop';
      const partnerId = agencyId || affiliateId || affilishopId;

      fetch(`/api/partner-info?type=${partnerType}&id=${encodeURIComponent(partnerId!)}${tokenQuery}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setData(res.data);
          } else {
            alert('申込データが見つかりません。お申し込み時のメールに記載されたリンクからアクセスしてください。');
            router.push('/');
          }
        })
        .catch(() => {
          alert('通信エラーが発生しました。');
          router.push('/');
        });
      return;
    }

    // ============================================================
    // 優先度2：localStorage（同じブラウザ・申込直後のみ）
    // ============================================================
    let stored = localStorage.getItem(STORAGE_KEY[type]);
     if (!stored) {
      stored = sessionStorage.getItem(STORAGE_KEY[type]);
　　   }
    if (!stored) {
      alert('申込データが見つかりません。お申し込み時のメールに記載されたリンクからアクセスしてください。');
      router.push('/');
      return;
    }
    try {
      setData(JSON.parse(stored));
    } catch {
      router.push('/');
    }
  }, [shopId, agencyId, affiliateId, affilishopId, type, router, searchParams]);

  // タブタイトル設定
  useEffect(() => {
    document.title = `${DOC_LABEL[type]} | Push-taro`;
    return () => {
      document.title = 'Push-taro';
    };
  }, [type]);

  if (!data) {
    return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>読み込み中...</div>;
  }

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const planLabel =
    data.plan === 'pro' ? 'PRO プラン' :
    data.plan === 'standard' ? 'STANDARD プラン' :
    data.plan === 'light' ? 'LIGHT プラン' :
    '—';

  const planPrice =
    data.plan === 'pro' ? '¥10,000（税別）' :
    data.plan === 'standard' ? '¥3,800（税別）' :
    data.plan === 'light' ? '¥1,980（税別）' :
    '—';

  const planLimit =
    data.plan === 'pro' ? '無制限' :
    data.plan === 'standard' ? '15,000通 / 月' :
    data.plan === 'light' ? '5,000通 / 月' :
    '—';

  return (
    <>
      {/* ツールバー */}
      <div className="print-toolbar no-print">
        <div className="print-toolbar-info">
          <strong>{DOC_LABEL[type]}</strong>
          <span>A4 / 1ページ</span>
        </div>
        <div className="print-toolbar-actions">
          <button className="primary" onClick={() => window.print()}>
            🖨️ 印刷 / PDF保存
          </button>
        </div>
      </div>

      <div className="print-doc">
        <div className="pdf-page">

          {/* ヘッダー */}
          <header className="pdf-header">
            <div className="pdf-header-inner">
              <div className="pdf-logo-row">
                <svg className="pdf-logo-mark" viewBox="0 0 48 48" fill="none">
                  <defs>
                    <linearGradient id="pdfLogoGradApp" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ff6b6b" />
                      <stop offset="100%" stopColor="#ff4500" />
                    </linearGradient>
                  </defs>
                  <circle cx="24" cy="24" r="23" fill="url(#pdfLogoGradApp)" />
                  <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
                  <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
                  <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
                  <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
                  <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
                </svg>
                <div>
                  <div className="pdf-logo-text">Push-taro<span>.</span></div>
                  <div className="pdf-logo-sub">実店舗向けプッシュ通知・クーポンアプリ</div>
                </div>
              </div>
              <div className="pdf-header-title">
                <div className="pdf-doc-type">Application Form</div>
                <div className="pdf-doc-name">{DOC_LABEL[type]}</div>
              </div>
            </div>
          </header>

          {/* ボディ */}
          <div className="pdf-body">
            <div className="pdf-date-row">
              <div className="pdf-date">
                <span className="pdf-date-label">作成日</span>{today}
              </div>
            </div>

            {/* 基本情報 */}
            <section className="pdf-section">
              <h2 className="pdf-section-title">基本情報</h2>
              <table className="pdf-table">
                <tbody>
                  {data.companyName && (
                    <tr>
                      <th>{data.businessType === 'corporation' ? '会社名' : '屋号 / 店舗名'}</th>
                      <td>{data.companyName}</td>
                    </tr>
                  )}
                  {data.ownerName && (
                    <tr>
                      <th>ご担当者様</th>
                      <td>{data.ownerName} 様</td>
                    </tr>
                  )}
                  {data.name && (
                    <tr>
                      <th>お名前</th>
                      <td>{data.name} 様</td>
                    </tr>
                  )}
                  <tr>
                    <th>メールアドレス</th>
                    <td>{data.email}</td>
                  </tr>
                  {data.phone && (
                    <tr>
                      <th>電話番号</th>
                      <td>{data.phone}</td>
                    </tr>
                  )}
                  {data.address && (
                    <tr>
                      <th>住所</th>
                      <td>{data.address}</td>
                    </tr>
                  )}
                  <tr>
                    <th>インボイス番号</th>
                    <td>{data.invoiceNumber || '未登録'}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 契約プラン（店舗申込のみ） */}
            {(typeParam === 'shop' || typeParam === 'pro-shop') && (
              <section className="pdf-section">
                <h2 className="pdf-section-title">ご契約プラン</h2>
                <table className="pdf-table">
                  <tbody>
                    <tr className="is-highlight">
                      <th>選択プラン</th>
                      <td>{planLabel}</td>
                    </tr>
                    <tr>
                      <th>月額費用</th>
                      <td>{planPrice}</td>
                    </tr>
                    <tr>
                      <th>月間配信上限</th>
                      <td>{planLimit}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {/* 振込先口座（必要な場合） */}
            {data.bankAccount && (
              <section className="pdf-section">
                <h2 className="pdf-section-title">振込先口座情報</h2>
                <table className="pdf-table">
                  <tbody>
                    <tr><th>金融機関名</th><td>{data.bankAccount.bankName || '—'}</td></tr>
                    <tr><th>支店名</th><td>{data.bankAccount.branchName || '—'}</td></tr>
                    <tr><th>預金種目</th><td>{data.bankAccount.accountType === 'savings' ? '普通' : '当座'}</td></tr>
                    <tr><th>口座番号</th><td>{data.bankAccount.accountNumber || '—'}</td></tr>
                    <tr><th>口座名義</th><td>{data.bankAccount.accountHolder || '—'}</td></tr>
                  </tbody>
                </table>
              </section>
            )}

            {/* 署名欄 */}
            <div className="pdf-signature">
              <div className="pdf-signature-box">
                <div className="pdf-signature-label">ご署名</div>
                <div className="pdf-signature-frame" />
              </div>
            </div>
          </div>

          {/* フッター */}
          <footer className="pdf-footer">
            <div className="pdf-footer-left">
              <div className="pdf-footer-company">the合同会社 ｜ Push-taro</div>
              <div className="pdf-footer-address">
                〒357-0123 埼玉県飯能市中藤下郷２３−２１ ／ info@push-taro.com
              </div>
            </div>
            <div className="pdf-footer-page">1 / 1</div>
          </footer>

        </div>
      </div>

      <style jsx global>{`
        /* ============================================================
           PDF ドキュメント共通
           ============================================================ */
        .pdf-page {
          width: 210mm;
          min-height: 297mm;
          background: #fff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          position: relative;
          display: flex;
          flex-direction: column;
          color: #1a202c;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif;
        }

        /* ========== ヘッダー ========== */
        .pdf-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          padding: 14mm 18mm 10mm;
          position: relative;
          overflow: hidden;
        }
        .pdf-header::after {
          content: '';
          position: absolute;
          top: -50%; right: -10%;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,69,0,0.35), transparent 70%);
          pointer-events: none;
        }
        .pdf-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
          z-index: 1;
        }
        .pdf-logo-row { display: flex; align-items: flex-start; gap: 8px; }
        .pdf-logo-mark {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .pdf-logo-text {
          font-size: 20pt; font-weight: 900;
          letter-spacing: -0.5px; line-height: 1;
        }
        .pdf-logo-text span { color: #ff4500; }
        .pdf-logo-sub {
          font-size: 8pt; color: #94a3b8;
          margin-top: 3px; font-weight: 600; letter-spacing: 0.3px;
        }
        .pdf-header-title { text-align: right; }
        .pdf-doc-type {
          font-size: 9pt; color: #fd7e5a; font-weight: 800;
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 4px;
        }
        .pdf-doc-name {
          font-size: 20pt; font-weight: 900;
          letter-spacing: 1px; line-height: 1.2;
        }

        /* ========== ボディ ========== */
        .pdf-body {
          flex: 1;
          padding: 14mm 18mm 20mm;
          position: relative;
        }

        .pdf-date-row { display: flex; justify-content: flex-end; margin-bottom: 10mm; }
        .pdf-date { font-size: 10pt; color: #475569; font-weight: 700; }
        .pdf-date-label { font-size: 9pt; color: #94a3b8; margin-right: 6px; }

        .pdf-section { margin-bottom: 8mm; }
        .pdf-section-title {
          font-size: 11pt; font-weight: 900; color: #0f172a;
          padding: 6px 0 6px 12px;
          border-left: 4px solid #ff4500;
          margin-bottom: 6mm;
          letter-spacing: -0.3px;
        }

        .pdf-table {
          width: 100%; border-collapse: collapse;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          overflow: hidden;
        }
        .pdf-table tr { border-bottom: 1px solid #e2e8f0; }
        .pdf-table tr:last-child { border-bottom: none; }
        .pdf-table th {
          width: 32%; padding: 10px 14px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          font-size: 9pt; font-weight: 800; color: #475569;
          text-align: left; vertical-align: top;
        }
        .pdf-table td {
          padding: 10px 14px;
          font-size: 10pt; color: #1a202c;
          vertical-align: top; line-height: 1.5;
        }
        .pdf-table tr.is-highlight td {
          background: #fff7ed;
          font-weight: 900; color: #c2410c;
        }

        .pdf-signature { display: flex; justify-content: flex-end; margin-top: 16mm; }
        .pdf-signature-box { width: 70mm; }
        .pdf-signature-label {
          font-size: 8pt; color: #94a3b8; font-weight: 700;
          margin-bottom: 3mm; text-align: center;
        }
        .pdf-signature-frame {
          width: 70mm; height: 25mm;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #fafafa;
        }

        /* ========== フッター ========== */
        .pdf-footer {
          background: #0f172a;
          color: #94a3b8;
          padding: 6mm 18mm;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8pt;
        }
        .pdf-footer-left { display: flex; flex-direction: column; gap: 1mm; }
        .pdf-footer-company {
          color: #fff; font-weight: 800;
          font-size: 9pt; letter-spacing: 0.3px;
        }
        .pdf-footer-address { font-size: 7pt; color: #64748b; }
        .pdf-footer-page {
          font-family: 'Courier New', monospace;
          font-weight: 900; color: #fff;
          font-size: 9pt;
          background: rgba(255,69,0,0.2);
          border: 1px solid rgba(255,69,0,0.5);
          padding: 3px 12px;
          border-radius: 12px;
          letter-spacing: 1px;
        }

        @media print {
          .pdf-page { box-shadow: none; }
        }
      `}</style>
    </>
  );
}

export default function PrintApplicationPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>読み込み中...</div>
    }>
      <ApplicationContent />
    </Suspense>
  );
}
