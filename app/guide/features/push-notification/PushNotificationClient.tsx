'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css'; // ★ 共通CSSを読み込み

export default function PushNotificationClient() {
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
          <span className="current">プッシュ通知</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-all">全プラン対応</span>
          <h1>📢 プッシュ通知</h1>
          <p>
            登録済みのお客様全員に、一斉に通知を配信する基本機能です。
            タイトル・本文・リンク先URLを自由に設定でき、開封率はなんと！メルマガの約3倍。
          </p>
        </div>

        <div className="g-content">

          {/* 1. できること */}
          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">📢</span><div><strong>全登録者へ一斉配信</strong><p>QRコードから登録したお客様全員に、1回の操作で通知を届けます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🔗</span><div><strong>リンク遷移</strong><p>タップで任意のURL（店舗サイト・予約ページ等）に遷移させられます。</p></div></div>
            <div className="g-feature-item"><span className="ico">📊</span><div><strong>送信数・成功数の記録</strong><p>送信履歴が自動で保存され、いつでも確認できます。</p></div></div>
          </div>

          {/* 2. こんな時に使う */}
          <h2 className="g-h2"><span className="num">2</span>こんな時に使う</h2>
          <div className="g-usecase-grid">
            <div className="g-usecase-card"><span className="ico">🔥</span><h4>セール・キャンペーン告知</h4><p>「本日限定20%OFF」を即時配信。来店動機を刺激。</p></div>
            <div className="g-usecase-card"><span className="ico">🍰</span><h4>新商品入荷の告知</h4><p>新メニュー・の特徴などを配信。</p></div>
            <div className="g-usecase-card"><span className="ico">☔</span><h4>天候に応じた配信</h4><p>「雨の日限定」を当日の天気に合わせて送信。</p></div>
            <div className="g-usecase-card"><span className="ico">⏰</span><h4>アイドルタイム対策</h4><p>「今空いてます」をリアルタイムで配信。</p></div>
          </div>

          {/* 3. 設定手順 */}
          <h2 className="g-h2"><span className="num">3</span>送信手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「📢 即時通知・消し込み」タブを開く</h4>
                <p>ログイン後、初期表示されるタブです。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>タイトルと本文を入力</h4>
                <p>タイトルは30文字以内、本文は100文字以内が読みやすいとされています。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>リンク先URLを設定（任意）</h4>
                <p>タップ時の遷移先を指定します。未設定の場合は店舗ページへ遷移します。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🔥 Push 通知送信」をタップ</h4>
                <p>送信が完了すると、送信履歴に記録されます。</p>
              </div>
            </div>
          </div>

          {/* 4. 画面イメージ */}
          <h2 className="g-h2"><span className="num">4</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span className="is-active">📢 即時通知</span>
              <span>🏪 店舗設定</span>
              <span>🔥 PRO機能</span>
              <span>📅 予約</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">📢 プッシュ通知を作成</div>
              <div className="g-mockup-label">タイトル</div>
              <div className="g-mockup-input">本日限定 20%OFFセール</div>
              <div className="g-mockup-label">本文</div>
              <div className="g-mockup-textarea">18時まで！新作スイーツも入荷しました🍰</div>
              <div className="g-mockup-label">リンク先URL（任意）</div>
              <div className="g-mockup-input">https://example.com/sale</div>
              <div className="g-mockup-btn">🔥 Push 通知送信</div>
            </div>
          </div>

          {/* 5. おすすめ設定 */}
          <h2 className="g-h2"><span className="num">5</span>おすすめ設定</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>項目</th><th>推奨</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr><td>タイトル</td><td className="yes">30文字以内</td><td>スマホの通知画面で切れずに表示</td></tr>
                <tr><td>本文</td><td className="yes">100文字以内</td><td>通知プレビューで全体が見える</td></tr>
                <tr><td>配信頻度</td><td className="yes">週2〜3回まで</td><td>しつこいと通知OFFにされやすい</td></tr>
                <tr><td>配信時間</td><td className="yes">10〜20時</td><td>深夜・早朝は不快感を与える</td></tr>
                <tr><td>絵文字</td><td className="yes">1〜2個</td><td>視認性アップ。多用しすぎはNG</td></tr>
              </tbody>
            </table>
          </div>

          {/* 6. 業種別活用例 */}
          <h2 className="g-h2"><span className="num">6</span>業種別の活用例</h2>
          <div className="g-grid">
            <Link href="/guide/cafe" className="g-card"><span className="g-card-icon">☕</span><h4>飲食店・カフェ</h4><p>雨の日割引、本日の日替わりメニュー告知</p></Link>
            <div className="g-card"><span className="g-card-icon">💇</span><h4>美容室・サロン</h4><p>空き枠のお知らせ、季節のスタイル紹介</p></div>
            <Link href="/guide/apparel" className="g-card"><span className="g-card-icon">👕</span><h4>アパレル</h4><p>新作入荷、セール開始の告知</p></Link>
            <div className="g-card"><span className="g-card-icon">🍺</span><h4>バー・居酒屋</h4><p>本日のオススメ、スポーツ中継の告知</p></div>
          </div>

          {/* 関連機能 */}
          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/scheduled-push" className="g-related-card">
                <span className="ico">📅</span>
                <div><div className="title">予約配信</div><div className="sub">日時指定で自動送信（PRO）</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-first" className="g-related-card">
                <span className="ico">🎫</span>
                <div><div className="title">初回クーポン</div><div className="sub">登録時の自動配信</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/ng-actions" className="g-related-card">
                <span className="ico">⚠️</span>
                <div><div className="title">NG行為集</div><div className="sub">炎上を避けるために</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>プッシュ通知で、確実にリピートを促す</h3>
            <p>メルマガの約3倍の開封率。Push-taroなら、登録者全員に一斉配信できます。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
