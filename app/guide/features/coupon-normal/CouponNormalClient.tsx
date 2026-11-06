'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css';

export default function CouponNormalClient() {
  return (
    <>
      <nav className="g-nav">
        <div className="g-nav-inner">
          <BrandLogo />
          <Link href="/signup" className="g-nav-cta">今すぐ申し込む →</Link>
        </div>
      </nav>

      <main className="g-main">
        <div className="g-breadcrumb">
          <Link href="/guide">ガイド</Link>
          <span className="sep">/</span>
          <Link href="/guide/features">機能別</Link>
          <span className="sep">/</span>
          <span className="current">通常クーポン</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-std">STANDARD 以上</span>
          <h1>🎟️ 通常クーポン</h1>
          <p>
            登録者全員が<strong>何度でも使える常設クーポン</strong>です。
            LINE公式アカウントの「友だち特典」と同じ役割を、Webプッシュ通知で実現します。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">♾️</span><div><strong>何度でも使える</strong><p>同じお客様が繰り返し使えます。来店のたびに割引・特典を提供。</p></div></div>
            <div className="g-feature-item"><span className="ico">📅</span><div><strong>有効期限を設定</strong><p>「2026年末まで」など期間を設け、季節キャンペーンにも使えます。使用済み・期限切れのクーポンは削除ボタンで非表示にでき、日本時間で使用日・期限日の翌日には自動で非表示になります。使用履歴や二重使用防止の記録は残ります。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎯</span><div><strong>会員特典として運用</strong><p>「会員様はいつでも10%OFF」など、登録のメリットを継続的に提供。</p></div></div>
            <div className="g-feature-item"><span className="ico">📊</span><div><strong>利用回数を追跡</strong><p>誰が何回使ったかが記録され、特別達成クーポンのカウントにも使われます。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>こんな時に使う</h2>
          <div className="g-usecase-grid">
            <div className="g-usecase-card"><span className="ico">💳</span><h4>会員証代わり</h4><p>「会員様は常時10%OFF」で、登録のメリットを継続提供。</p></div>
            <div className="g-usecase-card"><span className="ico">🎉</span><h4>期間キャンペーン</h4><p>「今月限定・全品5%OFF」など、季節キャンペーンに。</p></div>
            <div className="g-usecase-card"><span className="ico">🍰</span><h4>リピーター優遇</h4><p>常連さんへの「いつもの」特典として。</p></div>
            <div className="g-usecase-card"><span className="ico">📈</span><h4>特別達成への布石</h4><p>通常クーポンを使わせて、回数カウントを進める。</p></div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>設定手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🏪 店舗・基本クーポン」タブを開く</h4>
                <p>初回クーポンの下にスクロールすると「🎟️ 通常クーポン設定」があります。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「通常クーポンを有効にする」にチェック</h4>
                <p>設定項目が表示されます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>タイトル・説明文・有効期限を入力</h4>
                <p>例：タイトル「会員様 10%OFF」、説明文「いつでも何度でもご利用いただけます」</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「💾 基本設定を保存」をタップ</h4>
                <p>登録済みのお客様の画面にも、すぐに反映されます。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">4</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span>📢 即時通知</span>
              <span className="is-active">🏪 店舗・基本クーポン</span>
              <span>🔥 PRO機能</span>
              <span>📅 予約</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">🎟️ 通常クーポン設定</div>
              <div className="g-checkbox-row"><span className="g-checkbox is-on">✓</span><span>通常クーポンを有効にする</span></div>
              <div className="g-mockup-label">クーポンタイトル</div>
              <div className="g-mockup-input">会員様 10%OFFクーポン</div>
              <div className="g-mockup-label">説明文・利用条件</div>
              <div className="g-mockup-input">いつでも何度でもご利用いただけます</div>
              <div className="g-mockup-label">有効期限</div>
              <div className="g-mockup-input">📅 2026-12-31</div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>おすすめ設定</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>項目</th><th>推奨</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr><td>割引率</td><td className="yes">5〜10%OFF</td><td>継続的に使うので、利益を圧迫しない範囲で</td></tr>
                <tr><td>有効期限</td><td className="yes">半年〜1年</td><td>常設の方が「登録メリット」を感じやすい</td></tr>
                <tr><td>利用条件</td><td className="yes">最低限に</td><td>「他のクーポンと併用不可」など、シンプルに</td></tr>
                <tr><td>タイトル</td><td className="yes">「会員様」を明記</td><td>登録者の特別感を演出</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="g-h2"><span className="num">6</span>この機能の活用法</h2>
          <p className="g-desc">
            通常クーポンは、業種ごとに「お店の会員であることのメリット」として設計します。<br />
            具体的な運用方法は、各業種のガイドで詳しく解説しています。
          </p>
          <div className="g-related-grid">
            <Link href="/guide/super" className="g-related-card">
              <span className="ico">🛒</span>
              <div>
                <div className="title">スーパー・小売店の活用法</div>
                <div className="sub">チラシ代替・フードロス対策として</div>
              </div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/guide/cafe" className="g-related-card">
              <span className="ico">☕</span>
              <div>
                <div className="title">飲食店・カフェの活用法</div>
                <div className="sub">アイドルタイムの稼働率向上に</div>
              </div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/guide/apparel" className="g-related-card">
              <span className="ico">👕</span>
              <div>
                <div className="title">アパレル・雑貨の活用法</div>
                <div className="sub">ゲリラ的なセール告知として</div>
              </div>
              <span className="arrow">→</span>
            </Link>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>通常クーポンは「特別達成クーポン」の前提</strong>
              <p>お客様が通常クーポンを使うたびに、<strong>来店回数が自動カウント</strong>されます。規定回数に達すると「特別達成クーポン」が解放される仕組みです。</p>
            </div>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/coupon-first" className="g-related-card">
                <span className="ico">🎫</span>
                <div><div className="title">初回クーポン</div><div className="sub">登録時の特典</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-loyalty" className="g-related-card">
                <span className="ico">🏆</span>
                <div><div className="title">特別達成クーポン</div><div className="sub">N回来店で解放</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-stepup" className="g-related-card">
                <span className="ico">🐾</span>
                <div><div className="title">ステップアップクーポン</div><div className="sub">PRO限定</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>通常クーポンで、継続的な来店を</h3>
            <p>「会員様特典」を常設化して、リピートの動機を作りましょう。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
