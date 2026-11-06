'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function SnackClient() {
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
          <span className="current">スナック・パブ</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">🍸 スナック・パブ向け</span>
          <h1>スナック・パブのための<br />Push-taro活用ガイド</h1>
          <p>
            まず、正直に書きます。<br />
            <strong>顧客200人以下・キャスト1〜2人なら、LINEライトプランで十分です</strong>。<br />
            スナックは「人と人」のビジネス。個別チャットが、最も効率的です。<br />
            この記事では、<strong>「それでもPush-taroが向いているのは、どんな店舗か」</strong>を、正直に解説します。
          </p>
        </div>

        <div className="g-content">

          {/* 1 */}
          <h2><span className="num">1</span>スナックは、「人と人」のビジネス</h2>

          <p>
            スナックの最大の武器は、<strong>ママ・マスターと常連客の関係性</strong>です。<br />
            そして、常連客同士のつながり。<br />
            これは、他の業種にはない、スナックならではの強みです。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>だから、個別チャットが一番効率的</strong></p>
              <p>
                「今日、来る？」「元気？」——1対1の会話。<br />
                これが、スナックの集客の、最も自然な形です。<br />
                一斉配信よりも、<strong>個別チャットの方が、来店率が高い</strong>ケースが多い。
              </p>
            </div>
          </div>

          <p>
            そして、その個別チャットを、<strong>すでにLINEでやっている</strong>。<br />
            だから、スナックに「Push-taroを導入してください」と言うのは、<br />
            <strong>正直、無理がある</strong>のです。
          </p>

          {/* 2 */}
          <h2><span className="num">2</span>でも、キャストが増えると、限界が来る</h2>

          <p>
            個別チャットは、最強です。<br />
            でも、<strong>キャストが5人以上</strong>になってくると、話が変わります。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>規模</th>
                  <th>個別チャット</th>
                  <th>一斉配信の必要性</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ママ1人・顧客100人</td>
                  <td className="yes">◎ 十分可能</td>
                  <td className="no">不要</td>
                </tr>
                <tr>
                  <td>ママ1人・顧客200人</td>
                  <td className="yes">○ ギリギリ</td>
                  <td>△ 週1回なら、あった方が良い</td>
                </tr>
                <tr>
                  <td>キャスト5人・顧客500人</td>
                  <td className="no">❌ 不可能</td>
                  <td className="yes">✅ 必須</td>
                </tr>
                <tr>
                  <td>キャスト10人・顧客1,000人</td>
                  <td className="no">❌ 完全に無理</td>
                  <td className="yes">✅ 毎日配信したい</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            キャストが5人以上になると、<br />
            <strong>「今日のキャスト」を配信したくなる</strong>。<br />
            「今夜は、Mika・Yuki・Rina が出勤です」——これが、来店の決め手になる。
          </p>

          <p>
            これを、個別チャットで500人に送るのは、<strong>物理的に無理</strong>です。<br />
            ここで初めて、<strong>一斉配信の必要性</strong>が生まれます。
          </p>

          {/* 3 */}
          <h2><span className="num">3</span>まずは、LINEライトプランで十分です</h2>

          <p>
            ここが、この記事の、最も大切な部分です。<br />
            <strong>顧客200人以下・キャスト1〜2人なら、LINEライトプランで足ります</strong>。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>LINE ライトプラン</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>月額</td><td className="yes">¥5,000</td></tr>
                <tr><td>配信上限</td><td>5,000通</td></tr>
                <tr><td>クーポン機能</td><td className="yes">○ 使える</td></tr>
                <tr><td>友だち追加</td><td className="yes">すでに繋がっている</td></tr>
                <tr><td>個別チャット</td><td className="yes">無制限・無料</td></tr>
              </tbody>
            </table>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>スナックに、LINEライトプランは、よく合います。</strong></p>
              <p>
                ・すでに友だちと繋がっている<br />
                ・クーポンも配れる<br />
                ・個別チャットは無料<br />
                ・月¥5,000で、週1回の一斉配信ができる<br /><br />
                <strong>無理に、Push-taroに乗り換える必要は、ありません。</strong>
              </p>
            </div>
          </div>

          {/* 4 */}
          <h2><span className="num">4</span>Push-taroが向いているのは、こんな店舗</h2>

          <p>
            では、どんなスナックなら、Push-taroが向いているのか。<br />
            それは、<strong>「LINEの配信上限では、足りなくなった店舗」</strong>です。
          </p>

          <h3 className="g-h3">条件①：キャスト5人以上</h3>

          <p>
            「今日のキャスト」を、毎日配信したい。<br />
            キャスト5人以上、顧客500人以上の規模なら、これが来店の決め手になります。
          </p>

          <h3 className="g-h3">条件②：顧客500人以上</h3>

          <p>
            顧客500人に、月20日配信すると、10,000通。<br />
            LINEライトプラン（5,000通）では、足りません。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>LINE スタンダード</th>
                  <th>Push-taro PRO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>月額</td>
                  <td>¥15,000</td>
                  <td className="yes">¥10,000</td>
                </tr>
                <tr>
                  <td>配信上限</td>
                  <td>30,000通</td>
                  <td className="yes">無制限</td>
                </tr>
                <tr>
                  <td>月20日配信 × 500人</td>
                  <td>10,000通（足りる）</td>
                  <td className="yes">無制限（超過なし）</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>スナックの場合、LINEスタンダードが必要になるのは、この規模から</strong></p>
              <p>
                キャスト5人以上・顧客500人以上。<br />
                この規模なら、Push-taro PRO（¥10,000、配信無制限）の方が、安くて自由。
              </p>
            </div>
          </div>

          {/* 5 */}
          <h2><span className="num">5</span>あなたの店舗は、どっち？</h2>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>店舗の規模</th>
                  <th>推奨</th>
                  <th>理由</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ママ1人・顧客100人</td>
                  <td className="yes">LINE 無料プラン</td>
                  <td>個別チャットで十分。月200通も要らない</td>
                </tr>
                <tr>
                  <td>ママ1人・顧客200人</td>
                  <td className="yes">LINE ライトプラン</td>
                  <td>週1回の一斉配信 + 個別チャット。月¥5,000</td>
                </tr>
                <tr>
                  <td>キャスト3人・顧客300人</td>
                  <td className="yes">LINE ライトプラン</td>
                  <td>まだLINEで足りる。クーポンも使える</td>
                </tr>
                <tr>
                  <td>キャスト5人・顧客500人</td>
                  <td className="yes">Push-taro PRO</td>
                  <td>毎日配信したい。LINEスタンダード（¥15,000）より安い</td>
                </tr>
                <tr>
                  <td>キャスト10人・顧客1,000人</td>
                  <td className="yes">Push-taro PRO</td>
                  <td>配信無制限。全クーポン機能が使える</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="g-quote is-orange">
            スナックの多くは、<br />
            LINEライトプランで、十分です。<br /><br />
            Push-taroが要るのは、<br />
            「キャスト5人・顧客500人」を超えた、<br />
            大きな店舗だけ。
          </div>

          {/* 6 */}
          <h2><span className="num">6</span>「今日のキャスト」配信という、最強の武器</h2>

          <p>
            もし、Push-taroを使うなら、<br />
            最も効果的なのが、<strong>「今日のキャスト」配信</strong>です。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>① 今日のキャストを配信する</h4>
                <p>「今夜は、Mika・Yuki・Rina が出勤です🍸」——これを、毎日。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>② 指名客が、来店を決める</h4>
                <p>「Mikaちゃん、今日いるなら行こうかな」——これが、来店の決め手になる。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>③ 暇な日も、告知できる</h4>
                <p>「今夜、空いてるよ」——これを、一斉配信で伝えられる。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>④ イベント告知も、一斉配信</h4>
                <p>「金曜は生演奏」「周年祭」——特別な日を、全員に届ける。</p>
              </div>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>「今日のキャスト」配信は、キャスト5人以上のスナックにしか成立しない</strong></p>
              <p>
                ニッチだが、深い。<br />
                指名文化のあるスナックなら、これが最強の集客ツールになります。
              </p>
            </div>
          </div>

          {/* 7 */}
          <h2><span className="num">7</span>まとめ</h2>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>店舗の規模</th>
                  <th>推奨ツール</th>
                  <th>理由</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ママ1人・顧客〜200人</td>
                  <td className="yes">LINE（無料 / ライト）</td>
                  <td>個別チャット + 週1回配信で、十分</td>
                </tr>
                <tr>
                  <td>キャスト3人・顧客〜300人</td>
                  <td className="yes">LINE ライトプラン</td>
                  <td>クーポンも使える。乗り換え不要</td>
                </tr>
                <tr>
                  <td>キャスト5人以上・顧客500人以上</td>
                  <td className="yes">Push-taro PRO</td>
                  <td>毎日配信したい。LINEより安い</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            スナックは、「人と人」のビジネスです。<br />
            個別チャットを、大切にしてください。<br /><br />
            そして、もし<strong>「配信上限が足りない」</strong>と感じたら——<br />
            その時、Push-taroを思い出してください。
          </p>

          <div className="g-quote is-orange">
            無理に、乗り換える必要は、ありません。<br /><br />
            でも、もし必要になったら、<br />
            Push-taroは、そこにあります。
          </div>

          {/* 関連 */}
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
              <Link href="/guide/features/coupon-dormant" className="g-related-card">
                <span className="ico">💤</span>
                <div>
                  <div className="title">休眠復活クーポン</div>
                  <div className="sub">離反客を呼び戻す</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>まずは、LINEライトプランで。</h3>
            <p>
              スナックの多くは、LINEで足ります。<br />
              もし「配信上限が足りない」と感じたら、<br />
              その時、Push-taroを思い出してください。
            </p>
            <Link href="/guide/line-comparison" className="g-cta-btn">LINEとの比較を見る →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
