'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function SegmentationClient() {
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
          <span className="current">セグメント配信とは</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">📊 基礎知識</span>
          <h1>セグメント配信とは？<br />実店舗では「使えない」理由を数字で解説</h1>
          <p>
            セグメント配信は、<strong>顧客を属性や行動履歴でグループ分けし、それぞれに合った情報を届ける手法</strong>です。
            一見、どの店舗にも有効に見えます。しかし実店舗では、無視できない<strong>「人数の壁」+「属性の壁」</strong>があります。
            この記事では、セグメント配信が機能する条件と、実店舗に合わない理由を、数字と現場の実態から整理します。
          </p>
        </div>

        <div className="g-content">

          {/* ============================================================
              1. セグメント配信とは
          ============================================================ */}
          <h2><span className="num">1</span>セグメント配信とは</h2>

          <p>
            セグメント配信とは、顧客を「セグメント（区分）」に分けて、それぞれに最適な情報を届ける配信方法です。
            一斉配信が「全員に同じ情報を届ける」のに対し、セグメント配信では、次のような条件で対象を絞ります。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>セグメント条件</th>
                  <th>配信内容の例</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>過去2週間以内にランチ利用した方</td><td>週末限定ディナーコースの案内</td></tr>
                <tr><td>前回来店から60日以上経過した方</td><td>復帰クーポン</td></tr>
                <tr><td>特定の商品を購入した方</td><td>関連商品のレコメンド</td></tr>
                <tr><td>20代女性 / 40代男性 など</td><td>年代・性別に合わせた訴求</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            このように、顧客一人ひとりに合った情報を届けられるのが理想です。
            しかし、これを「実店舗で使いこなす」となると、話は別です。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>セグメント配信は、「顧客が十分に多い」ことが前提の機能です。</strong></p>
              <p>この「十分に多い」が、実店舗では手が届かない場所にあります。</p>
            </div>
          </div>

          {/* ============================================================
              2. 最低人数
          ============================================================ */}
          <h2><span className="num">2</span>セグメント配信が機能する「最低人数」</h2>

          <p>
            セグメント配信を「やった意味がある」レベルで機能させるには、いくつかの人数条件をクリアする必要があります。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>① 属性で絞り込む場合：100人以上</h4>
                <p>
                  LINE公式アカウントの属性セグメント配信では、<strong>ターゲットリーチ数が100人以上</strong>必要です。
                  50〜100人未満になると配信できないケースが実務上多く、100人が実質的な最低ラインです。
                </p>
              </div>
            </div>

            <div className="g-step">
              <div className="g-step-body">
                <h4>② セグメントを分けすぎない：1グループあたりの母数が重要</h4>
                <p>
                  「分ける前に、1セグメントあたりに何人残るかを計算してください」というのが、実務の鉄則です。
                  <strong>反応が数件しか出ない規模なら、分けすぎ</strong>です。上限ではなく、1グループあたりの人数で判断します。
                </p>
              </div>
            </div>

            <div className="g-step">
              <div className="g-step-body">
                <h4>③ A/Bテストで効果を検証する場合：バリアントあたり1,000人</h4>
                <p>
                  A/Bテストで統計的に意味のある結果を得るには、<strong>バリアントあたり最低1,000人</strong>が必要です。
                  2パターンの比較なら、合計2,000人が必要になります。
                </p>
              </div>
            </div>

            <div className="g-step">
              <div className="g-step-body">
                <h4>④ 反応率が上がる条件：組み合わせが必要</h4>
                <p>
                  ライフサイクルと行動履歴を<strong>組み合わせた</strong>セグメントで、ようやく配信反応率が均等配信の2〜3倍になります。
                  属性だけで分けても、購買行動の差はほとんど出ません。
                </p>
              </div>
            </div>
          </div>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>「最低1,000人、理想は1万人」が業界の共通認識</strong></p>
              <p>
                A/Bテストの統計的な議論で言う「1,000人」「1万人」は、<strong>通知登録者数（テストを投げられる母数）</strong>を指します。
                つまり、Push-taroで言えば<strong>「Push通知に登録してくれた人数」</strong>が、この数字に相当します。
              </p>
            </div>
          </div>

          {/* ============================================================
              3. 実店舗の現実
          ============================================================ */}
          <h2><span className="num">3</span>実店舗の現実：通知登録者数はどれくらいか</h2>

          <p>
            では、個人経営の実店舗で「通知登録者」は、実際にどれくらい集まるのでしょうか。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>店舗タイプ</th>
                  <th>1日の来店数</th>
                  <th>通知登録者の目安</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>カフェ（席数20席）</td><td>50〜80人</td><td>300〜600人</td></tr>
                <tr><td>美容室（1日10人）</td><td>10人</td><td>100〜200人</td></tr>
                <tr><td>小規模小売店</td><td>250〜300人/月</td><td>50〜100人</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            小規模店舗では、月の来店客数が250〜300人というデータもあります。
            1日の購買客数が10人以下という回答が15%を占める調査もあり、決して珍しい数字ではありません。
          </p>

          <p>
            つまり、個人経営の実店舗における通知登録者は、<strong>現実的には数百人規模</strong>です。
            これは「セグメント配信の最低ライン」ギリギリか、それ以下に相当します。
          </p>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>「1万人」は、実店舗では手の届かない数字</strong></p>
              <p>
                通知登録者1万人は、繁盛店や多店舗展開のチェーンなら届く数字です。
                しかし、<strong>個人経営の実店舗では、現実的に集まりません</strong>。
                数百人〜数千人が、ほとんどの店舗の現実です。
              </p>
            </div>
          </div>

          {/* ============================================================
              4. 1万人以下でやるとどうなるか
          ============================================================ */}
          <h2><span className="num">4</span>1万人以下でセグメント配信をやると、どうなるか</h2>

          <p>
            仮に、通知登録者500人の店舗で、セグメント配信を導入したとします。
            この規模で、実際に何が起きるかを、3つの軸で見てみましょう。
          </p>

          <h3 className="g-h3">労力：1回の配信ごとに、複数の文面を用意する</h3>

          <p>
            セグメントが5つあると、<strong>1回の配信で5種類の文面を作る</strong>ことになります。
            この負荷で配信頻度が落ちれば、分けた効果より失うもののほうが大きくなります。
          </p>

          <p>
            さらに、セグメント定義は「作って終わり」ではありません。
            <strong>3〜6ヶ月で必ず腐敗が起きます</strong>。
            たとえば「アクティブ顧客が90日後に休眠に移動する」という自動更新が動いていないと、定義と実態がズレていきます。
            これを防ぐには、セグメント定義を<strong>動的更新（毎日自動再計算）</strong>にする必要があります。
          </p>

          <h3 className="g-h3">リターン：配信900通で、来店+12人</h3>

          <p>
            実際の小規模店舗の事例では、<strong>配信900通で来店数が+12人</strong>（配信前3人→15人）という結果があります。
            これは成功事例の一つですが、同時に<strong>「セグメント配信をしても、来店者は数十人単位」</strong>という現実も示しています。
          </p>

          <p>
            500人の顧客を5セグメントに分けると、1グループあたり100人。
            そこから実際に来店するのは、数人〜十数人です。
            この規模では、<strong>「A案とB案のどちらが良かったか」を、統計的に判断することはできません</strong>。
          </p>

          <h3 className="g-h3">費用対効果：配信コストは減らない</h3>

          <p>
            LINE公式アカウントの通数は、「友だち数 × 配信回数」で決まります。
            セグメント配信をしても、配信回数×送った人数の通数は消費されます。
            つまり、セグメントを分けても<strong>配信コストは減りません</strong>。
            むしろ、文面作成の手間が増える分、人件費は上がります。
          </p>

          <div className="g-callout danger">
            <span className="ico">🚨</span>
            <div>
              <p><strong>1万人以下の顧客に、セグメント配信はオーバースペック</strong></p>
              <p>
                1グループあたり数十人では、効果の検証ができず、判断を誤るだけ。
                <strong>維持の手間に対して、リターンが見合いません</strong>。
              </p>
            </div>
          </div>

          {/* ============================================================
              5. セグメント配信が本当に必要になる条件
          ============================================================ */}
          <h2><span className="num">5</span>セグメント配信が「本当に必要」になる条件</h2>

          <p>
            ここまでの内容を整理すると、セグメント配信が<strong>ECサイトで成立し、実店舗で成立しない理由</strong>が見えてきます。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>条件</th>
                  <th>ECサイト</th>
                  <th>実店舗（個人経営）</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>顧客数</td><td>数十万〜数百万</td><td>数百〜数千</td></tr>
                <tr><td>1セグメントあたり</td><td>数万人</td><td>数十人</td></tr>
                <tr><td>A/Bテスト</td><td className="yes">統計的に検証可能</td><td className="no">検証不能</td></tr>
                <tr><td>セグメント維持の手間</td><td>専任チームで対応</td><td>店主が片手間</td></tr>
                <tr><td>費用対効果</td><td className="yes">合う</td><td className="no">合わない</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            ECサイトでは「顧客を10属性に分けたら、1セグメント数万人」です。
            この規模であれば、A/Bテストも統計的に機能し、セグメントごとに専任チームがPDCAを回す価値があります。
          </p>

          <p>
            しかし実店舗では、同じことをすると「1セグメント数十人」。
            <strong>セグメントを分けるほど、各グループの反応が数件しか出ず、判断を誤るリスクが高まります</strong>。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>セグメント配信は「ECサイトにおいて」優れた機能です</strong></p>
              <p>
                繰り返しますが、セグメント配信そのものが悪いわけではありません。
                ECサイトのように数十万〜数百万の顧客を相手にするからこそ、成立します。
              </p>
            </div>
          </div>

                    {/* ============================================================
              第6章
          ============================================================ */}
          <h2><span className="num">6</span>そもそも、属性が集まらない</h2>

          <p>
            セグメント配信には、<strong>顧客の属性情報が欠かせません</strong>。
          </p>

          <p>
            「30代女性」「月2回来店」「最終来店から60日」——<br />
            こうした条件で顧客を絞り込むには、まず<strong>属性データ</strong>がなければ始まりません。
          </p>

          <p>
            ECサイトなら、この属性収集は比較的簡単です。
          </p>

          <p>
            登録時に、年齢・性別・住所・電話番号を書かせる。<br />
            購入履歴は、自動的に蓄積される。<br />
            「カートに入れたけど買わなかった商品」も、記録される。
          </p>

          <p>
            エステや美容室なら、「カルテ」という名目があります。
          </p>

          <p>
            「お肌の状態」「アレルギーの有無」「ご希望の施術」——<br />
            お客様は、自然に書いてくれます。
          </p>

          <p>
            では——<strong>飲食店は、どうでしょう？</strong>
          </p>

          <p>
            ほぼ、皆無です。
          </p>

          <p>
            「お名前をどうぞ」「ご住所は？」<br />
            レジでそんなことを聞いたら、お客様は引いてしまいます。
          </p>

          <p>
            小売店でも、ポイントカード発行時に書かせる程度。<br />
            しかも、その場で書くのを敬遠されて、<br />
            「また今度で」と断られることも、少なくありません。
          </p>

          <div className="g-quote is-orange">
            セグメント配信をやろうにも、<br />
            そもそも「セグメントする材料」が集まらない。
          </div>

          <p>
            これが、実店舗が抱える、<strong>根本的な壁</strong>です。
          </p>

          <h3 className="g-h3">この壁を、Push-taroは突破する</h3>

          <p>
            Push-taroが、登録方法を<strong>QRコード＋ホーム画面追加＋SMS認証</strong>だけに絞ったのは、
            まさにこの「属性の壁」を突破するためです。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>名前も、住所も、年齢も——一切、聞きません。</strong></p>
              <p>
                お客様は、レジ横のQRを読み取って、ホーム画面に追加して、SMSで届いたコードを入力する。<br />
                <strong>30秒で、登録完了</strong>。
              </p>
            </div>
          </div>

          <p>
            さらに、そこに<strong>「初回限定クーポン」</strong>を付ければ、
            「登録しないと損」という<strong>動機</strong>まで生まれます。
          </p>

          <p>
            登録率が上がるのは、当然です。
          </p>

          <p>
            この<strong>「属性を集めない」</strong>という潔さが、
            実店舗のセグメント配信と、<strong>真逆の設計</strong>。
          </p>

          <p>
            だからこそ、Push-taroは、現場で使えるのです。
          </p>

          {/* ============================================================
              7. 結論
          ============================================================ */}
          <h2><span className="num">7</span>結論：実店舗に、セグメント配信は必要ない</h2>

          <p>
  数百人〜数千人の顧客を相手にする実店舗では、
  セグメント配信を導入しても、<strong>維持の手間に対して、リターンが見合いません</strong>。
