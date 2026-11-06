'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function ExistingCustomersClient() {
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
          <span className="current">既存客の囲い込み</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">📖 本質を知る</span>
          <h1>実店舗の売上が、<br />頭打ちになる。本当の理由。</h1>
          <p>
            既存客の囲い込みについて、その背景から徹底解説。
          </p>
        </div>

        <div className="g-content">

          {/* ============================================================
              導入：王道の限界
          ============================================================ */}
          <p>
            「新規の取り込みだけでは、売上が頭打ちになる」——
          </p>

          <p>
            この壁に、すべての実店舗がぶつかります。
          </p>

          <p>
            でも、その本当の原因は、多くの人が誤解しています。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>この記事でわかること</strong></p>
              <p>
                ・売上が頭打ちになる、本当の原因<br />
                ・「既存客の囲い込み」という言葉の罠<br />
                ・2つの課題の、正しい分け方<br />
                ・Push-taroが、なぜ生まれたのか
              </p>
            </div>
          </div>

          <p>
            売上を伸ばし、利益を拡大する——すべての店舗が目指すゴールです。
          </p>

          <p>
            その王道は、<strong>認知を広げ、新規顧客を開拓すること</strong>。
          </p>

          <p>
            ライザップのように、テレビCMや幅広い告知で一気に認知度を上げ、集客に繋げる。
            これが王道です。
          </p>

          <p>
            でも——<strong>普通の店舗には、そんな広告費はありません。</strong>
          </p>

          <div className="g-quote is-orange">
  広告費は、湯水のように使えない。
</div>

          <p>
            では、SNSで拡散する手は？——これも、限定的です。
          </p>

          <p>
            <strong>バズることと、集客は、そもそも別物。</strong>
          </p>

          <p>
            SNSでバズっても、そこまでの集客は見込めません。
            バズってから「行ってみよう」に至るまでには、時間がかかる。
          </p>

          <p>
            そして、その時間の中で、<strong>忘れられてしまう</strong>のです。
          </p>

          <p>
            特に、今流行っているショート動画においては、<strong>バズの周期が早すぎて、店舗には向きません</strong>。
          </p>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>広告も SNS も、限界がある</strong></p>
              <p>
                大手のように広告費を使えない。<br />
                SNS も、バズと集客は別物で、忘れられる。<br />
                では、どうすればいいのか？
              </p>
            </div>
          </div>

          <p>
            ここで出てくるのが、<strong>「既存客の囲い込み」</strong>です。
          </p>

          <p>
            広告費をあまりかけたくない、かけられないのであれば、
            まずは、<strong>既存客の囲い込みが、しっかりとできているか</strong>を見直す。
            そういう流れになってきます。
          </p>

          <div className="g-quote is-orange">
            1度来店してくれた人は、<br />
            そのお店を知っている。<br /><br />
            3回以上来店すると、<br />
            強いリピーターになる確率が高い。
          </div>

          <p>
            ここにアプローチすることが、<strong>とても有効な施策</strong>なのです。
          </p>

          <p>
            ただし——<strong>「1回の来店を、どう3回に持ち込むか」</strong>と、
            <strong>「3回以上来てくれている顧客の、来店頻度をどう上げるか」</strong>は、
            <strong>まったく別の課題</strong>になります。
          </p>

          <p>
            ここをしっかりと把握しないと、施策が散らかり、効果が出ません。
          </p>

          {/* ============================================================
              第1章
          ============================================================ */}
          <h2><span className="num">1</span>2つの課題を、はっきり分ける</h2>

          <p>
            では、この2つの課題を、もう少し詳しく見ていきましょう。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">🆕</div>
              <h4>課題① 新規客を、リピーターに変える</h4>
              <p>初めて来たお客様を、2回目・3回目に繋げる。<br />「新規客を、常連の入口まで導く」という課題。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🔄</div>
              <h4>課題② 既存リピーターの回転率を上げる</h4>
              <p>すでに何度か来てくれているお客様の、来店頻度を上げる。<br />「すでに来てくれている人を、もっと喜ばせる」という課題。</p>
            </div>
          </div>

          <p>
            この2つは、<strong>目的も、打ち手も、まったく違う</strong>。
          </p>

          <p>
            なのに「既存客の囲い込み」という、ひとつの言葉でまとめてしまうから、
            施策が混ざり、効果が出ない。
          </p>

          <p>
            Push-taroは、<strong>この2つを、はっきり分けて考えます。</strong>
          </p>

          {/* ============================================================
              第2章
          ============================================================ */}
          <h2><span className="num">2</span>課題① 新規客を、リピーターに変える</h2>

          <p>
            まず、新規のお客様に、どう2回目・3回目に来てもらうか。
          </p>

          <p>
            ここで、多くの店舗が最初に手を出すのが——<strong>ポイントカード</strong>です。
          </p>

          <p>
            でも、ポイントカードには、決定的な弱点があります。
          </p>

          <div className="g-quote is-orange">
  目標が、遠すぎる。
