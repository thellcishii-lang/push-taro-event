import { useId } from 'react';
import type { PartnerPrintData } from '@/lib/print/types';
import QRBlock from './QRBlock';

interface Props { data: PartnerPrintData; }

export default function BusinessCard({ data }: Props) {
  const {
    companyName,
    ownerName,
    referralCode,
    referralUrl,
    role,
  } = data;

  const roleLabel = role === 'agency' ? 'AUTHORIZED AGENCY' : 'AFFILISHOP PARTNER';
  const gid = useId().replace(/:/g, '');

  return (
    <section className="p-page bc-a4">
      {/* ========== 上段：表 ========== */}
      <div className="bc-slot bc-slot--top">
        <div className="bc-card bc-front">
          <div className="bc-glow" />

          <div className="bc-front-top">
            <div className="bc-logo-row">
              <svg className="bc-logo-mark" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient
                    id={`bcLogoGrad-${gid}`}
                    x1="0" y1="0" x2="48" y2="48"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="100%" stopColor="#ff4500" />
                  </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="23" fill={`url(#bcLogoGrad-${gid})`} />
                <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
                <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
                <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
                <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
                <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
              </svg>
              <div className="bc-logo">Push-taro<span>.</span></div>
            </div>
            <div className="bc-badge">2026年9月 正式リリース</div>
          </div>

          <div className="bc-front-mid">
            <h1 className="bc-catch">
              お客様に喜んで頂ける<br />
              <span className="accent">お店づくりのお手伝い。</span>
            </h1>
            <div className="bc-sub">実店舗向けプッシュ通知・クーポンアプリ</div>
          </div>

          <div className="bc-front-foot">
            <span className="bc-role">{roleLabel}</span>
            <span className="bc-year">2026</span>
          </div>
        </div>
      </div>

      {/* ========== 下段：裏 ========== */}
      <div className="bc-slot bc-slot--bottom">
        <div className="bc-card bc-back">
          <div className="bc-back-top">
            <div>
              <div className="bc-offer-badge">SPECIAL OFFER</div>
              <div className="bc-offer-title">
                このコードで<span className="accent">限定特典</span>を<br />
                受け取れます
              </div>
              <div className="bc-offer-code">{referralCode || '—'}</div>
            </div>
            <div className="bc-back-right">
              <div className="bc-qr">
                <QRBlock value={referralUrl} size={70} />
              </div>
            </div>
          </div>

          <div className="bc-back-bottom">
            <div className="bc-company">{companyName}</div>
            <div className="bc-owner-row">
              <span className="bc-owner">{ownerName}</span>
              <span className="bc-role-inline">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 切り取りガイド（画面のみ） ========== */}
      <div className="bc-guide bc-guide--top" />
      <div className="bc-guide bc-guide--bottom" />

      <style jsx global>{`
        /* ========== A4ページ ========== */
        .bc-a4 {
          position: relative;
          width: 210mm;
          height: 297mm;
          background: #fff;
          overflow: hidden;
          box-sizing: border-box;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          page: page-a4v;
        }

        /* 配置スロット（絶対配置でmm指定） */
        .bc-slot {
          position: absolute;
          left: 59.5mm;        /* (210-91)/2 */
          width: 91mm;
          height: 55mm;
        }
        .bc-slot--top    { top: 46.75mm; }   /* (148.5-55)/2 */
        .bc-slot--bottom { top: 195.25mm; }  /* 148.5 + 46.75 */

        /* ========== 名刺本体（実寸） ========== */
        .bc-card {
          width: 91mm;
          height: 55mm;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* ========== 表 ========== */
        .bc-front {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          padding: 6mm 7mm;
          display: flex;
          flex-direction: column;
        }
        .bc-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 88% 12%, rgba(255,69,0,0.5), transparent 55%);
          pointer-events: none;
        }
        .bc-front > * { position: relative; z-index: 1; }

        .bc-front-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: auto;
        }
        .bc-logo-row { display: flex; align-items: center; gap: 1.8mm; }
        .bc-logo-mark { width: 7mm; height: 7mm; flex-shrink: 0; display: block; }
        .bc-logo {
          font-size: 12pt; font-weight: 900;
          letter-spacing: -0.1mm; line-height: 1;
        }
        .bc-logo span { color: #ff4500; }

        .bc-badge {
          font-size: 5pt; font-weight: 900; letter-spacing: 0.2mm;
          padding: 0.6mm 2mm; border-radius: 1.5mm;
          background: rgba(255,69,0,0.25);
          border: 0.25mm solid rgba(255,69,0,0.5);
          color: #fd7e5a;
        }

        .bc-front-mid { margin-bottom: auto; }
        .bc-catch {
          font-size: 13pt; font-weight: 900;
          line-height: 1.35; letter-spacing: -0.1mm;
          margin: 0 0 1.5mm;
        }
        .bc-catch .accent { color: #fd7e5a; }
        .bc-sub {
          font-size: 6.5pt; color: #94a3b8;
          font-weight: 700; letter-spacing: 0.1mm;
        }

        .bc-front-foot {
          display: flex; justify-content: space-between; align-items: baseline;
          padding-top: 2mm;
          border-top: 0.25mm solid rgba(255,255,255,0.1);
        }
        .bc-role {
          font-size: 5.5pt; font-weight: 900; letter-spacing: 0.4mm;
          color: #fd7e5a;
        }
        .bc-year { font-size: 5.5pt; color: #64748b; font-weight: 700; }

        /* ========== 裏 ========== */
        .bc-back {
          background: #fff;
          border: 0.25mm solid #e2e8f0;
          padding: 4mm 5mm 3.5mm;
          display: flex;
          flex-direction: column;
        }
        .bc-back-top {
          display: grid;
          grid-template-columns: 1fr 20mm;
          gap: 3mm;
          align-items: center;
          padding-bottom: 2.5mm;
          margin-bottom: 2.5mm;
          border-bottom: 0.25mm solid #e2e8f0;
        }
        .bc-offer-badge {
          display: inline-block;
          font-size: 4.5pt; font-weight: 900; letter-spacing: 0.25mm;
          padding: 0.5mm 1.8mm; border-radius: 1.5mm;
          background: linear-gradient(135deg, #ff4500, #f97316);
          color: #fff;
          margin-bottom: 1.2mm;
        }
        .bc-offer-title {
          font-size: 6.5pt; font-weight: 900;
          color: #0f172a; line-height: 1.3; margin-bottom: 1.5mm;
        }
        .bc-offer-title .accent { color: #ff4500; }
        .bc-offer-code {
          font-family: 'Courier New', monospace;
          font-size: 9pt; font-weight: 900;
          letter-spacing: 0.4mm;
          color: #0f172a;
          background: #fff7ed;
          border: 0.4mm dashed #ff4500;
          border-radius: 1mm;
          padding: 1.2mm 1.5mm;
          text-align: center;
        }
        .bc-back-right { display: flex; justify-content: center; align-items: center; }
        .bc-qr {
          display: inline-block;
          padding: 0.8mm;
          background: #fff;
          border: 0.25mm solid #e2e8f0;
          border-radius: 1mm;
        }
        .bc-back-bottom { display: flex; flex-direction: column; gap: 0.5mm; }
        .bc-company {
          font-size: 7pt; font-weight: 900;
          color: #0f172a; line-height: 1.3;
        }
        .bc-owner-row { display: flex; align-items: baseline; gap: 2mm; }
        .bc-owner {
          font-size: 11pt; font-weight: 900;
          color: #0f172a; letter-spacing: 0.4mm; line-height: 1.1;
        }
        .bc-role-inline {
          font-size: 5pt; font-weight: 900;
          color: #ff4500; letter-spacing: 0.3mm;
        }

        /* ========== ガイド（画面のみ） ========== */
        .bc-guide {
          position: absolute;
          left: 59.5mm;
          width: 91mm;
          height: 55mm;
          border: 0.2mm dashed #cbd5e1;
          pointer-events: none;
        }
        .bc-guide--top    { top: 46.75mm; }
        .bc-guide--bottom { top: 195.25mm; }

        /* 中央線 */
        .bc-a4::before {
          content: "";
          position: absolute;
          left: 0; right: 0;
          top: 148.5mm;
          border-top: 0.2mm dashed #cbd5e1;
          pointer-events: none;
        }

        @media print {
          .bc-a4 {
            box-shadow: none !important;
            margin: 0 !important;
          }
          .bc-guide,
          .bc-a4::before { display: none !important; }
        }
      `}</style>
    </section>
  );
}
