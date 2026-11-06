'use client';

import Link from 'next/link';
import '../torisetsu.css';

export default function TorisetsuProClient() {
  return (
    <>
      <nav className="t-nav">
        <div className="t-nav-inner">
          <Link href="/torisetsu" className="t-back">← 取扱説明書TOP</Link>
          <span className="t-nav-title">PRO 版</span>
        </div>
      </nav>

      <main className="t-main">
        <div className="t-hero">
          <span className="t-badge is-pro">🔥 PRO</span>
          <h1>PROプラン<br />取扱説明書</h1>
          <p>全機能の操作方法を、実際の画面で図解します。</p>
        </div>

        {/* 機能一覧 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">0</span>
            <h2>PROプランで使える全機能</h2>
          </div>

          <div className="t-feature-grid">
            <div className="t-feature-card"><span className="ico">📢</span><div><strong>配信無制限</strong><small>何通でも送信可能</small></div></div>
            <div className="t-feature-card"><span className="ico">🎫</span><div><strong>初回クーポン</strong><small>登録者全員に自動配布</small></div></div>
            <div className="t-feature-card"><span className="ico">🎟️</span><div><strong>通常クーポン</strong><small>何度でも使える常設</small></div></div>
            <div className="t-feature-card"><span className="ico">🏆</span><div><strong>特別達成クーポン</strong><small>N回来店で解放</small></div></div>
            <div className="t-feature-card"><span className="ico">🖨️</span><div><strong>店頭POP印刷</strong><small>A4・B5サイズ対応</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">🐾</span><div><strong>ステップアップ</strong><small>段階的に特典アップ</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">🔄</span><div><strong>連続クーポン</strong><small>消込で次回分発行</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">🎂</span><div><strong>記念日・誕生日</strong><small>自動でお祝い通知</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">💤</span><div><strong>休眠復活</strong><small>離反顧客を呼び戻す</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">📅</span><div><strong>予約配信</strong><small>日時指定で自動送信</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">🔗</span><div><strong>POS連携</strong><small>会計と同時に消込</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">🤝</span><div><strong>紹介報酬</strong><small>毎月10%還元</small></div></div>
          </div>
        </section>

        {/* ログイン */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">1</span>
            <h2>ログインする</h2>
          </div>
          <p className="t-desc">ブラウザで <code>/pro-shop</code> を開き、登録時のメールアドレスとパスワードを入力します。</p>
          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-top">
                <div className="t-mockup-circle">🍰</div>
                <div className="t-mockup-h1">Push-taro</div>
                <div className="t-mockup-sub">PROオーナー専用ログイン画面</div>
              </div>
              <div className="t-mockup-input">✉️ メールアドレス</div>
              <div className="t-mockup-input">🔑 パスワード</div>
              <div className="t-mockup-btn">ログイン</div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>登録時のメールアドレスを入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>②</span>登録時のパスワードを入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>③</span>ログインボタンをタップ</div>
            </div>
          </div>
        </section>

        {/* タブ紹介 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">2</span>
            <h2>PROコンソールの6つのタブ</h2>
          </div>
          <p className="t-desc">PROプランの管理画面は6つのタブで構成されています。（POS連携はダッシュボードへ移動しました）</p>

          <div className="t-tabs-demo">
            <div className="t-tab-item">
              <div className="t-tab-btn is-active">📢 即時配信</div>
              <div className="t-tab-desc">通知の送信とクーポン消込を行う、日常的によく使うタブ</div>
            </div>
            <div className="t-tab-item">
              <div className="t-tab-btn is-sky">📋 送信履歴</div>
              <div className="t-tab-desc">過去に送信したプッシュ通知の一覧・開封率を確認</div>
            </div>
            <div className="t-tab-item">
              <div className="t-tab-btn is-sky">🎫 消込履歴</div>
              <div className="t-tab-desc">クーポンの消込履歴（いつ・誰が・どのクーポン）</div>
            </div>
            <div className="t-tab-item">
              <div className="t-tab-btn is-sky">🏪 店舗設定</div>
              <div className="t-tab-desc">店舗情報、各種クーポン、店頭POP印刷</div>
            </div>
            <div className="t-tab-item">
              <div className="t-tab-btn is-green">🔥 PRO機能</div>
              <div className="t-tab-desc">ステップアップ、連続、記念日誕生日、休眠復活、連続ログイン</div>
            </div>
            <div className="t-tab-item">
              <div className="t-tab-btn is-amber">📅 予約配信</div>
              <div className="t-tab-desc">日時指定・定期配信の設定と管理</div>
            </div>
          </div>
        </section>

        {/* 即時通知 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">3</span>
            <h2>📢 プッシュ通知を送る（配信無制限）</h2>
          </div>
          <p className="t-desc">
            「📢 即時配信」タブから、タイトル・本文を入力して送信するだけ。
            <strong>PROプランは配信無制限</strong>なので、上限を気にせず送信できます。
          </p>
          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span className="is-active">📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span>🏪 店舗設定</span>
                <span>🔥 PRO機能</span>
                <span>📅 予約</span>
              </div>
              <div className="t-mockup-card">
                <div className="t-mockup-h3">📢 プッシュ通知を作成</div>
                <div className="t-mockup-label">タイトル</div>
                <div className="t-mockup-input">例: 新着セールのお知らせ</div>
                <div className="t-mockup-label">本文</div>
                <div className="t-mockup-textarea">例: 本日から全品20%OFF！</div>
                <div className="t-mockup-btn">🔥 通知を送信する</div>
              </div>
              <div className="t-mockup-unlimited">
                <span>🔥 月間送信ステータス</span>
                <strong>配信無制限</strong>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>通知のタイトルを入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>②</span>通知の本文を入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>③</span>送信ボタンをタップ</div>
              <div className="t-anno-note">💡 PROプランは配信無制限。上限を気にせず送れます</div>
            </div>
          </div>
        </section>

        {/* 消込 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">4</span>
            <h2>クーポンを消し込む</h2>
          </div>
          <p className="t-desc">お客様のQRコードをスキャンするだけで消込完了。どのクーポンかは自動判定されます。</p>
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
              <div className="t-mockup-success">✅ 消し込み完了！<br />【連続クーポン】を適用</div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#16a34a' }}>①</span>緑のボタンをタップ</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#16a34a' }}>②</span>QRコードを枠内に収める</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#16a34a' }}>③</span>自動で消込完了</div>
              <div className="t-anno-note">💡 二重利用は自動ブロック。連続クーポン等は次回分が自動発行されます</div>
            </div>
          </div>
        </section>

        {/* 店頭POP（PROでも利用可能） */}
        <section className="t-section t-section-sky">
          <div className="t-sec-head">
            <span className="t-sec-num is-sky">5</span>
            <h2>🖨️ 店頭POPを印刷する</h2>
            <span className="t-plan-label is-all">STANDARD以上</span>
          </div>
          <p className="t-desc">
            レジ横やカウンターに置く<strong>QRコードポップを印刷</strong>できます。
            お客様がQRを読み取るだけで通知登録が完了します。
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
                <span>🔥 PRO機能</span>
                <span>📅 予約</span>
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
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#0284c7' }}>①</span>A4縦 or B5縦を選択</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#0284c7' }}>②</span>印刷してレジ横に設置</div>
              <div className="t-anno-note">💡 お客様がQRを読み取るだけで通知登録完了</div>
            </div>
          </div>
        </section>

        {/* 基本クーポン */}
        <section className="t-section t-section-sky">
          <div className="t-sec-head">
            <span className="t-sec-num is-sky">6</span>
            <h2>🏪 基本クーポンを設定する</h2>
            <span className="t-plan-label is-all">PRO 含む全プラン</span>
          </div>
          <p className="t-desc">「🏪 店舗設定」タブで、3種類のクーポンを設定します。</p>

          <div className="t-coupon-grid">
            <div className="t-coupon-card">
              <div className="t-coupon-head">
                <span className="t-coupon-badge is-all">全プラン</span>
                <h4>🎫 初回クーポン</h4>
              </div>
              <p>通知登録と同時に自動配布される初回特典。二重利用は自動ブロック。</p>
            </div>
            <div className="t-coupon-card">
              <div className="t-coupon-head">
                <span className="t-coupon-badge is-std">STANDARD+</span>
                <h4>🎟️ 通常クーポン</h4>
              </div>
              <p>登録者全員が何度でも使える常設クーポン。</p>
            </div>
            <div className="t-coupon-card">
              <div className="t-coupon-head">
                <span className="t-coupon-badge is-std">STANDARD+</span>
                <h4>🏆 特別達成クーポン</h4>
              </div>
              <p>累計N回来店で解放される特別報酬。ポイントカードのデジタル版。</p>
            </div>
          </div>
        </section>

                {/* PRO機能：ステップアップ */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">7</span>
            <h2>🐾 ステップアップクーポンを設定する</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            来店回数に応じて<strong>段階的に特典が豪華になる</strong>仕組み。最大10段階まで設定できます。
          </p>

          <div className="t-flow-pro">
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle">1回目</div><p>¥100引き</p></div>
            <div className="t-flow-pro-arrow">→</div>
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle">2回目</div><p>¥200引き</p></div>
            <div className="t-flow-pro-arrow">→</div>
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle">3回目</div><p>¥300引き</p></div>
            <div className="t-flow-pro-arrow">→</div>
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle is-highlight">4回目</div><p>¥500引き</p></div>
            <div className="t-flow-pro-arrow">→</div>
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle is-success">🎉</div><p>5回目<br />特別特典</p></div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span>🏪 店舗設定</span>
                <span className="is-active-green">🔥 PRO機能</span>
                <span>📅 予約</span>
              </div>
              <div className="t-mockup-h3">🐾 ステップアップクーポン</div>
              <div className="t-toggle-row">
                <span>有効にする</span>
                <span className="t-toggle is-on"></span>
              </div>
              <div className="t-step-mockup">
                <div className="t-step-title">ステップ 1</div>
                <div className="t-mockup-input">例: 1回目来店特典</div>
                <div className="t-mockup-inline">
                  <span>有効日数:</span><strong>7</strong><span>日間</span>
                </div>
              </div>
              <div className="t-step-mockup">
                <div className="t-step-title">ステップ 2</div>
                <div className="t-mockup-input">例: 2回目来店特典</div>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#7c3aed' }}>①</span>「有効にする」をONに</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#7c3aed' }}>②</span>各ステップの特典タイトルを入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#7c3aed' }}>③</span>有効日数を設定</div>
              <div className="t-anno-note">💡 最大10段階まで設定可能。「＋ステップを追加」ボタンで追加</div>
            </div>
          </div>
        </section>

        {/* PRO機能：連続クーポン */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">8</span>
            <h2>🔄 連続クーポンを設定する</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            クーポン消込と同時に、<strong>次回使えるクーポンを即時発行</strong>する仕組み。来店サイクルを自動で短縮できます。
          </p>

          <div className="t-callout-info is-pro">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>連続クーポンの仕組み</strong>
              <ul>
                <li>来店→消込→次回クーポン自動発行→再来店のループが自動化</li>
                <li>「14日以内に来れば次のクーポン」という心理で来店を促進</li>
                <li>有効期限は「日数」「日付固定」から選択可能</li>
              </ul>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span>🏪 店舗設定</span>
                <span className="is-active-green">🔥 PRO機能</span>
                <span>📅 予約</span>
              </div>
              <div className="t-mockup-h3">🔄 連続クーポン</div>
              <div className="t-toggle-row">
                <span>有効にする</span>
                <span className="t-toggle is-on"></span>
              </div>
              <div className="t-mockup-input">次回使える特典タイトル</div>
              <div className="t-mockup-inline">
                <span>有効日数:</span><strong>14</strong><span>日間</span>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#0ea5e9' }}>①</span>「有効にする」をONに</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#0ea5e9' }}>②</span>次回特典のタイトルを入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#0ea5e9' }}>③</span>有効日数を設定（例: 14日）</div>
            </div>
          </div>
        </section>

        {/* PRO機能：記念日誕生日 */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">9</span>
            <h2>🎂 記念日・お誕生日クーポンを設定する</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            お客様の<strong>記念日・誕生日当日に自動でお祝い通知</strong>を配信。特別感でファン化を加速させます。
          </p>

          <div className="t-callout-info is-pro">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>お客様側での生年月日登録が必要</strong>
              <ul>
                <li>顧客画面（/subscribe）で、任意で月日を登録してもらいます</li>
                <li>一度登録すると変更不可（改ざん防止）</li>
                <li>登録月日の当日に自動配信されます</li>
              </ul>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span>🏪 店舗設定</span>
                <span className="is-active-green">🔥 PRO機能</span>
                <span>📅 予約</span>
              </div>
              <div className="t-mockup-h3">🎂 記念日、お誕生日クーポン</div>
              <div className="t-toggle-row">
                <span>有効にする</span>
                <span className="t-toggle is-on"></span>
              </div>
              <div className="t-mockup-input">クーポンタイトル</div>
              <div className="t-mockup-textarea">お祝いメッセージ本文</div>
              <div className="t-checkbox-row">
                <span className="t-checkbox">□</span>
                <span>特別達成クーポンに追加する</span>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ea580c' }}>①</span>「有効にする」をONに</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ea580c' }}>②</span>クーポンタイトルを入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ea580c' }}>③</span>お祝いメッセージを入力</div>
            </div>
          </div>
        </section>

        {/* PRO機能：休眠復活 */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">10</span>
            <h2>💤 休眠復活クーポンを設定する</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            最終来店から<strong>N日経過した顧客を自動抽出</strong>し、特別な復帰クーポンを配信。離反顧客を呼び戻します。
          </p>

          <div className="t-flow-pro is-purple">
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle is-purple">60日経過</div><p>自動検知</p></div>
            <div className="t-flow-pro-arrow">→</div>
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle is-purple">自動配信</div><p>復帰クーポン</p></div>
            <div className="t-flow-pro-arrow">→</div>
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle is-purple">再来店</div><p>クーポン利用</p></div>
            <div className="t-flow-pro-arrow">→</div>
            <div className="t-flow-pro-item"><div className="t-flow-pro-circle is-success">🎉</div><p>復活</p></div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span>🏪 店舗設定</span>
                <span className="is-active-green">🔥 PRO機能</span>
                <span>📅 予約</span>
              </div>
              <div className="t-mockup-h3">💤 休眠復活クーポン</div>
              <div className="t-toggle-row">
                <span>有効にする</span>
                <span className="t-toggle is-on"></span>
              </div>
              <div className="t-mockup-inline">
                <span>最終利用から</span><strong>60</strong><span>日経過した顧客</span>
              </div>
              <div className="t-mockup-input">復帰クーポンタイトル</div>
              <div className="t-mockup-textarea">お久しぶりメッセージ本文</div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#8b5cf6' }}>①</span>「有効にする」をONに</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#8b5cf6' }}>②</span>休眠判定の日数を設定（60日推奨）</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#8b5cf6' }}>③</span>復帰クーポンのタイトル・メッセージ</div>
            </div>
          </div>
        </section>

        {/* PRO機能：連続ログイン特典 */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">11</span>
            <h2>🔥 連続ログイン特典を設定する</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            アプリを開く習慣をつけ、<strong>連続達成でクーポンをプレゼント</strong>する仕組み。
            1日でも途切れるとリセットされますが、リマインド通知で継続を後押しできます。
          </p>

          <div className="t-callout-info is-pro">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>連続ログイン特典の仕組み</strong>
              <ul>
                <li>顧客画面で「今日のスタンプ」を押すとカウントアップ</li>
                <li>目標日数（1〜10日）達成でクーポン獲得</li>
                <li>毎日夕方18時に「あと1日で達成！」のリマインド通知を自動送信</li>
                <li>達成時は紙吹雪とモーダルでお祝い演出</li>
              </ul>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span>🏪 店舗設定</span>
                <span className="is-active-green">🔥 PRO機能</span>
                <span>📅 予約</span>
              </div>
              <div className="t-mockup-h3">🔥 連続ログイン特典</div>
              <div className="t-toggle-row">
                <span>有効にする</span>
                <span className="t-toggle is-on"></span>
              </div>
              <div className="t-mockup-inline">
                <span>目標日数:</span><strong>5</strong><span>日</span>
              </div>
              <div className="t-mockup-input">達成時のクーポン名</div>
              <div className="t-checkbox-row">
                <span className="t-checkbox is-on">✓</span>
                <span>リマインド通知を送る</span>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#f97316' }}>①</span>「有効にする」をONに</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#f97316' }}>②</span>目標日数をスライダーで設定</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#f97316' }}>③</span>達成時のクーポン名を入力</div>
              <div className="t-anno-note">💡 リマインド通知ONで、あと1日で達成時に自動通知</div>
            </div>
          </div>
        </section>

        {/* 予約配信 */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">12</span>
            <h2>📅 予約配信をセットする</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            「毎週金曜18時」「毎月1日」など、<strong>任意のスケジュールで自動配信</strong>。
            一度設定すればずっと動き続けます。
          </p>

          <div className="t-schedule-types">
            <div className="t-schedule-card">
              <div className="t-schedule-head">① 日付指定（1回のみ）</div>
              <p>指定した日付に1回だけ配信</p>
            </div>
            <div className="t-schedule-card">
              <div className="t-schedule-head">② 毎月指定日</div>
              <p>「毎月1日」「毎月15日」など定期的に配信</p>
            </div>
            <div className="t-schedule-card">
              <div className="t-schedule-head">③ 毎週指定曜日</div>
              <p>「毎週金曜日」など曜日指定で配信</p>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-tabs-pill">
                <span>📢 即時配信</span>
                <span>📋 送信履歴</span>
                <span>🎫 消込履歴</span>
                <span>🏪 店舗設定</span>
                <span>🔥 PRO機能</span>
                <span className="is-active-amber">📅 予約</span>
              </div>
              <div className="t-mockup-h3">📅 新規配信予約をセット</div>
              <div className="t-mockup-label">① 配信の種別</div>
              <div className="t-mockup-inline">
                <span className="t-checkbox is-on">●</span><span>通常通知</span>
                <span className="t-checkbox">○</span><span>クーポン付き</span>
              </div>
              <div className="t-mockup-label">② スケジュール</div>
              <div className="t-mockup-inline">
                <span className="t-checkbox is-on">●</span><span>日付指定</span>
                <span className="t-checkbox">○</span><span>毎月</span>
                <span className="t-checkbox">○</span><span>毎週</span>
              </div>
              <div className="t-mockup-input">📅 配信指定日</div>
              <div className="t-mockup-input">タイトル</div>
              <div className="t-mockup-textarea">本文</div>
              <div className="t-mockup-btn is-amber">➕ 予約をセット</div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#d97706' }}>①</span>通知 or クーポン付きを選択</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#d97706' }}>②</span>配信タイプを選択</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#d97706' }}>③</span>日付・タイトル・本文を入力</div>
              <div className="t-anno-note">💡 設定した予約はタブ下部の一覧でいつでも削除できます</div>
            </div>
          </div>
        </section>

        {/* POS連携 */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">13</span>
            <h2>🔗 POS連携で消込を自動化する</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            お使いの<strong>POSレジと連携</strong>して、会計と同時にクーポン消込を自動記録。
            スタッフがスマホでQRを読み取る手間がなくなります。
          </p>

          <div className="t-callout-info is-pro">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>POS連携でできること</strong>
              <ul>
                <li>レジでQRを読み取るだけで消込完了</li>
                <li>複数レジでも1つのAPIキーで対応可能</li>
                <li>技術仕様は公開済み。POSベンダーに実装を依頼できます</li>
              </ul>
            </div>
          </div>

          <div className="t-pos-steps">
            <div className="t-pos-step">
              <div className="t-pos-step-num">1</div>
              <div>
                <h4>ダッシュボードでAPIキーを発行</h4>
                <p>PRO紹介・報酬ダッシュボードの「POS API キー」セクションから発行します。</p>
              </div>
            </div>
            <div className="t-pos-step">
              <div className="t-pos-step-num">2</div>
              <div>
                <h4>POSベンダーに技術仕様を共有</h4>
                <p>API仕様ページのURLをPOSベンダーに渡してください。</p>
              </div>
            </div>
            <div className="t-pos-step">
              <div className="t-pos-step-num">3</div>
              <div>
                <h4>POS側で実装 → 接続テスト</h4>
                <p>実際にQRを読み取って消込が記録されるか確認します。</p>
              </div>
            </div>
          </div>

          <div className="t-related-grid" style={{ marginTop: '28px' }}>
            <Link href="/guide/pos-integration" className="t-related-card">
              <span className="ico">📘</span>
              <div>
                <div className="title">POS連携ガイド</div>
                <div className="sub">導入の流れ・注意事項</div>
              </div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/developers/pos-api" className="t-related-card">
              <span className="ico">🔧</span>
              <div>
                <div className="title">API 技術仕様</div>
                <div className="sub">エンドポイント・サンプルコード</div>
              </div>
              <span className="arrow">→</span>
            </Link>
          </div>
        </section>

        {/* お客様の登録フロー */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">14</span>
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

            <div className="t-reg-step is-pro">
              <div className="t-reg-num">4</div>
              <div className="t-reg-content">
                <h4>🎂 記念日・誕生日を登録（PRO店舗のみ）</h4>
                <p>
                  PROプラン店舗では、任意で<strong>記念日・誕生日</strong>を登録できます。
                  <strong>電話番号に紐づくため、一度登録すると後から変更できません</strong>（改ざん防止）。
                </p>
              </div>
            </div>

            <div className="t-reg-step">
              <div className="t-reg-num">5</div>
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
            <span className="t-sec-num is-pro">15</span>
            <h2>お客様側の画面（PRO）</h2>
          </div>
          <p className="t-desc">PRO店舗では、お客様の画面に最大8種類のクーポンが並んで表示されます。</p>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-shop-icon">🍰</div>
              <div className="t-mockup-h2">Patisserie Taro</div>
              <div className="t-mockup-link-btn">🌐 サイトはこちらから</div>
              <div className="t-coupon-preview is-pink">
                <span className="t-cp-badge is-pink">連続ログイン</span>
                <div className="t-cp-title is-pink">🔥 5日連続達成！</div>
              </div>
              <div className="t-coupon-preview is-orange">
                <span className="t-cp-badge">記念日・誕生日</span>
                <div className="t-cp-title">🎂 お誕生日おめでとう</div>
              </div>
              <div className="t-coupon-preview is-orange">
                <span className="t-cp-badge">初回限定</span>
                <div className="t-cp-title">🎁 初回限定クーポン</div>
              </div>
              <div className="t-coupon-preview is-green">
                <span className="t-cp-badge is-green">通常クーポン</span>
                <div className="t-cp-title is-green">🎟️ 会員様 10%OFF</div>
              </div>
              <div className="t-coupon-preview is-purple">
                <span className="t-cp-badge is-purple">ステップアップ</span>
                <div className="t-cp-title is-purple">🐾 ステップ3特典</div>
              </div>
              <div className="t-coupon-preview is-sky">
                <span className="t-cp-badge is-sky">連続クーポン</span>
                <div className="t-cp-title is-sky">🔄 次回使える10%OFF</div>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#f97316' }}>🔥</span>連続ログイン特典（PRO限定）</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ea580c' }}>🎂</span>記念日・誕生日クーポン（PRO限定）</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#f59e0b' }}>🎫</span>初回限定クーポン</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#10b981' }}>🎟️</span>通常クーポン</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#8b5cf6' }}>🐾</span>ステップアップクーポン（PRO限定）</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#0284c7' }}>🔄</span>連続クーポン（PRO限定）</div>
              <div className="t-anno-note">💡 利用可能なクーポンだけが自動的に表示されます</div>
            </div>
          </div>
        </section>

        {/* 紹介報酬 → ダッシュボードへ */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">16</span>
            <h2>🤝 紹介・報酬ダッシュボード</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            PROプラン特典として、他店舗を紹介すると<strong>毎月10%の報酬</strong>が発生します。
            紹介・報酬の管理は専用ダッシュボードで行います。
          </p>

          <div className="t-callout-info is-pro">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>ダッシュボードでできること</strong>
              <ul>
                <li>紹介コード・専用URLの発行</li>
                <li>累計報酬・未払い報酬・紹介店舗数の確認</li>
                <li>振込先口座の登録</li>
                <li>報酬明細CSVのダウンロード</li>
                <li>POS連携APIキーの発行</li>
              </ul>
            </div>
          </div>

          <div className="t-related-grid">
            <Link href="/torisetsu/dashboard" className="t-related-card">
              <span className="ico">🤝</span>
              <div>
                <div className="title">紹介・報酬ダッシュボード取説</div>
                <div className="sub">ダッシュボードの使い方</div>
              </div>
              <span className="arrow">→</span>
            </Link>
          </div>
        </section>

                {/* 関連リンク */}
        <div className="t-related">
          <h3>関連ページ</h3>
          <div className="t-related-grid">
            <Link href="/torisetsu/light-standard" className="t-related-card">
              <span className="ico">📗</span>
              <div><div className="title">LIGHT / STANDARD版</div><div className="sub">基本機能の取扱説明書</div></div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/torisetsu/dashboard" className="t-related-card">
              <span className="ico">🤝</span>
              <div><div className="title">紹介・報酬ダッシュボード</div><div className="sub">ダッシュボードの使い方</div></div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/guide" className="t-related-card">
              <span className="ico">📚</span>
              <div><div className="title">業種別 活用ガイド</div><div className="sub">業種ごとの運用ノウハウ</div></div>
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="t-cta is-pro">
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
        .t-nav-title { font-size: 13px; font-weight: 800; color: #ff4500; }

        .t-main { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif; }

        .t-hero { text-align: center; margin-bottom: 56px; padding-bottom: 40px; border-bottom: 1px solid #e2e8f0; }
        .t-badge { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; padding: 6px 16px; border-radius: 20px; margin-bottom: 20px; }
        .t-badge.is-pro { color: #fff; background: linear-gradient(135deg, #ff4500, #f97316); }
        .t-hero h1 { font-size: clamp(26px, 3.6vw, 40px); font-weight: 900; color: #0f172a; letter-spacing: -1px; margin: 0 0 14px; line-height: 1.25; }
        .t-hero p { font-size: 15px; color: #64748b; margin: 0; }

        .t-section { margin-bottom: 72px; }
        .t-section-sky { background: linear-gradient(180deg, #f0f9ff 0%, #fff 100%); border-radius: 20px; padding: 32px 28px; border: 2px solid #bae6fd; }
        .t-section-pro { background: linear-gradient(180deg, #fff7ed 0%, #fff 100%); border-radius: 20px; padding: 32px 28px; border: 2px solid #fed7aa; }
        .t-sec-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .t-sec-num { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 12px; font-size: 20px; font-weight: 900; box-shadow: 0 6px 16px rgba(255,69,0,0.25); flex-shrink: 0; }
        .t-sec-num.is-pro { background: linear-gradient(135deg, #ff4500, #ea580c); }
        .t-sec-num.is-sky { background: linear-gradient(135deg, #0284c7, #38bdf8); box-shadow: 0 6px 16px rgba(2,132,199,0.25); }
        .t-sec-head h2 { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.6px; }
        .t-plan-label { font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 12px; letter-spacing: 0.3px; }
        .t-plan-label.is-all { background: #f1f5f9; color: #64748b; }
        .t-plan-label.is-pro { background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; }
        .t-desc { font-size: 15px; color: #475569; line-height: 1.9; margin-bottom: 28px; }
        .t-desc code { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #dc2626; }

        .t-feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .t-feature-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
        .t-feature-card.is-pro { background: #fff7ed; border-color: #fed7aa; }
        .t-feature-card .ico { font-size: 22px; flex-shrink: 0; }
        .t-feature-card strong { display: block; font-size: 13.5px; font-weight: 800; color: #0f172a; line-height: 1.3; }
        .t-feature-card small { font-size: 11px; color: #64748b; }

        .t-tabs-demo { display: flex; flex-direction: column; gap: 12px; }
        .t-tab-item { display: flex; align-items: center; gap: 20px; padding: 16px 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
        .t-tab-btn { flex-shrink: 0; min-width: 180px; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 800; text-align: center; }
        .t-tab-btn.is-active { background: #fff7ed; color: #ff4500; border-bottom: 3px solid #ff4500; }
        .t-tab-btn.is-sky { background: #f0f9ff; color: #0284c7; border-bottom: 3px solid #0284c7; }
        .t-tab-btn.is-green { background: #f0fdf4; color: #16a34a; border-bottom: 3px solid #16a34a; }
        .t-tab-btn.is-amber { background: #fffbeb; color: #d97706; border-bottom: 3px solid #d97706; }
        .t-tab-desc { font-size: 13px; color: #64748b; line-height: 1.7; }
        @media (max-width: 640px) { .t-tab-item { flex-direction: column; align-items: flex-start; gap: 8px; } }

        .t-flow-pro { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; padding: 28px 24px; background: #fff; border-radius: 16px; border: 2px solid #fed7aa; margin: 28px 0; }
        .t-flow-pro.is-purple { border-color: #e9d5ff; }
        .t-flow-pro-item { text-align: center; flex-shrink: 0; }
        .t-flow-pro-circle { width: 72px; height: 72px; border-radius: 50%; background: #fff7ed; border: 2px solid #ea580c; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #ea580c; margin: 0 auto 8px; }
        .t-flow-pro-circle.is-purple { background: #faf5ff; border-color: #8b5cf6; color: #8b5cf6; }
        .t-flow-pro-circle.is-highlight { background: #ff4500; border-color: #ff4500; color: #fff; }
        .t-flow-pro-circle.is-success { background: #f0fdf4; border-color: #16a34a; color: #16a34a; font-size: 24px; }
        .t-flow-pro-item p { font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; }
        .t-flow-pro-arrow { color: #ea580c; font-size: 20px; font-weight: 900; }
        .t-flow-pro.is-purple .t-flow-pro-arrow { color: #8b5cf6; }

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

        .t-mockup-tabs-pill { display: flex; gap: 2px; padding: 3px; background: rgba(226,232,240,0.6); border-radius: 12px; margin-bottom: 16px; overflow-x: auto; }
        .t-mockup-tabs-pill span { font-size: 9px; font-weight: 700; color: #64748b; padding: 6px 8px; white-space: nowrap; border-radius: 8px; }
        .t-mockup-tabs-pill span.is-active { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(15,23,42,0.08); }
        .t-mockup-tabs-pill span.is-active-sky { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(15,23,42,0.08); }
        .t-mockup-tabs-pill span.is-active-green { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(15,23,42,0.08); }
        .t-mockup-tabs-pill span.is-active-amber { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(15,23,42,0.08); }

        .t-mockup-label { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px; }
        .t-mockup-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #94a3b8; background: #f8fafc; margin-bottom: 12px; }
        .t-mockup-textarea { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #94a3b8; background: #f8fafc; margin-bottom: 12px; min-height: 50px; }
        .t-mockup-btn { padding: 12px; background: #ff4500; color: #fff; border-radius: 8px; text-align: center; font-weight: 800; font-size: 14px; }
        .t-mockup-btn.is-green { background: #16a34a; }
        .t-mockup-btn.is-amber { background: #d97706; }
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
        .t-mockup-unlimited { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; margin-top: 16px; }
        .t-mockup-unlimited span { font-size: 12px; font-weight: 800; color: #c2410c; }
        .t-mockup-unlimited strong { font-size: 13px; font-weight: 900; color: #c2410c; }

        .t-toggle-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 12px; font-weight: 700; color: #334155; }
        .t-toggle { display: inline-block; width: 32px; height: 18px; background: #cbd5e1; border-radius: 999px; position: relative; }
        .t-toggle.is-on { background: #16a34a; }
        .t-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
        .t-toggle.is-on::after { left: 16px; }

        .t-checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 12px; color: #334155; font-weight: 700; }
        .t-checkbox { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 900; }
        .t-checkbox.is-on { background: #16a34a; border-color: #16a34a; color: #fff; }
        .t-mockup-inline { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 12px; color: #334155; }
        .t-step-mockup { background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #86efac; margin-bottom: 10px; }
        .t-step-title { font-size: 12px; font-weight: 800; color: #166534; margin-bottom: 6px; }

        .t-pop-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .t-pop-btn { padding: 18px 12px; border: 2px dashed #ddd6fe; background: rgba(245,243,255,0.4); border-radius: 12px; text-align: center; }
        .t-pop-icon { font-size: 20px; margin-bottom: 2px; }
        .t-pop-label { font-size: 11px; font-weight: 700; color: #6d28d9; }

        .t-coupon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .t-coupon-card { background: #fff; border: 2px solid #e2e8f0; border-radius: 14px; padding: 20px; }
        .t-coupon-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
        .t-coupon-head h4 { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; }
        .t-coupon-badge { font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 10px; }
        .t-coupon-badge.is-all { background: #fef3c7; color: #92400e; }
        .t-coupon-badge.is-std { background: #dbeafe; color: #1e40af; }
        .t-coupon-card p { font-size: 13px; color: #64748b; line-height: 1.75; margin: 0; }

        .t-callout-info { display: flex; gap: 16px; padding: 20px 24px; background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 14px; margin-bottom: 28px; align-items: flex-start; }
        .t-callout-info.is-pro { background: #fff7ed; border-color: #fed7aa; }
        .t-callout-info-icon { font-size: 22px; flex-shrink: 0; }
        .t-callout-info strong { display: block; font-size: 15px; color: #0369a1; margin-bottom: 8px; }
        .t-callout-info.is-pro strong { color: #c2410c; }
        .t-callout-info ul { margin: 0; padding-left: 20px; font-size: 14px; color: #075985; line-height: 1.9; }
        .t-callout-info.is-pro ul { color: #7c2d12; }

        .t-schedule-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .t-schedule-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; }
        .t-schedule-head { font-size: 13px; font-weight: 800; color: #d97706; margin-bottom: 6px; }
        .t-schedule-card p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.7; }

        .t-coupon-preview { border-radius: 10px; padding: 12px; text-align: center; margin-bottom: 10px; }
        .t-coupon-preview.is-orange { background: #fff3e0; border: 1px dashed #ffb74d; }
        .t-coupon-preview.is-green { background: #f0fdf4; border: 1px dashed #4ade80; }
        .t-coupon-preview.is-purple { background: #f5f3ff; border: 1px dashed #8b5cf6; }
        .t-coupon-preview.is-sky { background: #eff6ff; border: 1px dashed #0ea5e9; }
        .t-coupon-preview.is-pink { background: #fff7ed; border: 1px dashed #fb923c; }
        .t-cp-badge { display: inline-block; font-size: 10px; background: #e65100; color: #fff; padding: 2px 8px; border-radius: 10px; font-weight: 800; margin-bottom: 6px; }
        .t-cp-badge.is-green { background: #16a34a; }
        .t-cp-badge.is-purple { background: #8b5cf6; }
        .t-cp-badge.is-sky { background: #0284c7; }
        .t-cp-badge.is-pink { background: #ea580c; }
        .t-cp-title { font-size: 12px; font-weight: 800; color: #e65100; }
        .t-cp-title.is-green { color: #15803d; }
        .t-cp-title.is-purple { color: #6d28d9; }
        .t-cp-title.is-sky { color: #0369a1; }
        .t-cp-title.is-pink { color: #c2410c; }

        .t-pos-steps { display: flex; flex-direction: column; gap: 12px; margin: 24px 0; }
        .t-pos-step { display: flex; gap: 14px; padding: 16px 20px; background: #fff; border: 1px solid #fed7aa; border-radius: 12px; align-items: flex-start; }
        .t-pos-step-num { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; border-radius: 50%; font-size: 14px; font-weight: 900; flex-shrink: 0; }
        .t-pos-step h4 { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
        .t-pos-step p { font-size: 13px; color: #64748b; line-height: 1.7; margin: 0; }

        .t-mockup-anno { position: absolute; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: #ff4500; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 900; box-shadow: 0 4px 10px rgba(255,69,0,0.4); border: 2px solid #fff; }

        .t-annos { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }
        .t-anno { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #334155; line-height: 1.7; }
        .t-anno-num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: #ff4500; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 900; flex-shrink: 0; }
        .t-anno-note { font-size: 13px; color: #475569; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 12px 16px; margin-top: 8px; line-height: 1.7; }

        .t-reg-flow { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
        .t-reg-step { display: flex; gap: 16px; padding: 20px 24px; background: #fff; border: 2px solid #e2e8f0; border-radius: 14px; align-items: flex-start; }
        .t-reg-step.is-ios { border-color: #bae6fd; background: #f0f9ff; }
        .t-reg-step.is-sms { border-color: #86efac; background: #f0fdf4; }
        .t-reg-step.is-pro { border-color: #fed7aa; background: #fff7ed; }
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
        .t-cta.is-pro { background: linear-gradient(160deg, #7c2d12, #1e293b); }
        .t-cta h3 { font-size: 20px; font-weight: 900; margin: 0 0 10px; }
        .t-cta p { font-size: 14px; color: #94a3b8; margin: 0 0 20px; }
        .t-cta-btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none; box-shadow: 0 6px 20px rgba(255,69,0,0.3); }

        @media (max-width: 640px) {
          .t-main { padding: 24px 16px 60px; }
          .t-sec-head h2 { font-size: 20px; }
          .t-flow-pro-arrow { display: none; }
          .t-cta { padding: 32px 24px; }
          .t-section-sky, .t-section-pro { padding: 24px 16px; }
          .t-feature-grid { grid-template-columns: 1fr; }
          .t-sms-reason-grid { grid-template-columns: 1fr; }
          .t-reg-step { padding: 16px 18px; }
        }
      `}</style>
    </>
  );
}
