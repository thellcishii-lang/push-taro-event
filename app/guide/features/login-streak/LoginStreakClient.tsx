'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css';

export default function LoginStreakClient() {
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
          <span className="current">連続ログイン特典</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-pro">🔥 PRO 限定</span>
          <h1>🔥 連続ログイン特典</h1>
          <p>
            アプリを開く習慣をつけ、<strong>連続達成でクーポンをプレゼント</strong>する仕組みです。
            1日でも途切れるとリセットされますが、リマインド通知で継続を後押しします。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">🎯</span><div><strong>目標日数を自由に設定</strong><p>1〜10日の間でスライダーを動かして設定します。</p></div></div>
            <div className="g-feature-item"><span className="ico">🔥</span><div><strong>毎日スタンプを押す</strong><p>お客様はアプリを開いて「今日のスタンプを押す」をタップするだけ。</p></div></div>
            <div className="g-feature-item"><span className="ico">⏰</span><div><strong>リマインド通知</strong><p>「あと1日で達成！」というタイミングで、自動でプッシュ通知を送信します。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎉</span><div><strong>達成時は紙吹雪でお祝い</strong><p>達成した瞬間、画面上に紙吹雪とモーダルが表示され、クーポンを獲得できます。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>仕組みとリマインド</h2>
          <div className="g-flow">
            <div className="g-flow-item"><div className="g-flow-circle">1日目</div><p>スタンプ</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle">2日目</div><p>スタンプ</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle">3日目</div><p>スタンプ</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">あと1日</div><p>リマインド通知</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-success">🎉</div><p>目標達成</p></div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>リマインド通知で「リセットのショック」を防ぐ</strong>
              <p>あと1日で達成！というタイミングで通知が届くので、うっかり忘れて途切れるのを防ぎます。<br />
              毎日夕方18時に自動送信されます。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>設定手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🔥 PRO機能」タブを開く</h4>
                <p>「🔥 連続ログイン特典」セクションまでスクロール。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「有効にする」をONに</h4>
                <p>設定項目が表示されます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>目標日数を設定（1〜10日）</h4>
                <p>スライダーを動かして、目標日数を決めます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>達成時のクーポン名を入力</h4>
                <p>POSレジや顧客画面には、この名前で表示されます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>リマインド通知を設定（任意）</h4>
                <p>ONにすると、通知タイトルと本文をカスタムできます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「✅ 設定完了」をタップ</h4>
                <p>以降、お客様の画面にスタンプカードが表示されます。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">4</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span>📢 即時配信</span>
              <span>📋 送信履歴</span>
              <span>🎫 消込履歴</span>
              <span>🏪 店舗設定</span>
              <span className="is-active-green">🔥 PRO機能</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">🔥 連続ログイン特典</div>
              <div className="g-checkbox-row"><span className="g-checkbox is-on">✓</span><span>有効にする</span></div>
              <div className="g-mockup-inline">目標日数: 5 日</div>
              <div className="g-mockup-input">5日連続ログイン達成！特別10%OFFクーポン</div>
              <div className="g-checkbox-row"><span className="g-checkbox is-on">✓</span><span>リマインド通知を送る</span></div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>おすすめ設定</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>項目</th><th>推奨</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr><td>目標日数</td><td className="yes">3〜7日</td><td>長すぎると達成が困難に。まずは1週間以内</td></tr>
                <tr><td>クーポン内容</td><td className="yes">通常より少し豪華</td><td>「5日連続で10%OFF」など、努力に見合う特典</td></tr>
                <tr><td>リマインド通知</td><td className="yes">ON</td><td>あと1日での挫折を防ぐ</td></tr>
                <tr><td>通知タイトル</td><td className="yes">「あと1日でクーポンGET！🔥」</td><td>絵文字で開封率アップ</td></tr>
              </tbody>
            </table>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/coupon-stepup" className="g-related-card">
                <span className="ico">🐾</span>
                <div><div className="title">ステップアップクーポン</div><div className="sub">来店回数で特典アップ</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/push-notification" className="g-related-card">
                <span className="ico">📢</span>
                <div><div className="title">プッシュ通知</div><div className="sub">リマインド通知の仕組み</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>アプリを開く習慣を、クーポンで。</h3>
            <p>毎日開いてもらうことで、自然とお店のことが頭に残ります。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
