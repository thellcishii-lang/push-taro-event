'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css';

export default function StorePopClient() {
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
          <span className="current">店頭POP印刷</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-std">STANDARD+</span>
          <h1>🖨️ 店頭POP印刷</h1>
          <p>
            レジ横やカウンターに置く<strong>QRコードポップを印刷</strong>できる機能です。
            お客様がスマホで読み取るだけで通知登録が完了し、その場で初回クーポンが使えます。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">📄</span><div><strong>A4 / B5の2サイズ</strong><p>レジ横に立てるA4、カウンターに置くB5。店舗の状況に合わせて選べます。</p></div></div>
            <div className="g-feature-item"><span className="ico">✨</span><div><strong>店舗名とQRコード入り</strong><p>お客様はQRを読み取るだけ。アプリ不要、30秒で通知登録が完了します。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎁</span><div><strong>初回クーポンが自動表示</strong><p>初回クーポンが設定されていれば、ポップに自動で反映されます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🖨️</span><div><strong>管理画面からすぐ印刷</strong><p>PDFがダウンロードできるので、コンビニのマルチコピー機でも印刷可能です。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>店頭POPが最強の登録動機になる理由</h2>
          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>「未来のお得」ではなく「目の前のお得」</strong>
              <p>お会計時に「これ、今日使えるから登録するとお得ですよ」と一言添えるだけ。<br />
              お客様は「次回使える」ではなく<strong>「今すぐ使える」</strong>特典を得られるため、その場での登録率が爆発的に上がります。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>設定・印刷手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🏪 店舗設定」タブを開く</h4>
                <p>「店頭POP（印刷用）」セクションまでスクロール。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>サイズを選択（A4 / B5）</h4>
                <p>お店のレイアウトに合わせて選びます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>印刷してレジ横に設置</h4>
                <p>ダウンロードしたPDFを印刷し、カウンターやレジ横に置きます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>お客様に「今すぐ使える」を案内</h4>
                <p>お会計時に「登録すると今すぐ使えますよ」と一言添えましょう。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">4</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span>📢 即時配信</span>
              <span>📋 送信履歴</span>
              <span>🎫 消込履歴</span>
              <span className="is-active-sky">🏪 店舗設定</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">🖨️ 店頭POP（印刷用）</div>
              <div className="g-mockup-grid">
                <div className="g-mockup-btn is-outline">📄 A4縦</div>
                <div className="g-mockup-btn is-outline">📄 B5縦</div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>PDFがダウンロードされます。コンビニ印刷も可能です。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>設置のコツ</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>場所</th><th>推奨サイズ</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr><td>レジ横（会計時）</td><td className="yes">B5縦</td><td>スタッフが手渡ししやすく、会話のきっかけになる</td></tr>
                <tr><td>カウンター・テーブル</td><td className="yes">B5縦</td><td>お客様が待ち時間に自分で読み取れる</td></tr>
                <tr><td>入口・店内ポスター</td><td className="yes">A4縦</td><td>目立つ場所に置くことで、入店時から目に入る</td></tr>
                <tr><td>持ち帰り用チラシ</td><td className="yes">B5縦</td><td>購入商品に同梱して、自宅で登録してもらう</td></tr>
              </tbody>
            </table>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/qr-acquisition" className="g-related-card">
                <span className="ico">📱</span>
                <div><div className="title">QRコード顧客獲得</div><div className="sub">店頭POPから登録する仕組み</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-first" className="g-related-card">
                <span className="ico">🎫</span>
                <div><div className="title">初回クーポン</div><div className="sub">登録時に配布する特典</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>店頭POPで、登録率を最大化</h3>
            <p>「今日、これ使えます」が最強の登録動機になります。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
