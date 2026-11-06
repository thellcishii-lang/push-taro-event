'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css';

export default function CouponDormantClient() {
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
          <span className="current">休眠復活クーポン</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-pro">🔥 PRO 限定</span>
          <h1>💤 休眠復活クーポン</h1>
          <p>
            最後にQRコードを読み取ってから<strong>指定した日数（例: 60日）が経過したお客様を自動抽出</strong>し、
            特別な復帰クーポンを自動配信します。離反しかけた顧客を、確実に呼び戻します。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">🔍</span><div><strong>休眠顧客を自動抽出</strong><p>最終来店（QR読み取り）から指定日数が経過した顧客を、システムが自動で検出します。</p></div></div>
            <div className="g-feature-item"><span className="ico">📢</span><div><strong>自動で復帰クーポン配信</strong><p>特別なクーポンと共に、お久しぶりの通知をお届けします。</p></div></div>
            <div className="g-feature-item"><span className="ico">📅</span><div><strong>再送信間隔を自動制御</strong><p>同じ人にしつこく送らないよう、システムが30日間隔で制御します。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎯</span><div><strong>休眠判定日数を自由に設定</strong><p>業種に合わせて「30日」「60日」「90日」などを選択可能です。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>仕組み</h2>
          <div className="g-flow">
            <div className="g-flow-item"><div className="g-flow-circle">来店</div><p>QR読み取り</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle">60日経過</div><p>自動検知</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">自動配信</div><p>復帰クーポン</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-success">🎉</div><p>再来店で<br />復活</p></div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>既存客の復活は、新規獲得の5倍効率的</strong>
              <p>新規獲得に5,000〜30,000円かかるのに対し、休眠客の復活は<strong>ほぼゼロコスト</strong>。
              しかも元々店舗を知っているので、成約率が高いのです。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>休眠判定の推奨日数</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>業種</th><th>通常の来店サイクル</th><th>休眠判定</th></tr>
              </thead>
              <tbody>
                <tr><td>美容室・サロン</td><td>30〜45日</td><td className="yes">60日</td></tr>
                <tr><td>飲食店・カフェ</td><td>7〜14日</td><td className="yes">30日</td></tr>
                <tr><td>マッサージ・エステ</td><td>30〜60日</td><td className="yes">90日</td></tr>
                <tr><td>アパレル・雑貨</td><td>30〜90日</td><td className="yes">90日</td></tr>
                <tr><td>スナック・パブ</td><td>14〜30日</td><td className="yes">60日</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="g-h2"><span className="num">4</span>設定手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🔥 PRO機能」タブを開く</h4>
                <p>「💤 休眠復活クーポン設定」セクションまでスクロール。</p>
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
                <h4>休眠判定日数を設定</h4>
                <p>業種に合わせて、30日 / 60日 / 90日 から選択。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>復帰クーポンのタイトル・メッセージを入力</h4>
                <p>「お久しぶりです。特別な復帰クーポンをご用意しました🎁」など。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「✅ 設定完了」をタップ</h4>
                <p>以降、毎日Cronが自動で休眠顧客をチェックし、配信します。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span>📢 即時通知</span>
              <span>🏪 店舗設定</span>
              <span className="is-active-green">🔥 PRO機能</span>
              <span>📅 予約</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">💤 休眠復活クーポン</div>
              <div className="g-checkbox-row"><span className="g-checkbox is-on">✓</span><span>有効にする</span></div>
              <div className="g-mockup-label">対象条件</div>
              <div className="g-mockup-input">最終利用から 60 日経過した顧客</div>
              <div className="g-mockup-label">復帰クーポンタイトル</div>
              <div className="g-mockup-input">お久しぶりクーポン 20%OFF</div>
              <div className="g-mockup-label">お久しぶりメッセージ</div>
              <div className="g-mockup-textarea">お久しぶりです。またお会いできるのを楽しみにしています🎁</div>
              <div className="g-checkbox-row"><span className="g-checkbox">□</span><span>特別達成クーポンに追加する</span></div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">6</span>おすすめ設定</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>項目</th><th>推奨</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr><td>休眠判定日数</td><td className="yes">60〜90日</td><td>来店サイクルの2〜3倍が効果的</td></tr>
                <tr><td>割引率</td><td className="yes">20〜30%OFF</td><td>通常より手厚く、戻ってくる動機に</td></tr>
                <tr><td>有効期限</td><td className="yes">30〜60日</td><td>お久しぶりの方にも使いやすい期間</td></tr>
                <tr><td>メッセージ</td><td className="yes">親しみやすく</td><td>「お久しぶりです」など、押し付けない文体</td></tr>
              </tbody>
            </table>
          </div>

          {/* ============================================================
              本質と心理
          ============================================================ */}
          <h2 className="g-h2"><span className="num">7</span>なぜ、「無料特典」が効くのか？</h2>
          
          <p className="g-desc">
            お客様が来なくなったのには、必ず理由があります（忙しい、忘れた、少し遠い、など）。
            だからこそ、休眠復活クーポンは「単なる値引き」ではなく、<strong>「また足を運ぶきっかけ」</strong>として設計することが重要です。
          </p>

          <div className="g-callout success">
            <span className="ico">💡</span>
            <div>
              <p><strong>「タダで貰える」というハードルの低さと、お客様の心理</strong></p>
              <p>
                「〇〇が無料で貰える」という特典は、お客様の心理的なハードルを極限まで下げます。<br />
                しかし、<strong>「無料目当ての冷やかし」はほとんどいません。</strong><br />
                なぜなら、わざわざ足を運ぶ手間をかけるお客様は、お店のことを好意的に覚えているからです。<br />
                結果として、無料特典をきっかけに来店し、<strong>「ついでに他の商品も買ってくれる」</strong>という温かい循環が生まれます。
              </p>
            </div>
          </div>

          <div className="g-quote is-orange">
            少し遠くても足を運びたくなる。<br />
            近くに似た店があっても、<br />
            「あのお店」と選ばれる。<br /><br />
            そんな「ミシュラン的な引力」を、<br />
            休眠復活からもう一度思い出してもらう。
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>店舗のコンセプト × プッシュ通知</strong></p>
              <p>
                「わざわざ行きたい」と思わせる店舗のコンセプトや商品力は、プッシュ通知とは別の話です。<br />
                例えば、<strong>パンに力を入れているスーパー</strong>は、それ自体が強い来店動機になっています。<br />
                プッシュ通知の役割は、その素晴らしい店舗の価値を<strong>「お客様に思い出してもらうこと」</strong>。土台となる店舗力があるからこそ、休眠復活の一手が最大の効果を発揮します。
              </p>
            </div>
          </div>

          {/* ============================================================
              業種別活用例
          ============================================================ */}
          <h2 className="g-h2"><span className="num">8</span>業種別のリアルな活用例</h2>
          <div className="g-grid">
            <Link href="/guide/super" className="g-card">
              <span className="g-card-icon">🛒</span>
              <h4>スーパー・小売店</h4>
              <p>
                <strong>総額値引きより「商品限定」で。</strong><br />
                60日以上来店がないお客様へ「お好きな商品3品まで30%OFF」を配信。また、<strong>パンに力を入れているスーパーなら「人気の惣菜パン1つ無料」</strong>など、お店の強みをフックにして「もらいに行こう」と来店のハードルを下げます。
              </p>
            </Link>
            <Link href="/guide/apparel" className="g-card">
              <span className="g-card-icon">👕</span>
              <h4>アパレル・雑貨</h4>
              <p>
                <strong>60日スパンで「一品20%OFF」。</strong><br />
                「そういえば最近行ってないな」と思い出してもらうために、対象を絞ったクーポンを配信。AI動画を見て「実物を触りに行こう」という動機に繋げます。
              </p>
            </Link>
            <Link href="/guide/snack" className="g-card">
              <span className="g-card-icon">🍸</span>
              <h4>スナック・パブ</h4>
              <p>
                <strong>「ボトル1本サービス」で背中を押す。</strong><br />
                足が遠のいた常連客へ、ママからの「お久しぶり」メッセージと共に。ボトルサービスは「行ってみようかな」という強い動機になります。
              </p>
            </Link>
            <Link href="/guide/cafe" className="g-card">
              <span className="g-card-icon">☕</span>
              <h4>飲食店・カフェ</h4>
              <p>
                <strong>「デザートサービス」が効果的。</strong><br />
                ランチやディナーで来なくなったお客様へ。「次回来たらデザート無料」など、通常の食事にプラスアルファする特典が喜ばれます。
              </p>
            </Link>
            <Link href="/guide/bakery" className="g-card">
              <span className="g-card-icon">🥐</span>
              <h4>パン屋・ベーカリー</h4>
              <p>
                <strong>「来てくれたら、無料で進呈」の心理。</strong><br />
                しばらく来ていないお客様へ、翌日使える「食パン1斤無料」や「人気の惣菜パン1つ無料」を配信。「もらいに行くついでに、つい他のパンも買ってしまう」という、温かい来店動機を作ります。
              </p>
            </Link>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/coupon-birthday" className="g-related-card">
                <span className="ico">🎂</span>
                <div><div className="title">記念日・誕生日クーポン</div><div className="sub">年1回の特別配信</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-loyalty" className="g-related-card">
                <span className="ico">🏆</span>
                <div><div className="title">特別達成クーポン</div><div className="sub">N回来店で解放</div></div>
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
            <h3>休眠顧客を、自動で呼び戻す</h3>
            <p>離反しかけた顧客を、Push-taroの休眠復活クーポンで。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
