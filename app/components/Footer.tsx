'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="100%" stopColor="#ff4500" />
                  </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="23" fill="url(#footerLogoGrad)" />
                <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
                <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
                <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
                <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
                <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
              </svg>
              <span>Push-taro<span className="dot">.</span></span>
            </div>
            <p className="footer-desc">
              実店舗のリピート施策を「プッシュ通知 × クーポンアプリ」で自動化するSaaS。<br />
              顧客データを集めず、QRコード一つで始められます。
            </p>
            <div className="footer-badge">
              <span className="footer-badge-dot"></span>
              2026年9月 サービス開始
            </div>
          </div>
          
          <div className="footer-links-wrap">
            <div className="footer-col">
              <h4 className="footer-col-title">サービス</h4>
              <ul className="footer-col-list">
                <li><Link href="/">Push-taro トップ</Link></li>
                <li><Link href="/guide/pos-integration">POSレジ連携</Link></li>
                <li><Link href="/guide/features/store-pop">店頭POP印刷</Link></li>
                <li><Link href="/partners">収益化プログラム</Link></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4 className="footer-col-title">活用ガイド</h4>
              <ul className="footer-col-list">
                <li><Link href="/guide">ガイドTOP</Link></li>
                <li><Link href="/guide/features">機能別ガイド</Link></li>
                <li><Link href="/guide/ng-actions">NG行為集</Link></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4 className="footer-col-title">サポート</h4>
              <ul className="footer-col-list">
                <li><Link href="/contact">お問い合わせ</Link></li>
                <li><Link href="/terms">利用規約</Link></li>
                <li><Link href="/privacy">プライバシーポリシー</Link></li>
                <li><Link href="/tokusho">特定商取引法</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">&copy; 2026 Push-taro All Rights Reserved. ｜ 運営：the合同会社</p>
          <p className="footer-address">〒357-0123 埼玉県飯能市中下郷23-21</p>
        </div>
      </div>
    </footer>
  );
}
