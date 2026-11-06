'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function CafeClient() {
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
          <span className="current">飲食店・カフェ</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">☕ 飲食店・カフェ向け</span>
          <h1>飲食店・カフェのための<br />Push-taro活用ガイド</h1>
          <p>
            飲食店・カフェは、<strong>2つのタイプに分かれます</strong>。<br />
            <strong>ランチで呼ぶ店</strong>と、<strong>ランチ以外で呼ぶ店</strong>。<br />
            それぞれ、プッシュ通知の使い方が、まったく違います。
          </p>
        </div>

        <div className="g-content">

          {/* ============================================================
              1. 飲食店・カフェは、2つのタイプに分かれる
          ============================================================ */}
          <h2><span className="num">1</span>飲食店・カフェは、2つのタイプに分かれる</h2>

          <p>
            「飲食店・カフェ」と、ひとくくりに言っても、<br />
            集客の仕方は、まったく違います。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">🍱</div>
              <h4>ランチで呼ぶ店</h4>
              <p>定食屋、ランチ営業の飲食店。<br />「今日のランチ」で、来店を決める。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">☕</div>
              <h4>ランチ以外で呼ぶ店</h4>
              <p>カフェ、夜カフェ、スイーツ店。<br />「特別なメニュー」で、来店を決める。</p>
            </div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>あなたの店は、どっち？</strong></p>
              <p>
                ランチ需要が主なら「ランチ型」。<br />
                午後・夜の需要が主なら「カフェ型」。<br />
                両方なら、両方の施策を組み合わせます。
              </p>
            </div>
          </div>

          {/* ============================================================
              2. ランチで呼ぶ店：毎朝10時、日替わりランチを配信
          ============================================================ */}
          <h2><span className="num">2</span>ランチで呼ぶ店：毎朝10時、日替わりランチを配信</h2>

          <p>
            ランチ型の店の、最も強い武器は——<br />
            <strong>「毎朝10時の、日替わりランチ配信」</strong>です。
          </p>

          <h3 className="g-h3">なぜ、朝10時なのか</h3>

          <p>
            お客様が「今日のランチ、どこ行こう」と考え始めるのは、<br />
            <strong>午前10時〜11時</strong>。<br />
            この時間に配信すれば、お昼の来店に、直結します。
          </p>

          <div className="g-callout success">
            <span className="ico">📢</span>
            <div>
              <p><strong>配信例</strong></p>
              <p>
                「おはようございます🍱<br />
                <strong>本日の日替わりランチ</strong>は、<br />
                <strong>「鶏の照り焼き丼 + 味噌汁 + 小鉢」</strong>。<br />
                11:30より、ご用意しています。」
              </p>
            </div>
          </div>

          <p>
            これを、<strong>毎朝10時に、毎日</strong>。<br />
            お客様は、「今日は、あれだな」と、来店を決めます。
          </p>

          <h3 className="g-h3">定食屋も、まったく同じ</h3>

          <p>
            「定食屋だから、特別なことはできない」——<br />
            そんなことは、ありません。
          </p>

          <p>
            日替わり定食、週替わり、月替わり。<br />
            <strong>「今日の一食」を、毎朝届ける</strong>。これだけで、来店の習慣が生まれます。
          </p>

          <div className="g-quote is-orange">
            ランチ型の店は、<br />
            「今日のランチ」を毎朝届ける。<br /><br />
            それだけで、<br />
            お昼の来店が、習慣になる。
          </div>

          {/* ============================================================
              3. カフェ（ランチ以外）：週の前半後半で、特別スイーツを
          ============================================================ */}
          <h2><span className="num">3</span>カフェ（ランチ以外）：週の前半後半で、特別スイーツを</h2>

          <p>
            カフェ・スイーツ店は、ランチ型とは、戦い方が違います。<br />
            日替わりで、毎日スイーツを作るのは、<strong>負担が大きすぎる</strong>。
          </p>

          <p>
            そこで、<strong>「週の前半・後半」で、分ける</strong>のが、ちょうどいい。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>期間</th>
                  <th>特別スイーツ</th>
                  <th>配信タイミング</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>月〜水</td>
                  <td>特別スイーツ A</td>
                  <td>月曜の朝、配信</td>
                </tr>
                <tr>
                  <td>木〜日</td>
                  <td>特別スイーツ B</td>
                  <td>木曜の朝、配信</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            週2回の配信で、<strong>「今週のスイーツ」</strong>を、2パターン届ける。<br />
            これなら、無理なく続けられます。
          </p>

          <div className="g-callout success">
            <span className="ico">📢</span>
            <div>
              <p><strong>配信例</strong></p>
              <p>
                「今週の前半は——<br />
                <strong>「塩キャラメルバスクチーズケーキ」</strong>🍰<br />
                月〜水限定、ご用意しています。」
              </p>
            </div>
          </div>

          <div className="g-quote is-orange">
            日替わりじゃなくていい。<br />
            週の前半・後半で、分ける。<br /><br />
            それだけで、<br />
            カフェの特別感は、作れる。
          </div>

          {/* ============================================================
              4. 「バズりもの作ってみたシリーズ」は、絶対やるべき
          ============================================================ */}
          <h2><span className="num">4</span>「バズりもの作ってみたシリーズ」は、絶対やるべき</h2>

          <p>
            これは、パン屋でも、飲食店でも、カフェでも——<br />
            <strong>すべての飲食業で、絶対にやるべき施策</strong>です。
          </p>

          <p>
            なのに、<strong>ほぼ、誰もやっていない</strong>。
          </p>

          <h3 className="g-h3">「専門店にしない」のが、コツ</h3>

          <p>
            「バズりものを再現する」と聞くと、<br />
            「専門店化しないと無理」と思うかもしれません。
          </p>

          <p>
            でも、そうじゃない。<br />
            <strong>通常メニューの「特別枠」として、出す</strong>だけでいい。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>① SNSでバズっているものを、探す</h4>
                <p>「生チョコ食パン」「台湾カステラ」「マリトッツォ」——なんでもOK。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>② 「作ってみた」として、特別メニューで出す</h4>
                <p>専門店にしない。通常メニューの片隅で、数量限定で。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>③ 反応を見る</h4>
                <p>開封率・完売・お客様の声で、判断。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>④ 人気があれば、期間限定メニューに</h4>
                <p>定番化するのではなく、期間限定で。次のバズりものを、また作る。</p>
              </div>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">🔥</span>
            <div>
              <p><strong>配信例</strong></p>
              <p>
                「【作ってみました】<br />
                <strong>今、SNSで話題の「〇〇」</strong>、<br />
                当店オリジナルで再現。<br /><br />
                <strong>本日20食限定</strong>。<br />
                14時より、ご提供開始です。」
              </p>
            </div>
          </div>

          <h3 className="g-h3">なぜ、やるべきなのか</h3>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">📱</div>
              <h4>SNSで、既に話題</h4>
              <p>「食べてみたい」という需要が、すでに存在する。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🎯</div>
              <h4>来店動機が、明確</h4>
              <p>「あれが食べられるなら、行こう」——シンプル。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">📸</div>
              <h4>お客様が、SNSに投稿する</h4>
              <p>「バズりものを食べた」という体験は、シェアされる。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">💰</div>
              <h4>低リスクで、試せる</h4>
              <p>数量限定で出して、ダメならやめる。損失が少ない。</p>
            </div>
          </div>

          <div className="g-quote is-orange">
            「バズりもの作ってみたシリーズ」は、<br />
            飲食業の、最強の武器。<br /><br />
            なのに、<br />
            ほぼ、誰もやっていない。
          </div>

          {/* ============================================================
              5. Push-taroなら、これが全部、簡単に仕込める
          ============================================================ */}
          <h2><span className="num">5</span>Push-taroなら、これが全部、簡単に仕込める</h2>

          <p>
            ここまでの施策を、Push-taroなら、<br />
            <strong>特別な知識も、マーケティング専任チームもなく、仕込めます</strong>。
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
                  <td>毎朝10時のランチ配信</td>
                  <td>プッシュ通知</td>
                  <td className="yes">全プラン</td>
                </tr>
                <tr>
                  <td>週2回のスイーツ配信</td>
                  <td>プッシュ通知</td>
                  <td className="yes">全プラン</td>
                </tr>
                <tr>
                  <td>バズりもの作ってみた</td>
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

          <h3 className="g-h3">プラン別の目安</h3>

          <p>
            毎日のランチ配信、週2回のスイーツ配信——<br />
            この運用なら、<strong>LIGHT / STANDARDで十分</strong>です。
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
            常連向けのクーポン（連続・達成・誕生日・休眠復活）まで仕込みたいなら、<br />
            <strong>PROプラン</strong>。配信無制限で、すべての機能が使えます。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>飲食店・カフェのリピート施策を、シンプルに。</strong></p>
              <p>
                「今日のランチ」「特別スイーツ」「バズりもの」——<br />
                毎日の情報発信が、来店の習慣を作ります。
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
              <Link href="/guide/bakery" className="g-related-card">
                <span className="ico">🥐</span>
                <div>
                  <div className="title">パン屋・ベーカリー向け</div>
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
            <h3>「今日の一食」を、仕組みに。</h3>
            <p>日替わりランチ・特別スイーツ・バズりもの——毎日の情報を、Push-taroで。</p>
            <Link href="/signup" className="g-cta-btn">無料相談 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
