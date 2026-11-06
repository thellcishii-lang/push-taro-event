'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function ApparelClient() {
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
          <span className="current">アパレル・雑貨</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">👕 アパレル・雑貨向け</span>
          <h1>アパレル・雑貨店のための<br />Push-taro活用ガイド</h1>
          <p>
            アパレル・雑貨は、<strong>ビジュアルが命</strong>です。<br />
            商品画像だけでは、魅力が伝わらない。<br />
            「着回し」「使用風景」で、初めて伝わる。<br />
            Instagramとの共存が、最強の戦略です。
          </p>
        </div>

        <div className="g-content">

          {/* ============================================================
              1. アパレル・雑貨の武器は、「ビジュアル」
          ============================================================ */}
          <h2><span className="num">1</span>アパレル・雑貨の武器は、「ビジュアル」</h2>

          <p>
            アパレル・雑貨の集客で、最も大事なのは、<strong>ビジュアル</strong>です。<br />
            どんなに良い商品でも、<strong>魅力が伝わらなければ、買われない</strong>。
          </p>

          <p>
            でも、考えてみてください。<br />
            「商品の写真1枚」で、お客様は、買いたいと思うでしょうか。
          </p>

          <div className="g-quote is-orange">
            商品画像だけでは、<br />
            魅力は、伝わらない。<br /><br />
            「着回し」「使用風景」で、<br />
            初めて、伝わる。
          </div>

          <h3 className="g-h3">「着回し」「使用風景」が、購買意欲を生む</h3>

          <p>
            お客様が知りたいのは、<strong>「これを買ったら、どう使えるか」</strong>。<br />
            ワンピースなら、街中で着ているシーン。<br />
            花瓶なら、リビングに飾った風景。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">👗</div>
              <h4>アパレル</h4>
              <p>「このワンピース、街で着たら？」「カフェでくつろいだら？」</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🏺</div>
              <h4>雑貨</h4>
              <p>「この花瓶、リビングに置いたら？」「実際に使うと？」</p>
            </div>
          </div>

          <h3 className="g-h3">Instagramとの共存が、最強の戦略</h3>

          <p>
            ここで、<strong>Instagram</strong>の出番です。<br />
            プッシュ通知の小さな画像より、Instagramの投稿は、<strong>圧倒的に伝わる</strong>。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>① 新商品を、Instagramに投稿</h4>
                <p>着回し・使用風景を、複数枚のカルーセルで。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>② プッシュ通知で、Instagramへリンク</h4>
                <p>「新作ワンピース、入荷しました。着回しは、こちらから」</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>③ お客様が、Instagramで保存</h4>
                <p>「あとで見返せる」という安心感が、来店を後押し。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>④ 来店して、実物を確認</h4>
                <p>「インスタで見た、あれ」——来店の、明確な動機になる。</p>
              </div>
            </div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>プッシュ通知は、「きっかけ」に徹する</strong></p>
              <p>
                主役は、Instagram。<br />
                プッシュ通知は、「見てみたい」と思わせる、<strong>きっかけ</strong>です。<br />
                Instagramで魅力を伝え、来店に繋げる。
              </p>
            </div>
          </div>

          {/* ============================================================
              2. 「新作」と「セール」を、4つの型で届ける
          ============================================================ */}
          <h2><span className="num">2</span>「新作」と「セール」を、4つの型で届ける</h2>

          <p>
            アパレル・雑貨が、配信すべき情報は、<strong>4つの型</strong>に分かれます。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">🆕</div>
              <h4>新作入荷</h4>
              <p>「入荷しました」を、画像付きで配信。買い逃しを防ぐ。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🔥</div>
              <h4>SNSバズり再現</h4>
              <p>「今、SNSで話題のあれ、入荷しました」——話題性が武器になる。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🍂</div>
              <h4>季節セール</h4>
              <p>「衣替えセール」「シーズン切り替え」——季節ごとに配信。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🎁</div>
              <h4>限定アイテム</h4>
              <p>「Push-taro登録者限定」——特別感で、来店動機を強化。</p>
            </div>
          </div>

          <h3 className="g-h3">買い逃しは、最大の機会損失</h3>

          <p>
            アパレル・雑貨で、最も多い機会損失は——<br />
            <strong>「あの商品、欲しかったのに、売り切れていた」</strong>。
          </p>

          <p>
            これは、<strong>在庫の問題ではなく、情報伝達の問題</strong>です。<br />
            「入荷した瞬間」に届けば、買い逃しは減る。<br />
            プッシュ通知の<strong>即時性</strong>が、直接効きます。
          </p>

          <div className="g-callout success">
            <span className="ico">📢</span>
            <div>
              <p><strong>配信例</strong></p>
              <p>
                「【入荷しました】<br />
                今季注目の<strong>「〇〇ワンピース」</strong>、<br />
                入荷しました👗<br /><br />
                着回し3パターンは、プロフィールのリンクから。<br />
                <strong>数量限定</strong>です。」
              </p>
            </div>
          </div>

          <h3 className="g-h3">季節変動は、逆にチャンス</h3>

          <p>
            アパレルは、季節変動が激しい。<br />
            でも、これは、<strong>「季節ごとに来店動機を作れる」</strong> ということです。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>季節</th>
                  <th>テーマ</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>春</td><td>新生活・桜・入学</td></tr>
                <tr><td>夏</td><td>海・フェス・夏物</td></tr>
                <tr><td>秋</td><td>紅葉・ハロウィン・衣替え</td></tr>
                <tr><td>冬</td><td>クリスマス・新年・防寒</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>季節の変わり目に、必ず配信する</strong>。<br />
            これが、年間のリズムになります。
          </p>

          {/* ============================================================
              3. 配信頻度とプランの、現実
          ============================================================ */}
          <h2><span className="num">3</span>配信頻度とプランの、現実</h2>

          <p>
            アパレル・雑貨の配信は、<strong>定期配信</strong>と<strong>即時配信</strong>の、2種類があります。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>配信の種類</th>
                  <th>頻度の目安</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>定期配信</td>
                  <td>週2回</td>
                  <td>「今週の新作」「着回し提案」</td>
                </tr>
                <tr>
                  <td>即時配信</td>
                  <td>月4〜8回</td>
                  <td>「入荷しました」「セール開始」</td>
                </tr>
                <tr>
                  <td><strong>合計</strong></td>
                  <td><strong>月12〜16回</strong></td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            この運用で、プランを選びます。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>顧客数</th>
                  <th>月12回の場合</th>
                  <th>推奨プラン</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>〜300人</td>
                  <td>3,600通</td>
                  <td className="yes">LIGHT（¥1,980、5,000通）</td>
                </tr>
                <tr>
                  <td>300〜800人</td>
                  <td>3,600〜9,600通</td>
                  <td className="yes">STANDARD（¥3,800、15,000通）</td>
                </tr>
                <tr>
                  <td>800人〜1,200人</td>
                  <td>9,600〜14,400通</td>
                  <td className="yes">STANDARD（¥3,800）</td>
                </tr>
                <tr>
                  <td>1,200人〜</td>
                  <td>14,400通〜</td>
                  <td className="yes">PRO（¥10,000、無制限）</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>アパレル・雑貨は、STANDARDが本命</strong></p>
              <p>
                定期配信（週2回）+ 即時配信（新作・セール）で、<br />
                月12〜16回の配信。<br />
                <strong>顧客300人を超えたら、STANDARDが現実的</strong>です。
              </p>
            </div>
          </div>

          {/* ============================================================
              4. 常連には、PROでクーポンを仕込む
          ============================================================ */}
          <h2><span className="num">4</span>常連には、PROでクーポンを仕込む</h2>

          <p>
            「新作」と「セール」で、来店の習慣ができたら、次は<strong>ファン化</strong>です。<br />
            PROプランなら、常連向けのクーポンを、自動で仕込めます。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>連続クーポン</h4>
                <p>来店ごとに、次回使えるクーポンを自動配信。来店サイクルを、自然に短縮。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>特別達成クーポン</h4>
                <p>N回来店で、特別クーポンを解放。「あと1回」の心理で、来店を後押し。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>記念日・誕生日クーポン</h4>
                <p>年1回の特別な日に、自動でお祝いクーポンを配信。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>休眠復活クーポン</h4>
                <p>しばらく来ていないお客様に、自動で復帰クーポンを配信。</p>
              </div>
            </div>
          </div>

          <div className="g-quote is-orange">
            「新作」＋「クーポン」で、<br />
            常連が、もっと来てくれる。
          </div>

          {/* ============================================================
              5. Push-taroなら、これが全部、簡単に仕込める
          ============================================================ */}
          <h2><span className="num">5</span>Push-taroなら、これが全部、簡単に仕込める</h2>

          <p>
            「新作入荷」を、画像付きで配信。<br />
            「SNSバズり再現」を、即時配信。<br />
            「連続クーポン」「誕生日クーポン」を、自動で。
          </p>

          <p>
            これらすべてを、<strong>特別な知識も、マーケティング専任チームもなく、仕込めます</strong>。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>施策</th>
                  <th>使う機能</th>
                  <th>プラン</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>新作入荷の配信</td>
                  <td>プッシュ通知（リンク遷移）</td>
                  <td className="yes">全プラン</td>
                </tr>
                <tr>
                  <td>SNSバズり再現</td>
                  <td>プッシュ通知</td>
                  <td className="yes">全プラン</td>
                </tr>
                <tr>
                  <td>季節セール</td>
                  <td>プッシュ通知</td>
                  <td className="yes">全プラン</td>
                </tr>
                <tr>
                  <td>初回クーポン</td>
                  <td>初回クーポン</td>
                  <td className="yes">全プラン</td>
                </tr>
                <tr>
                  <td>常連クーポン</td>
                  <td>連続・達成クーポン</td>
                  <td className="yes">STANDARD+</td>
                </tr>
                <tr>
                  <td>ファン化クーポン</td>
                  <td>誕生日・休眠復活</td>
                  <td className="yes">PRO</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            店頭に、QRコードを置くだけ。<br />
            お客様は、スマホで読み取って、通知を許可する。<br />
            ——これで、毎週の配信が、始められます。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>アパレル・雑貨のリピート施策を、シンプルに。</strong></p>
              <p>
                「新作」「セール」「限定アイテム」——<br />
                ビジュアルで伝えて、来店の習慣を作ります。
              </p>
            </div>
          </div>

          {/* ============================================================
              6. マネキンの写真1枚で着用動画の作り方！
          ============================================================ */}
          <h2><span className="num">6</span>マネキンの写真1枚で着用動画の作り方！</h2>

          <img
            className="g-img is-narrow"
            src="/guide/apparel-ai-video/%20wearing.jpeg"
            alt="マネキンの写真からAIで生成した、ワンピースの着用イメージ（ワンショット）"
          />
          <p className="g-img-cap">マネキンの静止画から、AIが生成した着用イメージ。これが動画になります</p>

          <p>
            「着回し」「使用風景」を伝える一番の近道は、<strong>動画</strong>です。<br />
            でも、モデル撮影はコストも手間もかかる。
          </p>

          <p>
            実は今、<strong>マネキンに着せた写真1枚</strong>をAIアシスタントの<strong>「Muse」</strong>に渡して一言頼むだけで、<br />
            歩く・回る・BGM付きの<strong>着用イメージ動画</strong>が作れます。<br />
            実際に作って、Push-taro公式Instagramで公開しました。
          </p>

          <div className="g-callout success">
            <span className="ico">🎬</span>
            <div>
              <p><strong>作り方は、専用記事で全部公開しています</strong></p>
              <p>
                実際に使ったプロンプト全文と、プッシュ通知で新作を届ける仕上げまで。<br />
                <Link href="/guide/apparel-ai-video">▶︎ マネキンの写真1枚で着用動画の作り方（専用記事）</Link>
              </p>
            </div>
          </div>

          {/* ============================================================
              関連ガイド
          ============================================================ */}
          <div className="g-related">
            <h3>次に読む</h3>
            <div className="g-related-grid">
              <Link href="/guide/line-comparison" className="g-related-card is-next">
                <span className="ico">📊</span>
                <div>
                  <div className="title">LINE公式アカウントとの比較</div>
                  <div className="sub">配信上限という壁を、数字で解説</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <h3>あわせて読みたい</h3>
            <div className="g-related-grid">
              <Link href="/guide/super" className="g-related-card">
                <span className="ico">🛒</span>
                <div>
                  <div className="title">スーパー・小売店向け</div>
                  <div className="sub">業種別ガイド</div>
                </div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-stepup" className="g-related-card">
                <span className="ico">🐾</span>
                <div>
                  <div className="title">ステップアップクーポン</div>
                  <div className="sub">機能別ガイド</div>
                </div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/ng-actions" className="g-related-card">
                <span className="ico">⚠️</span>
                <div>
                  <div className="title">NG行為集</div>
                  <div className="sub">炎上を避ける</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          {/* ============================================================
              CTA
          ============================================================ */}
          <div className="g-cta">
            <h3>アパレル・雑貨の「ビジュアル」を、仕組みに。</h3>
            <p>新作入荷・SNSバズり再現・季節セール——ビジュアルで伝える集客を、Push-taroで。</p>
            <Link href="/signup" className="g-cta-btn">無料相談 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
