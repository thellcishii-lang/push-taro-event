'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './line-comparison.css';

export default function LineComparisonClient() {
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
          <span className="current">LINE公式アカウントとの比較</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">📊 設計思想の違い</span>
          <h1>LINE公式アカウントと、<br />Push-taroは、何が違うのか。</h1>
          <p>
            LINE Businessは、<strong>本当に素晴らしいツール</strong>です。<br />
            9,800万人が使う国民的インフラ。友だち登録という低いハードル。<br />
            でも、<strong>「クーポンを届ける」という一点において</strong>、<br />
            LINEとPush-taroは、<strong>根本的に設計が違います</strong>。
          </p>
        </div>

        <div className="g-content">

          {/* 1 */}
          <h2><span className="num">1</span>決定的な違いは、「クーポンの届け方」</h2>
          <p>まず、結論から書きます。</p>
          <div className="g-quote is-orange">
            LINEは、「クーポンを届ける」＝「メッセージを送る」。<br /><br />
            Push-taroは、「クーポンを発行する」＝「自動でお客様画面に反映」。<br /><br />
            この違いが、すべての差を生みます。
          </div>

          <h3 className="g-h3">LINEの場合：クーポンを届けるたびに、1通消費する</h3>
          <p>
            LINEでクーポンを届けるには、<strong>必ずメッセージを送信</strong>する必要があります。<br />
            クーポンを添付しようと、別送しようと、<strong>1通は消費する</strong>。
          </p>

          <div className="flow-compare">
            <div className="flow-card">
              <div className="flow-card-label">LINE</div>
              <div className="flow-steps">
                <div className="flow-step"><span className="flow-step-num">1</span><span>クーポンを届けたい</span></div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step is-ctr"><span className="flow-step-num">2</span><span>メッセージを送信（1通消費）</span></div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step"><span className="flow-step-num">3</span><span>トーク画面に届く</span></div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step"><span className="flow-step-num">4</span><span>履歴を遡って探す</span></div>
              </div>
            </div>
            <div className="flow-card is-push">
              <div className="flow-card-label">PUSH-TARO</div>
              <div className="flow-steps">
                <div className="flow-step"><span className="flow-step-num">1</span><span>クーポンを発行する</span></div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step is-ctr"><span className="flow-step-num">2</span><span>自動でお客様画面に反映（0通）</span></div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step"><span className="flow-step-num">3</span><span>クーポン専用画面に常時表示</span></div>
                <div className="flow-arrow-down">↓</div>
                <div className="flow-step"><span className="flow-step-num">4</span><span>プッシュ通知は、任意</span></div>
              </div>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>Push-taroでは、「クーポンを届ける」と「通知を送る」が、完全に分離しています。</strong></p>
              <p>
                クーポンを発行するだけで、お客様の画面に自動反映。<br />
                プッシュ通知は、<strong>「今週限定」「お久しぶり」など、特別な時だけ</strong>送る。<br />
                これが、Push-taroの最も大きな違いです。
              </p>
            </div>
          </div>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>「クーポン発行＝0通」は、STANDARD以上の機能です。</strong></p>
              <p>
                LIGHTプランは、<strong>初回クーポンのみ</strong>。<br />
                「通常クーポン」「特別達成クーポン」などの定期配信クーポンは、STANDARD以上で使えます。
              </p>
            </div>
          </div>

          {/* 2 */}
          <h2><span className="num">2</span>プラン別のクーポン機能</h2>
          <p>まず、Push-taroの3プランで、<strong>どのクーポンが使えるか</strong>を整理します。</p>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>プラン</th><th>月額</th><th>配信上限</th><th>クーポン機能</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>LIGHT</strong></td><td>¥1,980</td><td>5,000通</td><td className="no">初回クーポンのみ</td></tr>
                <tr><td><strong>STANDARD</strong></td><td>¥3,800</td><td>15,000通</td><td className="yes">初回・通常・特別達成</td></tr>
                <tr><td><strong>PRO</strong></td><td>¥10,000</td><td>無制限</td><td className="yes">全7種類</td></tr>
              </tbody>
            </table>
          </div>
          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>LIGHTは「プッシュ通知を送るだけ」のプラン</strong></p>
              <p>LIGHTは、<strong>QRコード登録・プッシュ通知・初回クーポン</strong>が基本機能。<br />定期配信のクーポン（通常・達成）は、STANDARDから。<br /><strong>「まず配信の習慣を作る」</strong>ための、入門プランです。</p>
            </div>
          </div>

          {/* 3 */}
          <h2><span className="num">3</span>「クーポンは自動反映」が、何を変えるか</h2>
          <p>この設計の違いは、<strong>運用・コスト・お客様体験</strong>のすべてを変えます。<br />以下は、<strong>STANDARD以上</strong>の話です。</p>

          <h3 className="g-h3">① クーポン配信コストが、実質ゼロ</h3>
          <p>LINEでは、クーポンを届けるたびに通数がかかります。<br />Push-taroでは、<strong>発行するだけなら0通</strong>。</p>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead><tr><th>アクション</th><th>LINE</th><th className="col-pushtaro">Push-taro STANDARD+</th></tr></thead>
              <tbody>
                <tr><td>クーポン発行</td><td className="no">メッセージ送信（1通）</td><td className="col-pushtaro yes">0通</td></tr>
                <tr><td>クーポンの自動反映</td><td className="no">なし</td><td className="col-pushtaro yes">自動</td></tr>
                <tr><td>プッシュ通知</td><td className="no">必須</td><td className="col-pushtaro yes">任意</td></tr>
                <tr><td>クーポンの閲覧</td><td>トーク履歴を遡る</td><td className="col-pushtaro yes">専用画面に常時表示</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="g-h3">② プッシュ通知の使い方が、全く変わる</h3>
          <p>LINE：「通知＝クーポン送信」。<br />Push-taro：「通知は<strong>必要な時だけ</strong>」。</p>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead><tr><th>クーポンの種類</th><th>発行</th><th>プッシュ通知</th></tr></thead>
              <tbody>
                <tr><td>通常クーポン（会員様10%OFF）</td><td className="yes">する</td><td className="no">不要（常設）</td></tr>
                <tr><td>特別達成クーポン（3回来店で解放）</td><td className="yes">自動発行</td><td>任意（達成をお祝い）</td></tr>
                <tr><td>新作クーポン（今週限定）</td><td className="yes">する</td><td className="yes">する（今週限定を伝える）</td></tr>
                <tr><td>休眠復活クーポン</td><td className="yes">自動発行</td><td className="yes">する（お久しぶりを伝える）</td></tr>
              </tbody>
            </table>
          </div>
          <div className="g-quote is-orange">
            常設クーポンは、<br />発行するだけで、運用できる。<br /><br />これが、LINEにはない、<br />Push-taroの強みです。
          </div>

          <h3 className="g-h3">③ 「今、何が使えるか」が、一目でわかる</h3>
          <p>LINEでは、クーポンはトーク履歴に埋もれます。<br />新しいメッセージが届くたびに、過去のクーポンは、下に流れていく。</p>
          <p>Push-taroでは、<strong>クーポン専用画面</strong>に、有効なクーポンが常に一覧表示されます。<br />お客様は、レジで「あのクーポン、どこだっけ？」と探す手間が、ありません。</p>

          {/* 4 (旧4.5) */}
          <h2><span className="num">4</span>LINE公式アカウントの料金プランと配信上限</h2>
          <p>次に、皆様がお使いの（あるいは導入を検討している）LINE公式アカウントの「配信上限」を正確に把握しておきましょう。</p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>プラン</th><th>月額（税別）</th><th>配信上限</th><th>Push-taroとの比較</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>コミュニケーション</strong></td><td>無料</td><td className="no">月200通</td><td>1回の配信で終わる</td></tr>
                <tr><td><strong>ライト</strong></td><td>¥5,000</td><td className="no">月5,000通</td><td>登録者500人なら月10回で終了</td></tr>
                <tr><td><strong>スタンダード</strong></td><td>¥15,000</td><td className="no">月30,000通</td><td>クーポン別送で通数が足りなくなる</td></tr>
                <tr><td><strong>プロ</strong></td><td>¥50,000</td><td>無制限</td><td className="yes">Push-taro PRO（¥10,000）の5倍の価格</td></tr>
              </tbody>
            </table>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>ここが落とし穴！「セグメント配信」の限界</strong></p>
              <p>「セグメント配信で対象を絞れば、通数を節約できる」と考える方もいます。<br />しかし、配信対象を分ける手間がかかる上に、実店舗の場合「顧客の属性情報」が少ないため、セグメントを分けること自体が困難です。<br />さらに、通数を節約するために配信を控えると、<strong>一番大切な「お客様との接触頻度」が減ってしまいます。</strong></p>
            </div>
          </div>

          {/* 5 */}
          <h2><span className="num">5</span>LINEの配信通数、正しく理解していますか</h2>
          <p>では、LINEの配信通数の仕組みを、正確に整理します。<br />配信通数は、<strong>「友だち数 × 配信回数」</strong>で消費されます。</p>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead><tr><th>送信方法</th><th>通数カウント</th></tr></thead>
              <tbody>
                <tr><td>メッセージのみ</td><td>1通</td></tr>
                <tr><td>メッセージ + クーポン（同時送信）</td><td className="yes">1通（クーポンは添付扱い）</td></tr>
                <tr><td>メッセージ + クーポン（別送信）</td><td className="no">2通（別々にカウント）</td></tr>
              </tbody>
            </table>
          </div>
          <p>「同時送信なら1通」と聞くと、得した気分になります。<br />でも、ここに<strong>LINEの隠れた弱点</strong>があります。</p>

          <h3 className="g-h3">「同時送信」の罠</h3>
          <div className="g-steps">
            <div className="g-step"><div className="g-step-body"><h4>① クーポンが、メッセージに埋もれる</h4><p>トーク画面では、メッセージ本文が優先表示されます。クーポンは、下に小さく添付されるだけ。「クーポンが来た」という実感が、薄れる。</p></div></div>
            <div className="g-step"><div className="g-step-body"><h4>② お客様が、クーポンだけを見返せない</h4><p>LINEのトーク画面は、時系列で流れていきます。「あのクーポン、どこだっけ？」と探すのが、手間になる。</p></div></div>
            <div className="g-step"><div className="g-step-body"><h4>③ 「今すぐ使える」感が、弱い</h4><p>クーポンは、<strong>独立して目立つから使われる</strong>。メッセージの添付では、その臨場感が出ない。</p></div></div>
          </div>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>「通数を節約する」か、「クーポンを目立たせる」か。</strong></p>
              <p>LINEでは、この<strong>トレードオフ</strong>から逃れられません。</p>
            </div>
          </div>

          <p>そして、この「配信数」の問題は、<br /><strong>その店舗のCVR（来店率）を出すために、決定的に重要</strong>です。</p>
          <p>CVRは、店舗ごとに違います。<br />業種・商圏・客層・単価——あらゆる条件で変わるからです。<br />だから、<strong>「毎週配信して、結果を見て、改善する」</strong>というサイクルを回さないと、<br />自店舗のCVRは、永遠に見えてきません。</p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>CVRについて、もっと詳しく知りたい方へ</strong></p>
              <p>プッシュ通知のCTR・CVRのベンチマーク、<br />実店舗の来店CVRの目安、ECサイトとの比較は、<br />別の記事で詳しく解説しています。</p>
            </div>
          </div>

          <Link href="/guide/push-notification-metrics" className="next-article">
            <div className="next-article-icon">📊</div>
            <div className="next-article-body">
              <div className="next-article-label">詳しくはこちら</div>
              <div className="next-article-title">プッシュ通知のCVRは、何%あればいいのか</div>
              <div className="next-article-desc">CTRとCVRのベンチマークを、データで解説。<br />実店舗の来店CVR 3.88%、ECサイトのCVR 0.29%など、数字で見るプッシュ通知の実力。</div>
            </div>
            <div className="next-article-arrow">→</div>
          </Link>

          {/* 6 */}
          <h2><span className="num">6</span>Push-taroの答え：「クーポン」と「通知」を、完全分離する</h2>
          <p>Push-taroは、このトレードオフを、<strong>設計で解決</strong>しました。</p>

          <div className="separation-diagram">
            <div className="separation-col">
              <div className="separation-head"><span className="separation-icon">🎫</span><h4>クーポン発行</h4></div>
              <div className="separation-body"><p>管理画面で作成・有効化</p><p className="separation-result">→ 自動でお客様画面に反映</p><p className="separation-cost">0通</p></div>
            </div>
            <div className="separation-plus">＋</div>
            <div className="separation-col">
              <div className="separation-head"><span className="separation-icon">📢</span><h4>プッシュ通知</h4></div>
              <div className="separation-body"><p>必要な時だけ送信</p><p className="separation-result">→ ホーム画面に通知</p><p className="separation-cost">1通（通知のみ）</p></div>
            </div>
          </div>

          <p><strong>「クーポンを発行する」と「通知を送る」は、別の操作です。</strong><br />これにより、店舗は<strong>無駄な通数を消費せず</strong>、クーポンを自由に設計できます。</p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>「常設クーポン」という発想</strong></p>
              <p>たとえば、「会員様はいつでも10%OFF」というクーポン。<br />LINEなら、定期的にメッセージを送り続けないと、見てもらえません。<br />Push-taroなら、<strong>一度発行するだけで、ずっと使える</strong>（STANDARD以上）。</p>
            </div>
          </div>

          {/* 7 */}
          <h2><span className="num">7</span>登録者数別・コスト比較</h2>
          <p>では、具体的な数字で見ていきましょう。<br />ベースは、<strong>週2回配信（月8回）・うち4回がクーポン</strong>という運用です。</p>

          <h3 className="g-h3">ケース①：登録者500人の場合</h3>
          <p>まず、<strong>LIGHTプラン</strong>（クーポンは初回のみ）と、<strong>STANDARDプラン</strong>（クーポン使い放題）の2段構えで見ます。</p>
          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>LIGHTプランの場合</strong></p>
              <p>クーポンは初回のみ。<br />定期配信のクーポン（月4回）は使えないので、<strong>月8回すべてプッシュ通知</strong>。<br />4,000通で、5,000通の範囲内。ギリギリ運用可能。</p>
            </div>
          </div>

          <div className="cost-compare">
            <div className="cost-card is-line">
              <div className="cost-card-head"><span className="cost-badge">LINE ライトプラン</span><span className="cost-amount">¥5,000<span className="cost-per">/月</span></span></div>
              <div className="cost-detail">
                <div className="cost-row"><span>配信上限</span><strong>5,000通</strong></div>
                <div className="cost-row"><span>月8回配信 × 500人</span><strong>4,000通</strong></div>
                <div className="cost-row"><span>クーポン4回を別送</span><strong className="is-warn">+2,000通 = 6,000通</strong></div>
                <div className="cost-verdict is-bad">❌ 上限を超える。追加課金 or スタンダードへ</div>
              </div>
            </div>
            <div className="cost-card is-push">
              <div className="cost-card-head"><span className="cost-badge is-push">Push-taro STANDARD</span><span className="cost-amount">¥3,800<span className="cost-per">/月</span></span></div>
              <div className="cost-detail">
                <div className="cost-row"><span>配信上限</span><strong>15,000通</strong></div>
                <div className="cost-row"><span>月8回配信 × 500人</span><strong>4,000通</strong></div>
                <div className="cost-row"><span>クーポン4回</span><strong className="is-good">0通（自動反映）</strong></div>
                <div className="cost-verdict is-good">✅ 余裕あり。LINEの1/4の価格</div>
              </div>
            </div>
          </div>

          <h3 className="g-h3">ケース②：登録者1,500人の場合</h3>
          <div className="cost-compare">
            <div className="cost-card is-line">
              <div className="cost-card-head"><span className="cost-badge">LINE スタンダード</span><span className="cost-amount">¥15,000<span className="cost-per">/月</span></span></div>
              <div className="cost-detail">
                <div className="cost-row"><span>配信上限</span><strong>30,000通</strong></div>
                <div className="cost-row"><span>月8回配信 × 1,500人</span><strong>12,000通</strong></div>
                <div className="cost-row"><span>クーポン4回を別送</span><strong>+6,000通 = 18,000通</strong></div>
                <div className="cost-verdict is-ok">△ ギリギリ。だが、月¥15,000</div>
              </div>
            </div>
            <div className="cost-card is-push">
              <div className="cost-card-head"><span className="cost-badge is-push">Push-taro STANDARD</span><span className="cost-amount">¥3,800<span className="cost-per">/月</span></span></div>
              <div className="cost-detail">
                <div className="cost-row"><span>配信上限</span><strong>15,000通</strong></div>
                <div className="cost-row"><span>月8回配信 × 1,500人</span><strong>12,000通</strong></div>
                <div className="cost-row"><span>クーポン4回</span><strong className="is-good">0通（自動反映）</strong></div>
                <div className="cost-verdict is-good">✅ 余裕あり。LINEの1/4の価格</div>
              </div>
            </div>
          </div>

          <h3 className="g-h3">ケース③：登録者3,000人の場合</h3>
          <div className="cost-compare">
            <div className="cost-card is-line">
              <div className="cost-card-head"><span className="cost-badge">LINE プロ</span><span className="cost-amount">¥50,000<span className="cost-per">/月</span></span></div>
              <div className="cost-detail">
                <div className="cost-row"><span>配信上限</span><strong>無制限</strong></div>
                <div className="cost-row"><span>月8回配信 × 3,000人</span><strong>24,000通</strong></div>
                <div className="cost-row"><span>クーポン4回を別送</span><strong>+12,000通</strong></div>
                <div className="cost-verdict is-bad">❌ スタンダード（30,000通）では足りない。プロが必須</div>
              </div>
            </div>
            <div className="cost-card is-push">
              <div className="cost-card-head"><span className="cost-badge is-push">Push-taro PRO</span><span className="cost-amount">¥10,000<span className="cost-per">/月</span></span></div>
              <div className="cost-detail">
                <div className="cost-row"><span>配信上限</span><strong className="is-good">無制限</strong></div>
                <div className="cost-row"><span>月8回配信 × 3,000人</span><strong>無制限（超過なし）</strong></div>
                <div className="cost-row"><span>クーポン4回</span><strong className="is-good">0通（自動反映）</strong></div>
                <div className="cost-verdict is-good">✅ LINEの1/5の価格。全クーポン機能が使える</div>
              </div>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>登録者数が増えるほど、Push-taroの優位性が際立つ</strong></p>
              <p>500人以下の小規模なら、LINE無料プランで足ります。<br />しかし、500人を超えたあたりから、Push-taroの方が安く、自由に配信できます。</p>
            </div>
          </div>

          {/* 8 */}
          <h2><span className="num">8</span>あなたの店舗は、どっち？</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead><tr><th>登録者数・目的</th><th>推奨</th><th>理由</th></tr></thead>
              <tbody>
                <tr><td>〜200人（配信のみ）</td><td className="yes">LINE 無料プラン</td><td>月200通で足りる。まずは無料で始める</td></tr>
                <tr><td>200〜600人（配信のみ）</td><td className="yes">Push-taro LIGHT</td><td>¥1,980で5,000通。クーポンは初回のみ</td></tr>
                <tr><td>200〜600人（クーポンも使いたい）</td><td className="yes">Push-taro STANDARD</td><td>¥3,800で15,000通。通常クーポンも使える</td></tr>
                <tr><td>600〜1,500人</td><td className="yes">Push-taro STANDARD</td><td>LINEライトでは足りず、スタンダード¥15,000が必要になる</td></tr>
                <tr><td>1,500〜3,000人</td><td className="yes">Push-taro STANDARD or PRO</td><td>LINEスタンダードの1/4〜1/2の価格</td></tr>
                <tr><td>3,000人以上</td><td className="yes">Push-taro PRO</td><td>LINEプロ¥50,000に対し、¥10,000で無制限</td></tr>
              </tbody>
            </table>
          </div>
          <p>ただし、これは<strong>「配信コスト」だけの比較</strong>です。<br />実際の判断には、クーポンの使いやすさ・通知の届き方・運用のシンプルさも含めて、総合的に考える必要があります。</p>

          {/* 9 */}
          <h2><span className="num">9</span>まずSTANDARDから始める理由</h2>
          <p>Push-taroには、LIGHT・STANDARD・PROの3プランがあります。<br />最初から<strong>PROを使いこなす必要はありません</strong>。</p>
          <div className="g-steps">
            <div className="g-step"><div className="g-step-body"><h4>STEP 1：LIGHT で、配信の習慣を作る</h4><p>まず「毎週配信する」という習慣を身につける。月5,000通で、500人規模までなら十分。<br />ただし、クーポンは<strong>初回のみ</strong>。定期配信のクーポンは、STANDARDから。</p></div></div>
            <div className="g-step"><div className="g-step-body"><h4>STEP 2：STANDARD で、来店回数の施策を始める</h4><p>通常クーポン・特別達成クーポンで、「来てくれる人を大切にする」仕組みを追加。ここからが、本番。</p></div></div>
            <div className="g-step"><div className="g-step-body"><h4>STEP 3：PRO で、本格的なリピート施策へ</h4><p>ステップアップ・連続・誕生日・休眠復活。顧客が1,000人を超えたあたりが、切り替えの目安。</p></div></div>
          </div>
          <div className="g-quote is-orange">
            まずは、STANDARDで<br />「全員に同じ施策」を届ける習慣を作る。<br /><br />それが、リピート施策の、<br />一番の土台になる。
          </div>

          {/* 10 */}
          <h2><span className="num">10</span>広告費の「循環」を作る</h2>
          <p>最後に、もっと大きな話を。<br />Push-taroが目指すのは、<strong>「広告費に依存しない経営体質」</strong>です。</p>
          <div className="cycle-diagram">
            <div className="cycle-step"><div className="cycle-num">1</div><div className="cycle-content"><h4>広告で、集客する</h4><p>オープン時、売上の落ち込み時に、一時的に広告の露出を増やす</p></div></div>
            <div className="cycle-arrow">↓</div>
            <div className="cycle-step"><div className="cycle-num">2</div><div className="cycle-content"><h4>来店した顧客に、QRで登録してもらう</h4><p>初回クーポンで、登録のハードルを下げる</p></div></div>
            <div className="cycle-arrow">↓</div>
            <div className="cycle-step is-highlight"><div className="cycle-num">3</div><div className="cycle-content"><h4>クーポンを発行して、プッシュ通知で届ける</h4><p>クーポンは自動反映。通知は、必要な時だけ</p></div></div>
            <div className="cycle-arrow">↓</div>
            <div className="cycle-step"><div className="cycle-num">4</div><div className="cycle-content"><h4>常連化 → 口コミ → 新規も自然に増える</h4><p>広告費を、通常レベルに戻せる</p></div></div>
          </div>
          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>この循環が、実店舗の理想形です。</strong></p>
              <p>広告を打ち続ける経営から、広告を「点」で打つ経営へ。<br />Push-taroは、その循環を作るための、リピート施策の土台です。</p>
            </div>
          </div>

          {/* 11 */}
          <h2><span className="num">11</span>まとめ</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead><tr><th>論点</th><th>LINE公式</th><th>Push-taro LIGHT</th><th>Push-taro STANDARD+</th></tr></thead>
              <tbody>
                <tr><td>クーポンの届け方</td><td>メッセージ送信（1通）</td><td className="no">初回のみ</td><td className="yes">自動反映（0通）</td></tr>
                <tr><td>定期配信クーポン</td><td>1通</td><td className="no">なし</td><td className="yes">0通</td></tr>
                <tr><td>プッシュ通知の位置づけ</td><td>クーポン送信と一体化</td><td>配信の基本</td><td className="yes">完全に独立（任意）</td></tr>
                <tr><td>クーポンの閲覧</td><td>トーク履歴を遡る</td><td>トーク履歴を遡る</td><td className="yes">専用画面に常時表示</td></tr>
                <tr><td>500人・月8回配信</td><td>¥5,000〜（別送で上限超え）</td><td>¥1,980（配信のみ）</td><td className="yes">¥3,800（クーポン込）</td></tr>
                <tr><td>1,500人・月8回配信</td><td>¥15,000（スタンダード）</td><td className="no">配信のみ</td><td className="yes">¥3,800（STANDARD）</td></tr>
                <tr><td>3,000人・月8回配信</td><td>¥50,000（プロ）</td><td className="no">配信のみ</td><td className="yes">¥10,000（PRO・無制限）</td></tr>
              </tbody>
            </table>
          </div>
          <p>LINEは、素晴らしいツールです。<br />否定する気は、まったくありません。<br /><br />ただ、<strong>「クーポンを届ける」という一点において、設計が根本的に違う</strong>。<br />その違いを理解した上で、あなたの店舗に合った方を選んでください。</p>

          {/* 関連ガイド */}
          <div className="g-related">
            <h3>この記事の前提</h3>
            <div className="g-related-grid">
              <Link href="/guide/store-marketing" className="g-related-card">
                <span className="ico">📖</span>
                <div><div className="title">実店舗の集客、オススメの施策</div><div className="sub">LINEの配信上限という壁を、最初に指摘した記事</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <h3>次に読む</h3>
            <div className="g-related-grid">
              <Link href="/guide/push-notification-metrics" className="g-related-card is-next">
                <span className="ico">📊</span>
                <div><div className="title">プッシュ通知のCVRは、何%あればいいのか</div><div className="sub">CTRとCVRのベンチマークを、データで解説</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <h3>あわせて読みたい</h3>
            <div className="g-related-grid">
              <Link href="/guide/segmentation" className="g-related-card">
                <span className="ico">📊</span>
                <div><div className="title">セグメント配信とは</div><div className="sub">実店舗では「使えない」理由</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/ctr-to-cvr" className="g-related-card">
                <span className="ico">🎯</span>
                <div><div className="title">CTRを、CVRに繋げる方法</div><div className="sub">衝動タップを、来店に変える3つの設計</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>配信上限を、気にせず。</h3>
            <p>Push-taroは、クーポン発行が0通。<br />プッシュ通知は、必要な時だけ。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
