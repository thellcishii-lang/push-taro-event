'use client';

import Link from 'next/link';

export default function TorisetsuBasicClient() {
  return (
    <>
      <nav className="t-nav">
        <div className="t-nav-inner">
          <Link href="/torisetsu" className="t-back">← 取扱説明書TOP</Link>
          <span className="t-nav-title">LIGHT / STANDARD 版</span>
        </div>
      </nav>

      <main className="t-main">
        <div className="t-hero">
          <span className="t-badge">LIGHT / STANDARD</span>
          <h1>LIGHT / STANDARDプラン<br />取扱説明書</h1>
          <p>店舗オーナー様向けの操作を、実際の画面で図解します。</p>
        </div>

        {/* プラン別機能一覧 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">0</span>
            <h2>プラン別 利用可能機能</h2>
          </div>
          <p className="t-desc">ご契約プランによって使える機能が異なります。以下の表でご確認ください。</p>

          <div className="t-plan-table-wrap">
            <table className="t-plan-table">
              <thead>
                <tr>
                  <th>機能</th>
                  <th className="is-light">LIGHT</th>
                  <th className="is-standard">STANDARD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>プッシュ通知の配信</td>
                  <td className="is-light">✓ 月5,000通</td>
                  <td className="is-standard">✓ 月15,000通</td>
                </tr>
                <tr>
                  <td>QRコード顧客獲得</td>
                  <td className="is-light">✓</td>
                  <td className="is-standard">✓</td>
                </tr>
                <tr>
                  <td>🎫 初回クーポン</td>
                  <td className="is-light">✓</td>
                  <td className="is-standard">✓</td>
                </tr>
                <tr className="is-highlight">
                  <td>🎟️ <strong>通常クーポン</strong></td>
                  <td className="is-light no">✗</td>
                  <td className="is-standard yes">✓ STANDARD以上</td>
                </tr>
                <tr className="is-highlight">
                  <td>🏆 <strong>特別達成クーポン</strong></td>
                  <td className="is-light no">✗</td>
                  <td className="is-standard yes">✓ STANDARD以上</td>
                </tr>
                <tr className="is-highlight">
                  <td>🖨️ <strong>店頭POP印刷</strong></td>
                  <td className="is-light no">✗</td>
                  <td className="is-standard yes">✓ STANDARD以上</td>
                </tr>
                <tr>
                  <td>顧客管理ダッシュボード</td>
                  <td className="is-light">✓</td>
                  <td className="is-standard">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 全体像 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">1</span>
            <h2>基本的な操作フロー</h2>
          </div>
          <div className="t-flow">
            <div className="t-flow-item"><div className="t-flow-icon">🔐</div><div className="t-flow-label">ログイン</div></div>
            <div className="t-flow-arrow">→</div>
            <div className="t-flow-item"><div className="t-flow-icon">🎫</div><div className="t-flow-label">クーポン設定</div></div>
            <div className="t-flow-arrow">→</div>
            <div className="t-flow-item"><div className="t-flow-icon">📱</div><div className="t-flow-label">QR配布</div></div>
            <div className="t-flow-arrow">→</div>
            <div className="t-flow-item"><div className="t-flow-icon">📢</div><div className="t-flow-label">通知送信</div></div>
            <div className="t-flow-arrow">→</div>
            <div className="t-flow-item"><div className="t-flow-icon">✅</div><div className="t-flow-label">消込</div></div>
          </div>
        </section>

        {/* ログイン */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">2</span>
            <h2>ログインする</h2>
          </div>
          <p className="t-desc">ブラウザで <code>/shop</code> を開き、登録時のメールアドレスとパスワードを入力します。</p>
          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-top">
                <div className="t-mockup-circle">🍰</div>
                <div className="t-mockup-h1">Push-taro</div>
                <div className="t-mockup-sub">オーナー専用ログイン画面</div>
              </div>
              <div className="t-mockup-input">✉️ メールアドレス</div>
              <div className="t-mockup-input">🔑 パスワード</div>
              <div className="t-mockup-btn">ログイン</div>
              <span className="t-mockup-anno" style={{ top: '58%', left: '-10px' }}>①</span>
              <span className="t-mockup-anno" style={{ top: '72%', left: '-10px' }}>②</span>
              <span className="t-mockup-anno" style={{ top: '87%', left: '-10px' }}>③</span>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num">①</span>登録時のメールアドレス</div>
              <div className="t-anno"><span className="t-anno-num">②</span>登録時のパスワード</div>
              <div className="t-anno"><span className="t-anno-num">③</span>ログインボタン</div>
            </div>
          </div>
        </section>

        {/* タブ紹介 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">3</span>
            <h2>4つのタブの使い分け</h2>
          </div>
          <p className="t-desc">ログイン後の管理画面は、4つのタブで構成されています。</p>

          <div className="t-tabs-demo">
            <div className="t-tab-item">
              <div className="t-tab-btn is-active">📢 即時配信</div>
              <div className="t-tab-desc">通知の送信と、クーポンの消し込みを行うタブ。日常的によく使います。</div>
            </div>
            <div className="t-tab-item">
              <div className="t-tab-btn is-sky">📋 送信履歴</div>
              <div className="t-tab-desc">過去に送信したプッシュ通知の一覧。送信数・開封率を確認できます。</div>
            </div>
            <div className="t-tab-item">
              <div className="t-tab-btn is-sky">🎫 消込履歴</div>
              <div className="t-tab-desc">クーポンの消込履歴。いつ・誰が・どのクーポンを使ったか確認できます。</div>
            </div>
            <div className="t-tab-item">
              <div className="t-tab-btn is-sky">🏪 店舗設定</div>
              <div className="t-tab-desc">店舗情報、クーポン設定、店頭POP印刷を行います。</div>
            </div>
          </div>
        </section>

        {/* 通知送信 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">4</span>
            <h2>プッシュ通知を送る</h2>
          </div>
          <p className="t-desc">「📢 即時配信」タブから、タイトル・本文を入力して送信ボタンを押すだけです。</p>
          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span className="is-active">📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span>🏪 店舗設定</span>
              </div>
              <div className="t-mockup-card">
                <div className="t-mockup-h3">📢 プッシュ通知を作成</div>
                <div className="t-mockup-label">タイトル</div>
                <div className="t-mockup-input">例: 新着セールのお知らせ</div>
                <div className="t-mockup-label">本文</div>
                <div className="t-mockup-textarea">例: 本日から全品20%OFF！</div>
                <div className="t-mockup-btn">🔥 通知を送信する</div>
              </div>
              <span className="t-mockup-anno" style={{ top: '38%', left: '-10px' }}>①</span>
              <span className="t-mockup-anno" style={{ top: '58%', left: '-10px' }}>②</span>
              <span className="t-mockup-anno" style={{ top: '82%', left: '-10px' }}>③</span>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num">①</span>通知のタイトル</div>
              <div className="t-anno"><span className="t-anno-num">②</span>通知の本文</div>
              <div className="t-anno"><span className="t-anno-num">③</span>タップで送信</div>
            </div>
          </div>
        </section>

        {/* 消込 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">5</span>
            <h2>クーポンを消し込む</h2>
          </div>
          <p className="t-desc">お客様が提示したQRコードを、スマホのカメラでスキャンするだけで消込完了です。</p>
          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-btn is-green" style={{ marginBottom: '16px' }}>📷 クーポンQRコードを読み取る</div>
              <div className="t-mockup-scan">
                <div className="t-scan-frame">
                  <div className="t-scan-corner tl"></div>
                  <div className="t-scan-corner tr"></div>
                  <div className="t-scan-corner bl"></div>
                  <div className="t-scan-corner br"></div>
                </div>
              </div>
              <div className="t-mockup-success">✅ 消し込み完了！<br />【初回クーポン】を適用</div>
              <span className="t-mockup-anno" style={{ top: '8%', left: '-10px' }}>①</span>
              <span className="t-mockup-anno" style={{ top: '40%', left: '-10px' }}>②</span>
              <span className="t-mockup-anno" style={{ top: '78%', left: '-10px' }}>③</span>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num">①</span>緑のボタンをタップ</div>
              <div className="t-anno"><span className="t-anno-num">②</span>お客様のQRコードを枠内に収める</div>
              <div className="t-anno"><span className="t-anno-num">③</span>自動で消込完了</div>
              <div className="t-anno-note">💡 二重利用は自動でブロックされます</div>
            </div>
          </div>
        </section>

        {/* 送信履歴・消込履歴 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">6</span>
            <h2>送信履歴・消込履歴を確認する</h2>
          </div>
          <p className="t-desc">過去の通知送信履歴と、クーポンの消込履歴をそれぞれ専用タブで確認できます。</p>

          <div className="t-coupon-grid">
            <div className="t-coupon-card">
              <div className="t-coupon-head">
                <h4>📋 送信履歴</h4>
              </div>
              <p>過去に送信したプッシュ通知の一覧。タイトル・本文・送信日時・送信数・開封率が確認できます。STANDARD以上では開封率も表示されます。</p>
            </div>
            <div className="t-coupon-card">
              <div className="t-coupon-head">
                <h4>🎫 消込履歴</h4>
              </div>
              <p>クーポンの消込履歴。いつ・誰が・どのクーポンを使ったかを一覧で確認できます。</p>
            </div>
          </div>
        </section>

        {/* 初回クーポン（共通） */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">7</span>
            <h2>🎫 初回クーポンを設定する</h2>
            <span className="t-plan-label is-all">LIGHT / STANDARD 共通</span>
          </div>
          <p className="t-desc">通知登録したお客様に自動配布される初回特典です。登録と同時に配信されます。</p>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span className="is-active-sky">🏪 店舗設定</span>
              </div>
              <div className="t-mockup-h3">🎫 初回クーポン設定</div>
              <div className="t-toggle-row">
                <span>初回クーポンを有効にする</span>
                <span className="t-toggle is-on"></span>
              </div>
              <div className="t-mockup-input">クーポンタイトル</div>
              <div className="t-mockup-input">説明文</div>
              <div className="t-mockup-input">📅 有効期限</div>
              <span className="t-mockup-anno" style={{ top: '48%', left: '-10px' }}>①</span>
              <span className="t-mockup-anno" style={{ top: '68%', left: '-10px' }}>②</span>
              <span className="t-mockup-anno" style={{ top: '90%', left: '-10px' }}>③</span>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num">①</span>「有効にする」をONに</div>
              <div className="t-anno"><span className="t-anno-num">②</span>タイトル・説明文を入力</div>
              <div className="t-anno"><span className="t-anno-num">③</span>有効期限を設定（任意）</div>
              <div className="t-anno-note">💡 例：「初回10%OFFクーポン」</div>
            </div>
          </div>
        </section>

        {/* ★ STANDARD限定：通常クーポン */}
        <section className="t-section t-section-std">
          <div className="t-sec-head">
            <span className="t-sec-num is-std">8</span>
            <h2>🎟️ 通常クーポンを設定する</h2>
            <span className="t-plan-label is-std">STANDARD 限定</span>
          </div>
          <p className="t-desc">
            登録者全員が<strong>何度でも使える常設クーポン</strong>です。LINE公式の「友だち特典」と同じ役割で、
            リピートを促進する基本の仕組みになります。
          </p>

          <div className="t-callout-info">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>通常クーポンの使い方</strong>
              <ul>
                <li>「入会特典」「会員様特典」など、常時使えるクーポンとして運用</li>
                <li>消込回数に制限なし（同じ人が何度でも使える）</li>
                <li>有効期限を設定して、期間限定のキャンペーンにも使える</li>
              </ul>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span className="is-active-sky">🏪 店舗設定</span>
              </div>
              <div className="t-mockup-h3">🎟️ 通常クーポン設定</div>
              <div className="t-toggle-row">
                <span>通常クーポンを有効にする</span>
                <span className="t-toggle is-on"></span>
              </div>
              <div className="t-mockup-input">クーポンタイトル</div>
              <div className="t-mockup-textarea">説明文・利用条件</div>
              <div className="t-mockup-input">📅 有効期限</div>
              <span className="t-mockup-anno" style={{ top: '48%', left: '-10px' }}>①</span>
              <span className="t-mockup-anno" style={{ top: '72%', left: '-10px' }}>②</span>
              <span className="t-mockup-anno" style={{ top: '92%', left: '-10px' }}>③</span>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num">①</span>「有効にする」をONに</div>
              <div className="t-anno"><span className="t-anno-num">②</span>タイトル・説明文を入力</div>
              <div className="t-anno"><span className="t-anno-num">③</span>有効期限を設定</div>
              <div className="t-anno-note">💡 例：「会員様いつでも10%OFF」</div>
            </div>
          </div>

          <div className="t-coupon-example">
            <div className="t-coupon-example-head">📝 おすすめの設定例</div>
            <div className="t-coupon-example-body">
              <div className="t-example-row"><span>タイトル</span><strong>会員様 10%OFFクーポン</strong></div>
              <div className="t-example-row"><span>説明文</span><strong>いつでも何度でもご利用いただけます</strong></div>
              <div className="t-example-row"><span>有効期限</span><strong>2026-12-31（年末まで）</strong></div>
            </div>
          </div>
        </section>

　　　　　　　　　　　　　        {/* ★ STANDARD限定：特別達成クーポン */}
        <section className="t-section t-section-std">
          <div className="t-sec-head">
            <span className="t-sec-num is-std">9</span>
            <h2>🏆 特別達成クーポンを設定する</h2>
            <span className="t-plan-label is-std">STANDARD 限定</span>
          </div>
          <p className="t-desc">
            累計で<strong>N回来店したお客様に解放される特別報酬</strong>です。ポイントカードのデジタル版として、
            常連客のファン化を促進します。
          </p>

          <div className="t-callout-info">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>特別達成クーポンの仕組み</strong>
              <ul>
                <li>通常クーポンを規定回数使うと、自動的に特別クーポンが解放される</li>
                <li>「あと1回で特別クーポン！」という心理が来店動機を後押し</li>
                <li>「繰り返す」設定で、達成後また1からカウントし直すことも可能</li>
              </ul>
            </div>
          </div>

          <div className="t-flow-std">
            <div className="t-flow-std-item">
              <div className="t-flow-std-circle">1回目</div>
              <p>通常クーポン<br />消込</p>
            </div>
            <div className="t-flow-std-arrow">→</div>
            <div className="t-flow-std-item">
              <div className="t-flow-std-circle">2回目</div>
              <p>通常クーポン<br />消込</p>
            </div>
            <div className="t-flow-std-arrow">→</div>
            <div className="t-flow-std-item">
              <div className="t-flow-std-circle is-highlight">3回目</div>
              <p>特別達成<br />クーポン解放</p>
            </div>
            <div className="t-flow-std-arrow">→</div>
            <div className="t-flow-std-item">
              <div className="t-flow-std-circle is-success">🎉</div>
              <p>特別クーポン<br />利用可能</p>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span className="is-active-sky">🏪 店舗設定</span>
              </div>
              <div className="t-mockup-h3">🏆 特別達成クーポン設定</div>
              <div className="t-toggle-row">
                <span>有効にする</span>
                <span className="t-toggle is-on"></span>
              </div>
              <div className="t-mockup-inline">
                <span>店舗設定の達成回数:</span>
                <strong className="t-inline-num">3</strong>
                <span>回で達成</span>
              </div>
              <div className="t-mockup-input">特典タイトル</div>
              <div className="t-mockup-inline">
                <span>有効期限:</span>
                <strong>出現から7日間</strong>
              </div>
              <div className="t-checkbox-row">
                <span className="t-checkbox">□</span>
                <span>他クーポンと併用可能</span>
              </div>
              <div className="t-checkbox-row">
                <span className="t-checkbox">□</span>
                <span>繰り返す</span>
              </div>
              <span className="t-mockup-anno" style={{ top: '38%', left: '-10px' }}>①</span>
              <span className="t-mockup-anno" style={{ top: '58%', left: '-10px' }}>②</span>
              <span className="t-mockup-anno" style={{ top: '82%', left: '-10px' }}>③</span>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num">①</span>達成回数を指定（例: 3回）</div>
              <div className="t-anno"><span className="t-anno-num">②</span>特典タイトルを入力</div>
              <div className="t-anno"><span className="t-anno-num">③</span>有効期限・併用可否を設定</div>
              <div className="t-anno-note">💡 「繰り返す」をONにすると、達成後また1からカウント</div>
            </div>
          </div>
        </section>

        {/* ★ STANDARD限定：店頭POP */}
        <section className="t-section t-section-std">
          <div className="t-sec-head">
            <span className="t-sec-num is-std">10</span>
            <h2>🖨️ 店頭POPを印刷する</h2>
            <span className="t-plan-label is-std">STANDARD 限定</span>
          </div>
          <p className="t-desc">
            店舗のレジ横やカウンターに置く<strong>QRコードポップを印刷</strong>できます。
            お客様がQRコードを読み取るだけで通知登録が完了する、集客の入り口となるツールです。
          </p>

          <div className="t-callout-info">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>店頭POPの使い方</strong>
              <ul>
                <li>「🏪 店舗設定」タブの「店頭POP（印刷用）」から印刷</li>
                <li>A4縦・B5縦サイズの2種類から選択可能</li>
                <li>印刷したQRコードをお客様が読み取ると、通知登録画面が開く</li>
                <li><strong style={{ color: '#c2410c' }}>※お使いのブラウザやプリンターによっては、端が切れる場合があります。その場合は印刷設定で「余白なし」にするか、倍率を90〜95%に下げて調整してください。</strong></li>
              </ul>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span className="is-active-sky">🏪 店舗設定</span>
              </div>
              <div className="t-mockup-h3">🖨️ 店頭POP（印刷用）</div>
              <div className="t-pop-options">
                <div className="t-pop-btn">
                  <div className="t-pop-icon">📄</div>
                  <div className="t-pop-label">A4縦</div>
                </div>
                <div className="t-pop-btn">
                  <div className="t-pop-icon">📄</div>
                  <div className="t-pop-label">B5縦</div>
                </div>
              </div>
              <span className="t-mockup-anno" style={{ top: '55%', left: '-10px' }}>①</span>
              <span className="t-mockup-anno" style={{ top: '72%', left: '-10px' }}>②</span>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num">①</span>A4縦 or B5縦を選択</div>
              <div className="t-anno"><span className="t-anno-num">②</span>印刷してレジ横に設置</div>
              <div className="t-anno-note">💡 お客様がQRを読み取るだけで通知登録完了</div>
            </div>
          </div>
        </section>

        {/* お客様の登録フロー */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">11</span>
            <h2>お客様の登録フロー</h2>
          </div>
          <p className="t-desc">
            お客様がPush-taroの通知を受け取るまでの流れです。<strong>不正利用防止のため、SMS認証が必要</strong>です。
          </p>

          <div className="t-reg-flow">
            <div className="t-reg-step">
              <div className="t-reg-num">1</div>
              <div className="t-reg-content">
                <h4>🔗 QRコードを読み取る</h4>
                <p>店頭POPのQRコードをスマホでスキャン。アプリのインストールは不要です。</p>
              </div>
            </div>

            <div className="t-reg-step is-ios">
              <div className="t-reg-num">2</div>
              <div className="t-reg-content">
                <h4>📱 iPhoneの場合：ホーム画面に追加</h4>
                <p>
                  iOSの仕様上、Webプッシュ通知を受け取るには<strong>「ホーム画面に追加」が必須</strong>です。
                  <br />
                  Safari下部の「共有ボタン（□に↑）」 → <strong>「ホーム画面に追加」</strong>をタップ →
                  ホーム画面に作成されたアイコンから開きます。
                </p>
              </div>
            </div>

            <div className="t-reg-step is-sms">
              <div className="t-reg-num">3</div>
              <div className="t-reg-content">
                <h4>📞 電話番号でSMS認証</h4>
                <p>
                  電話番号を入力すると、SMSで6桁の認証コードが届きます。
                  コードを入力して認証完了。<br />
                  <strong>認証は一度だけ</strong>。以降は認証済みの端末として扱われます。
                </p>
              </div>
            </div>

            <div className="t-reg-step">
              <div className="t-reg-num">4</div>
              <div className="t-reg-content">
                <h4>🔔 通知を許可する</h4>
                <p>ブラウザの通知許可ダイアログで「許可」をタップ。これで登録完了です。</p>
              </div>
            </div>
          </div>

          <div className="t-sms-reason">
            <div className="t-sms-reason-head">
              <span className="t-sms-reason-icon">🛡️</span>
              <h3>なぜSMS認証が必要なのですか？</h3>
            </div>
            <p className="t-sms-reason-lead">
              SMS認証は、<strong>クーポンの不正利用を防ぐため</strong>に設けています。
            </p>

            <div className="t-sms-reason-grid">
              <div className="t-sms-reason-card is-bad">
                <div className="t-sms-badge is-bad">SMS認証がない場合</div>
                <ul>
                  <li>同じ人が何度も登録し直せる</li>
                  <li>「初回クーポン」を何度も使い回せる</li>
                  <li>店舗の貴重なクーポンが不正消費される</li>
                </ul>
              </div>
              <div className="t-sms-reason-card is-good">
                <div className="t-sms-badge is-good">SMS認証がある場合</div>
                <ul>
                  <li>電話番号1つにつき、<strong>1回のみ</strong>登録可能</li>
                  <li>初回クーポンの使い回しを完全ブロック</li>
                  <li>お客様は安心してご利用いただける</li>
                </ul>
              </div>
            </div>

            <div className="t-sms-reason-note">
              <strong>💡 電話番号はSMS認証以外の用途では一切使用しません</strong>
              <p>
                ご登録いただいた電話番号は、本人確認（SMS認証）のみに使用し、
                マーケティング目的の営業電話・SMS送信などは<strong>一切行いません</strong>。
              </p>
            </div>
          </div>
        </section>

        {/* 顧客側の画面 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">12</span>
            <h2>お客様側の画面（STANDARD）</h2>
          </div>
          <p className="t-desc">お客様はQRコードを読み取るだけで、クーポン付きの専用画面が開きます。STANDARDでは複数のクーポンが並んで表示されます。</p>
          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-shop-icon">🍰</div>
              <div className="t-mockup-h2">Patisserie Taro</div>
              <div className="t-mockup-link-btn">🌐 サイトはこちらから</div>
              <div className="t-coupon-preview is-orange">
                <span className="t-cp-badge">初回限定</span>
                <div className="t-cp-title">🎁 初回限定クーポン</div>
                <div className="t-cp-qr"></div>
              </div>
              <div className="t-coupon-preview is-green">
                <span className="t-cp-badge is-green">通常クーポン</span>
                <div className="t-cp-title is-green">🎟️ 会員様 10%OFF</div>
                <div className="t-cp-qr"></div>
              </div>
              <div className="t-coupon-preview is-orange2">
                <span className="t-cp-badge is-orange2">特別達成クーポン</span>
                <div className="t-cp-title is-orange2">🏆 3回達成 20%OFF</div>
                <div className="t-cp-qr"></div>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#f59e0b' }}>🎫</span>初回クーポン</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#10b981' }}>🎟️</span>通常クーポン（STANDARD以上）</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ea580c' }}>🏆</span>特別達成クーポン（STANDARD以上）</div>
              <div className="t-anno-note">💡 3回来店後、特別達成クーポンが自動で解放されます</div>
            </div>
          </div>
        </section>

        {/* PROプランへ */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num">13</span>
            <h2>PROプランへアップグレード</h2>
          </div>
          <p className="t-desc">「📢 即時配信」タブ上部の「プラン比較・変更」ボタンから、PROプランへ変更できます。</p>
          <div className="t-upgrade-box">
            <div className="t-upgrade-icon">🚀</div>
            <div className="t-upgrade-text">
              <strong>PROプランでできること</strong>
              <ul>
                <li>配信無制限</li>
                <li>ステップアップ・連続・記念日誕生日・休眠復活クーポン</li>
                <li>予約配信・定期配信</li>
                <li>POS連携（API連携）</li>
                <li>紹介報酬制度（毎月10%還元）</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 関連リンク */}
        <div className="t-related">
          <h3>関連ページ</h3>
          <div className="t-related-grid">
            <Link href="/torisetsu/pro" className="t-related-card">
              <span className="ico">🔥</span>
              <div><div className="title">PROプラン取扱説明書</div><div className="sub">全機能の使い方</div></div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/guide" className="t-related-card">
              <span className="ico">📚</span>
              <div><div className="title">業種別 活用ガイド</div><div className="sub">業種ごとの運用ノウハウ</div></div>
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="t-cta">
          <h3>困ったときは</h3>
          <p>操作で分からないことがあれば、お気軽にお問い合わせください。</p>
          <a href="mailto:info@push-taro.com" className="t-cta-btn">お問い合わせ →</a>
        </div>
      </main>

      <style jsx global>{`
        .t-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; }
        .t-nav-inner { max-width: 960px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
        .t-back { font-size: 13px; font-weight: 700; color: #64748b; text-decoration: none; }
        .t-back:hover { color: #ff4500; }
        .t-nav-title { font-size: 13px; font-weight: 800; color: #0f172a; }

        .t-main { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif; }

        .t-hero { text-align: center; margin-bottom: 56px; padding-bottom: 40px; border-bottom: 1px solid #e2e8f0; }
        .t-badge { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; color: #0284c7; background: #e0f2fe; padding: 6px 16px; border-radius: 20px; margin-bottom: 20px; }
        .t-hero h1 { font-size: clamp(26px, 3.6vw, 40px); font-weight: 900; color: #0f172a; letter-spacing: -1px; margin: 0 0 14px; line-height: 1.25; }
        .t-hero p { font-size: 15px; color: #64748b; margin: 0; }

        .t-section { margin-bottom: 72px; }
        .t-section-std { background: linear-gradient(180deg, #f0f9ff 0%, #fff 100%); border-radius: 20px; padding: 32px 28px; border: 2px solid #bae6fd; }
        .t-sec-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .t-sec-num { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 12px; font-size: 20px; font-weight: 900; box-shadow: 0 6px 16px rgba(255,69,0,0.25); flex-shrink: 0; }
        .t-sec-num.is-std { background: linear-gradient(135deg, #0284c7, #38bdf8); box-shadow: 0 6px 16px rgba(2,132,199,0.25); }
        .t-sec-head h2 { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.6px; }
        .t-plan-label { font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 12px; letter-spacing: 0.3px; }
        .t-plan-label.is-all { background: #f1f5f9; color: #64748b; }
        .t-plan-label.is-std { background: #0284c7; color: #fff; }
        .t-desc { font-size: 15px; color: #475569; line-height: 1.9; margin-bottom: 28px; }
        .t-desc code { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #dc2626; }

        .t-plan-table-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.04); }
        .t-plan-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 500px; }
        .t-plan-table th, .t-plan-table td { padding: 16px 20px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .t-plan-table thead th { background: #f8fafc; font-weight: 800; color: #0f172a; font-size: 13px; }
        .t-plan-table thead th.is-light { color: #64748b; text-align: center; }
        .t-plan-table thead th.is-standard { color: #0284c7; text-align: center; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); }
        .t-plan-table tbody tr:last-child td { border-bottom: none; }
        .t-plan-table tbody tr.is-highlight { background: #f8fafc; }
        .t-plan-table td.is-light { text-align: center; color: #475569; font-weight: 700; }
        .t-plan-table td.is-standard { text-align: center; font-weight: 800; background: #f0f9ff; }
        .t-plan-table td.is-light.no { color: #cbd5e1; font-weight: 500; }
        .t-plan-table td.is-standard.yes { color: #0284c7; }

        .t-flow { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; padding: 24px; background: linear-gradient(135deg, #f8fafc, #eef2f7); border-radius: 16px; border: 1px solid #e2e8f0; }
        .t-flow-item { text-align: center; flex-shrink: 0; }
        .t-flow-icon { font-size: 28px; margin-bottom: 6px; }
        .t-flow-label { font-size: 12px; font-weight: 700; color: #334155; }
        .t-flow-arrow { color: #ff4500; font-size: 20px; font-weight: 900; }

        .t-tabs-demo { display: flex; flex-direction: column; gap: 12px; }
        .t-tab-item { display: flex; align-items: center; gap: 20px; padding: 16px 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
        .t-tab-btn { flex-shrink: 0; min-width: 180px; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 800; text-align: center; }
        .t-tab-btn.is-active { background: #fff7ed; color: #ff4500; border-bottom: 3px solid #ff4500; }
        .t-tab-btn.is-sky { background: #f0f9ff; color: #0284c7; border-bottom: 3px solid #0284c7; }
        .t-tab-desc { font-size: 13px; color: #64748b; line-height: 1.7; }
        @media (max-width: 640px) { .t-tab-item { flex-direction: column; align-items: flex-start; gap: 8px; } }

        .t-flow-std { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; padding: 28px 24px; background: #fff; border-radius: 16px; border: 2px solid #bae6fd; margin: 28px 0; }
        .t-flow-std-item { text-align: center; flex-shrink: 0; }
        .t-flow-std-circle { width: 72px; height: 72px; border-radius: 50%; background: #f0f9ff; border: 2px solid #0284c7; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #0284c7; margin: 0 auto 8px; }
        .t-flow-std-circle.is-highlight { background: #0284c7; color: #fff; }
        .t-flow-std-circle.is-success { background: #f0fdf4; border-color: #16a34a; color: #16a34a; font-size: 24px; }
        .t-flow-std-item p { font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; }
        .t-flow-std-arrow { color: #0284c7; font-size: 20px; font-weight: 900; }

        .t-mockup-row { display: grid; grid-template-columns: 320px 1fr; gap: 32px; align-items: start; }
        @media (max-width: 768px) { .t-mockup-row { grid-template-columns: 1fr; } }
        .t-mockup { position: relative; background: #fff; border: 2px solid #e2e8f0; border-radius: 20px; padding: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
        .t-mockup-top { text-align: center; margin-bottom: 20px; }
        .t-mockup-circle { font-size: 40px; margin-bottom: 8px; }
        .t-mockup-h1 { font-size: 18px; font-weight: 900; color: #0f172a; }
        .t-mockup-h2 { font-size: 16px; font-weight: 900; color: #0f172a; text-align: center; margin-bottom: 12px; }
        .t-mockup-h3 { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 14px; }
        .t-mockup-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
        .t-mockup-shop-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #ff6b6b, #ff4500); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px; }

        /* セグメント型ピルタブ */
        .t-mockup-tabs-pill { display: flex; gap: 2px; padding: 3px; background: rgba(226,232,240,0.6); border-radius: 12px; margin-bottom: 16px; overflow-x: auto; }
        .t-mockup-tabs-pill span { font-size: 9px; font-weight: 700; color: #64748b; padding: 6px 8px; white-space: nowrap; border-radius: 8px; }
        .t-mockup-tabs-pill span.is-active { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(15,23,42,0.08); }
        .t-mockup-tabs-pill span.is-active-sky { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(15,23,42,0.08); }

        .t-mockup-label { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px; }
        .t-mockup-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #94a3b8; background: #f8fafc; margin-bottom: 12px; }
        .t-mockup-textarea { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #94a3b8; background: #f8fafc; margin-bottom: 12px; min-height: 60px; }
        .t-mockup-btn { padding: 12px; background: #ff4500; color: #fff; border-radius: 8px; text-align: center; font-weight: 800; font-size: 14px; }
        .t-mockup-btn.is-green { background: #16a34a; }
        .t-mockup-card { background: #fff; padding: 14px; border-radius: 10px; border: 1px solid #e0e0e0; }
        .t-mockup-scan { background: #1e293b; border-radius: 12px; padding: 32px; margin-bottom: 16px; display: flex; justify-content: center; align-items: center; min-height: 160px; }
        .t-scan-frame { position: relative; width: 100px; height: 100px; }
        .t-scan-corner { position: absolute; width: 20px; height: 20px; border: 3px solid #22c55e; }
        .t-scan-corner.tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
        .t-scan-corner.tr { top: 0; right: 0; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
        .t-scan-corner.bl { bottom: 0; left: 0; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
        .t-scan-corner.br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 8px 0; }
        .t-mockup-success { padding: 14px; background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; color: #15803d; font-weight: 800; font-size: 13px; text-align: center; }
        .t-mockup-link-btn { display: block; text-align: center; padding: 10px; background: #2563eb; color: #fff; border-radius: 6px; font-weight: 700; font-size: 12px; margin-bottom: 16px; }

        /* トグルスイッチ */
        .t-toggle-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 12px; font-weight: 700; color: #334155; }
        .t-toggle { display: inline-block; width: 32px; height: 18px; background: #cbd5e1; border-radius: 999px; position: relative; }
        .t-toggle.is-on { background: #16a34a; }
        .t-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
        .t-toggle.is-on::after { left: 16px; }

        .t-checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 12px; color: #334155; font-weight: 700; }
        .t-checkbox { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 900; }
        .t-mockup-inline { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 12px; color: #334155; }
        .t-inline-num { display: inline-block; padding: 4px 10px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px; font-weight: 800; color: #0f172a; }

        /* 店頭POP */
        .t-pop-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .t-pop-btn { padding: 18px 12px; border: 2px dashed #ddd6fe; background: rgba(245,243,255,0.4); border-radius: 12px; text-align: center; }
　　　　　　　　　　　　　　　　　.t-pop-btn:hover { background: rgba(245,243,255,0.8); }
        .t-pop-icon { font-size: 20px; margin-bottom: 2px; }
        .t-pop-label { font-size: 11px; font-weight: 700; color: #6d28d9; }

        .t-coupon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .t-coupon-card { background: #fff; border: 2px solid #e2e8f0; border-radius: 14px; padding: 20px; }
        .t-coupon-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
        .t-coupon-head h4 { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; }
        .t-coupon-card p { font-size: 13px; color: #64748b; line-height: 1.75; margin: 0; }

        .t-callout-info { display: flex; gap: 16px; padding: 20px 24px; background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 14px; margin-bottom: 28px; align-items: flex-start; }
        .t-callout-info-icon { font-size: 22px; flex-shrink: 0; }
        .t-callout-info strong { display: block; font-size: 15px; color: #0369a1; margin-bottom: 8px; }
        .t-callout-info ul { margin: 0; padding-left: 20px; font-size: 14px; color: #075985; line-height: 1.9; }

        .t-coupon-example { margin-top: 24px; background: #fff; border: 2px solid #0284c7; border-radius: 14px; overflow: hidden; }
        .t-coupon-example-head { background: #0284c7; color: #fff; font-size: 13px; font-weight: 800; padding: 12px 20px; }
        .t-coupon-example-body { padding: 16px 20px; }
        .t-example-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; font-size: 13px; border-bottom: 1px dashed #e2e8f0; }
        .t-example-row:last-child { border-bottom: none; }
        .t-example-row span { color: #64748b; flex-shrink: 0; }
        .t-example-row strong { color: #0f172a; font-weight: 800; text-align: right; }

        .t-coupon-preview { border-radius: 10px; padding: 14px; text-align: center; margin-bottom: 12px; }
        .t-coupon-preview.is-orange { background: #fff3e0; border: 1px dashed #ffb74d; }
        .t-coupon-preview.is-green { background: #f0fdf4; border: 1px dashed #4ade80; }
        .t-coupon-preview.is-orange2 { background: #fff7ed; border: 1px dashed #fb923c; }
        .t-cp-badge { display: inline-block; font-size: 10px; background: #e65100; color: #fff; padding: 2px 8px; border-radius: 10px; font-weight: 800; margin-bottom: 6px; }
        .t-cp-badge.is-green { background: #16a34a; }
        .t-cp-badge.is-orange2 { background: #ea580c; }
        .t-cp-title { font-size: 13px; font-weight: 800; color: #e65100; margin-bottom: 10px; }
        .t-cp-title.is-green { color: #15803d; }
        .t-cp-title.is-orange2 { color: #c2410c; }
        .t-cp-qr { width: 90px; height: 90px; background: repeating-linear-gradient(45deg, #0f172a, #0f172a 8px, #fff 8px, #fff 16px); border-radius: 6px; margin: 0 auto; }

        .t-upgrade-box { display: flex; gap: 20px; padding: 28px; background: linear-gradient(135deg, #fff7ed, #fffbeb); border: 2px solid #ff4500; border-radius: 16px; align-items: flex-start; }
        .t-upgrade-icon { font-size: 48px; flex-shrink: 0; }
        .t-upgrade-text strong { display: block; font-size: 16px; color: #c2410c; margin-bottom: 12px; }
        .t-upgrade-text ul { margin: 0; padding-left: 20px; font-size: 14px; color: #7c2d12; line-height: 1.9; }

        .t-related { margin-top: 64px; padding-top: 32px; border-top: 2px solid #e2e8f0; }
        .t-related h3 { font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #64748b; margin: 0 0 20px; }
        .t-related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .t-related-card { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .t-related-card:hover { border-color: #ff4500; transform: translateX(4px); }
        .t-related-card .ico { font-size: 24px; flex-shrink: 0; }
        .t-related-card .title { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.3; }
        .t-related-card .sub { font-size: 11.5px; color: #64748b; margin-top: 2px; }
        .t-related-card .arrow { color: #ff4500; font-size: 16px; font-weight: 900; margin-left: auto; }

        .t-cta { margin-top: 48px; padding: 40px 32px; background: linear-gradient(160deg, #0f172a, #1e293b); color: #fff; border-radius: 20px; text-align: center; }
        .t-cta h3 { font-size: 20px; font-weight: 900; margin: 0 0 10px; }
        .t-cta p { font-size: 14px; color: #94a3b8; margin: 0 0 20px; }
        .t-cta-btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none; box-shadow: 0 6px 20px rgba(255,69,0,0.3); }

        /* お客様の登録フロー */
        .t-reg-flow { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
        .t-reg-step { display: flex; gap: 16px; padding: 20px 24px; background: #fff; border: 2px solid #e2e8f0; border-radius: 14px; align-items: flex-start; }
        .t-reg-step.is-ios { border-color: #bae6fd; background: #f0f9ff; }
        .t-reg-step.is-sms { border-color: #86efac; background: #f0fdf4; }
        .t-reg-num { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 50%; font-size: 16px; font-weight: 900; box-shadow: 0 4px 12px rgba(255,69,0,0.25); flex-shrink: 0; }
        .t-reg-content h4 { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
        .t-reg-content p { font-size: 13.5px; color: #475569; line-height: 1.8; margin: 0; }
        .t-reg-content strong { color: #0f172a; }

        .t-sms-reason { padding: 28px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 2px solid #86efac; border-radius: 20px; margin-bottom: 24px; }
        .t-sms-reason-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .t-sms-reason-icon { font-size: 32px; }
        .t-sms-reason-head h3 { font-size: 20px; font-weight: 900; color: #166534; margin: 0; letter-spacing: -0.5px; }
        .t-sms-reason-lead { font-size: 15px; color: #166534; line-height: 1.8; margin: 0 0 24px; }
        .t-sms-reason-lead strong { color: #14532d; background: #fef3c7; padding: 2px 8px; border-radius: 4px; }
        .t-sms-reason-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .t-sms-reason-card { padding: 18px 20px; border-radius: 14px; }
        .t-sms-reason-card.is-bad { background: #fef2f2; border: 1px solid #fecaca; }
        .t-sms-reason-card.is-good { background: #fff; border: 1px solid #86efac; }
        .t-sms-badge { display: inline-block; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 12px; margin-bottom: 12px; }
        .t-sms-badge.is-bad { background: #dc2626; color: #fff; }
        .t-sms-badge.is-good { background: #16a34a; color: #fff; }
        .t-sms-reason-card ul { margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.9; }
        .t-sms-reason-card.is-bad ul { color: #7f1d1d; }
        .t-sms-reason-card.is-good ul { color: #14532d; }
        .t-sms-reason-note { padding: 18px 22px; background: #fff; border: 1px solid #86efac; border-radius: 12px; }
        .t-sms-reason-note strong { display: block; font-size: 14px; color: #166534; margin-bottom: 8px; }
        .t-sms-reason-note p { font-size: 13px; color: #475569; line-height: 1.8; margin: 0; }
        .t-sms-reason-note p strong { display: inline; color: #dc2626; }

        .t-mockup-anno { position: absolute; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: #ff4500; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 900; box-shadow: 0 4px 10px rgba(255,69,0,0.4); border: 2px solid #fff; }

        .t-annos { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }
        .t-anno { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #334155; line-height: 1.7; }
        .t-anno-num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: #ff4500; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 900; flex-shrink: 0; }
        .t-anno-note { font-size: 13px; color: #475569; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 12px 16px; margin-top: 8px; line-height: 1.7; }

        @media (max-width: 640px) {
          .t-main { padding: 24px 16px 60px; }
          .t-sec-head h2 { font-size: 20px; }
          .t-flow { gap: 8px; }
          .t-flow-arrow, .t-flow-std-arrow { display: none; }
          .t-upgrade-box { flex-direction: column; }
          .t-cta { padding: 32px 24px; }
          .t-section-std { padding: 24px 16px; }
          .t-plan-table { font-size: 12px; }
          .t-plan-table th, .t-plan-table td { padding: 10px 12px; }
          .t-sms-reason-grid { grid-template-columns: 1fr; }
          .t-reg-step { padding: 16px 18px; }
        }
      `}</style>
    </>
  );
}
