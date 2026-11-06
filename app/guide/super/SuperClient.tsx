'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function SuperClient() {
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
          <span className="current">スーパー・小売店</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">🛒 スーパー・小売店向け</span>
          <h1>スーパー・小売店のための<br />Push-taro活用ガイド</h1>
          <p>
            スーパーの最大コストは、<strong>チラシ</strong>です。<br />
            印刷費・折込費で、<strong>月100〜500万円</strong>。<br />
            特設ページ + プッシュ通知 + クーポンで、<strong>チラシを置き換える</strong>。<br />
            ポイントカードも不要に。地域密着型スーパーの、新しい集客です。
          </p>
        </div>

        <div className="g-content">

          {/* ============================================================
              1. スーパーの最大コストは、チラシ
          ============================================================ */}
          <h2><span className="num">1</span>スーパーの最大コストは、チラシ</h2>

          <p>
            スーパー経営で、最も大きなコストのひとつが、<strong>チラシ</strong>です。<br />
            売上に直結する一方で、こんな負担があります。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>費用の目安</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>チラシ印刷費</td>
                  <td>1回 10〜50万円</td>
                </tr>
                <tr>
                  <td>折込費</td>
                  <td>1回 20〜100万円</td>
                </tr>
                <tr>
                  <td>月4回の場合</td>
                  <td className="no">月100〜500万円</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            しかも、チラシの効果は、年々下がっています。
          </p>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>新聞を、読まなくなっている。</strong></p>
              <p>
                新聞購読者は、年々減少。<br />
                一方、スマホは、ほぼ全世代に普及。<br />
                チラシが届いても、<strong>見られていない</strong>。
              </p>
            </div>
          </div>

          <div className="g-quote is-orange">
            チラシは、届いている。<br />
            でも、見られていない。<br /><br />
            チラシの時代は、<br />
            終わりつつある。
          </div>

          {/* ============================================================
              2. 「特売情報」を、毎日届ける
          ============================================================ */}
          <h2><span className="num">2</span>「特売情報」を、毎日届ける</h2>

          <p>
            チラシの代わりに、何を届けるのか。<br />
            それは、<strong>「特売情報」</strong>です。
          </p>

          <p>
            チラシと同じ内容を、<strong>特設ページ</strong>で作成し、<br />
            <strong>プッシュ通知</strong>で、お客様に届ける。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>① 特設ページを作成</h4>
                <p>チラシと同じレイアウトで、特売情報を掲載。管理画面から、スマホで編集。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>② プッシュ通知で配信</h4>
                <p>「本日の特売」を、毎日配信。お客様のスマホに、直接届く。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>③ クーポンも、同時に配信</h4>
                <p>「本日限り」「タイムセール」など、クーポンで来店動機を強化。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>④ お客様は、スマホで確認</h4>
                <p>そのまま来店して、レジでQRコードを提示。消込完了。</p>
              </div>
            </div>
          </div>

          <h3 className="g-h3">毎日届けられる3つの特売</h3>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">📅</div>
              <h4>日替わり特売</h4>
              <p>「本日の特売」を、毎日配信。お客様は、スマホで確認。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">⏰</div>
              <h4>タイムセール</h4>
              <p>「今、半額！」を、リアルタイム配信。空いた時間に、来店を促す。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🎉</div>
              <h4>週末特売</h4>
              <p>週末の特売情報を、金曜に配信。土日の来店を後押し。</p>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">📢</span>
            <div>
              <p><strong>配信例</strong></p>
              <p>
                「【本日の特売】<br />
                🥩 国産和牛、<strong>30%OFF</strong><br />
                🍓 いちご、<strong>1パック¥298</strong><br />
                🥚 卵10個、<strong>¥158</strong><br /><br />
                <strong>18時まで</strong>、ご用意しています。」
              </p>
            </div>
          </div>

          {/* ============================================================
              3. 毎日配信なら、PROが本命
          ============================================================ */}
          <h2><span className="num">3</span>毎日配信なら、PROが本命</h2>

          <p>
            スーパーは、<strong>毎日配信</strong>が基本。<br />
            顧客数も多いので、プラン選択が重要です。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>顧客数</th>
                  <th>配信頻度</th>
                  <th>推奨プラン</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>〜500人</td>
                  <td>毎日</td>
                  <td className="yes">STANDARD（¥3,800）</td>
                </tr>
                <tr>
                  <td>〜1,000人</td>
                  <td>週3回</td>
                  <td className="yes">STANDARD（¥3,800）</td>
                </tr>
                <tr>
                  <td>1,000人〜</td>
                  <td>毎日</td>
                  <td className="yes">PRO（¥10,000）</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            たとえば、顧客1,000人に毎日配信すると、<strong>月30,000通</strong>。<br />
            STANDARD（15,000通）では足りません。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>スーパーは、PROが本命</strong></p>
              <p>
                PROプラン（¥10,000、配信無制限）なら、<br />
                毎日配信しても、追加料金なし。<br />
                クーポンも、使い放題。<br />
                <strong>チラシ代の、1/10以下</strong>です。
              </p>
            </div>
          </div>

          <div className="g-quote is-orange">
            チラシ代、月100〜500万円。<br />
            Push-taro PRO、月¥10,000。<br /><br />
            これだけで、<br />
            経営が、変わる。
          </div>

          {/* ============================================================
              4. ポイントカードを、置き換える
          ============================================================ */}
          <h2><span className="num">4</span>ポイントカードを、置き換える</h2>

          <p>
            スーパーのもう一つの負担が、<strong>ポイントカード</strong>です。<br />
            Push-taroなら、これを、丸ごと置き換えられます。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>ポイントカード</th>
                  <th className="yes">Push-taro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>カード発行コスト</td>
                  <td className="no">1枚 数十〜数百円</td>
                  <td className="yes">ゼロ</td>
                </tr>
                <tr>
                  <td>カード更新・再発行</td>
                  <td className="no">必要</td>
                  <td className="yes">不要</td>
                </tr>
                <tr>
                  <td>ポイント管理システム</td>
                  <td className="no">必要</td>
                  <td className="yes">不要</td>
                </tr>
                <tr>
                  <td>レジでの読み取り</td>
                  <td>カードをスキャン</td>
                  <td className="yes">QRコードをスキャン</td>
                </tr>
                <tr>
                  <td>紛失・不正利用</td>
                  <td className="no">対応が必要</td>
                  <td className="yes">電話番号認証で防止</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="g-h3">シニア層にも、やさしい</h3>

          <p>
            スーパーの顧客層は、<strong>シニアが多い</strong>。<br />
            「スマホは難しい」と思われがちですが、実は、そうでもありません。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>シニアのスマホは、ほぼAndroid</strong></p>
              <p>
                らくらくホン、Galaxy、AQUOS——シニアのスマホは、ほぼAndroid。<br />
                <strong>Androidは、ホーム画面追加なしで、通知を受け取れます</strong>。<br />
                つまり、登録のハードルが、ほぼゼロ。
              </p>
            </div>
          </div>

          <div className="g-quote is-orange">
            シニア層にも、<br />
            スマホで、簡単。<br /><br />
            「ポイントカード、やめませんか」<br />
            ——これが、最強の提案になる。
          </div>

          {/* ============================================================
              5. Push-taroなら、チラシを置き換えられる
          ============================================================ */}
          <h2><span className="num">5</span>Push-taroなら、チラシを置き換えられる</h2>

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
                  <td>特売情報の特設ページ</td>
                  <td>リンク遷移</td>
                  <td className="yes">全プラン</td>
                </tr>
                <tr>
                  <td>毎日の特売配信</td>
                  <td>プッシュ通知</td>
                  <td className="yes">全プラン</td>
                </tr>
                <tr>
                  <td>タイムセール</td>
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
                  <td>休眠復活クーポン</td>
                  <td>休眠復活クーポン</td>
                  <td className="yes">PRO</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>チラシ代、ゼロ。ポイントカード、不要。</strong></p>
              <p>
                特設ページ + プッシュ通知 + クーポン。<br />
                これが、地域密着型スーパーの、新しい集客です。
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
              <Link href="/guide/apparel" className="g-related-card">
                <span className="ico">👕</span>
                <div>
                  <div className="title">アパレル・雑貨向け</div>
                  <div className="sub">業種別ガイド</div>
                </div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-normal" className="g-related-card">
                <span className="ico">🎟️</span>
                <div>
                  <div className="title">通常クーポン</div>
                  <div className="sub">何度でも使える常設クーポン</div>
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
            <h3>チラシを、プッシュ通知に。</h3>
            <p>特設ページ + クーポン + ポイントカード廃止。地域密着型スーパーの、新しい集客を。</p>
            <Link href="/signup" className="g-cta-btn">無料相談 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
