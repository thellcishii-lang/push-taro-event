'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function BakeryClient() {
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
          <span className="current">パン屋・ベーカリー</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">🥐 パン屋・ベーカリー向け</span>
          <h1>パン屋・ベーカリーのための<br />Push-taro活用ガイド</h1>
          <p>
            パン屋の武器は、<strong>「焼きたて」だけじゃない</strong>。<br />
            「今日は何だろう」という<strong>期待</strong>を、毎日届ける。<br />
            通常メニュー以外の一手が、来店の習慣を作ります。
          </p>
        </div>

        <div className="g-content">

          {/* ============================================================
              1. パン屋の武器は、「今日は何だろう」という期待
          ============================================================ */}
          <h2><span className="num">1</span>パン屋の武器は、「今日は何だろう」という期待</h2>

          <p>
            パン屋の多くが、「焼きたて」を売りにしています。<br />
            でも、よく考えてください。
          </p>

          <div className="g-quote is-orange">
            パン屋は、その日に焼いたパンしか、売っていない。<br /><br />
            つまり、「焼きたて」は、<strong>当たり前</strong>なんです。
          </div>

          <p>
            お客様にとって、大事なのは「焼きたてかどうか」ではありません。<br />
            <strong>「今日、何が焼けているか」</strong>。これが、知りたいことです。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>お客様の頭の中</strong></p>
              <p>
                「あのパン屋、今日は何があるかな」<br />
                「生チョコ食パン、まだあるかな」<br />
                「15時から、あれが出るらしい」<br /><br />
                この<strong>「今日の情報」</strong>を、毎日届けるのが、プッシュ通知です。
              </p>
            </div>
          </div>

          <p>
            「今日は何だろう」という期待が、来店の動機になる。<br />
            そして、毎日配信することで、<strong>来店の習慣</strong>が生まれます。
          </p>

          {/* ============================================================
              2. 「通常メニュー以外」を、毎日届ける
          ============================================================ */}
          <h2><span className="num">2</span>「通常メニュー以外」を、毎日届ける</h2>

          <p>
            通常メニューだけでは、毎日配信する意味が薄い。<br />
            <strong>「通常メニュー以外」</strong>があるから、毎日、配信する意味が生まれます。
          </p>

          <p>
            パン屋が発信できる「通常メニュー以外」は、<strong>4つの型</strong>に分かれます。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">📅</div>
              <h4>日替わり</h4>
              <p>曜日で変える。「水曜は明太ポテト」など、習慣になる。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">⏰</div>
              <h4>数量限定 × 時間指定</h4>
              <p>「本日30個限定、15時より販売開始」——最も強い来店動機。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🔥</div>
              <h4>SNSバズり再現</h4>
              <p>「今、SNSで話題のアレ、作りました」——話題性が武器になる。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🍂</div>
              <h4>季節限定</h4>
              <p>「桜あんぱん、始めました」——年1回のお楽しみを作る。</p>
            </div>
          </div>

          <p>
            この4つを、<strong>組み合わせて、毎日配信する</strong>。<br />
            これが、パン屋のプッシュ通知の、基本形です。
          </p>

          <div className="g-callout success">
            <span className="ico">📢</span>
            <div>
              <p><strong>配信例</strong></p>
              <p>
                「【本日限定】<br />
                <strong>今、SNSで話題の「生チョコ食パン」</strong>、<br />
                当店オリジナルで作りました🍫<br /><br />
                本日30個限定。<br />
                <strong>15時より販売開始</strong>です。<br />
                なくなり次第、終了。」
              </p>
            </div>
          </div>

          {/* ============================================================
              3. 毎日配信なら、LIGHT / STANDARDで十分
          ============================================================ */}
          <h2><span className="num">3</span>毎日配信なら、LIGHT / STANDARDで十分</h2>

          <p>
            「今日のパン」「焼き上がり」の毎日配信は、<br />
            <strong>LIGHT / STANDARDプランで、十分</strong>です。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>登録者数</th>
                  <th>推奨プラン</th>
                  <th>月間配信上限</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>〜500人</td>
                  <td className="yes">LIGHT（¥1,980）</td>
                  <td>5,000通</td>
                </tr>
                <tr>
                  <td>〜1,500人</td>
                  <td className="yes">STANDARD（¥3,800）</td>
                  <td>15,000通</td>
                </tr>
                <tr>
                  <td>1,500人以上</td>
                  <td className="yes">PRO（¥10,000）</td>
                  <td>無制限</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            500人に毎日配信（月30回）しても、15,000通。<br />
            STANDARDプランで、余裕を持って運用できます。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>クーポンなしでも、来店動機は作れる</strong></p>
              <p>
                「本日のパン」「焼き上がり」「数量限定」——<br />
                <strong>クーポンを配らなくても、来店の理由は作れます</strong>。<br />
                むしろ、毎日の情報発信の方が、クーポンより効果が高いケースも。
              </p>
            </div>
          </div>

          {/* ============================================================
              4. 常連には、PROでクーポンを仕込む
          ============================================================ */}
          <h2><span className="num">4</span>常連には、PROでクーポンを仕込む</h2>

          <p>
            毎日配信で、来店の習慣ができたら、次は<strong>ファン化</strong>です。<br />
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
            「今日の情報」＋「クーポン」で、<br />
            常連が、もっと来てくれる。
          </div>

          <p>
            毎日の情報発信で、来店の習慣を作る。<br />
            そして、クーポンで、常連をファンに変えていく。
          </p>

          {/* ============================================================
              5. Push-taroなら、これが全部、簡単に仕込める
          ============================================================ */}
          <h2><span className="num">5</span>Push-taroなら、これが全部、簡単に仕込める</h2>

          <p>
            「今日のパン」を毎日配信。<br />
            「数量限定」「SNSバズり再現」を、画像付きで。<br />
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
                  <td>今日のパン配信</td>
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
                  <td>連続・達成</td>
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
            ——これで、毎日の配信が、始められます。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>パン屋のリピート施策を、シンプルに。</strong></p>
              <p>
                「今日は何だろう」という期待を、毎日届ける。<br />
                それが、パン屋の、一番強い集客です。
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
              <Link href="/guide/cafe" className="g-related-card">
                <span className="ico">☕</span>
                <div>
                  <div className="title">飲食店・カフェ向け</div>
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
            <h3>パン屋の「今日の情報」を、仕組みに。</h3>
            <p>「本日のパン」「数量限定」「SNSバズり再現」——毎日の情報を、Push-taroで。</p>
            <Link href="/signup" className="g-cta-btn">無料相談 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