</p>

<p>
  それ以前に——<strong>そもそも、セグメントする材料が集まらない</strong>。<br />
  この2つの壁が、実店舗には立ちはだかっています。
</p>
          <p>
            むしろ、シンプルに「全員に同じ施策」を届ける方が、現場の負担も少なく、成果に直結します。
            「差別」ではなく「お返し」としての仕組みが、実店舗には合っています。
          </p>

          <p>
            セグメント配信は「優れた機能」です。
            ただ、それは<strong>「ECサイトにおいて」</strong>という条件付きの評価です。
            実店舗にそのまま持ち込んでも、機能しません。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>だからPush-taroは、その機能をあえて搭載していません。</strong></p>
              <p>
                実店舗に本当に必要なものだけを、シンプルに。
                大手ツールの真似ではなく、現場に寄り添った設計です。
              </p>
            </div>
          </div>

          {/* ============================================================
              FAQ
          ============================================================ */}
          <h2><span className="num">8</span>よくあるご質問</h2>

          <div className="g-faq">
            <details className="g-faq-item">
              <summary>セグメント配信は無料で使えるのですか？</summary>
              <p>
                LINE公式アカウントの場合、セグメント配信の機能自体は追加費用なしで使えます。
                ただし、配信通数は「人数×回数」でカウントされるため、セグメントを分けても通数は消費されます。
              </p>
            </details>

            <details className="g-faq-item">
              <summary>通知登録者100人でも、セグメント配信は意味がありますか？</summary>
              <p>
                属性での絞り込みは100人以上が目安です。
                ただし、セグメントを分けると1グループあたりの人数が減り、
                <strong>反応が数件しか出ない規模では「分けすぎ」</strong>です。
                実店舗では、まず「全員に同じ」から始めるのが現実的です。
              </p>
            </details>

            <details className="g-faq-item">
              <summary>セグメント配信を維持するのは、どれくらい大変ですか？</summary>
              <p>
                セグメント定義は<strong>3〜6ヶ月で腐敗</strong>します。
                自動更新を仕組まないと、定義と実態がズレていきます。
                これに気づかず放置すると、「セグメントを分けたが反応率は変わらない」状態に陥ります。
              </p>
            </details>

            <details className="g-faq-item">
              <summary>それでも、セグメント配信が必要な店舗はありますか？</summary>
              <p>
                はい。チェーンや多店舗展開で<strong>通知登録者1万人以上</strong>を抱える店舗であれば、
                セグメント配信の恩恵を受けられます。
                しかし、個人経営の実店舗の多くは、この規模に届きません。
              </p>
            </details>
          </div>

          {/* ============================================================
              関連ガイド
          ============================================================ */}
          <div className="g-related">
            <h3>関連ガイド</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/coupon-first" className="g-related-card">
                <span className="ico">🎫</span>
                <div>
                  <div className="title">初回クーポン</div>
                  <div className="sub">シンプルな仕組みから始める</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          {/* ============================================================
              CTA
          ============================================================ */}
          <div className="g-cta">
            <h3>実店舗に、本当に必要なものだけ。</h3>
            <p>
              セグメント配信は不要。全員に同じ施策を届けて、<br />
              来てくれる人に、感謝をカタチに。
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
        .g-badge { display: inline-block; font-size: 11px; font-weight: 800; color: #0284c7; background: #f0f9ff; padding: 5px 14px; border-radius: 20px; margin-bottom: 16px; }
        .g-hero h1 { font-size: clamp(26px, 3.4vw, 38px); font-weight: 900; color: #0f172a; letter-spacing: -1px; line-height: 1.3; margin: 0 0 14px; }
        .g-hero p { font-size: 15.5px; color: #64748b; line-height: 1.9; margin: 0; }
        .g-hero strong { color: #0f172a; }

        .g-content { line-height: 1.9; color: #334155; font-size: 15px; }
        .g-content > h2 { font-size: 24px; font-weight: 900; color: #0f172a; margin: 56px 0 20px; letter-spacing: -0.6px; display: flex; align-items: center; gap: 12px; }
        .g-content > h2:first-of-type { margin-top: 0; }
        .g-content > h2 .num { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 10px; font-size: 16px; font-weight: 900; flex-shrink: 0; }
        .g-content p { margin-bottom: 16px; }
        .g-content strong { color: #0f172a; font-weight: 800; }

        .g-h3 { font-size: 18px; font-weight: 900; color: #0f172a; margin: 32px 0 16px; letter-spacing: -0.4px; padding-left: 14px; border-left: 4px solid #ff4500; }

        /* ============================================================
           コールアウト
           ============================================================ */
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

        /* ============================================================
           ステップ
           ============================================================ */
        .g-steps { display: flex; flex-direction: column; gap: 20px; margin: 28px 0; counter-reset: gstep; }
        .g-step { display: flex; gap: 20px; align-items: flex-start; }
        .g-step::before { counter-increment: gstep; content: counter(gstep); flex-shrink: 0; width: 44px; height: 44px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; }
        .g-step-body { flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; }
        .g-step-body h4 { margin: 0 0 8px; font-size: 15px; font-weight: 800; color: #0f172a; }
        .g-step-body p { margin: 0; font-size: 14px; color: #475569; line-height: 1.8; }

        /* ============================================================
           テーブル
           ============================================================ */
        .g-table-wrap { overflow-x: auto; margin: 24px 0; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; }
        .g-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 500px; }
        .g-table th, .g-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .g-table thead th { background: #f8fafc; font-weight: 800; color: #0f172a; font-size: 13px; border-bottom: 2px solid #e2e8f0; }
        .g-table tbody tr:last-child td { border-bottom: none; }
        .g-table .yes { color: #16a34a; font-weight: 800; }
        .g-table .no { color: #dc2626; font-weight: 800; }

        /* ============================================================
           FAQ
           ============================================================ */
        .g-faq { display: flex; flex-direction: column; gap: 12px; margin: 24px 0; }
        .g-faq-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .g-faq-item[open] { border-color: #ff4500; }
        .g-faq-item summary { padding: 18px 24px; font-size: 15px; font-weight: 800; color: #0f172a; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
        .g-faq-item summary::-webkit-details-marker { display: none; }
        .g-faq-item summary::after { content: '＋'; color: #ff4500; font-weight: 900; font-size: 18px; }
        .g-faq-item[open] summary::after { content: '−'; }
        .g-faq-item > p { padding: 0 24px 20px; font-size: 14px; color: #475569; line-height: 1.85; margin: 0; }

        /* ============================================================
           関連ガイド
           ============================================================ */
        .g-related { margin-top: 64px; padding-top: 32px; border-top: 2px solid #e2e8f0; }
        .g-related > h3 { font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #64748b; margin: 0 0 20px; }
        .g-related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .g-related-card { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .g-related-card:hover { border-color: #ff4500; transform: translateX(4px); }
        .g-related-card .ico { font-size: 24px; flex-shrink: 0; }
        .g-related-card .title { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.3; }
        .g-related-card .sub { font-size: 11.5px; color: #64748b; margin-top: 2px; }
        .g-related-card .arrow { color: #ff4500; font-size: 16px; font-weight: 900; margin-left: auto; }

        /* ============================================================
           CTA
           ============================================================ */
        .g-cta { margin-top: 56px; padding: 40px 32px; background: linear-gradient(160deg, #0f172a, #1e293b); color: #fff; border-radius: 20px; text-align: center; }
        .g-cta h3 { font-size: 22px; font-weight: 900; margin: 0 0 12px; color: #fff; }
        .g-cta p { font-size: 14.5px; color: #94a3b8; margin-bottom: 24px; line-height: 1.8; }
        .g-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 15px; text-decoration: none; box-shadow: 0 8px 24px rgba(255,69,0,0.35); }

        @media (max-width: 640px) {
          .g-main { padding: 24px 16px 60px; }
          .g-nav-cta { padding: 8px 14px; font-size: 12px; }
          .g-h3 { font-size: 16px; }
          .g-cta { padding: 32px 24px; }
        }
      `}</style>
    </>
  );
}
