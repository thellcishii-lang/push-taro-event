'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function EventMarketingClient() {
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
          <span className="current">イベント・展示会の活用</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">Event Marketing</span>
          <h1>2日〜3日の短期イベントで<br />劇的なコスト削減と収益化を実現する方法</h1>
          <p>
            フェス、大型イベント、BtoBの展示会など、期間が2日〜3日間と限られた催事。<br />
            こうしたイベント運営において、常に頭を悩ませるのが<strong>「来場者のスムーズな誘導」</strong>と<strong>「膨大な運営人件費・印刷コスト」</strong>です。
          </p>
        </div>

        <div className="g-content">

          <p className="g-lead">
            これまで「数日間のイベントのためだけにプッシュ通知システムを導入する」ことは、初期費用や年縛りの面から費用対効果が合わないとされてきました。<br />
            しかし、<strong>初期費用0円・月額制でいつでも解約できる「Push-taro」</strong>の登場によって、短期イベントの運営常識が変わり始めています。<br />
            わずか3日間の運用でも、圧倒的なリターンを生み出す「3つの理由」と具体的な活用法を解説します。
          </p>

          <h2><span className="num">1</span>誘導スタッフの負担減：リアルタイム人流コントロール</h2>

          <p>
            数万人規模が動く会場において、臨機応変なアナウンスや導線確保は、看板を持ったスタッフの配置（人件費）に頼らざるを得ませんでした。<br />
            これを1タップのプッシュ通知に置き換えることで、<strong>スタッフの負担を大幅に軽減</strong>できます。
          </p>

          <div className="g-card-simple" style={{ marginBottom: '16px' }}>
            <h4>タイムリーなステージ誘導</h4>
            <p>「まもなくメインステージにて、〇〇氏による基調講演が始まります（席数残りわずか）」</p>
          </div>
          <div className="g-card-simple" style={{ marginBottom: '16px' }}>
            <h4>混雑の分散</h4>
            <p>「現在、東3ホールのフードエリアが大変混雑しています。西1ホールの特設サテライト会場が比較的スムーズにご利用いただけます」</p>
          </div>
          <div className="g-card-simple">
            <h4>紙のパンフレットの「最小化」</h4>
            <p>会場マップやスケジュールをすべてシステム内に集約し、通知から一瞬で開かせることで、大量の印刷費用や配布人員を大幅に削減できます。</p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
              ※通信環境や端末のバッテリー等を考慮し、紙の配布を完全ゼロにするのではなく、必要な人だけに絞る運用が現実的です。
            </p>
          </div>

          <h2><span className="num">2</span>展示会の新しいマネタイズ：出展ブース向けの「プッシュ通知広告枠」</h2>

          <p>
            BtoBの展示会において、出展社は「自社ブースにいかに足を止めてもらうか」に多額の予算を割いています。<br />
            イベント主催者は、このプッシュ通知の仕組み自体を<strong>「有料の広告枠」として出展社に販売</strong>し、新たな収入源にすることができます。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <h4>1通知ごとの広告モデル</h4>
              <p>出展社に対して「来場者全員のスマホに直接届くプッシュ通知枠」を1配信あたり有料で販売。</p>
            </div>
            <div className="g-card-simple">
              <h4>内容例</h4>
              <p>「【ブース番号：B-12】にて、今から最新システムの実機デモと限定ノベルティの配布を開始します！」</p>
            </div>
            <div className="g-card-simple">
              <h4>圧倒的な費用対効果</h4>
              <p>出展社からすれば、会場の隅に誰も見ない看板を出すよりも、来場者のスマホへダイレクトに通知を届けて自社ブースに行列を作れるため、非常に価値の高い広告枠になります。</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            ※配信にあたっては、来場者の「広告配信への同意」や各OSのガイドラインに沿った運用が前提となります。
          </p>

          <h2><span className="num">3</span>なぜ「Push-taro」なら3日間のイベントで黒字化できるのか？</h2>

          <p>
            一般的な店舗向けプッシュ通知SaaSには「初期費用が10万円以上」「最低契約期間1年（年縛り）」という重い条件があります。これでは数日間のイベントのためだけに導入することは不可能です。<br />
            Push-taroなら、以下の仕様により<strong>イベント終了後に即クローズする運用が完全に成立</strong>します。
          </p>

          <div className="g-feature-list">
            <div className="g-feature-item">
              <span className="ico">💡</span>
              <div>
                <strong>初期費用0円・月額制のサブスク</strong>
                <p>イベントがある「その1ヶ月間だけ」契約し、終わったら違約金なしで即解約できます。たった3日間の稼働であっても、無駄な残債が発生しません。</p>
              </div>
            </div>
            <div className="g-feature-item">
              <span className="ico">📈</span>
              <div>
                <strong>圧倒的なコストパフォーマンス</strong>
                <p>削減できるスタッフの人件費や印刷代、そして出展社から得られる広告枠の収入を考えれば、システム投資に対する費用対効果（ROI）は数倍〜数十倍になって返ってきます。</p>
              </div>
            </div>
          </div>

          <h2><span className="num">4</span>Push-taroをイベントで使う際の「導入3ステップ」</h2>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 1：イベント専用のQRコードを発行</h4>
                <p>入場ゲートや受付で配布するQRコード（または会場POP）を管理画面から発行します。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 2：来場者に登録してもらう</h4>
                <p>スマホでQRを読み取るだけ。アプリのインストールは不要です（※iPhoneはホーム画面追加、SMS認証あり）。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 3：当日、管理画面から通知を配信</h4>
                <p>混雑状況やステージの開始に合わせて、リアルタイムに配信します。</p>
              </div>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>短期催事こそ、仕組みの力で「スマートな運営」を</strong></p>
              <p>
                これからのイベント・展示会運営は、泥臭いマンパワーに頼るのをやめ、プッシュ通知で「コスト削減」と「売上向上」を同時に達成する時代です。<br />
                短期間だからこそ、いつでも辞められるフットワークの軽さを活かしたシステム運用が最大の武器になります。
              </p>
            </div>
          </div>

          <div className="g-related">
            <h3>関連ガイド</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/push-notification" className="g-related-card">
                <span className="ico">📢</span>
                <div><div className="title">プッシュ通知</div><div className="sub">基本機能の使い方</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/store-marketing" className="g-related-card">
                <span className="ico">📖</span>
                <div><div className="title">実店舗の集客、オススメの施策</div><div className="sub">マーケティングの本質</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>イベントの運営を、もっとスマートに。</h3>
            <p>初期費用0円。イベントの1ヶ月だけ使って、すぐ解約も可能です。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
