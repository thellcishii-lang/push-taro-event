'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './store-marketing.css';

export default function StoreMarketingClient() {
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
          <span className="current">実店舗の集客</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">📖 店舗マーケティング</span>
          <h1>店舗集客においてオススメの施策。<br />これが土台になる。</h1>
          <p>
            広告、ポータルサイト、LP、SNS、そしてLINE。<br />
            どれも必要で、今や全てをやる時代となってます。<br />
            ただ、新規顧客獲得がメインになりがちで<br />
            <strong>1回来店してくれたお客様への施策</strong>の大切さが弱いのが現状ではないでしょうか。
          </p>
        </div>

        <div className="g-content">

          <p>まず、誤解のないように書いておきます。</p>

          <p>
            <strong>SNSは、必要です。</strong><br />
            特に、飲食店におけるSNS運用は、今や必須事項と言っていい。
          </p>

          <p>
            その上で、今、店舗において必要なものを、挙げてみます。
          </p>

          {/* 1. 店舗に必要な5つの施策 */}
          <h2 className="g-h2"><span className="num">1</span>店舗に必要な、5つの施策</h2>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">📢</div>
              <h4>広告</h4>
              <p>瞬発力最強。でも、費用対効果は、高額をかけないと得られない。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🔍</div>
              <h4>ポータルサイト</h4>
              <p>月額固定費を最大化で効果大。低料金では、届く確率が限定的。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🖥️</div>
              <h4>LP</h4>
              <p>SEO上位表示で効果大。更新頻度が少ないと、見られなくなる。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">📱</div>
              <h4>SNS</h4>
              <p>静止画＋ショート動画で興味。でも、すぐ忘れられる。</p>
            </div>
            <div className="g-card-simple is-new">
              <span className="new-badge">ESSENTIAL</span>
              <div className="g-icon-big">💬</div>
              <h4>LINE Business</h4>
              <p>国内最大のメッセージ基盤。今や、実店舗の定番ツール。</p>
            </div>
          </div>

          {/* 2. それぞれの特性と限界 */}
          <h2 className="g-h2"><span className="num">2</span>それぞれの、特性と限界</h2>

          <h3 className="g-h3">広告</h3>
          <p>
            一番、瞬発力があって、強力。<br />
            でも、費用対効果は、<strong>高額をかけないと、思ったほどの効果は得られない</strong>。
          </p>

          <h3 className="g-h3">ポータルサイト</h3>
          <p>
            月額固定費を最大化することで、効果は大きくなる。<br />
            これは、広告と同じような仕組みではあるが、<strong>低料金においては、興味のある人へ届く確率は、通常広告より高い</strong>。
          </p>

          <h3 className="g-h3">LP</h3>
          <p>
            SEO対策などで、上位表示させれば、効果は高い。<br />
            ただし、<strong>更新頻度が少ないと、見られなくなる</strong>。SEO効果も、限定的になる。
          </p>

          <h3 className="g-h3">SNS</h3>
          <p>
            インスタなどの静止画と、ショート動画などを組み合わせることで、興味を持ってもらえそう。<br />
            ただし、特に<strong>ショート動画は「その場の凄い」でしかなく、すぐに忘れられてしまう</strong>。来店までの動機につながるには、なかなか難しい。
          </p>

          <h3 className="g-h3">LINE Business</h3>
          <p>
            国内で<strong>9,800万人以上が使う、国民的インフラ</strong>。<br />
            友達登録という、低いハードルで顧客接点を持てる。<br />
            クーポン、キャンペーン、ポイントカード、おみくじ——<strong>機能も豊富</strong>です。
          </p>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>では、どれをやればいいのか？</strong></p>
              <p>
                答えは、<strong>全部</strong>です。<br />
                全部をやることで、新規集客をあげていくことができる。
              </p>
            </div>
          </div>

          <p>
            ただし、効率化を見たら、間違いなく、<strong>広告をたくさん打つ</strong>。今も昔も、これは変わらない。
          </p>

          <p>
            ただ、広告費も、大手ではない限り、そんなに打つことができない。<br />
            だから、<strong>予算内で、これらを上手に組み合わせることが大切</strong>です。
          </p>

          {/* 3. 見落とされていること */}
          <h2 className="g-h2"><span className="num">3</span>見落とされていること</h2>

          <p>
            ここまでやって、初めて来店してくれた人は、<strong>とても貴重</strong>です。
          </p>

          <p>
            広告、ポータル、LP、SNS、LINE。<br />
            それらを見て、初めて来店してくれた。
          </p>

          <p>
            既存客、または1度でも来店してくれた人は、<strong>そのお店をすでに知っている</strong>ので、訴求が通りやすい。
          </p>

          <p>
            しかしながら、<strong>その施策が、上手に構築できていない</strong>のが、ほとんどのお店の現状ではないでしょうか？
          </p>

          <div className="g-quote is-orange">
            1回目の来店客を、<br />
            どう2回目に繋げるか。<br />
            ここが、抜けている。
          </div>

          {/* 4. よくある間違い */}
          <h2 className="g-h2"><span className="num">4</span>よくある間違い</h2>

          <p>
            そんな、貴重な1回目の来店したお客様へ、<br />
            もう一度来てみようとする施策に着目し、
          </p>

          <p>
            <strong>では、ポイントカード？ 会員登録？</strong><br />
            となりがち。
          </p>

          <p>
            しかし、それでは、<strong>お客様には敬遠されてしまいます</strong>。
          </p>

          <p>
            でも、何かしら登録してもらわないと、次への動線は引けません。
          </p>

          <p>
            ここで、<strong>LINE登録</strong>。<br />
            今、LINE Businessは、かなり定着してきております。
          </p>

          <p>
            1回来店してくれたお客様に、<br />
            LINE追加クーポンや、キャンペーンや、ポイントカードで、<br />
            次の来店に繋げるという仕組み。
          </p>

          {/* 5. LINE Businessは、素晴らしい */}
          <h2 className="g-h2"><span className="num">5</span>LINE Businessは、素晴らしい</h2>

          <p>
            ここで、誤解のないように書いておきます。
          </p>

          <p>
            <strong>LINE Businessは、本当に、素晴らしいツールです。</strong>
          </p>

          <div className="line-praise">
            <div className="line-praise-inner">
              <div className="line-praise-badge">LINE BUSINESS</div>
              <div className="line-praise-title">
                9,800万人が使う<br />
                国民的インフラ。
              </div>
              <div className="line-praise-text">
                友達登録という<strong>低いハードル</strong>で、顧客接点を持てる。<br />
                クーポン、キャンペーン、ポイントカード、おみくじ——<br />
                <strong>機能も、使い勝手も、圧倒的</strong>です。<br /><br />
                すでに、多くの実店舗が導入し、<br />
                「LINEがあるから、リピート施策が回っている」<br />
                という店舗も、少なくありません。
              </div>
            </div>
          </div>

          <p>
            だからこそ、多くの店舗が、LINE Businessを導入しています。<br />
            これは、<strong>正しい選択</strong>です。
          </p>

          {/* 6. しかし、使いこなせていない */}
          <h2 className="g-h2"><span className="num">6</span>では、それを使いこなせているか？</h2>

          <p>
            ここで、質問を変えます。
          </p>

          <p>
            <strong>LINE Businessを導入している店舗は、それを、使いこなせているのか？</strong>
          </p>

          <div className="g-quote is-orange">
            答えは、<br />
            NO。
          </div>

          <p>
            理由は、シンプルです。
          </p>

          <p>
            <strong>配信上限という、壁があるから。</strong>
          </p>

          {/* 7. 配信上限という壁 */}
          <h2 className="g-h2"><span className="num">7</span>配信上限という、見えない壁</h2>

          <p>
            LINE Businessには、プランごとに、配信上限があります。
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
                <tr>
                  <td>コミュニケーション</td>
                  <td>無料</td>
                  <td>200通</td>
                </tr>
                <tr>
                  <td>ライト</td>
                  <td>¥5,000</td>
                  <td>5,000通</td>
                </tr>
                <tr>
                  <td>スタンダード</td>
                  <td>¥15,000</td>
                  <td>30,000通</td>
                </tr>
                <tr>
                  <td>プロ</td>
                  <td>¥50,000</td>
                  <td>無制限</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            たとえば、ライトプラン。<br />
            月額¥5,000で、5,000通。
          </p>

          <p>
            これは、<strong>1,000人の友達に、月5回配信したら、終わり</strong>です。
          </p>

          <p>
            もっと能動的に配信しようとすれば、<br />
            スタンダードプラン（月額¥15,000）、<br />
            それでも足りなければ、プロプラン（月額¥50,000）。
          </p>

          <p>
            すると、店舗オーナーは、こう考えます。
          </p>

          <div className="g-quote">
            「この配信費を払うなら、<br />
            広告に回した方がいいのでは？」
          </div>

          <p>
            <strong>予算の奪い合い</strong>が始まるのです。
          </p>

          <div className="wall-box">
            <div className="wall-box-inner">
              <div className="wall-box-label">THE WALL</div>
              <div className="wall-box-title">
                配信上限が、<br />
                <span className="accent">能動的な運用を、許さない。</span>
              </div>
              <div className="wall-box-text">
                結果、LINE配信は、最低限の運用に留まる。<br />
                <strong>仕組みの入り口までは出来ているが、その先が構築できていない</strong>。
              </div>
            </div>
          </div>

          {/* 8. なぜ、CVRを上げるには、繰り返しが必要か */}
          <h2 className="g-h2"><span className="num">8</span>CVRを上げるには、繰り返しの検証が必要</h2>

          <p>
            ここで、少し、視点を変えます。
          </p>

          <p>
            なぜ、店舗が、LINE配信を「使いこなせない」のか。
          </p>

          <p>
            それは、<strong>CVRを上げるには、繰り返しの検証が必要</strong>だからです。
          </p>

          <p>
            配信して、結果を見る。<br />
            どの通知が、何人来店に繋がったか。<br />
            どのクーポンが、よく使われたか。
          </p>

          <p>
            この検証を、<strong>繰り返す</strong>ことで、初めて、CVRは改善されます。
          </p>

          <div className="cycle-box">
            <div className="cycle-box-title">CVR改善のサイクル</div>
            <div className="cycle-steps">
              <div className="cycle-step">
                <div className="cycle-step-circle">📢</div>
                <div className="cycle-step-label">配信</div>
              </div>
              <div className="cycle-arrow">→</div>
              <div className="cycle-step">
                <div className="cycle-step-circle">📊</div>
                <div className="cycle-step-label">計測</div>
              </div>
              <div className="cycle-arrow">→</div>
              <div className="cycle-step">
                <div className="cycle-step-circle">🔍</div>
                <div className="cycle-step-label">分析</div>
              </div>
              <div className="cycle-arrow">→</div>
              <div className="cycle-step is-active">
                <div className="cycle-step-circle is-active">✨</div>
                <div className="cycle-step-label">改善</div>
              </div>
              <div className="cycle-arrow">→</div>
              <div className="cycle-step">
                <div className="cycle-step-circle">📢</div>
                <div className="cycle-step-label">再配信</div>
              </div>
            </div>
            <p className="cycle-note">
              このサイクルを、<strong>何度も回す</strong>ことで、<br />
              自店舗のCVRが、初めて見えてくる。
            </p>
          </div>

          <p>
            そして、このサイクルを回すには、<br />
            <strong>配信を、継続する必要</strong>があります。
          </p>

          <p>
            でも、配信上限があると、<br />
            継続的な配信が、できない。
          </p>

          <div className="g-callout danger">
            <span className="ico">🚨</span>
            <div>
              <p><strong>配信上限が、改善のサイクルを止める</strong></p>
              <p>
                配信上限にぶつかる。<br />
                すると、配信を控える。<br />
                すると、データが蓄積されない。<br />
                すると、改善のサイクルが回らない。<br />
                <strong>結果、CVRは、いつまでも改善されない。</strong>
              </p>
            </div>
          </div>

          {/* 9. 結局、受動的なアプリに */}
          <h2 className="g-h2"><span className="num">9</span>結局、受動的なアプリとなってしまう</h2>

          <p>
            そして、最終的に、こうなります。
          </p>

          <p>
            配信上限に縛られて、<br />
            能動的な配信ができない。
          </p>

          <p>
            だから、配信は、<br />
            月に数回の「お知らせ」程度に留まる。
          </p>

          <p>
            すると、お客様のLINEには、<br />
            すでに何十もの公式アカウントがある中で、
          </p>

          <p>
            <strong>ほとんど見られず、埋もれて、削除される。</strong>
          </p>

          <div className="g-quote is-orange">
            仕組みの入り口までは、<br />
            出来ている。<br /><br />
            でも、その先が、<br />
            構築できていない。
          </div>

          <p>
            これが、<strong>今の実店舗の、リアルな現状</strong>です。<br />
            LINE Businessを導入しているのに、<br />
            それが、受動的なアプリになってしまっている。
          </p>

          <p>
            そして、これは、<strong>店舗のせいではありません</strong>。<br />
            配信上限という、構造的な壁が、そうさせているのです。
          </p>

          {/* 10. Push-taroの答え */}
          <h2 className="g-h2"><span className="num">10</span>Push-taroは、ここをどう解決したか</h2>

          <p>
            Push-taroは、この<strong>「配信上限の壁」</strong>を、根本から外しました。
          </p>

          <h3 className="g-h3">① クーポンは、配信数にカウントしない</h3>
          <p>
            Push-taroでは、<strong>クーポンの配信は、配信数に含まれません</strong>。<br />
            あくまで、プッシュ通知による配信のみが、カウント対象です。
          </p>

          <p>
            これにより、店舗は、<strong>クーポンを気軽に配信できる</strong>。<br />
            クーポンは、リピート施策の中心です。ここに制限があると、仕組みが回りません。
          </p>

          <h3 className="g-h3">② PROプランは、配信無制限</h3>
          <p>
            そもそも、<strong>PROプランには、配信上限がありません</strong>。<br />
            月額¥10,000（税別）で、無制限。<br />
            これが、Push-taroの答えです。
          </p>

          <h3 className="g-h3">③ 顧客情報は、最小限</h3>
          <p>
            SMS認証のみで、本人確認は完了。<br />
            名前も、住所も、年齢も、聞きません。
          </p>

          <h3 className="g-h3">④ 埋もれない</h3>
          <p>
            ホーム画面に、直接届く。<br />
            LINEのように、埋もれることがありません。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>配信上限の壁を、外した。</strong></p>
              <p>
                これにより、店舗は、<strong>能動的に配信できる</strong>。<br />
                配信を続けて、データを蓄積して、改善する。<br />
                このサイクルが、初めて回り始めるのです。
              </p>
            </div>
          </div>

          {/* 11. 価格設定の妙 */}
          <h2 className="g-h2"><span className="num">11</span>価格設定の妙</h2>

          <p>
            PROプランは、月額¥10,000（税別）。
          </p>

          <p>
            そして、<strong>2店舗を紹介すると、¥6,000税別</strong>。<br />
            紹介報酬20%×2件で、40%OFFになる計算です。
          </p>

          <div className="g-quote is-orange">
            配信無制限で、<br />
            月額¥6,000税別。
          </div>

          <p>
            LINE Businessで、配信無制限にしようとすれば、<br />
            STANDARDプラン（月額¥15,000+３万通以上は従量課金一通３円）が必要となります。
          </p>

          <p>
            それと比べれば、<strong>圧倒的に安い</strong>。
          </p>

          <p>
            しかも、Push-taroは、<strong>紹介するほど、安くなる仕組みも選べる</strong>。<br />
            これは、代理店制度と組み合わせることで、<strong>紹介する側にもメリットがある設計</strong>です。
          </p>

          {/* まとめ */}
          <h2 className="g-h2"><span className="num">12</span>まとめ</h2>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>LINE Businessは、素晴らしい。</strong></p>
              <p>
                でも、配信上限という壁が、<br />
                その能力を、十分に引き出せていない。
              </p>
            </div>
          </div>

          <p>
            CVRを上げるには、<strong>繰り返しの検証が必要</strong>。<br />
            そのためには、<strong>能動的な配信が、欠かせない</strong>。
          </p>

          <p>
            Push-taroは、<strong>配信上限の壁を外し、能動的な運用を可能にした</strong>。<br />
            これが、実店舗のリピート施策を、次のステージに進めます。
          </p>

          {/* 関連ガイド */}
<div className="g-related">
  <h3>次に読む</h3>
  <div className="g-related-grid">
    {/* ★ ここに挿入 */}
    <Link href="/guide/line-comparison" className="g-related-card is-next">
      <span className="ico">📊</span>
      <div>
        <div className="title">LINE公式アカウントとの比較</div>
        <div className="sub">配信上限という壁を、数字で解説</div>
      </div>
      <span className="arrow">→</span>
    </Link>
    {/* ★ 挿入ここまで */}
    <Link href="/guide/push-notification-metrics" className="g-related-card is-next">
      <span className="ico">📊</span>
      <div>
        <div className="title">プッシュ通知のCVRは、何%あればいいのか</div>
        <div className="sub">CTRとCVRのベンチマークを、データで解説</div>
      </div>
      <span className="arrow">→</span>
    </Link>
  </div>
</div>

<div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
  <h3>あわせて読みたい</h3>
  <div className="g-related-grid">
    <Link href="/guide/existing-customers" className="g-related-card">
      <span className="ico">👥</span>
      <div>
        <div className="title">既存客の囲い込み</div>
        <div className="sub">売上が頭打ちになる、本当の理由</div>
      </div>
      <span className="arrow">→</span>
    </Link>
    <Link href="/guide/segmentation" className="g-related-card">
      <span className="ico">📊</span>
      <div>
        <div className="title">セグメント配信とは</div>
        <div className="sub">実店舗では「使えない」理由</div>
      </div>
      <span className="arrow">→</span>
    </Link>
  </div>
</div>
          {/* CTA */}
          <div className="g-cta">
            <h3>配信上限の壁を、外す。</h3>
            <p>
              Push-taroなら、PROプランで配信無制限。<br />
              能動的な運用で、CVR改善のサイクルを回せます。
            </p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
