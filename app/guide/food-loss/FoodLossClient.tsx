'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function FoodLossClient() {
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
          <span className="current">フードロス削減</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">♻️ フードロス削減</span>
          <h1>フードロスを、売上に。<br />スーパー・コンビニのための<br />食品ロス対策ガイド</h1>
          <p>
            毎日廃棄される「賞味期限間近の商品」。<br />
            これらを<strong>プッシュ通知によるタイムセール配信</strong>と、<br />
            <strong>環境省推奨のmottECOパッケージ</strong>で解決し、<br />
            店舗の利益と社会貢献を両立させましょう。
          </p>
        </div>

        <div className="g-content">

          <h2><span className="num">1</span>フードロスは、店舗の「赤字」です</h2>
          <p>
            スーパーやコンビニ、飲食店にとって、売れ残った食品の廃棄は、そのまま**店舗の損失（赤字）**に直結します。
          </p>
          <div className="g-callout danger">
            <span className="ico">🚨</span>
            <div>
              <p><strong>廃棄ロス ＝ 売上機会の損失 ＋ 廃棄コスト</strong></p>
              <p>
                「捨てる」ことは、ただ利益が出ないだけでなく、処分するためのコストもかかります。<br />
                さらに、環境省が推奨するSDGsの観点からも、食品ロスの削減は企業の責務になりつつあります。
              </p>
            </div>
          </div>

          <h2><span className="num">2</span>解決策①：Push-taroで「タイムセール」を通知する</h2>
          <p>
            「賞味期限が近い」「売れ残りそう」という商品を、お客様のスマホに直接お知らせします。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>夕方に「今すぐ半額」を配信</h4>
                <p>「本日限定！お弁当全品半額。19時まで」とプッシュ通知を送るだけで、即座にお客様が来店します。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>クーポン発行は0通</h4>
                <p>Push-taroでは、クーポンを発行しても配信数は消費されません。無制限のPROプランなら、毎日配信しても月定額1万円。</p>
              </div>
            </div>
          </div>

          <h2><span className="num">3</span>解決策②：mottECO（モッテコ）の導入で、持ち帰りを後押し</h2>
          <p>
            「店内で食べきれなかった料理を持ち帰りたい」「スーパーのお惣菜を自分の袋で持ち帰りたい」というニーズに応えるのが、環境省推奨の<strong>mottECO（モッテコ）</strong>の取り組みです。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>環境省推奨のmottECOロゴ入りパッケージ</strong></p>
              <p>
                店舗で食品ロスを削減するための「持ち帰り用容器」として、環境省が推奨するmottECOのロゴ入りパッケージがあります。<br />
                当社（the合同会社）が運営する<strong>mottecogoods.com</strong>では、環境省推奨のmottECOロゴ入りペーパーボックスを格安でご提供しています。
              </p>
            </div>
          </div>

          <div className="g-card" style={{ textAlign: 'center', marginTop: '32px' }}>
            <h4>motteco（モッテコ）について</h4>
            <p style={{ marginBottom: '24px' }}>
              食べ残しを持ち帰る「mottECO」の文化を広めるための、環境省推奨のパッケージ資材。<br />
              フードロス削減と、お客様の満足度向上を両立します。
            </p>
            <a href="https://mottecogoods.com" target="_blank" rel="noopener noreferrer" className="g-cta-btn" style={{ display: 'inline-block' }}>
              mottECOロゴ入りパッケージを見る →
            </a>
          </div>

          <h2><span className="num">4</span>「売る仕組み」と「持ち帰る仕組み」でロスゼロへ</h2>
          <p>
            Push-taroの通知で売り切れを防ぎ、mottECOのパッケージで食べ残しを持ち帰ってもらう。<br />
            この2つの取り組みが揃えば、店舗のフードロスは大幅に削減できます。
          </p>

          <div className="g-quote is-orange">
            売れ残りは、通知で売る。<br />
            食べ残しは、mottECOで持ち帰る。<br /><br />
            これが、これからの店舗のスタンダードです。
          </div>

          {/* 関連ガイド */}
          <div className="g-related">
            <h3>関連ガイド</h3>
            <div className="g-related-grid">
              <Link href="/guide/super" className="g-related-card">
                <span className="ico">🛒</span>
                <div>
                  <div className="title">スーパー・小売店向け</div>
                  <div className="sub">チラシをプッシュ通知に置き換える</div>
                </div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/line-comparison" className="g-related-card">
                <span className="ico">📊</span>
                <div>
                  <div className="title">LINE公式アカウントとの比較</div>
                  <div className="sub">配信上限という壁を、数字で解説</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>フードロス削減を、仕組みに。</h3>
            <p>Push-taroのプッシュ通知で、売れ残りを売上に変えましょう。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
