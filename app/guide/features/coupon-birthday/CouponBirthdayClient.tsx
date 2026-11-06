'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css';

export default function CouponBirthdayClient() {
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
          <span className="current">記念日・誕生日</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-pro">🔥 PRO 限定</span>
          <h1>🎂 記念日・誕生日クーポン</h1>
          <p>
            お客様の<strong>記念日・誕生日当日に自動でお祝い通知</strong>を配信します。
            「1年に1度の特別な日」を演出し、ファン化を加速させます。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">🎂</span><div><strong>記念日・誕生日に自動配信</strong><p>お客様が登録した月日の当日に、自動でお祝い通知が届きます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎁</span><div><strong>特別なクーポンを配布</strong><p>通常クーポンより手厚い特典を設定して、特別感を演出。</p></div></div>
            <div className="g-feature-item"><span className="ico">🔒</span><div><strong>1人1回・年1回のみ</strong><p>電話番号に紐づくため、使い回しは自動でブロックされます。</p></div></div>
            <div className="g-feature-item"><span className="ico">💬</span><div><strong>お祝いメッセージを自由に設定</strong><p>「お誕生日おめでとうございます🎉」など、店舗らしい文言を。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>「記念日・誕生日」としている理由</h2>
          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>誕生日だけでなく、あらゆる「年1回の特別な日」に対応</strong>
              <p>結婚記念日、ペットの誕生日、お店のオープン記念日、お子様の入学記念日など、
              お客様にとっての「特別な日」を自由に選べます。<br />
              「自分のための日」を選べることで、登録のハードルが下がり、より多くのお客様にご利用いただけます。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>不正利用防止の仕組み</h2>
          <p className="g-desc">
            記念日・誕生日クーポンは「1年に1度」の特別なクーポンだからこそ、
            不正利用を防ぐ仕組みが重要です。Push-taroでは以下の3つで防止しています。
          </p>

          <div className="g-fraud-grid">
            <div className="g-fraud-card">
              <div className="g-fraud-num">①</div>
              <h4>電話番号に紐づく</h4>
              <p>SMS認証で本人確認を行うため、同じ電話番号で何度も登録することはできません。</p>
            </div>
            <div className="g-fraud-card">
              <div className="g-fraud-num">②</div>
              <h4>一度登録すると変更不可</h4>
              <p>記念日を一度登録すると、お客様自身では後から変更できません。「月だけ変える」などの使い回しをブロック。</p>
            </div>
            <div className="g-fraud-card">
              <div className="g-fraud-num">③</div>
              <h4>年間重複防止機能</h4>
              <p>同じ年に同じお客様へ複数回配信されることを、システムが自動でブロックします。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">4</span>設定手順（店舗側）</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「🔥 PRO機能」タブを開く</h4>
                <p>「🎂 記念日、お誕生日クーポン設定」セクションまでスクロール。</p>
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
                <h4>クーポンタイトル・お祝いメッセージを入力</h4>
                <p>例：タイトル「お誕生日クーポン 20%OFF」、メッセージ「お誕生日おめでとうございます🎉」</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「✅ 設定完了」をタップ</h4>
                <p>以降、記念日を登録したお客様に当日自動配信されます。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>お客様側の登録フロー</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>SMS認証を完了する</h4>
                <p>電話番号で本人確認を行います（不正利用防止のため必須）。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>記念日・誕生日を登録</h4>
                <p>顧客画面（/subscribe）で、月と日を選択。「設定する」をタップ。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「一度設定すると変更できません」の警告を確認</h4>
                <p>改ざん防止のため、お客様にもこの点を明示しています。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>当日、自動でお祝い通知が届く</h4>
                <p>登録した月日の当日に、クーポン付きの通知が届きます。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">6</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span>📢 即時通知</span>
              <span>🏪 店舗設定</span>
              <span className="is-active-green">🔥 PRO機能</span>
              <span>📅 予約</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">🎂 記念日、お誕生日クーポン</div>
              <div className="g-checkbox-row"><span className="g-checkbox is-on">✓</span><span>有効にする</span></div>
              <div className="g-mockup-label">クーポンタイトル</div>
              <div className="g-mockup-input">お誕生日クーポン 20%OFF</div>
              <div className="g-mockup-label">お祝いメッセージ</div>
              <div className="g-mockup-textarea">お誕生日おめでとうございます🎉 素敵な一年になりますように。</div>
              <div className="g-checkbox-row"><span className="g-checkbox">□</span><span>特別達成クーポンに追加する</span></div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">7</span>おすすめ設定</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>項目</th><th>推奨</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr><td>配信タイミング</td><td className="yes">当日 9:00</td><td>朝イチで届くと「今日は特別な日」と実感できる</td></tr>
                <tr><td>割引率</td><td className="yes">15〜25%OFF</td><td>通常より手厚く、特別感を演出</td></tr>
                <tr><td>有効期限</td><td className="yes">30日程度</td><td>当日来られない人も多いため</td></tr>
                <tr><td>メッセージ</td><td className="yes">お客様名を入れる</td><td>パーソナル感で特別感アップ</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="g-h2"><span className="num">8</span>業種別の活用例</h2>
          <div className="g-grid">
            <Link href="/guide/cafe" className="g-card"><span className="g-card-icon">☕</span><h4>飲食店・カフェ</h4><p>「バースデーデザート無料」</p></Link>
            <div className="g-card"><span className="g-card-icon">💇</span><h4>美容室・サロン</h4><p>「誕生日月は20%OFF」</p></div>
            <div className="g-card"><span className="g-card-icon">🍣</span><h4>寿司店</h4><p>「記念日は乾杯ドリンクサービス」</p></div>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/coupon-dormant" className="g-related-card">
                <span className="ico">💤</span>
                <div><div className="title">休眠復活クーポン</div><div className="sub">離反客を呼び戻す</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-loyalty" className="g-related-card">
                <span className="ico">🏆</span>
                <div><div className="title">特別達成クーポン</div><div className="sub">N回来店で解放</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>記念日・誕生日を、最高のファン化の機会に</h3>
            <p>年1回の特別な日に、自動でお祝いクーポンを届けましょう。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