</div>

          <p>
            「100ポイント貯まったら500円引き」と言われても、
            初回来店のお客様にとって、それは<strong>ずっと先の話</strong>。
          </p>

          <p>
            しかも、ポイントカードは<strong>どこもやっている</strong>。<br />
            お客様は、すでに何枚も持っている。だから、<strong>逆に敬遠される</strong>。
          </p>

          <p>
            「本日ポイント5倍」——これも、<strong>人は動きません</strong>。<br />
            ポイントは「未来の貯金」だから、今日わざわざ来る理由にはならないのです。
          </p>

          <h3 className="g-h3">Push-taroの答え：初来店からの「ロードマップ」を作る</h3>

          <p>
            もし、レジ横のQRコードを読み取るだけで——
          </p>

          <div className="g-quote is-orange">
            「本日のお会計、<br />10%OFFになります」
          </div>

          <p>
            と言われたら、どうでしょう？<br />
            入れない人は、いませんよね。
          </p>

          <p>
            さらに、そこに——<strong>「次回使えるクーポン」</strong> が付いていたら？
          </p>

          <p>
            そして、そのクーポンに——<br />
            <strong>「3回来店で、特別クーポンをプレゼント」</strong> という仕組みが仕込まれていて、
            <strong>今日が1回目</strong>だとしたら？
          </p>

          <p>
            今日10%引かれて、あと2回来れば、特別クーポンが貰える。
          </p>

          <p>
            しかも、<strong>次回クーポンには期限がある</strong>。<br />
            期限があるから、<strong>「行かないと、損する」</strong>という意識が生まれる。
          </p>

          <p>
            さらに、<strong>5回来店で、もっと特別なクーポン</strong>が出る仕組みを仕込んでおけば——
          </p>

          <p>
            3回目に来たとき、<strong>「あと2回で、また特別なクーポンが出ますよ」</strong> と、
            自然に次の来店を促せる。
          </p>

          <p>
            これは、<strong>5回へのロードマップ</strong>です。
          </p>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>これは、あくまで一例です。</strong></p>
              <p>
                業種・商圏・客層・単価——あらゆる条件によって、最適な設計は変わります。<br />
                「3回で特別クーポン」「5回で次のステップ」という数字が、
                すべての店舗に当てはまるわけではありません。
              </p>
              <p>
                大事なのは、<strong>「回数を重ねるごとに、少しずつ特典が良くなる」</strong>という考え方です。<br />
                Push-taro は、その設計を、あなたの店舗に合わせて自由に組めるようにしています。
              </p>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>大事なのは、お客様に「これは自分のものだ」と意識してもらうこと</strong></p>
              <p>
                貯めている途中のクーポンは、<strong>来ないと、失ってしまう</strong>。<br />
                この「もったいない」が、<strong>自然な来店動機</strong>になるのです。
              </p>
            </div>
          </div>

          {/* ============================================================
              第3章
          ============================================================ */}
          <h2><span className="num">3</span>課題② 既存リピーターの、回転率を上げる</h2>

          <p>
            次に、すでに来てくれているお客様の、来店頻度を上げる。
          </p>

          <p>
            ここでも、<strong>ポイント制度は、もう通用しません</strong>。<br />
            ポイントで囲い込もうとしても、今の時代、お客様は他のお店にもポイントを持っている。<br />
            ポイントだけでは、<strong>離反してしまう</strong>のです。
          </p>

          <p>
            では、<strong>クーポンなら、どうでしょう？</strong>
          </p>

          <h3 className="g-h3">学ぶべきは、マクドナルドの、50年の歴史</h3>

          <p>
            マクドナルドは、<strong>50年以上、季節ごとのキャンペーンを続けています</strong>。
          </p>

          <p>
            これは、「長くやったからファンがつく」という話ではありません。
          </p>

          <div className="g-quote is-orange">
            「この時期は、これ」<br />
            という季節キャンペーンが、<br />
            今でも十分に通用する、<br />
            普遍的なマーケティング手法
          </div>

          <p>
            だ、という証拠なのです。
          </p>

          <p>
            そして、この手法は、大手だからできる特別なことではありません。
          </p>

          <p>
            <strong>「この時期は、これ」</strong> という定着は、<strong>3年もあれば、十分に作れます。</strong>
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p>
                「3年は長い」と感じるなら——<br />
                それは、<strong>マーケティングの基本が、抜けている</strong>のかもしれません。
              </p>
            </div>
          </div>

          <h3 className="g-h3">実店舗の、独自の季節キャンペーン</h3>

          <p>
            これを、<strong>実店舗の業種ごとに当てはめていく</strong>。
          </p>

          <p>
            1年を細かく分けて、<strong>クリスマス・お正月・バレンタイン以外の、独自のイベント</strong>を仕込む。
          </p>

          <p>
            そして、<strong>あなたの店にしかない、独自の季節イベント</strong>を作る。
          </p>

          <p>
            これを何年か続けることで、店舗は<strong>人気の季節メニュー</strong>がわかってきます。
          </p>

          <p>
            また、お客さんの中にも、<strong>それを1年待ってくれるようなお客さん</strong>が出てくれば、成功です。
          </p>

          <p>
            さらに、キャンペーンの中に、<strong>3回程度のステップクーポン</strong>を組み込めば、
            <strong>その期間の来店回数を増やす仕組み</strong>を盛り込むことも可能です。
          </p>

          <div className="g-quote is-orange">
            1年を通じて、季節ごとにお店に合った施策を<br />
            仕組化することは、<br /><br />
            良い商品を提供することと、<br />
            同じくらい重要なこと。
          </div>

          <div className="g-callout danger">
            <span className="ico">🚨</span>
            <div>
              <p><strong>「良いものを出せば、自ずと客がつく」——それは、昭和の考えです。</strong></p>
              <p>
                残念ながら、いまの時代、それだけでは生き残れません。<br />
                どれだけ良いサービス・良い商品があっても、<br />
                <strong>お客様に伝わらなければ、存在しないのと同じ</strong>です。
              </p>
              <p>
                良い商品を届けながら、同時に、<strong>「喜んで頂ける仕組み」</strong>を整える。<br />
                この<strong>両輪</strong>が、これからの実店舗には必要です。
              </p>
            </div>
          </div>

          <h3 className="g-h3">「囲い込み」ではなく、「楽しんでもらう」</h3>

          <p>ここで、大事な言葉の整理を。</p>

          <div className="g-quote is-orange">
            「既存客の囲い込み」——<br />
            これは、もう古い考え方です。
          </div>

          <p>
            お客様を「囲い込む」のではなく、<strong>「喜んで、楽しんでもらう」</strong>。<br />
            この発想の転換が、課題②を解く、本当の鍵です。
          </p>

          <p>
            そして、これは、最初の問いへの答えにも繋がっていきます。
          </p>

          <p>
            広告費をかけて新規を取るのではなく、<strong>すでに来てくれている人に、もっと喜んでもらう</strong>。<br />
            そうすれば、<strong>リピートが生まれ、口コミが生まれ、新規も自然に増えていく</strong>。
          </p>

          <p>
            これが、実店舗の、<strong>本来あるべき姿</strong>なのです。
          </p>

          {/* ============================================================
              第4章
          ============================================================ */}
          <h2><span className="num">4</span>では、こんな施策は、どうやったら組めるのか？</h2>

          <p>ここまで読んで、こう思ったはずです。</p>

          <div className="g-quote is-orange">
            「そんな施策、どうやったら組めるんだろ？<br />組むのは大変そう。」
          </div>

          <p>その通りです。</p>

          <p>
            課題①のロードマップ。<br />
            課題②の季節キャンペーン。<br />
            誕生日クーポン、ステップクーポン、連続クーポン、休眠復活——
          </p>

          <p>
            これらを、<strong>ひとつひとつ手作業で組むのは、現実的ではありません</strong>。
          </p>

          <p>
            だから、<strong>Push-taroは、このような仕組化を簡単に店舗に取り込める機能を詰め込みました</strong>。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">🆕</div>
              <h4>新規客を、リピーターに変える仕組み</h4>
              <p style={{ textAlign: 'left' }}>
                ・QRコード登録で、初回クーポンが即配布<br />
                ・連続クーポンで、来店のたびに次が届く<br />
                ・ステップアップクーポンで、回数を重ねるほど特典アップ<br />
                ・特別達成クーポンで、「あと1回」の心理を後押し
              </p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🔄</div>
              <h4>既存リピーターの、回転率を上げる仕組み</h4>
              <p style={{ textAlign: 'left' }}>
                ・記念日・誕生日クーポンで、年1回の特別な日に<br />
                ・予約配信・定期配信で、季節キャンペーンを自動化<br />
                ・休眠復活クーポンで、離反しかけたお客様を呼び戻し
              </p>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>これらすべてが、特別な知識も、マーケティング専任チームもなく、運用できます。</strong></p>
              <p>
                専門チームも、高度な分析も、必要ありません。<br />
                Push-taro は、実店舗の課題を、シンプルに解決する機能を、全部入りで用意しました。
              </p>
            </div>
          </div>

          <div className="g-quote is-orange" style={{ textAlign: 'center', fontSize: '22px' }}>
            だから、Push-taroなのです。
          </div>

          {/* ============================================================
    関連ガイド
============================================================ */}
<div className="g-related">
  <h3>関連ガイド</h3>
  <div className="g-related-grid">
    <Link href="/guide" className="g-related-card">
      <span className="ico">📖</span>
      <div>
        <div className="title">ガイドTOPに戻る</div>
        <div className="sub">すべてのガイドを見る</div>
      </div>
      <span className="arrow">→</span>
    </Link>
    <Link href="/guide/store-marketing" className="g-related-card">
      <span className="ico">📖</span>
      <div>
        <div className="title">実店舗の集客、オススメの施策</div>
        <div className="sub">集客の全体像</div>
      </div>
      <span className="arrow">→</span>
    </Link>
    <Link href="/guide/features/qr-acquisition" className="g-related-card">
      <span className="ico">📱</span>
      <div>
        <div className="title">QRコード顧客獲得</div>
        <div className="sub">店頭から、SNSから、顧客を集める</div>
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

          {/* ============================================================
              CTA
          ============================================================ */}
          <div className="g-cta">
            <h3>実店舗のための、シンプルな仕組み。</h3>
            <p>
              特別な知識も、マーケティング専任チームも、必要ありません。<br />
              Push-taro なら、今日から始められます。
            </p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>

        </div>
      </main>

      <style jsx global>{`
        /* ============================================================
           ナビ・ヒーロー・コンテンツ基本
           ============================================================ */
        .g-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; }
        .g-nav-inner { max-width: 860px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .g-nav-cta { background: #ff4500; color: #fff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(255,69,0,0.25); }

        .g-main { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif; }
        .g-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; margin-bottom: 20px; flex-wrap: wrap; }
        .g-breadcrumb a { color: #64748b; text-decoration: none; }
        .g-breadcrumb a:hover { color: #ff4500; }
        .g-breadcrumb .sep { color: #cbd5e1; }
        .g-breadcrumb .current { color: #1e293b; font-weight: 700; }

        .g-hero { padding: 32px 0 40px; border-bottom: 1px solid #e2e8f0; margin-bottom: 40px; }
        .g-badge { display: inline-block; font-size: 11px; font-weight: 800; color: #ff4500; background: #fff7ed; padding: 5px 14px; border-radius: 20px; margin-bottom: 16px; }
        .g-hero h1 { font-size: clamp(26px, 3.4vw, 38px); font-weight: 900; color: #0f172a; letter-spacing: -1px; line-height: 1.3; margin: 0 0 14px; }
        .g-hero p { font-size: 15.5px; color: #64748b; line-height: 1.9; margin: 0; }

        .g-content { line-height: 1.9; color: #334155; font-size: 15px; }
        .g-content > h2 { font-size: 24px; font-weight: 900; color: #0f172a; margin: 56px 0 20px; letter-spacing: -0.6px; display: flex; align-items: center; gap: 12px; }
        .g-content > h2:first-of-type { margin-top: 0; }
        .g-content > h2 .num { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 10px; font-size: 16px; font-weight: 900; flex-shrink: 0; }
        .g-content p { margin-bottom: 16px; }
        .g-content strong { color: #0f172a; font-weight: 800; }

        .g-h3 { font-size: 18px; font-weight: 900; color: #0f172a; margin: 32px 0 16px; letter-spacing: -0.4px; padding-left: 14px; border-left: 4px solid #ff4500; }

        /* 引用風の強調 */
        .g-quote { margin: 32px auto; padding: 28px 36px; max-width: 640px; background: #f8fafc; border-radius: 16px; text-align: center; font-size: 20px; font-weight: 900; color: #0f172a; line-height: 1.6; letter-spacing: -0.5px; }
        .g-quote.is-orange { background: linear-gradient(135deg, #fff7ed, #ffedd5); color: #c2410c; }

        /* カードグリッド */
        .g-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin: 24px 0; }
        .g-card-simple { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; text-align: center; }
        .g-icon-big { font-size: 32px; margin-bottom: 8px; }
        .g-card-simple h4 { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
        .g-card-simple p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.8; }

        /* コールアウト */
        .g-callout { display: flex; gap: 16px; padding: 20px 24px; border-radius: 14px; margin: 24px 0; align-items: flex-start; }
        .g-callout .ico { flex-shrink: 0; font-size: 22px; line-height: 1; }
        .g-callout p { margin: 0; font-size: 14.5px; line-height: 1.85; }
        .g-callout p + p { margin-top: 8px; }
        .g-callout.info { background: #ebf8ff; border: 1px solid #90cdf4; color: #2c5282; }
        .g-callout.warn { background: #fffbeb; border: 1px solid #fcd34d; color: #78350f; }
        .g-callout.danger { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        .g-callout.success { background: #f0fdf4; border: 1px solid #86efac; color: #14532d; }
        .g-callout strong { display: block; margin-bottom: 6px; font-weight: 900; }
        .g-callout.info strong { color: #2c5282; }
        .g-callout.warn strong { color: #78350f; }
        .g-callout.danger strong { color: #991b1b; }
        .g-callout.success strong { color: #14532d; }

        /* 関連ガイド */
        .g-related { margin-top: 64px; padding-top: 32px; border-top: 2px solid #e2e8f0; }
        .g-related > h3 { font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #64748b; margin: 0 0 20px; }
        .g-related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .g-related-card { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .g-related-card:hover { border-color: #ff4500; transform: translateX(4px); }
        .g-related-card .ico { font-size: 24px; flex-shrink: 0; }
        .g-related-card .title { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.3; }
        .g-related-card .sub { font-size: 11.5px; color: #64748b; margin-top: 2px; }
        .g-related-card .arrow { color: #ff4500; font-size: 16px; font-weight: 900; margin-left: auto; }

        /* CTA */
        .g-cta { margin-top: 56px; padding: 40px 32px; background: linear-gradient(160deg, #0f172a, #1e293b); color: #fff; border-radius: 20px; text-align: center; }
        .g-cta h3 { font-size: 22px; font-weight: 900; margin: 0 0 12px; color: #fff; }
        .g-cta p { font-size: 14.5px; color: #94a3b8; margin-bottom: 24px; line-height: 1.8; }
        .g-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 15px; text-decoration: none; box-shadow: 0 8px 24px rgba(255,69,0,0.35); }

        @media (max-width: 640px) {
          .g-main { padding: 24px 16px 60px; }
          .g-nav-cta { padding: 8px 14px; font-size: 12px; }
          .g-quote { padding: 20px 24px; font-size: 17px; }
          .g-h3 { font-size: 16px; }
        }
      `}</style>
    </>
  );
}
