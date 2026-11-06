'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './torisetsu.css'; // ★ 共通CSSをインポート

export default function TorisetsuIndexClient() {
  return (
    <>
      <nav className="t-nav">
        <div className="t-nav-inner">
          <BrandLogo />
          <Link href="/guide" className="t-nav-link">📚 活用ガイド</Link>
        </div>
      </nav>

      <main className="t-main">
        <div className="t-hero">
          <span className="t-badge">User Manual</span>
          <h1>Push-taro 取扱説明書</h1>
          <p>ご利用中のプランに合わせて、実際の画面をもとに操作を図解で解説します。</p>
        </div>

        <div className="t-plan-grid">
          <Link href="/torisetsu/light-standard" className="t-plan-card">
            <div className="t-plan-icon">📗</div>
            <div className="t-plan-name">LIGHT / STANDARD</div>
            <div className="t-plan-desc">基本機能 + 通常・特別達成クーポン</div>
            <ul className="t-plan-list">
              <li>通知送信（月5,000〜15,000通）</li>
              <li>初回クーポン / 通常クーポン / 特別達成クーポン</li>
              <li>QRコード消込</li>
              <li>顧客管理ダッシュボード</li>
            </ul>
            <span className="t-plan-btn">取扱説明書を見る →</span>
          </Link>

          <Link href="/torisetsu/pro" className="t-plan-card is-pro">
            <span className="t-plan-badge">PRO</span>
            <div className="t-plan-icon">🔥</div>
            <div className="t-plan-name">PRO</div>
            <div className="t-plan-desc">全機能 + 予約配信 + 紹介報酬</div>
            <ul className="t-plan-list">
              <li><strong>配信無制限</strong></li>
              <li>ステップアップ / 連続クーポン</li>
              <li>記念日・誕生日 / 休眠復活クーポン</li>
              <li>予約配信・定期配信</li>
              <li>紹介報酬（10%）</li>
            </ul>
            <span className="t-plan-btn">取扱説明書を見る →</span>
          </Link>
        </div>
      </main>
    </>
  );
}
