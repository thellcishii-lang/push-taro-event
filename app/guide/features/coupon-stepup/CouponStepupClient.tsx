'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css';

export default function CouponStepupClient() {
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
          <span className="current">ステップアップクーポン</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-pro">🔥 PRO 限定</span>
          <h1>🐾 ステップアップクーポン</h1>
          <p>
            来店回数に応じて<strong>段階的に特典が豪華になる</strong>仕組みです。
            最大10段階まで設定でき、来店習慣を強力に後押しします。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">📈</span><div><strong>段階的に特典アップ</strong><p>1回目は小さな特典、5回目は大きな特典…と、ステップを設計できます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🔟</span><div><strong>最大10段階まで設定可能</strong><p>来店回数に応じて、きめ細かく特典を設計できます。</p></div></div>
            <div className="g-feature-item"><span className="ico">📅</span><div><strong>各段階に有効期限を設定</strong><p>「出現から7日間」「日付固定」など、ステップごとに期限を設定可能。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎯</span><div><strong>他クーポンとの併用可否</strong><p>各ステップで「他クーポンと併用可/不可」を選択できます。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>仕組み</h2>
          <div className="g-flow">
            <div className="g-flow-item"><div className="g-flow-circle">1回目</div><p>¥100引き</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle">2回目</div><p>¥200引き</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle">3回目</div><p>¥300引き</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">4回目</div><p>¥500引き</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-success">🎉</div><p>5回目<br />特別特典</p></div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>「次のステップ」が見えるから、来店が習慣化する</strong>
              <p>お客様は「あと2回来れば¥500引き」という明確な目標を持てます。
              通常クーポンより強い動機づけになり、来店頻度が自然と上がります。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>設定手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🔥 PRO機能」タブを開く</h4>
                <p>「🐾 ステップアップクーポン」セクションまでスクロール。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「有効にする」にチェック</h4>
                <p>ステップ 1・2 の初期値が表示されます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>各ステップのタイトル・有効日数を入力</h4>
                <p>「1回目来店特典」「2回目来店特典」…のように設定。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>ステップを追加（最大10段階）</h4>
                <p>「＋ステップを追加」ボタンで、必要な段階まで増やせます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「✅ 設定完了」をタップ</h4>
                <p>以降、通常クーポンを消し込むたびにステップが進みます。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">4</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span>📢 即時通知</span>
              <span>🏪 店舗設定</span>
              <span className="is-active-green">🔥 PRO機能</span>
              <span>📅 予約</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">🐾 ステップアップクーポン</div>
              <div className="g-checkbox-row"><span className="g-checkbox is-on">✓</span><span>有効にする</span></div>
              <div className="g-step-mockup">
                <div className="g-step-title">ステップ 1</div>
                <div className="g-mockup-input">1回目来店特典</div>
                <div className="g-mockup-inline">有効日数: 7 日間</div>
              </div>
              <div className="g-step-mockup">
                <div className="g-step-title">ステップ 2</div>
                <div className="g-mockup-input">2回目来店特典</div>
                <div className="g-mockup-inline">有効日数: 14 日間</div>
              </div>
              <div className="g-mockup-addbtn">＋ ステップを追加（最大10段階）</div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>おすすめ設定</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>項目</th><th>推奨</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr><td>ステップ数</td><td className="yes">3〜5段階</td><td>多すぎると設計が複雑に。まずは3段階から</td></tr>
                <tr><td>特典内容</td><td className="yes">段階的にアップ</td><td>1回目：¥100引き → 5回目：特別メニュー無料</td></tr>
                <tr><td>有効日数</td><td className="yes">7〜14日間</td><td>「今月中に来ないと」の心理を活用</td></tr>
                <tr><td>併用可否</td><td className="yes">最初は不可</td><td>他のクーポンと重複すると割引が過剰になる</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="g-h2"><span className="num">6</span>業種別の活用例</h2>
          <div className="g-grid">
            <Link href="/guide/cafe" className="g-card"><span className="g-card-icon">☕</span><h4>飲食店・カフェ</h4><p>「1回目：ドリンク50円引き → 5回目：デザート無料」</p></Link>
            <div className="g-card"><span className="g-card-icon">💇</span><h4>美容室・サロン</h4><p>「1回目：トリートメント10%OFF → 5回目：ヘッドスパ無料」</p></div>
            <div className="g-card"><span className="g-card-icon">🍜</span><h4>ラーメン店</h4><p>「3回目：味玉無料 → 5回目：チャーシュー増量」</p></div>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/coupon-loyalty" className="g-related-card">
                <span className="ico">🏆</span>
                <div><div className="title">特別達成クーポン</div><div className="sub">1回の達成で解放</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-repeat" className="g-related-card">
                <span className="ico">🔄</span>
                <div><div className="title">連続クーポン</div><div className="sub">消込で次回分発行</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>ステップアップで、来店を習慣に</h3>
            <p>段階的に特典をアップして、自然なリピートサイクルを作りましょう。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
