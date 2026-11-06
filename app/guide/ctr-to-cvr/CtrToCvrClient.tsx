'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './ctr-to-cvr.css';

export default function CtrToCvrClient() {
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
          <span className="current">CTRを、CVRに繋げる方法</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">🎯 実践ガイド</span>
          <h1>CTRを、<br />CVRに繋げる方法。</h1>
          <p>
            プッシュ通知は、CTRが高い。<br />
            でも、そのタップには、<strong>「衝動的なタップ」</strong>も含まれています。<br />
            CTRを、実際の来店に変えるための設計を解説します。
          </p>
        </div>

        <div className="g-content">

          <p>
            <strong>「プッシュ通知は、CTRが高い」</strong>。<br />
            これは、紛れもない事実です。
          </p>

          <p>
            メールと違って、通知をタップするだけで、<br />
            リンク先に直行できる。<br />
            この構造的な強みが、CTRを押し上げています。
          </p>

          <p>
            でも、ここで、ひとつの落とし穴があります。
          </p>

          <div className="g-quote is-orange">
            CTRが高い ＝ <br />
            CVRも高い、<br />
            ではない。
          </div>

          <p>
            なぜ、そうなるのか。<br />
            そして、どうすれば、CTRをCVRに繋げられるのか。
          </p>

          <p>
            この記事では、CTRが高いのに、CVRが低い理由と、<br />
            <strong>CTRをCVRに繋げる3つの設計</strong>をお伝えします。
          </p>

          {/* 1. なぜ、CTRが高くてもCVRが低いのか */}
          <h2 className="g-h2"><span className="num">1</span>なぜ、CTRが高くてもCVRが低いのか</h2>

          <p>
            まず、前提を整理しておきます。
          </p>

          <p>
            前の記事で見た通り、<br />
            プッシュ通知のCTRは、メールの<strong>約3〜5倍</strong>。
          </p>

          <p>
            でも、CTRが高いのに、CVRが伸びない、<br />
            という現象が、よく起こります。
          </p>

          <p>
            理由は、<strong>タップの「質」</strong>にあります。
          </p>

          <h3 className="g-h3">メールのタップは、「深い興味」</h3>

          <p>
            メールの場合、タップするまでに、<br />
            3つのステップがあります。
          </p>

          <div className="step-list">
            <div className="step-item">
              <span className="step-num">1</span>
              <span className="step-text">メールを開く</span>
            </div>
            <div className="step-item">
              <span className="step-num">2</span>
              <span className="step-text">本文を読む</span>
            </div>
            <div className="step-item">
              <span className="step-num">3</span>
              <span className="step-text">興味を持って、リンクをクリック</span>
            </div>
          </div>

          <p>
            ここまで来て、やっとタップに至る。<br />
            だから、メールのタップは、<strong>「深い興味」</strong>に基づいています。
          </p>

          <h3 className="g-h3">プッシュ通知のタップは、「衝動」も含む</h3>

          <p>
            一方、プッシュ通知の場合、<br />
            ステップは、たったの2つ。
          </p>

          <div className="step-list is-push">
            <div className="step-item">
              <span className="step-num">1</span>
              <span className="step-text">通知を見る</span>
            </div>
            <div className="step-item">
              <span className="step-num">2</span>
              <span className="step-text">タップする</span>
            </div>
          </div>

          <p>
            通知を見て、タップする。<br />
            このステップが少ないから、CTRは高くなる。
          </p>

          <p>
            でも、同時に、<br />
            <strong>「深く考えずに、タップした」</strong>というケースも、生まれます。
          </p>

          <p>
            通知のタイトルを見て、反射的にタップする。<br />
            でも、リンク先を見て、<strong>「あ、いいや」</strong> となる。
          </p>

          <div className="g-quote is-orange">
            プッシュ通知のCTRには、<br />
            「衝動的なタップ」が含まれる。
          </div>

          <p>
            これが、<strong>CTRが高いのに、CVRが低い理由</strong>です。
          </p>

          {/* 2. CTRをCVRに繋げる3つの設計 */}
          <h2 className="g-h2"><span className="num">2</span>CTRをCVRに繋げる3つの設計</h2>

          <p>
            では、どうすれば、CTRをCVRに繋げられるのか。
          </p>

          <p>
            鍵は、<strong>「タップの勢い」を、そのまま来店に変える設計</strong>です。
          </p>

          <p>
            具体的には、3つの設計が欠かせません。
          </p>

          <div className="three-points">
            <div className="three-point">
              <div className="three-point-num">01</div>
              <div className="three-point-title">通知とリンク先の、一貫性</div>
            </div>
            <div className="three-point">
              <div className="three-point-num">02</div>
              <div className="three-point-title">1タップで使える、クーポン</div>
            </div>
            <div className="three-point">
              <div className="three-point-num">03</div>
              <div className="three-point-title">行動を促す、期限の設計</div>
            </div>
          </div>

          {/* 設計1 */}
          <h3 className="g-h3">設計① 通知とリンク先の、一貫性</h3>

          <p>
            最も多い失敗が、これです。
          </p>

          <p>
            <strong>通知で言ったことと、リンク先で表示されることが違う。</strong>
          </p>

          <div className="fail-example">
            <div className="fail-example-label">❌ 悪い例</div>
            <div className="fail-example-body">
              <div className="fail-example-row">
                <span className="fail-example-tag">通知</span>
                <span>「本日限定！20%OFFクーポン配布中」</span>
              </div>
              <div className="fail-example-arrow">↓ タップ</div>
              <div className="fail-example-row">
                <span className="fail-example-tag is-bad">リンク先</span>
                <span>トップページが表示される。「クーポン」の文字すらない</span>
              </div>
            </div>
          </div>

          <p>
            お客様は、反射的にタップした。<br />
            でも、リンク先で、通知で言っていた「クーポン」が見つからない。
          </p>

          <p>
            この瞬間、<strong>「あ、いいや」</strong> となる。
          </p>

          <div className="g-callout danger">
            <span className="ico">🚨</span>
            <div>
              <p><strong>通知とリンク先の一貫性は、絶対条件</strong></p>
              <p>
                通知で「20%OFF」と言ったら、リンク先も「20%OFF」。<br />
                通知で「クーポン配布中」と言ったら、リンク先も「クーポン」。<br />
                <strong>この一貫性がなければ、CTRはCVRに繋がりません。</strong>
              </p>
            </div>
          </div>

          <p>
            そして、もう一歩踏み込みたいのが、<br />
            <strong>「リンク先が、クーポン画面そのもの」</strong>であること。
          </p>

          <p>
            トップページを経由して、クーポン画面に飛ぶ。<br />
            この1ステップが、離脱を生みます。
          </p>

          <p>
            通知をタップしたら、<strong>いきなりクーポン画面</strong>。<br />
            これが、理想です。
          </p>

          {/* 設計2 */}
          <h3 className="g-h3">設計② 1タップで使える、クーポン</h3>

          <p>
            次に、大事なのが、<strong>「使うまでのステップ」</strong>です。
          </p>

          <p>
            せっかくリンク先に来たのに、<br />
            使うまでに、いくつものステップがあったら、お客様は疲れてしまいます。
          </p>

          <div className="flow-card-full">
            <div className="flow-full-label">❌ ステップが多い例</div>
            <div className="flow-full-steps">
              <span>クーポン画面を開く</span>
              <span className="flow-full-arrow">→</span>
              <span>ログインを求められる</span>
              <span className="flow-full-arrow">→</span>
              <span>クーポンを選択</span>
              <span className="flow-full-arrow">→</span>
              <span>QRコードを表示</span>
              <span className="flow-full-arrow">→</span>
              <span>スタッフに提示</span>
            </div>
          </div>

          <p>
            この間、お客様は、<strong>何度も「やめる」選択肢と出会います。</strong><br />
            そのたびに、CVRは下がっていきます。
          </p>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>理想は、この流れ</strong></p>
              <p>
                通知をタップする → <strong>クーポンが即座に表示される</strong>。<br />
                これだけ。ログインも、選択も、不要。
              </p>
            </div>
          </div>

          <p>
            Push-taroのクーポンは、<strong>タップすると同時に表示</strong>されます。<br />
            会計時に、そのまま画面を提示するだけ。
          </p>

          <div className="g-quote is-orange">
            1タップで使えるから、<br />
            その場で、来店の理由になる。
          </div>

          {/* 設計3 */}
          <h3 className="g-h3">設計③ 行動を促す、期限の設計</h3>

          <p>
            最後に、<strong>「いつまでに使えばいいか」</strong>を、明確にすること。
          </p>

          <p>
            これがないと、お客様は、<br />
            <strong>「あとで使おう」</strong> と思って、忘れてしまいます。
          </p>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>「あとで」は、永遠に来ない</strong></p>
              <p>
                人間は、期限がないと動かない生き物です。<br />
                「今日だけ」「あと3日」「今週末まで」——<br />
                <strong>期限を切ることで、行動を促します。</strong>
              </p>
            </div>
          </div>

          <p>
            これは、心理学で言う<strong>「損失回避バイアス」</strong>の活用です。<br />
            「使わないと損」という感覚が、来店を後押しします。
          </p>

          <div className="deadline-examples">
            <div className="deadline-card">
              <div className="deadline-icon">⏰</div>
              <div className="deadline-title">今日だけ</div>
              <div className="deadline-desc">最も強い。即日来店を促す</div>
            </div>
            <div className="deadline-card">
              <div className="deadline-icon">📅</div>
              <div className="deadline-title">今週末まで</div>
              <div className="deadline-desc">週末の来店を狙う</div>
            </div>
            <div className="deadline-card">
              <div className="deadline-icon">🗓️</div>
              <div className="deadline-title">今月末まで</div>
              <div className="deadline-desc">ゆるやかに、来店を促す</div>
            </div>
          </div>

          <p>
            ただし、<strong>過度な煽りはNG</strong>です。<br />
            「今すぐ買わないと損！」を連発すると、不信感を招きます。
          </p>

          <p>
            <strong>自然な期限設計</strong>が、大切です。
          </p>

          {/* 3. Push-taroは、どう設計したか */}
          <h2 className="g-h2"><span className="num">3</span>Push-taroは、どう設計したか</h2>

          <p>
            ここまでの3つの設計を、Push-taroは、<strong>標準搭載</strong>しています。
          </p>

          <div className="design-list">
            <div className="design-row">
              <div className="design-row-icon">🔗</div>
              <div className="design-row-body">
                <div className="design-row-title">通知とリンク先の、一貫性</div>
                <div className="design-row-desc">
                  通知をタップすると、クーポン画面に直行。<br />
                  トップページを経由しません。
                </div>
              </div>
            </div>

            <div className="design-row">
              <div className="design-row-icon">⚡</div>
              <div className="design-row-body">
                <div className="design-row-title">1タップで使える、クーポン</div>
                <div className="design-row-desc">
                  ログイン不要。会計時に、画面を提示するだけ。<br />
                  QRコードを読み取れば、消込は完了。
                </div>
              </div>
            </div>

            <div className="design-row">
              <div className="design-row-icon">⏰</div>
              <div className="design-row-body">
                <div className="design-row-title">行動を促す、期限の設計</div>
                <div className="design-row-desc">
                  クーポンごとに、有効期限を設定可能。<br />
                  「今日だけ」「今週末まで」を、自由に設計できます。
                </div>
              </div>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>CTRを、CVRに繋げる設計が、最初から入っている</strong></p>
              <p>
                これが、Push-taroの強みです。<br />
                配信して、タップされて、来店される。<br />
                この流れを、最初から設計しています。
              </p>
            </div>
          </div>

          {/* 4. さらに、改善を続ける */}
          <h2 className="g-h2"><span className="num">4</span>さらに、改善を続ける</h2>

          <p>
            3つの設計を整えても、まだ完璧ではありません。
          </p>

          <p>
            <strong>配信を続けて、データを蓄積して、改善する。</strong><br />
            このサイクルが、CVRを伸ばします。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>改善のサイクルを回すには、データが必要</strong></p>
              <p>
                どの通知が、何人来店に繋がったか。<br />
                どのクーポンが、よく使われたか。<br />
                データを蓄積して、初めて、改善の方向が見えます。
              </p>
            </div>
          </div>

          <p>
            そして、データを蓄積するには、<br />
            <strong>配信を続けること</strong>が、欠かせません。
          </p>

          <p>
            配信上限に縛られて、配信を止めてしまったら、<br />
            データは永遠に蓄積されません。
          </p>

          <p>
            Push-taroのPROプランなら、<strong>配信無制限</strong>。<br />
            改善のサイクルを、止めずに回せます。
          </p>

          {/* 5. まとめ */}
          <h2 className="g-h2"><span className="num">5</span>まとめ</h2>

          <div className="summary-box">
            <div className="summary-title">CTRを、CVRに繋げる3つの設計</div>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-num">01</span>
                <span className="summary-text"><strong>通知とリンク先の、一貫性</strong>。タップしたら、クーポン画面に直行。</span>
              </div>
              <div className="summary-item">
                <span className="summary-num">02</span>
                <span className="summary-text"><strong>1タップで使える、クーポン</strong>。ログイン不要、提示するだけ。</span>
              </div>
              <div className="summary-item">
                <span className="summary-num">03</span>
                <span className="summary-text"><strong>行動を促す、期限の設計</strong>。「今日だけ」で、来店を後押し。</span>
              </div>
            </div>
          </div>

          <p>
            プッシュ通知は、確実にCTRを高められます。<br />
            でも、CTRは通過点。<br />
            <strong>本当の勝負は、CVRに繋げられるか</strong>です。
          </p>

          <p>
            3つの設計を整えて、<br />
            配信を続けて、データを蓄積する。<br />
            これが、実店舗のリピート施策を、成功に導きます。
          </p>

          <div className="g-related">
  <h3>この記事の前提</h3>
  <div className="g-related-grid">
    <Link href="/guide/push-notification-metrics" className="g-related-card">
      <span className="ico">📊</span>
      <div>
        <div className="title">プッシュ通知のCVRは、何%あればいいのか</div>
        <div className="sub">CTRとCVRのベンチマーク</div>
      </div>
      <span className="arrow">→</span>
    </Link>
    <Link href="/guide/store-marketing" className="g-related-card">
      <span className="ico">📖</span>
      <div>
        <div className="title">実店舗の集客、オススメの施策</div>
        <div className="sub">この記事のさらに前提</div>
      </div>
      <span className="arrow">→</span>
    </Link>
  </div>
</div>

<div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
  <h3>具体的な機能</h3>
  <div className="g-related-grid">
    <Link href="/guide/features/coupon-first" className="g-related-card">
      <span className="ico">🎫</span>
      <div>
        <div className="title">初回クーポン</div>
        <div className="sub">登録のハードルを、クーポンで超える</div>
      </div>
      <span className="arrow">→</span>
    </Link>
    <Link href="/guide/features/coupon-repeat" className="g-related-card">
      <span className="ico">🔄</span>
      <div>
        <div className="title">連続クーポン</div>
        <div className="sub">来店サイクルを、自動で短縮</div>
      </div>
      <span className="arrow">→</span>
    </Link>
  </div>
</div>

          <div className="g-cta">
            <h3>CTRを、CVRに繋げる設計を。</h3>
            <p>
              Push-taroは、通知とリンク先の一貫性、<br />
              1タップで使えるクーポン、期限の設計を、標準搭載。
            </p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
