'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './security.css';

export default function SecurityClient() {
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
          <span className="current">セキュリティ</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">🔒 セキュリティ</span>
          <h1>なぜ、Push-taroは<br />顧客情報を取らないのか。</h1>
          <p>
            大手企業の情報流出が、日常になっています。<br />
            顧客情報を取れば取るほど、<strong>リスクは増える</strong>。<br />
            Push-taroが保存するのは、<strong>電話番号だけ</strong>です。
          </p>
        </div>

        <div className="g-content">

          {/* 1 */}
          <h2><span className="num">1</span>情報流出が、日常になった</h2>

          <p>
            ここ数年、大手企業の情報流出が、後を絶ちません。<br />
            ニュースで、毎週のように報じられています。
          </p>

          <div className="g-callout danger">
            <span className="ico">🚨</span>
            <div>
              <p><strong>「あの大手でも、漏れる」</strong></p>
              <p>
                どれだけセキュリティに投資しても、<strong>100%は防げない</strong>。<br />
                これが、今の時代の現実です。
              </p>
            </div>
          </div>

          <p>
            そして、経営者は、考え始めています。
          </p>

          <div className="g-quote is-orange">
            「うちの店の顧客情報、<br />
            本当に必要だったのか？」
          </div>

          {/* 2 */}
          <h2><span className="num">2</span>顧客情報を取れば取るほど、リスクは増える</h2>

          <p>
            情報流出のリスクは、<strong>保存する情報の量に比例</strong>します。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>保存する情報</th>
                  <th>漏洩時のリスク</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>氏名・住所</td>
                  <td className="no">なりすまし・詐欺のリスク</td>
                </tr>
                <tr>
                  <td>生年月日・性別</td>
                  <td className="no">個人特定のリスク</td>
                </tr>
                <tr>
                  <td>購買履歴</td>
                  <td className="no">プライバシー侵害</td>
                </tr>
                <tr>
                  <td>クレジットカード情報</td>
                  <td className="no">金銭的被害・最大のリスク</td>
                </tr>
                <tr>
                  <td><strong>電話番号</strong></td>
                  <td className="yes">相対的に、リスクは最小</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            つまり、<strong>「情報を取らなければ、漏れない」</strong>。<br />
            これは、最もシンプルで、最も確実な、セキュリティ対策です。
          </p>

          {/* 3 */}
          <h2><span className="num">3</span>Push-taroが保存するのは、電話番号だけ</h2>

          <p>
            Push-taroは、<strong>この発想を、徹底しました</strong>。
          </p>

          <div className="security-detail">
            <div className="security-detail-col is-yes">
              <h4>✅ 保存する情報</h4>
              <ul>
                <li>電話番号（SMS認証済み）</li>
                <li>クーポン消込履歴</li>
                <li>来店回数・最終来店日</li>
              </ul>
            </div>
            <div className="security-detail-col is-no">
              <h4>❌ 保存しない情報</h4>
              <ul>
                <li>氏名</li>
                <li>住所</li>
                <li>生年月日・性別</li>
                <li>購買履歴（何を買ったか）</li>
                <li>クレジットカード情報</li>
              </ul>
            </div>
          </div>

          <h3 className="g-h3">なぜ、電話番号だけなのか</h3>

          <p>
            理由は、シンプルです。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>① 通知を届けるのに、電話番号で足りる</h4>
                <p>Push-taroの目的は、プッシュ通知を届けること。名前も住所も、必要ありません。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>② 不正利用の防止に、電話番号で足りる</h4>
                <p>SMS認証で、1人1回の登録を保証。クーポンの使い回しを、防げます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>③ それ以上は、取らない</h4>
                <p>「取れるから取る」ではなく、「必要だから取る」。Push-taroは、後者です。</p>
              </div>
            </div>
          </div>

          {/* 4 */}
          <h2><span className="num">4</span>漏洩時のリスクを、最小化する設計</h2>

          <p>
            仮に、Push-taroが攻撃を受けたとします。<br />
            漏れる可能性があるのは、<strong>電話番号のリストだけ</strong>。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>もし、漏れたら</th>
                  <th>被害</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>電話番号</td>
                  <td>迷惑電話・SMSのリスク</td>
                </tr>
                <tr>
                  <td>氏名・住所</td>
                  <td className="yes">漏れない</td>
                </tr>
                <tr>
                  <td>購買履歴</td>
                  <td className="yes">漏れない</td>
                </tr>
                <tr>
                  <td>クレジットカード情報</td>
                  <td className="yes">漏れない</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            つまり、<strong>被害を、最小限に抑えられる</strong>。<br />
            これは、<strong>構造的な強み</strong>です。運用力でカバーするのではなく、<strong>設計で防いでいる</strong>。
          </p>

          {/* 5 */}
<h2><span className="num">5</span>現代のハッカー集団は、AIで攻めてくる</h2>

<p>
  ここで、<strong>現代のセキュリティ事情</strong>を、正直にお伝えします。
</p>

<p>
  今、ハッカー集団は、<strong>最新鋭のAIを使い、あの手この手で攻めてくる</strong>。<br />
  対策をすれば、新しい手口が出てくる。<br />
  これは、<strong>永遠に続く、いたちごっこ</strong>です。
</p>

<div className="g-callout danger">
  <span className="ico">🚨</span>
  <div>
    <p><strong>どれだけ対策をしても、「絶対に安心」とは言い切れない。</strong></p>
    <p>
      これが、<strong>現代のセキュリティの、現実</strong>です。<br />
      大手企業が、巨額を投じて対策しても、漏れる。<br />
      「対策の量」では、もう、勝てない時代になっています。
    </p>
  </div>
</div>

<h3 className="g-h3">だから、発想を変える</h3>

<p>
  「対策を、もっと強くする」——これは、<strong>いたちごっこの中で戦い続ける</strong>ということ。<br />
  Push-taroは、<strong>別の方向</strong>から、この問題を解きました。
</p>

<div className="g-steps">
  <div className="g-step">
    <div className="g-step-body">
      <h4>① 守るものを、減らす</h4>
      <p>氏名・住所・購買履歴を、そもそも取らない。守る対象を、最小化する。</p>
    </div>
  </div>
  <div className="g-step">
    <div className="g-step-body">
      <h4>② 攻撃対象を、小さくする</h4>
      <p>「電話番号だけ」なら、ハッカーが狙う価値も、小さくなる。</p>
    </div>
  </div>
  <div className="g-step">
    <div className="g-step-body">
      <h4>③ 万が一の被害を、最小化する</h4>
      <p>漏れても、電話番号だけ。名前も住所も、クレジットカードも漏れない。</p>
    </div>
  </div>
</div>

<div className="g-quote is-orange">
  守るものを、減らす。<br />
  これが、いたちごっこに、<br />
  勝つ、唯一の方法です。
</div>

<p>
  電話番号も、個人情報保護法上は、<strong>個人情報</strong>です。<br />
  現代のハッカー集団の攻撃がある中で、どんなアプリでも「絶対に漏れない」とは、言いきれません。<br />
  でも、<strong>漏れる情報を、最小限にすること</strong>。そして、ハッカー集団が盗んだとしても電話番号だけではなんの情報にもなりません。
</p>

<div className="g-callout success">
  <span className="ico">✅</span>
  <div>
    <p><strong>「対策を強くする」のではなく、「取らない」。</strong></p>
    <p>
      攻められる前提で、被害を最小化する。<br />
      これが、AI時代の、最も誠実なセキュリティ対策です。
    </p>
  </div>
</div>

          {/* 関連 */}
          <div className="g-related">
            <h3>次に読む</h3>
            <div className="g-related-grid">
              <Link href="/guide/segmentation" className="g-related-card is-next">
                <span className="ico">📊</span>
                <div>
                  <div className="title">セグメント配信とは</div>
                  <div className="sub">実店舗では「使えない」理由</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <h3>あわせて読みたい</h3>
            <div className="g-related-grid">
              <Link href="/guide/store-marketing" className="g-related-card">
                <span className="ico">📖</span>
                <div>
                  <div className="title">実店舗の集客、オススメの施策</div>
                  <div className="sub">店舗マーケティングの理論</div>
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
            <h3>顧客情報を、取らない。</h3>
            <p>
              Push-taroが保存するのは、電話番号だけ。<br />
              漏洩時のリスクを、最小化する設計です。
            </p>
            <Link href="/signup" className="g-cta-btn">無料相談 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
