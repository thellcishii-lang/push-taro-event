import { useId } from 'react';
import type { PartnerPrintData } from '@/lib/print/types';
import QRBlock from './QRBlock';

interface Props { data: PartnerPrintData; }

export default function Card({ data }: Props) {
  const { companyName, referralCode, referralUrl, role } = data;
  const roleLabel = role === 'agency' ? 'AUTHORIZED AGENCY' : 'AFFILISHOP PARTNER';
  const gid = useId().replace(/:/g, '');

  return (
    <section className="p-page cd-a4">
      {/* ========== 上段：表 ========== */}
      <div className="cd-slot cd-slot--top">
        <div className="cd-card cd-front">
          <div className="cd-glow" />

          <div className="cd-front-top">
            <div className="cd-logo-row">
              <svg className="cd-logo-mark" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient
                    id={`cdLogoGrad-${gid}`}
                    x1="0" y1="0" x2="48" y2="48"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="100%" stopColor="#ff4500" />
                  </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="23" fill={`url(#cdLogoGrad-${gid})`} />
                <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
                <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
                <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
                <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
                <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
              </svg>
              <div className="cd-logo">Push-taro<span>.</span></div>
            </div>
            <div className="cd-badge">2026年9月 正式リリース</div>
          </div>

          <div className="cd-front-mid">
            <h1 className="cd-catch">
              お客様に喜んで頂ける<br />
              <span className="accent">お店づくりのお手伝い。</span>
            </h1>
            <div className="cd-sub">実店舗向けプッシュ通知・クーポンアプリ</div>
          </div>

          <div className="cd-front-foot">
            <span className="cd-role">{roleLabel}</span>
            <span className="cd-year">2026</span>
          </div>
        </div>
      </div>

      {/* ========== 下段：裏 ========== */}
      <div className="cd-slot cd-slot--bottom">
        <div className="cd-card cd-back">
          <div className="cd-back-left">
            <div className="cd-offer-badge">SPECIAL OFFER</div>
            <div className="cd-offer-title">
              このコードで<br />
              <span className="accent">限定特典</span>を<br />
              受け取れます
            </div>
            <div className="cd-offer-code">{referralCode || '—'}</div>
            <div className="cd-offer-note">QRを読み取って、今すぐお申し込み</div>
          </div>
          <div className="cd-back-right">
            <div className="cd-qr">
              <QRBlock value={referralUrl} size={70} />
            </div>
          </div>
          <div className="cd-back-company">{companyName}</div>
        </div>
      </div>

      {/* ========== 切り取りガイド（画面のみ） ========== */}
      <div className="cd-guide cd-guide--top" />
      <div className="cd-guide cd-guide--bottom" />

      <style jsx global>{`
        /* ========== A4ページ ========== */
        .cd-a4 {
          position: relative;
          width: 210mm;
          height: 297mm;
          background: #fff;
          overflow: hidden;
          box-sizing: border-box;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          page: page-a4v;
        }

        .cd-slot {
          position: absolute;
          left: 59.5mm;
          width: 91mm;
          height: 55mm;
        }
        .cd-slot--top    { top: 46.75mm; }
        .cd-slot--bottom { top: 195.25mm; }

        /* ========== 名刺本体 ========== */
        .cd-card {
          width: 91mm;
          height: 55mm;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* ========== 表 ========== */
        .cd-front {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          padding: 6mm 7mm;
          display: flex;
          flex-direction: column;
        }
        .cd-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 88% 12%, rgba(255,69,0,0.5), transparent 55%);
          pointer-events: none;
        }
        .cd-front > * { position: relative; z-index: 1; }

        .cd-front-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: auto;
        }
        .cd-logo-row { display: flex; align-items: center; gap: 1.8mm; }
        .cd-logo-mark { width: 7mm; height: 7mm; flex-shrink: 0; display: block; }
        .cd-logo {
          font-size: 12pt; font-weight: 900;
          letter-spacing: -0.1mm; line-height: 1;
        }
        .cd-logo span { color: #ff4500; }

        .cd-badge {
          font-size: 5pt; font-weight: 900; letter-spacing: 0.2mm;
          padding: 0.6mm 2mm; border-radius: 1.5mm;
          background: rgba(255,69,0,0.25);
          border: 0.25mm solid rgba(255,69,0,0.5);
          color: #fd7e5a;
        }

        .cd-front-mid { margin-bottom: auto; }
        .cd-catch {
          font-size: 13pt; font-weight: 900;
          line-height: 1.35; letter-spacing: -0.1mm;
          margin: 0 0 1.5mm;
        }
        .cd-catch .accent { color: #fd7e5a; }
        .cd-sub {
          font-size: 6.5pt; color: #94a3b8;
          font-weight: 700; letter-spacing: 0.1mm;
        }

        .cd-front-foot {
          display: flex; justify-content: space-between; align-items: baseline;
          padding-top: 2mm;
          border-top: 0.25mm solid rgba(255,255,255,0.1);
        }
        .cd-role {
          font-size: 5.5pt; font-weight: 900; letter-spacing: 0.4mm;
          color: #fd7e5a;
        }
        .cd-year { font-size: 5.5pt; color: #64748b; font-weight: 700; }

        /* ========== 裏 ========== */
        .cd-back {
          background: #fff;
          border: 0.25mm solid #e2e8f0;
          padding: 4mm 5mm;
          display: grid;
          grid-template-columns: 1fr 22mm;
          gap: 3mm;
          align-items: center;
        }
        .cd-back-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .cd-offer-badge {
          display: inline-block;
          font-size: 5pt; font-weight: 900; letter-spacing: 0.25mm;
          padding: 0.6mm 2mm; border-radius: 1.5mm;
          background: linear-gradient(135deg, #ff4500, #f97316);
          color: #fff;
          margin-bottom: 1.5mm;
          align-self: flex-start;
        }
        .cd-offer-title {
          font-size: 7.5pt; font-weight: 900;
          color: #0f172a; line-height: 1.35; margin-bottom: 1.8mm;
        }
        .cd-offer-title .accent { color: #ff4500; }
        .cd-offer-code {
          font-family: 'Courier New', monospace;
          font-size: 11pt; font-weight: 900;
          letter-spacing: 0.5mm;
          color: #0f172a;
          background: #fff7ed;
          border: 0.4mm dashed #ff4500;
          border-radius: 1mm;
          padding: 1.5mm 2mm;
          text-align: center;
          margin-bottom: 1.5mm;
        }
        .cd-offer-note {
          font-size: 5pt; font-weight: 700;
          color: #64748b; line-height: 1.35;
        }
        .cd-back-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .cd-qr {
          display: inline-block;
          padding: 0.8mm;
          background: #fff;
          border: 0.25mm solid #e2e8f0;
          border-radius: 1mm;
        }
        .cd-back-company {
          position: absolute;
          bottom: 2mm;
          left: 5mm;
          right: 5mm;
          font-size: 5.5pt;
          color: #94a3b8;
          font-weight: 700;
          text-align: center;
          padding-top: 1.5mm;
          border-top: 0.25mm solid #e2e8f0;
        }

        /* ========== ガイド（画面のみ） ========== */
        .cd-guide {
          position: absolute;
          left: 59.5mm;
          width: 91mm;
          height: 55mm;
          border: 0.2mm dashed #cbd5e1;
          pointer-events: none;
        }
        .cd-guide--top    { top: 46.75mm; }
        .cd-guide--bottom { top: 195.25mm; }

        .cd-a4::before {
          content: "";
          position: absolute;
          left: 0; right: 0;
          top: 148.5mm;
          border-top: 0.2mm dashed #cbd5e1;
          pointer-events: none;
        }

        @media print {
          .cd-a4 {
            box-shadow: none !important;
            margin: 0 !important;
          }
          .cd-guide,
          .cd-a4::before { display: none !important; }
        }
      `}</style>
    </section>
  );
}
