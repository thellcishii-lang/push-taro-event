'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css';

export default function CouponRepeatClient() {
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
          <span className="current">連続クーポン</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-pro">🔥 PRO 限定</span>
          <h1>🔄 連続クーポン</h1>
          <p>
            クーポン消込と同時に<strong>次回使えるクーポンを即時発行</strong>する仕組みです。
            「消込→次回クーポン→来店」のループが自動化され、来店サイクルを短縮できます。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">⚡</span><div><strong>消込と同時に次回クーポン発行</strong><p>お客様が会計時にQRを提示した瞬間、次のクーポンが自動で届きます。</p></div></div>
            <div className="g-feature-item"><span className="ico">📅</span><div><strong>有効期限で来店を促す</strong><p>「14日以内」など期限を設けて、来店サイクルを短縮。</p></div></div>
            <div className="g-feature-item"><span className="ico">🔗</span><div><strong>他クーポンとの併用可否</strong><p>特別達成クーポンとの併用可否を選択できます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🔄</span><div><strong>半永久的にループ</strong><p>設定した有効期限内に再来店するたびに、次のクーポンが発行され続けます。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>仕組み</h2>
          <div className="g-flow">
            <div className="g-flow-item"><div className="g-flow-circle">来店</div><p>クーポン利用</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">消込</div><p>QRスキャン</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">次回クーポン</div><p>自動発行</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-success">🔄</div><p>再来店で<br />また発行</p></div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>「今度いつ行こう？」を自動で解決</strong>
              <p>通常、来店後に次の予定を決めるのはお客様自身です。
              連続クーポンなら「あと14日以内に行けば、また特典がある」という状態が常に続くので、自然と来店が習慣化します。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>設定手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🔥 PRO機能」タブを開く</h4>
                <p>「🔄 連続クーポン」セクションまでスクロール。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「有効にする」にチェック</h4>
                <p>設定項目が表示されます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>次回クーポンのタイトルを入力</h4>
                <p>例：「次回使える10%OFFクーポン」</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>有効期限（日数 or 日付固定）を設定</h4>
                <p>「14日間」がもっとも効果的とされています。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「✅ 設定完了」をタップ</h4>
                <p>以降、通常クーポンの消込と同時に連続クーポンが発行されます。</p>
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
              <div className="g-mockup-h3">🔄 連続クーポン</div>
              <div className="g-checkbox-row"><span className="g-checkbox is-on">✓</span><span>有効にする</span></div>
              <div className="g-mockup-label">次回使える特典タイトル</div>
              <div className="g-mockup-input">次回使える 10%OFFクーポン</div>
              <div className="g-mockup-label">有効期限</div>
              <div className="g-mockup-input">出現から 14 日間</div>
              <div className="g-checkbox-row"><span className="g-checkbox">□</span><span>特別達成クーポンに追加する</span></div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>おすすめ設定</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>項目</th><th>推奨</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr><td>有効日数</td><td className="yes">14日間</td><td>短すぎず長すぎず、来店を促すベストな期間</td></tr>
                <tr><td>特典内容</td><td className="yes">5〜10%OFF</td><td>連続で使うので利益を圧迫しない範囲で</td></tr>
                <tr><td>タイトル</td><td className="yes">「次回使える」を明記</td><td>「次の来店」を想起させる</td></tr>
                <tr><td>併用可否</td><td className="yes">不可</td><td>連続使用のため、他のクーポンと重複させない</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="g-h2"><span className="num">6</span>この機能の活用法</h2>
          <p className="g-desc">
            連続クーポンは、<strong>「来店サイクルを短くしたい業種」</strong>と相性抜群です。<br />
            具体的な運用方法は、各業種のガイドで詳しく解説しています。
          </p>
          <div className="g-related-grid">
            <Link href="/guide/bakery" className="g-related-card">
              <span className="ico">🥐</span>
              <div>
                <div className="title">パン屋・ベーカリーの活用法</div>
                <div className="sub">週末の楽しみを逃さない</div>
              </div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/guide/cafe" className="g-related-card">
              <span className="ico">☕</span>
              <div>
                <div className="title">飲食店・カフェの活用法</div>
                <div className="sub">ランチからディナーへの誘導</div>
              </div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/guide/super" className="g-related-card">
              <span className="ico">🛒</span>
              <div>
                <div className="title">スーパー・小売店の活用法</div>
                <div className="sub">次回のまとめ買いを促す</div>
              </div>
              <span className="arrow">→</span>
            </Link>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/coupon-loyalty" className="g-related-card">
                <span className="ico">🏆</span>
                <div><div className="title">特別達成クーポン</div><div className="sub">N回来店で解放</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-stepup" className="g-related-card">
                <span className="ico">🐾</span>
                <div><div className="title">ステップアップクーポン</div><div className="sub">段階的に特典アップ</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-dormant" className="g-related-card">
                <span className="ico">💤</span>
                <div><div className="title">休眠復活クーポン</div><div className="sub">離反客を呼び戻す</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>連続クーポンで、来店サイクルを短縮</h3>
            <p>消込と同時に次回クーポンを自動発行。リピートのループを作りましょう。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
