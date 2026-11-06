'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css'; // ★ 共通CSSをインポート

export default function NgActionsClient() {
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
          <span className="current">NG行為集</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">⚠️ 運用ノウハウ</span>
          <h1>プッシュ通知がブロックされる理由。<br /><span className="text-red">店舗がやってはいけないNG行為</span></h1>
          <p>
            「プッシュ通知がうざい」「LINEのブロックが解除されない」——<br />
            一度ブロックされた顧客は、二度と戻ってきません。<br />
            配信頻度や内容の誤りで、大切な顧客を失わないための運用ルールをまとめました。
          </p>
        </div>

        <div className="g-content">

          <h2><span className="num">1</span>配信頻度・タイミングのNG</h2>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>1日に何通も連続配信する（しつこい）</h4>
            </div>
            <p className="g-ng-desc">
              「セール開始」「本日限定」「残りわずか」を1日に3通も送ると、<strong>80%以上の確率で通知OFF</strong>にされます。「プッシュ通知 うざい」と感じさせる最大の原因です。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>1日の配信は最大1通まで。緊急時のみ2通に留めましょう。</p>
          </div>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>深夜・早朝（22時〜8時）に配信</h4>
            </div>
            <p className="g-ng-desc">
              就寝中の通知は<strong>強い不快感</strong>を与え、即ブロックに繋がります。特にBtoCの店舗では致命的です。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>配信は<strong>10時〜20時</strong>の間に。予約配信機能で時間指定しましょう。</p>
          </div>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>連日同じ内容を配信</h4>
            </div>
            <p className="g-ng-desc">
              同じセール情報を5日連続で送ると、「またか」と思われ、通知の価値が下がります。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>クーポン配信は<strong>週2〜3回</strong>を目安に。内容に変化を持たせましょう。</p>
          </div>

          <h2><span className="num">2</span>内容・表現のNG</h2>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>過剰な割引（50%OFF以上）</h4>
            </div>
            <p className="g-ng-desc">
              極端な割引は<strong>常連客の離反</strong>を招きます。「先週定価で買ったのに」という不信感に繋がります。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>初回10〜15%、休眠復活20〜30%が適正。常連向けは<strong>特典型</strong>（ノベルティ・優先予約）で。</p>
          </div>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>無関係な情報・他社広告の配信</h4>
            </div>
            <p className="g-ng-desc">
              業種と無関係な広告（例：飲食店から保険の案内）は、<strong>「スパム」認定</strong>され配信停止されます。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>自店舗の商品・サービスに関連する情報のみ配信。</p>
          </div>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>煽り・恐怖を煽る表現</h4>
            </div>
            <p className="g-ng-desc">
              「今すぐ買わないと損」「残り1名」を連発すると、不信感・炎上リスクに。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>本当に希少な時だけ使用。日常的には使わない。</p>
          </div>

          <h2><span className="num">3</span>顧客対応のNG</h2>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>強引な登録誘導</h4>
            </div>
            <p className="g-ng-desc">
              「登録しないと割引しません」「会計前に必ず登録を」など、強制すると<strong>顧客体験を損ねます</strong>。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>登録は<strong>完全任意</strong>。「登録で初回10%OFF」など、メリットを提示して選んでもらう。</p>
          </div>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>クーポンの二重使用を許す</h4>
            </div>
            <p className="g-ng-desc">
              初回クーポンを2回使えてしまうと、<strong>ルールの信頼性が崩壊</strong>。以降の施策が効かなくなります。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>QRコード消込を<strong>必ず運用</strong>。Push-taroはSMS認証で自動的に二重使用をブロックします。</p>
          </div>

          <h2><span className="num">4</span>運用体制のNG</h2>

          <div className="g-ng-card">
            <div className="g-ng-head">
              <span className="g-ng-label">NG</span>
              <h4>効果測定をしない</h4>
            </div>
            <p className="g-ng-desc">
              「送りっぱなし」では、何が効いているか分からず、改善できません。
            </p>
            <p className="g-ng-fix"><strong>✅ 対策：</strong>開封率・来店率を<strong>月1回チェック</strong>。Push-taroの管理画面で数値が確認できます。</p>
          </div>

          <div className="g-callout danger">
            <span className="ico">🚨</span>
            <div>
              <p><strong>最重要：ブロックされた顧客は、二度と戻ってきません</strong></p>
              <p>プッシュ通知は「信頼関係」の上に成り立つコミュニケーション手段です。NG行為を避けることが、長期的な成果に直結します。</p>
            </div>
          </div>

          {/* ★ FAQ追加 */}
          <h2><span className="num">5</span>よくあるご質問</h2>
          <div className="g-faq">
            <details className="g-faq-item">
              <summary>プッシュ通知がブロックされる一番の理由は何ですか？</summary>
              <p>一番の理由は「配信頻度が多すぎる」ことです。1日に何通も送ったり、深夜に送ったりすると、顧客は不快に感じて通知をOFFにしてしまいます。</p>
            </details>
            <details className="g-faq-item">
              <summary>ブロックされた顧客を解除する方法はありますか？</summary>
              <p>一度ブロック（通知OFF）された顧客を、店舗側から強制的に解除することはできません。再度登録してもらう必要があるため、ブロックされない運用を徹底することが最も重要です。</p>
            </details>
            <details className="g-faq-item">
              <summary>適切なプッシュ通知の配信頻度はどのくらいですか？</summary>
              <p>週2〜3回が目安です。ただし、「今日の日替わり」など毎日配信が期待される情報は毎日でも問題ありません。クーポン配信は週2回までに抑えましょう。</p>
            </details>
          </div>

          {/* ★ 内部リンク修正：themes/repeat 削除、関係の深い記事へ変更 */}
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
              <Link href="/guide/security" className="g-related-card">
                <span className="ico">🔒</span>
                <div>
                  <div className="title">顧客情報を取らない理由</div>
                  <div className="sub">セキュリティと信頼</div>
                </div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/store-marketing" className="g-related-card">
                <span className="ico">📖</span>
                <div>
                  <div className="title">実店舗の集客、オススメの施策</div>
                  <div className="sub">店舗マーケティングの理論</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>安全で効果的な運用を、Push-taroで。</h3>
            <p>NG行為を避ける仕組みが、標準搭載されています。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
