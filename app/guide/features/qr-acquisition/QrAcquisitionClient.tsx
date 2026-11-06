'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css'; // ★ 共通CSSを読み込み

export default function QrAcquisitionClient() {
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
          <span className="current">QRコード顧客獲得</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-all">全プラン対応</span>
          <h1>📱 QRコード顧客獲得</h1>
          <p>
            店頭POPにQRコードを置くだけで、お客様は<strong>スマホで読み取るだけ</strong>で通知登録が完了。
            アプリのインストール不要で、顧客リストが自動で構築されていきます。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">📱</span><div><strong>アプリ不要で登録完了</strong><p>お客様はブラウザからQRを読み取って「通知を許可」するだけ。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎫</span><div><strong>登録と同時に初回クーポン配布</strong><p>登録完了と同時に、初回限定クーポンが自動配信されます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🏪</span><div><strong>店舗ごとに独立したPWA</strong><p>店舗名・アイコンがホーム画面に追加され、専用アプリのように動作。</p></div></div>
            <div className="g-feature-item"><span className="ico">📊</span><div><strong>登録数の自動集計</strong><p>ダッシュボードで現在の登録者数がいつでも確認できます。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>お客様の登録フロー</h2>
          <div className="g-flow">
            <div className="g-flow-item"><div className="g-flow-circle">1</div><p>QRスキャン</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">2</div><p>iPhoneは<br />ホーム画面追加</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">3</div><p>SMS認証</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-success">🎉</div><p>登録完了<br />クーポン配布</p></div>
          </div>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <strong>iPhoneは「ホーム画面に追加」が必須</strong>
              <p>iOSの仕様上、Safariの通常タブからではWebプッシュ通知を受け取れません。
              Safari下部の<strong>共有ボタン（□に↑）→「ホーム画面に追加」</strong>をタップし、
              ホーム画面のアイコンから開いて登録する必要があります。<br />
              登録画面には、この手順を自動表示するのでご安心ください。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>SMS認証について</h2>
          <p className="g-desc">
            Push-taroでは、<strong>不正利用防止のためSMS認証</strong>を採用しています。
            クーポンの使い回しを防ぎ、店舗の貴重なクーポンを守ります。
          </p>
          <div className="g-sms-grid">
            <div className="g-sms-card is-bad">
              <div className="g-sms-badge is-bad">SMS認証なしの場合</div>
              <ul>
                <li>同じ人が何度も登録し直せる</li>
                <li>初回クーポンを何度も使い回せる</li>
                <li>店舗のクーポンが不正消費される</li>
              </ul>
            </div>
            <div className="g-sms-card is-good">
              <div className="g-sms-badge is-good">SMS認証ありの場合</div>
              <ul>
                <li>電話番号1つにつき<strong>1回のみ</strong>登録可能</li>
                <li>初回クーポンの使い回しを完全ブロック</li>
                <li>お客様は安心してご利用いただける</li>
              </ul>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">4</span>設定手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🏪 店舗・基本クーポン」タブを開く</h4>
                <p>店舗名とアイコンを設定し、「💾 基本設定を保存」をタップ。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>QRコードをダウンロード or 印刷</h4>
                <p>画面に表示されるQRコードを、POPに印刷して店頭に設置。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>初回クーポンを設定</h4>
                <p>登録と同時に配布される初回クーポンを有効化。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>店頭POPにQRを設置</h4>
                <p>レジ横・テーブル・鏡前など、目につく場所に複数設置がおすすめ。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span>📢 即時通知</span>
              <span className="is-active">🏪 店舗・基本クーポン</span>
              <span>🔥 PRO機能</span>
              <span>📅 予約</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">🏪 店舗基本情報 & クーポン設定</div>
              <div className="g-mockup-label">店舗名</div>
              <div className="g-mockup-input">Patisserie Taro</div>
              <div className="g-mockup-label">店舗ID</div>
              <div className="g-mockup-input">example1234567890</div>
              <div className="g-qr-preview">
                <div className="g-qr-box">
                  <div className="g-qr-dots"></div>
                </div>
                <p className="g-qr-caption">📱 スマホで読み取って通知を受け取れます</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">6</span>QRコード設置のコツ</h2>
          <div className="g-grid">
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">📍</span><h4>複数箇所に設置</h4><p>レジ横・テーブル・鏡前・トイレなど、目につく場所に。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">🎁</span><h4>特典を明記</h4><p>「登録で10%OFF」など、登録メリットを大きく表示。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">📢</span><h4>スタッフの声かけ</h4><p>会計時に「よろしければこちらから」と自然に案内。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">⏰</span><h4>タイミング</h4><p>満足度が高い会計直後が最も登録率が高い。</p></div>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/coupon-first" className="g-related-card">
                <span className="ico">🎫</span>
                <div><div className="title">初回クーポン</div><div className="sub">登録時の特典</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/ng-actions" className="g-related-card">
                <span className="ico">⚠️</span>
                <div><div className="title">NG行為集</div><div className="sub">強引な誘導はNG</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>QRコードで、顧客リストを自動構築</h3>
            <p>店頭POPに置くだけで、お客様が自然に登録してくれます。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
