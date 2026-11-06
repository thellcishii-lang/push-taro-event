'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css'; // ★ 共通CSSを読み込み

export default function CouponFirstClient() {
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
          <span className="current">初回クーポン</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-all">全プラン対応</span>
          <h1>🎫 初回クーポン</h1>
          <p>
            QRコードから通知登録したお客様に、設定しておくと<strong>自動で配布される初回特典</strong>です。
            PUSH通知を受け取ってもらうためにはまず登録してもらうための動機づけが必須となります。これがLIGHTプランから全てのプランに付いてます。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">🎫</span><div><strong>登録と同時に自動配布</strong><p>QRコードを読み取って登録が完了した瞬間に、クーポンが届きます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🔒</span><div><strong>1人1回のみ使用可能</strong><p>SMS認証で電話番号に紐づくため、使い回しは自動でブロックされます。</p></div></div>
            <div className="g-feature-item"><span className="ico">📅</span><div><strong>有効期限を設定可能</strong><p>「登録から30日以内」など、期限を設けて来店を促せます。期限切れのクーポンは削除ボタンで非表示にでき、日本時間で期限日の翌日には自動で非表示になります。使用履歴や二重使用防止の記録は削除されません。</p></div></div>
            <div className="g-feature-item"><span className="ico">📱</span><div><strong>QRコード消込</strong><p>お客様が提示したQRをお店側で読み取るだけで消込完了。使用済みの初回クーポンは、お客様の画面から自動的に非表示になります。利用記録はクーポン使用履歴から確認できます。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>こんな時に使う</h2>
          <div className="g-usecase-grid">
            <div className="g-usecase-card"><span className="ico">🆕</span><h4>常連客への導線を引く</h4><p>「登録で10%OFF」で、QRを読み取る動機を作る。</p></div>
            <div className="g-usecase-card"><span className="ico">🔁</span><h4>2回目来店の約束</h4><p>「次回使える」クーポンとして、再来店を促す。</p></div>
            <div className="g-usecase-card"><span className="ico">📊</span><h4>施策の効果測定</h4><p>初回クーポンの消込率で、施策の良し悪しがわかる。</p></div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>設定手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🏪 店舗・基本クーポン」タブを開く</h4>
                <p>「🎫 初回クーポン設定」セクションまでスクロール。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「初回クーポンを有効にする」にチェック</h4>
                <p>チェックを入れると、設定項目が表示されます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>タイトル・説明文・有効期限を入力</h4>
                <p>例：タイトル「初回10%OFFクーポン」、説明文「次回ご来店時にご利用ください」</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「💾 基本設定を保存」をタップ</h4>
                <p>これ以降に登録したお客様に、自動でクーポンが配布されます。</p>
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
              <div className="g-mockup-h3">🎫 初回クーポン設定</div>
              <div className="g-checkbox-row"><span className="g-checkbox is-on">✓</span><span>初回クーポンを有効にする</span></div>
              <div className="g-mockup-label">クーポンタイトル</div>
              <div className="g-mockup-input">初回10%OFFクーポン</div>
              <div className="g-mockup-label">説明文</div>
              <div className="g-mockup-input">次回ご来店時にご利用ください</div>
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
                <tr><td>割引率</td><td className="yes">10〜15%OFF</td><td>高すぎると常連客が離反する</td></tr>
                <tr><td>有効期限</td><td className="yes">30〜60日</td><td>短すぎず長すぎず、行動を促す</td></tr>
                <tr><td>タイトル</td><td className="yes">「初回」を明記</td><td>特別感を出し、新規と伝える</td></tr>
                <tr><td>特典内容</td><td className="yes">次回使える形式</td><td>登録と同時に「来店の約束」を作る</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="g-h2"><span className="num">6</span>業種別の活用例</h2>
          <div className="g-grid">
            <Link href="/guide/cafe" className="g-card"><span className="g-card-icon">☕</span><h4>飲食店・カフェ</h4><p>「ドリンク1杯無料」など、来店しやすい特典</p></Link>
            <div className="g-card"><span className="g-card-icon">💇</span><h4>美容室・サロン</h4><p>「初回カット10%OFF」で予約のハードルを下げる</p></div>
            <div className="g-card"><span className="g-card-icon">🍜</span><h4>ラーメン店</h4><p>「次回トッピング無料」で2杯目を促す</p></div>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/qr-acquisition" className="g-related-card">
                <span className="ico">📱</span>
                <div><div className="title">QRコード顧客獲得</div><div className="sub">登録の入り口</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-normal" className="g-related-card">
                <span className="ico">🎟️</span>
                <div><div className="title">通常クーポン</div><div className="sub">常設のクーポン（STANDARD+）</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-loyalty" className="g-related-card">
                <span className="ico">🏆</span>
                <div><div className="title">特別達成クーポン</div><div className="sub">3回来店で定着（STANDARD+）</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>初回クーポンで、確実に顧客を獲得</h3>
            <p>登録と同時に自動配布。手間なく、新規顧客をリスト化できます。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
