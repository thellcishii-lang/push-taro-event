'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './push-notification-metrics.css';

export default function PushNotificationMetricsClient() {
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
          <span className="current">プッシュ通知の指標</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">📊 データで見る</span>
          <h1>プッシュ通知のCVRは、<br />何%あればいいのか。</h1>
          <p>
            配信しているけど、効果が出ているのか分からない。<br />
            数字を見ても、それが良いのか悪いのか、判断できない。<br />
            そんな方に向けて、<strong>プッシュ通知の主要指標とベンチマーク</strong>を整理しました。
          </p>
        </div>

        <div className="g-content">

          <p>まず、結論から書きます。</p>

          <div className="g-quote is-orange">
            プッシュ通知は、<br />
            メールよりも、確実にCTRを高められる。<br /><br />
            でも、CTRは<strong>通過点</strong>。<br />
            本当の勝負は、<strong>CVRに繋げられるか</strong>。
          </div>

          <p>
            この記事では、まずCTRとCVRの定義を整理し、<br />
            <strong>なぜプッシュ通知のCTRが高いのか</strong>、<br />
            そして、<strong>実店舗のCVRベンチマーク</strong>をお伝えします。
          </p>

          {/* 0. 用語の定義 */}
          <h2 className="g-h2"><span className="num">0</span>まず、CTRとCVRの定義</h2>

          <p>
            指標の話に入る前に、<br />
            <strong>CTRとCVR</strong>という2つの言葉を、整理しておきます。
          </p>

          <div className="def-box">
            <div className="def-box-head">
              <div className="def-box-term">CTR</div>
              <div className="def-box-name">
                Click-Through Rate
                <small>クリック率</small>
              </div>
            </div>
            <p className="def-box-desc">
              広告やWebサイトのリンクなどが<strong>画面に表示された回数のうち、実際にクリックされた割合</strong>を示す指標です。
            </p>
            <div className="def-box-formula">
              <div className="def-box-formula-label">CALCULATION</div>
              <div className="def-box-formula-text">
                CTR（%）<span className="op">＝</span>クリック数<span className="op">÷</span>表示回数（インプレッション数）<span className="op">×</span>100
              </div>
            </div>
            <div className="def-box-example">
              <strong>例：</strong>1,000回表示されて、10回クリックされた場合<br />
              10 ÷ 1,000 × 100 ＝ <strong>1%</strong>
            </div>
          </div>

          <div className="def-box">
            <div className="def-box-head">
              <div className="def-box-term">CVR</div>
              <div className="def-box-name">
                Conversion Rate
                <small>コンバージョン率／顧客転換率</small>
              </div>
            </div>
            <p className="def-box-desc">
              Webサイトへのアクセス数や広告のクリック数のうち、<strong>商品購入や会員登録などの「成果（コンバージョン）」に至った割合</strong>を示す指標です。
            </p>
            <div className="def-box-formula">
              <div className="def-box-formula-label">CALCULATION</div>
              <div className="def-box-formula-text">
                CVR（%）<span className="op">＝</span>コンバージョン数<span className="op">÷</span>サイト訪問者数（またはクリック数）<span className="op">×</span>100
              </div>
            </div>
            <div className="def-box-example">
              <strong>例：</strong>広告が1,000回クリックされ、そのうち10件の購入があった場合<br />
              10 ÷ 1,000 × 100 ＝ <strong>1%</strong>
            </div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>CTRは「通過点」、CVRは「ゴール」</strong></p>
              <p>
                CTRは、あくまで「タップされたか」の指標。<br />
                CVRは、「最終的に成果に至ったか」の指標。<br />
                <strong>お店にとって、本当に重要なのはCVR</strong>です。
              </p>
            </div>
          </div>

          {/* 1. なぜプッシュ通知は、CTRが高いのか */}
          <h2 className="g-h2"><span className="num">1</span>なぜプッシュ通知は、CTRが高いのか</h2>

          <p>
            ここが、この記事の核心です。<br />
            <strong>なぜ、プッシュ通知はメールよりも、CTRが高くなるのか。</strong>
          </p>

          <p>理由は、<strong>ユーザーの動線</strong>にあります。</p>

          <div className="flow-compare">
            <div className="flow-card">
              <div className="flow-card-label">EMAIL</div>
              <div className="flow-steps">
                <div className="flow-step">
                  <span className="flow-step-num">1</span>
                  <span>通知が届く</span>
                </div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step">
                  <span className="flow-step-num">2</span>
                  <span>メールを開く（開封）</span>
                </div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step">
                  <span className="flow-step-num">3</span>
                  <span>本文を読む</span>
                </div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step is-ctr">
                  <span className="flow-step-num">4</span>
                  <span>リンクをクリック（CTR）</span>
                </div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step">
                  <span className="flow-step-num">5</span>
                  <span>リンク先へ</span>
                </div>
              </div>
            </div>

            <div className="flow-card is-push">
              <div className="flow-card-label">PUSH NOTIFICATION</div>
              <div className="flow-steps">
                <div className="flow-step">
                  <span className="flow-step-num">1</span>
                  <span>通知が届く</span>
                </div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step is-ctr">
                  <span className="flow-step-num">2</span>
                  <span>通知をタップ（CTR）</span>
                </div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step">
                  <span className="flow-step-num">3</span>
                  <span>リンク先へ直行</span>
                </div>
              </div>
            </div>
          </div>

          <p>
            <strong>メールは、間に「本文を読む」というステップがある。</strong><br />
            メールを開いて、本文を読んで、興味を持ってから、リンクをクリックする。
          </p>

          <p>
            <strong>プッシュ通知は、そのステップをスキップする。</strong><br />
            通知を見たら、タップするだけで、いきなりリンク先へ飛べる。
          </p>

          <div className="g-quote is-orange">
            ステップが少ないから、<br />
            プッシュ通知のCTRは、<br />
            はるかに高い。
          </div>

          <p>
            これは、<strong>プッシュ通知の構造的な強み</strong>です。<br />
            メールでは、どう頑張っても超えられない壁を、最初から突破している。
          </p>

          {/* 2. CTRのベンチマーク */}
          <h2 className="g-h2"><span className="num">2</span>CTRの、ベンチマーク</h2>

          <p>
            セクション1で見た通り、<br />
            <strong>プッシュ通知は、構造的にCTRが高くなります。</strong>
          </p>

          <p>
            では、実際にどのくらい違うのか。<br />
            統計で比較してみます。
          </p>

          <p>
            ここで、ひとつ整理が必要です。<br />
            メールのCTRと、プッシュ通知のCTRは、<strong>分母が違う</strong>からです。
          </p>

          <p>
            メールのCTRは、「開封した人のうち、何%がクリックしたか」。<br />
            プッシュ通知のCTRは、「配信した全員のうち、何%がタップしたか」。
          </p>

          <p>
            だから、<strong>メールのCTRを、「配信数」を分母に換算し直します。</strong>
          </p>

          <div className="calc-box">
            <div className="calc-box-title">
              <span className="calc-box-title-icon">📧</span>
              メールのCTR（配信基準に換算）
            </div>
            <div className="calc-row">
              <span className="calc-row-label">開封率 20% の場合</span>
              <span className="calc-row-formula">20% × CTR 2%</span>
              <span className="calc-row-result">= 0.4%</span>
            </div>
            <div className="calc-row">
              <span className="calc-row-label">開封率 25% の場合</span>
              <span className="calc-row-formula">25% × CTR 5%</span>
              <span className="calc-row-result">= 1.25%</span>
            </div>
            <div className="calc-total">
              <span className="calc-total-label">メールの配信基準CTR</span>
              <span className="calc-total-value">0.4〜1.25%</span>
            </div>
          </div>

          <div className="calc-box">
            <div className="calc-box-title">
              <span className="calc-box-title-icon">📢</span>
              プッシュ通知のCTR（配信基準）
            </div>
            <div className="calc-row">
              <span className="calc-row-label">標準レンジ</span>
              <span className="calc-row-formula">CTR 2〜4%</span>
              <span className="calc-row-result">= 2〜4%</span>
            </div>
            <div className="calc-row">
              <span className="calc-row-label">良好レンジ</span>
              <span className="calc-row-formula">CTR 4%超</span>
              <span className="calc-row-result">= 4%超</span>
            </div>
            <div className="calc-total">
              <span className="calc-total-label">プッシュ通知の配信基準CTR</span>
              <span className="calc-total-value">2〜4%</span>
            </div>
          </div>

          <p>同じ「配信数」を分母にすると、こうなります。</p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>媒体</th>
                  <th>配信基準CTR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>メール</strong></td>
                  <td><strong>0.4〜1.25%</strong></td>
                </tr>
                <tr>
                  <td><strong>プッシュ通知</strong></td>
                  <td><strong>2〜4%</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="g-quote is-orange">
            プッシュ通知のCTRは、<br />
            メールの<strong>約3〜5倍</strong>。<br />
            条件次第では、<strong>最大10倍</strong>に。
          </div>

          <h3 className="g-h3">CTRのベンチマーク</h3>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>評価</th>
                  <th>CTR</th>
                  <th>意味</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="eval-badge is-bad">要改善</span></td>
                  <td><strong>2%未満</strong></td>
                  <td>全体平均を下回る。配信内容・タイミングの見直しが必要</td>
                </tr>
                <tr>
                  <td><span className="eval-badge is-ok">標準</span></td>
                  <td><strong>2〜4%</strong></td>
                  <td>業界平均レベル。まずはここを目指す</td>
                </tr>
                <tr>
                  <td><span className="eval-badge is-good">良好</span></td>
                  <td><strong>4%超</strong></td>
                  <td>上位層。配信の質が高い</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="g-source">
            出典：CleverTap、Pushwoosh などの業界調査
          </p>

          {/* 3. CVRのベンチマーク */}
          <h2 className="g-h2"><span className="num">3</span>CVRの、ベンチマーク</h2>

          <p>
            ここが、<strong>お店にとって最も重要な指標</strong>です。<br />
            CTRは通過点。最終的に、<strong>何人来店したか</strong>が、CVRです。
          </p>

          <h3 className="g-h3">実店舗のCVRは、「来店」で測る</h3>

          <p>ここで、大事な整理をします。</p>

          <p>
            通常、CVRは「購入」を達成率として計算します。<br />
            ECサイトなら、それが正解です。
          </p>

          <p>
            でも、<strong>実店舗の場合は、「来店」を達成率とする</strong>のが正しい。
          </p>

          <p>
            なぜなら、<strong>プッシュ通知の役割は、来店を促すこと</strong>だからです。<br />
            その先の購買は、店舗の接客や商品力で決まります。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>「来店」を最終目標として捉える</strong></p>
              <p>
                プッシュ通知を打つ目的は、来店を促すこと。<br />
                その先の購買は、店舗の仕事です。<br />
                だから、実店舗のCVRは、<strong>来店率で測る</strong>。
              </p>
            </div>
          </div>

          <h3 className="g-h3">実店舗の来店CVR</h3>

          <p>
            <strong>「1,000通配信して、何人来店したか」。</strong><br />
            お店が本当に知りたいのは、これです。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>業種</th>
                  <th>来店CVR（配信基準）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>飲食店（全業態平均）</strong></td>
                  <td><strong>3.88%</strong></td>
                </tr>
                <tr>
                  <td>飲食店（プッシュ通知あり）</td>
                  <td><strong>3.8〜9.2%</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="g-source">
            出典：レストラン★スター、リクルート
          </p>

          <div className="cv-highlight">
            <div className="cv-highlight-label">STANDARD 来店CVR</div>
            <div className="cv-highlight-num">
              3.88<span style={{ fontSize: '32px', WebkitTextFillColor: '#c2410c' }}>%</span>
            </div>
            <div className="cv-highlight-desc">
              飲食店の、平均来店CVR<br />
              1,000通配信して、<strong>約39人</strong>が来店
            </div>
          </div>

          <p>
            プッシュ通知を導入した店舗では、<br />
            来店率が<strong>1.5〜2.1倍</strong>に向上したというデータもあります。
          </p>

          <h3 className="g-h3">CVRのベンチマーク（実店舗）</h3>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>評価</th>
                  <th>来店CVR</th>
                  <th>意味</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="eval-badge is-bad">要改善</span></td>
                  <td><strong>1%未満</strong></td>
                  <td>1,000通で10人未満。配信しても、来店に繋がっていない</td>
                </tr>
                <tr>
                  <td><span className="eval-badge is-ok">標準</span></td>
                  <td><strong>1〜4%</strong></td>
                  <td>1,000通で10〜40人。飲食店の平均レベル</td>
                </tr>
                <tr>
                  <td><span className="eval-badge is-good">良好</span></td>
                  <td><strong>4%超</strong></td>
                  <td>1,000通で40人以上。成功事例レベル</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="g-h3">参考：ECサイトのCVR</h3>

          <p>
            ECサイトの場合、CVRは「購入」で測ります。<br />
            参考までに、ECアプリ32種の平均配信基準CVRは、<strong>0.29%</strong>。
          </p>

          <p><strong>1,000通配信して、約3人が購入。</strong></p>

          <p>
            これは、実店舗の来店CVR（3.88%）と比べて、<br />
            <strong>約13倍の差</strong>があります。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>なぜ、実店舗のCVRは高いのか</strong></p>
              <p>
                ECの「購入」は、決済という高いハードルがあります。<br />
                実店舗の「来店」は、はるかにハードルが低い。<br />
                <strong>だから、実店舗のCVRは、ECより高く出る。</strong>
              </p>
            </div>
          </div>

          {/* 4. CTRを、CVRに繋げるには */}
          <h2 className="g-h2"><span className="num">4</span>CTRを、CVRに繋げるには</h2>

          <p>ここまでで、わかったことがあります。</p>

          <p>
            <strong>① プッシュ通知は、構造的にCTRが高い。</strong><br />
            <strong>② でも、CTRが高い＝CVRも高い、ではない。</strong>
          </p>

          <p>
            なぜなら、プッシュ通知のタップには、<br />
            <strong>「衝動的なタップ」</strong>も含まれるからです。
          </p>

          <div className="g-quote is-orange">
            CTRは、CVRへの入口にすぎない。<br />
            入口で終わらせず、<br />
            出口まで設計する必要がある。
          </div>

          <p>
            では、どうすれば、CTRをCVRに繋げられるのか。<br />
            <strong>これについては、別の記事で詳しく解説しています。</strong>
          </p>

          <Link href="/guide/ctr-to-cvr" className="next-article">
            <div className="next-article-icon">🎯</div>
            <div className="next-article-body">
              <div className="next-article-label">NEXT ARTICLE</div>
              <div className="next-article-title">CTRを、CVRに繋げる方法。</div>
              <div className="next-article-desc">
                通知とリンク先の一貫性、1タップで使えるクーポン、期限の設計——<br />
                CTRを、実際の来店に変えるための設計を解説します。
              </div>
            </div>
            <div className="next-article-arrow">→</div>
          </Link>

          {/* 5. 数字が悪い時 */}
          <h2 className="g-h2"><span className="num">5</span>数字が悪い時、どう考えるか</h2>

          <p>
            配信してみて、CTRが2%を下回った。<br />
            CVRが1%を切った。
          </p>

          <p>
            その時、<strong>「配信しても効果がない」と諦めてしまう</strong>店舗が多い。<br />
            でも、これは間違いです。
          </p>

          <div className="g-quote is-orange">
            数字が悪いのは、<br />
            「配信の質」か「量」か「継続」の問題。
          </div>

          <h3 className="g-h3">① 配信の「質」を疑う</h3>
          <p>
            タイトル、本文、タイミング、特典。<br />
            これらを見直す余地があります。
          </p>

          <h3 className="g-h3">② 配信の「量」を疑う</h3>
          <p>
            配信回数が少なすぎて、まだデータが蓄積されていない。<br />
            1回や2回の配信では、何も分かりません。
          </p>

          <h3 className="g-h3">③ 配信の「継続」を疑う</h3>
          <p>
            配信を止めてしまったら、データは永遠に蓄積されません。<br />
            配信は、<strong>続けることに意味がある</strong>のです。
          </p>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>これは、広告も同じ原理です。</strong></p>
              <p>
                1回打って、効果がなければ止める。<br />
                これでは、どんな媒体でも成果は出ません。<br />
                <strong>継続と改善のサイクル</strong>があって、初めて数字は伸びます。
              </p>
            </div>
          </div>

          {/* 6. 配信上限 */}
          <h2 className="g-h2"><span className="num">6</span>配信上限という、見えない壁</h2>

          <p>
            ここで、問題になるのが<strong>配信上限</strong>です。<br />
            LINE Businessには、プランごとに配信上限があります。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>プラン</th>
                  <th>月額</th>
                  <th>配信上限</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>コミュニケーション</td><td>無料</td><td>200通</td></tr>
                <tr><td>ライト</td><td>¥5,000</td><td>5,000通</td></tr>
                <tr><td>スタンダード</td><td>¥15,000</td><td>30,000通</td></tr>
                <tr><td>プロ</td><td>¥50,000</td><td>無制限</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            ライトプランで、5,000通。<br />
            これは、1,000人に5回配信したら、終わりです。
          </p>

          <p>
            能動的に配信しようとすると、すぐに足りなくなる。<br />
            だから、多くの店舗が、<strong>受動的</strong>にならざるを得ない。
          </p>

          <div className="g-quote is-orange">
            配信上限が、<br />
            能動的な運用を、許さない。
          </div>

          {/* 7. Push-taroの答え */}
          <h2 className="g-h2"><span className="num">7</span>Push-taroの答え</h2>

          <p>
            Push-taroは、<strong>PROプランで配信無制限</strong>です。<br />
            月額¥10,000（税別）で、上限を気にせず配信できます。
          </p>

          <p>
            しかも、<strong>クーポンの配信は、カウント対象外</strong>。<br />
            あくまで、プッシュ通知のみが、カウント対象です。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>能動的に、配信できる。</strong></p>
              <p>
                配信を続けて、データを蓄積する。<br />
                そこから、自店舗のCTR・CVRが見えてくる。<br />
                そして、改善のサイクルが回り始める。
              </p>
            </div>
          </div>

          {/* 8. まとめ */}
          <h2 className="g-h2"><span className="num">8</span>まとめ</h2>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>指標</th>
                  <th>要改善</th>
                  <th>標準</th>
                  <th>良好</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CTR</strong></td>
                  <td className="no">2%未満</td>
                  <td className="mid">2〜4%</td>
                  <td className="yes">4%超</td>
                </tr>
                <tr>
                  <td><strong>来店CVR（実店舗）</strong></td>
                  <td className="no">1%未満</td>
                  <td className="mid">1〜4%</td>
                  <td className="yes">4%超</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            プッシュ通知は、確実にCTRを高められます。<br />
            でも、CTRは通過点。<br />
            <strong>本当の勝負は、CVRに繋げられるか</strong>です。
          </p>

          <p>
            まずは、配信を続けて、データを蓄積する。<br />
            そのサイクルを回すために、<strong>配信上限のない環境</strong>が必要です。
          </p>

          <div className="g-related">
  <h3>この記事の前提</h3>
  <div className="g-related-grid">
    <Link href="/guide/store-marketing" className="g-related-card">
      <span className="ico">📖</span>
      <div>
        <div className="title">実店舗の集客、オススメの施策</div>
        <div className="sub">なぜ、1回目の来店客が大事なのか</div>
      </div>
      <span className="arrow">→</span>
    </Link>
  </div>
</div>

<div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
  <h3>次に読む</h3>
  <div className="g-related-grid">
    <Link href="/guide/ctr-to-cvr" className="g-related-card is-next">
      <span className="ico">🎯</span>
      <div>
        <div className="title">CTRを、CVRに繋げる方法</div>
        <div className="sub">衝動タップを、来店に変える3つの設計</div>
      </div>
      <span className="arrow">→</span>
    </Link>
  </div>
</div>

<div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
  <h3>あわせて読みたい</h3>
  <div className="g-related-grid">
    <Link href="/guide/ng-actions" className="g-related-card">
      <span className="ico">⚠️</span>
      <div>
        <div className="title">NG行為集</div>
        <div className="sub">配信の質を下げないために</div>
      </div>
      <span className="arrow">→</span>
    </Link>
  </div>
</div>

          <div className="g-cta">
            <h3>配信上限を、気にせず。</h3>
            <p>
              Push-taroなら、PROプランで配信無制限。<br />
              改善のサイクルを、止めずに回せます。
            </p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
