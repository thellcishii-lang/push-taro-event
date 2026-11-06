'use client';

import Link from 'next/link';
import '../torisetsu.css';

export default function TorisetsuDashboardClient() {
  return (
    <>
      <nav className="t-nav">
        <div className="t-nav-inner">
          <Link href="/torisetsu" className="t-back">← 取扱説明書TOP</Link>
          <span className="t-nav-title">紹介・報酬ダッシュボード 版</span>
        </div>
      </nav>

      <main className="t-main">
        <div className="t-hero">
          <span className="t-badge is-pro">🤝 PRO 限定</span>
          <h1>紹介・報酬ダッシュボード<br />取扱説明書</h1>
          <p>紹介コードの発行から報酬の確認まで、実際の画面で図解します。</p>
        </div>

        {/* 機能一覧 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">0</span>
            <h2>ダッシュボードでできること</h2>
          </div>

          <div className="t-feature-grid">
            <div className="t-feature-card is-pro"><span className="ico">🎁</span><div><strong>紹介コード発行</strong><small>専用URLも自動生成</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">📊</span><div><strong>報酬の確認</strong><small>累計・未払い・紹介数</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">🏦</span><div><strong>振込先口座登録</strong><small>報酬受取用の口座</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">📋</span><div><strong>紹介店舗一覧</strong><small>契約状況を確認</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">💰</span><div><strong>報酬明細CSV</strong><small>月次明細をダウンロード</small></div></div>
            <div className="t-feature-card is-pro"><span className="ico">🔑</span><div><strong>POS APIキー</strong><small>POS連携用キーを発行</small></div></div>
          </div>
        </section>

        {/* ログイン */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">1</span>
            <h2>ダッシュボードにログインする</h2>
          </div>
          <p className="t-desc">
            ブラウザで <code>/pro-shop/dashboard</code> を開き、登録時のメールアドレスとパスワードを入力します。
            <br />
            <strong>このダッシュボードはオーナー専用です。</strong>スタッフが日常業務で使う管理画面（/pro-shop）とは別にログインが必要です。
          </p>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-top">
                <div className="t-mockup-circle">🤝</div>
                <div className="t-mockup-h1">Push-taro</div>
                <div className="t-mockup-sub">紹介・報酬ダッシュボード</div>
              </div>
              <div className="t-mockup-input">✉️ メールアドレス</div>
              <div className="t-mockup-input">🔑 パスワード</div>
              <div className="t-mockup-btn">ログイン</div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>登録時のメールアドレスを入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>②</span>登録時のパスワードを入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>③</span>ログインボタンをタップ</div>
              <div className="t-anno-note">💡 管理画面（/pro-shop）と同じアカウントでログインできます</div>
            </div>
          </div>
        </section>

        {/* プラン選択 */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">2</span>
            <h2>紹介プランを選択する（初回のみ）</h2>
          </div>
          <p className="t-desc">
            初回ログイン時のみ、紹介プランを選択します。<strong>確定後の変更はできません。</strong>
            慎重にお選びください。
          </p>

          <div className="t-plan-choices">
            <div className="t-plan-choice is-a">
              <div className="t-plan-choice-head">Aプラン</div>
              <div className="t-plan-choice-body">
                <p>どのプランでも何件でも紹介可能。報酬率は<strong>一律10%</strong>。</p>
                <p className="t-plan-choice-note">紹介を続けると、PROプランの費用を実質無料にでき、さらに収益を得られる可能性があります。</p>
              </div>
            </div>
            <div className="t-plan-choice is-b">
              <div className="t-plan-choice-head">Bプラン</div>
              <div className="t-plan-choice-body">
                <p>PROプランのみ紹介可能。紹介枠は同時に<strong>2件まで</strong>、報酬率は1件につき<strong>20%</strong>。</p>
                <p className="t-plan-choice-note">PROを2件紹介すると、合計で月額費用の実質40%相当の報酬になります。本業の傍らで紹介する方におすすめです。</p>
              </div>
            </div>
          </div>

          <div className="t-callout-info is-pro">
            <span className="t-callout-info-icon">⚠️</span>
            <div>
              <strong>途中からの変更は受け付けておりません</strong>
              <ul>
                <li>選択したプランは、今後ずっと適用されます</li>
                <li>内容をよく確認してから確定してください</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 紹介コード */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">3</span>
            <h2>紹介コード・専用URLを共有する</h2>
          </div>
          <p className="t-desc">
            ダッシュボード上部に、あなたの<strong>紹介コード</strong>と<strong>専用登録URL</strong>が表示されます。
            紹介先の店舗に共有してください。
          </p>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-referral">
                <div className="t-mockup-ref-label">あなたの紹介コード</div>
                <div className="t-mockup-ref-code">UBGIEKEK</div>
                <div className="t-mockup-ref-btn">コードをコピー</div>
              </div>
              <div className="t-mockup-referral is-secondary">
                <div className="t-mockup-ref-label">専用登録URL（紹介コード自動入力）</div>
                <div className="t-mockup-ref-url">https://push-taro.com/signup?ref=UBGIEKEK</div>
                <div className="t-mockup-ref-btn is-secondary">URLをコピー</div>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>紹介コードをコピーして共有</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>②</span>専用URLを共有（コード入力不要）</div>
              <div className="t-anno-note">💡 紹介先が契約すると、毎月の報酬が発生します</div>
            </div>
          </div>
        </section>

        {/* 振込先口座 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">4</span>
            <h2>振込先口座を登録する</h2>
          </div>
          <p className="t-desc">
            紹介報酬の振込先口座を登録します。初回のみ登録すれば、あとは自動で振り込まれます。
          </p>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-h3">🏦 振込先口座情報</div>
              <div className="t-mockup-label">金融機関名</div>
              <div className="t-mockup-input">例: 〇〇銀行</div>
              <div className="t-mockup-label">支店名</div>
              <div className="t-mockup-input">例: △△支店</div>
              <div className="t-mockup-label">預金種目</div>
              <div className="t-mockup-input">普通 / 当座</div>
              <div className="t-mockup-label">口座番号</div>
              <div className="t-mockup-input">1234567</div>
              <div className="t-mockup-label">口座名義（カナ）</div>
              <div className="t-mockup-input">ヤマダ タロウ</div>
              <div className="t-mockup-btn">💾 口座情報を保存</div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>金融機関名・支店名を入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>②</span>預金種目・口座番号を入力</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>③</span>口座名義（カナ）を入力</div>
              <div className="t-anno-note">💡 報酬は毎月末に締めて、翌月に振込されます</div>
            </div>
          </div>
        </section>

               {/* 紹介店舗一覧 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">5</span>
            <h2>紹介店舗一覧を確認する</h2>
          </div>
          <p className="t-desc">
            あなたが紹介した店舗の一覧が表示されます。店舗名・プラン・報酬率・月額報酬・契約状況を確認できます。
          </p>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-h3">🏪 紹介店舗一覧（3）</div>
              <div className="t-mockup-ref-list">
                <div className="t-mockup-ref-item">
                  <div className="t-mockup-ref-item-head">
                    <strong>Patisserie ABC</strong>
                    <span className="t-mockup-ref-badge is-pro">PRO</span>
                  </div>
                  <div className="t-mockup-ref-item-body">
                    <span>報酬率 10%</span>
                    <span>月額 ¥1,000</span>
                  </div>
                  <div className="t-mockup-ref-item-status is-active">契約中</div>
                </div>
                <div className="t-mockup-ref-item">
                  <div className="t-mockup-ref-item-head">
                    <strong>Cafe XYZ</strong>
                    <span className="t-mockup-ref-badge is-standard">STANDARD</span>
                  </div>
                  <div className="t-mockup-ref-item-body">
                    <span>報酬率 10%</span>
                    <span>月額 ¥380</span>
                  </div>
                  <div className="t-mockup-ref-item-status is-active">契約中</div>
                </div>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>紹介した店舗の一覧</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>②</span>プラン・報酬率・月額報酬</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>③</span>契約状況（契約中 / 停止）</div>
              <div className="t-anno-note">💡 検索窓から店舗名・コードで絞り込みできます</div>
            </div>
          </div>
        </section>

        {/* 報酬明細 */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">6</span>
            <h2>報酬明細を確認・CSVでダウンロードする</h2>
          </div>
          <p className="t-desc">
            毎月の報酬明細を確認できます。確定申告などに使える<strong>CSVダウンロード</strong>機能もあります。
          </p>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-h3">💰 今月の報酬明細</div>
              <div className="t-mockup-btn is-amber">📥 明細CSVダウンロード</div>
              <div className="t-mockup-ref-list">
                <div className="t-mockup-ref-item">
                  <div className="t-mockup-ref-item-head">
                    <strong>2026-10</strong>
                    <span className="t-mockup-ref-badge is-paid">振込済み</span>
                  </div>
                  <div className="t-mockup-ref-item-body">
                    <span>Patisserie ABC</span>
                    <strong>¥1,000</strong>
                  </div>
                </div>
                <div className="t-mockup-ref-item">
                  <div className="t-mockup-ref-item-head">
                    <strong>2026-10</strong>
                    <span className="t-mockup-ref-badge is-unpaid">未払い</span>
                  </div>
                  <div className="t-mockup-ref-item-body">
                    <span>Cafe XYZ</span>
                    <strong>¥380</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>月別の報酬明細</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>②</span>ステータス（振込済み / 未払い）</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>③</span>CSVでダウンロード可能</div>
              <div className="t-anno-note">💡 確定申告・経理処理にご利用ください</div>
            </div>
          </div>
        </section>

        {/* POS APIキー */}
        <section className="t-section t-section-pro">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">7</span>
            <h2>POS APIキーを発行する</h2>
            <span className="t-plan-label is-pro">PRO 限定</span>
          </div>
          <p className="t-desc">
            POSレジと連携するための<strong>APIキーを発行</strong>します。
            POSベンダーに技術仕様と合わせて渡してください。
          </p>

          <div className="t-callout-info is-pro">
            <span className="t-callout-info-icon">💡</span>
            <div>
              <strong>APIキー発行の流れ</strong>
              <ul>
                <li>ダッシュボード内「POS API キー」セクションから発行</li>
                <li>平文キーは<strong>発行時のみ表示</strong>されます（再表示不可）</li>
                <li>再発行すると既存キーは即座に失効します</li>
                <li>キー漏洩時は即座に失効 → 再発行してください</li>
              </ul>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-h3">🔑 POS API キー</div>
              <div className="t-mockup-pos-status">
                <div className="t-mockup-pos-status-item">
                  <span>プレフィックス:</span>
                  <code>pt_live_abcd...</code>
                </div>
                <div className="t-mockup-pos-status-item">
                  <span>発行日:</span>
                  <strong>2026/10/27</strong>
                </div>
                <div className="t-mockup-pos-status-item">
                  <span>最終使用:</span>
                  <strong>未使用</strong>
                </div>
              </div>
              <div className="t-mockup-btn">🔄 APIキーを再発行</div>
              <div className="t-mockup-btn is-danger">🔒 キーを失効させる</div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>初回は「APIキーを発行」ボタン</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>②</span>平文キーをコピーしてPOSベンダーへ</div>
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>③</span>再発行・失効もここから</div>
              <div className="t-anno-note">💡 発行直後のみキー全文が表示されます</div>
            </div>
          </div>

          <div className="t-pos-steps" style={{ marginTop: '28px' }}>
            <div className="t-pos-step">
              <div className="t-pos-step-num">1</div>
              <div>
                <h4>ダッシュボードでAPIキーを発行</h4>
                <p>「POS API キー」セクションから発行します。平文キーは1回だけ表示されます。</p>
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

        {/* セキュリティ */}
        <section className="t-section">
          <div className="t-sec-head">
            <span className="t-sec-num is-pro">8</span>
            <h2>セキュリティとログアウト</h2>
          </div>
          <p className="t-desc">
            ダッシュボードは<strong>オーナー専用</strong>です。スタッフに共有しないでください。
            使い終わったら必ずログアウトしましょう。
          </p>

          <div className="t-callout-info is-pro">
            <span className="t-callout-info-icon">🛡️</span>
            <div>
              <strong>ダッシュボードを安全に使うために</strong>
              <ul>
                <li>スタッフとアカウントを共有しない</li>
                <li>共有端末では使い終わったら必ずログアウト</li>
                <li>APIキーは第三者に漏らさない</li>
                <li>不審なアクセスがあれば即座にパスワード変更</li>
              </ul>
            </div>
          </div>

          <div className="t-mockup-row">
            <div className="t-mockup">
              <div className="t-mockup-h3">ヘッダー</div>
              <div className="t-mockup-header-demo">
                <div className="t-mockup-header-left">
                  <div className="t-mockup-circle-sm">🤝</div>
                  <div>
                    <div className="t-mockup-header-name">Patisserie Taro</div>
                    <div className="t-mockup-header-email">owner@example.com</div>
                  </div>
                </div>
                <div className="t-mockup-btn-sm">ログアウト</div>
              </div>
            </div>
            <div className="t-annos">
              <div className="t-anno"><span className="t-anno-num" style={{ background: '#ff4500' }}>①</span>右上の「ログアウト」で終了</div>
              <div className="t-anno-note">💡 次回は再度ログインが必要です</div>
            </div>
          </div>
        </section>

        {/* 関連リンク */}
        <div className="t-related">
          <h3>関連ページ</h3>
          <div className="t-related-grid">
            <Link href="/torisetsu/pro" className="t-related-card">
              <span className="ico">🔥</span>
              <div><div className="title">PROプラン取扱説明書</div><div className="sub">PRO管理画面の全機能</div></div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/guide/pos-integration" className="t-related-card">
              <span className="ico">📘</span>
              <div><div className="title">POS連携ガイド</div><div className="sub">導入の流れ・注意事項</div></div>
              <span className="arrow">→</span>
            </Link>
            <Link href="/developers/pos-api" className="t-related-card">
              <span className="ico">🔧</span>
              <div><div className="title">POS API 技術仕様</div><div className="sub">エンドポイント・サンプルコード</div></div>
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
        .t-section-pro { background: linear-gradient(180deg, #fff7ed 0%, #fff 100%); border-radius: 20px; padding: 32px 28px; border: 2px solid #fed7aa; }
        .t-sec-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .t-sec-num { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 12px; font-size: 20px; font-weight: 900; box-shadow: 0 6px 16px rgba(255,69,0,0.25); flex-shrink: 0; }
        .t-sec-num.is-pro { background: linear-gradient(135deg, #ff4500, #ea580c); }
        .t-sec-head h2 { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.6px; }
        .t-plan-label { font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 12px; letter-spacing: 0.3px; }
        .t-plan-label.is-pro { background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; }
        .t-desc { font-size: 15px; color: #475569; line-height: 1.9; margin-bottom: 28px; }
        .t-desc code { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #dc2626; }

        .t-feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .t-feature-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
        .t-feature-card.is-pro { background: #fff7ed; border-color: #fed7aa; }
        .t-feature-card .ico { font-size: 22px; flex-shrink: 0; }
        .t-feature-card strong { display: block; font-size: 13.5px; font-weight: 800; color: #0f172a; line-height: 1.3; }
        .t-feature-card small { font-size: 11px; color: #64748b; }

        .t-mockup-row { display: grid; grid-template-columns: 320px 1fr; gap: 32px; align-items: start; }
        @media (max-width: 768px) { .t-mockup-row { grid-template-columns: 1fr; } }
        .t-mockup { position: relative; background: #fff; border: 2px solid #e2e8f0; border-radius: 20px; padding: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
        .t-mockup-top { text-align: center; margin-bottom: 20px; }
        .t-mockup-circle { font-size: 40px; margin-bottom: 8px; }
        .t-mockup-h1 { font-size: 18px; font-weight: 900; color: #0f172a; }
        .t-mockup-h3 { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 14px; }
        .t-mockup-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
        .t-mockup-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #94a3b8; background: #f8fafc; margin-bottom: 12px; }
        .t-mockup-label { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px; }
        .t-mockup-btn { padding: 12px; background: #ff4500; color: #fff; border-radius: 8px; text-align: center; font-weight: 800; font-size: 13px; margin-top: 10px; }
        .t-mockup-btn.is-amber { background: #d97706; }
        .t-mockup-btn.is-danger { background: #dc2626; }

        /* プラン選択 */
        .t-plan-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        @media (max-width: 768px) { .t-plan-choices { grid-template-columns: 1fr; } }
        .t-plan-choice { background: #fff; border-radius: 16px; overflow: hidden; border: 2px solid #cbd5e1; }
        .t-plan-choice.is-a { border-color: #fdba74; }
        .t-plan-choice.is-b { border-color: #86efac; }
        .t-plan-choice-head { padding: 14px 20px; font-size: 16px; font-weight: 900; color: #fff; }
        .t-plan-choice.is-a .t-plan-choice-head { background: linear-gradient(135deg, #ea580c, #f97316); }
        .t-plan-choice.is-b .t-plan-choice-head { background: linear-gradient(135deg, #16a34a, #22c55e); }
        .t-plan-choice-body { padding: 18px 20px; }
        .t-plan-choice-body p { font-size: 13.5px; color: #334155; line-height: 1.8; margin: 0 0 10px; }
        .t-plan-choice-note { font-size: 12px; color: #64748b; padding: 10px 12px; background: #f8fafc; border-radius: 8px; margin-top: 8px !important; }

        /* 紹介コード・報酬 */
        .t-mockup-referral { background: #fff7ed; padding: 14px; border-radius: 10px; border: 1px solid #fed7aa; margin-bottom: 12px; }
        .t-mockup-referral.is-secondary { background: #f8fafc; border-color: #e2e8f0; }
        .t-mockup-ref-label { font-size: 10px; font-weight: 700; color: #9a3412; margin-bottom: 4px; }
        .t-mockup-referral.is-secondary .t-mockup-ref-label { color: #475569; }
        .t-mockup-ref-code { font-size: 18px; font-weight: 900; color: #c2410c; font-family: monospace; letter-spacing: 1.5px; text-align: center; margin: 6px 0 10px; }
        .t-mockup-ref-url { font-size: 10px; color: #475569; margin: 6px 0 10px; word-break: break-all; padding: 6px 8px; background: #fff; border-radius: 4px; border: 1px solid #e2e8f0; }
        .t-mockup-ref-btn { padding: 8px; background: #ff4500; color: #fff; border-radius: 6px; text-align: center; font-weight: 800; font-size: 11px; }
        .t-mockup-ref-btn.is-secondary { background: #475569; }

        .t-mockup-ref-list { display: flex; flex-direction: column; gap: 8px; }
        .t-mockup-ref-item { background: #f8fafc; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .t-mockup-ref-item-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px; }
        .t-mockup-ref-item-head strong { font-size: 12px; color: #0f172a; }
        .t-mockup-ref-badge { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 10px; }
        .t-mockup-ref-badge.is-pro { background: #fef3c7; color: #b45309; }
        .t-mockup-ref-badge.is-standard { background: #dbeafe; color: #1d4ed8; }
        .t-mockup-ref-badge.is-paid { background: #d1fae5; color: #065f46; }
        .t-mockup-ref-badge.is-unpaid { background: #fef3c7; color: #92400e; }
        .t-mockup-ref-item-body { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
        .t-mockup-ref-item-body strong { color: #c2410c; font-weight: 800; }
        .t-mockup-ref-item-status { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-top: 4px; }
        .t-mockup-ref-item-status.is-active { background: #d1fae5; color: #065f46; }

        /* POS連携 */
        .t-mockup-pos-status { background: #f8fafc; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px; }
        .t-mockup-pos-status-item { display: flex; justify-content: space-between; font-size: 11px; color: #475569; padding: 4px 0; border-bottom: 1px dashed #e2e8f0; }
        .t-mockup-pos-status-item:last-child { border-bottom: none; }
        .t-mockup-pos-status-item code { background: #fff; padding: 1px 6px; border-radius: 3px; border: 1px solid #e2e8f0; font-size: 10px; }

        .t-pos-steps { display: flex; flex-direction: column; gap: 12px; margin: 24px 0; }
        .t-pos-step { display: flex; gap: 14px; padding: 16px 20px; background: #fff; border: 1px solid #fed7aa; border-radius: 12px; align-items: flex-start; }
        .t-pos-step-num { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; border-radius: 50%; font-size: 14px; font-weight: 900; flex-shrink: 0; }
        .t-pos-step h4 { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
        .t-pos-step p { font-size: 13px; color: #64748b; line-height: 1.7; margin: 0; }

        /* ヘッダーデモ */
        .t-mockup-header-demo { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
        .t-mockup-header-left { display: flex; align-items: center; gap: 8px; }
        .t-mockup-circle-sm { width: 30px; height: 30px; background: #ff4500; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .t-mockup-header-name { font-size: 11px; font-weight: 800; color: #0f172a; }
        .t-mockup-header-email { font-size: 9px; color: #64748b; }
        .t-mockup-btn-sm { padding: 6px 10px; background: #0f172a; color: #fff; border-radius: 6px; font-size: 10px; font-weight: 800; }

        /* Callout */
        .t-callout-info { display: flex; gap: 16px; padding: 20px 24px; background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 14px; margin-bottom: 28px; align-items: flex-start; }
        .t-callout-info.is-pro { background: #fff7ed; border-color: #fed7aa; }
        .t-callout-info-icon { font-size: 22px; flex-shrink: 0; }
        .t-callout-info strong { display: block; font-size: 15px; color: #0369a1; margin-bottom: 8px; }
        .t-callout-info.is-pro strong { color: #c2410c; }
        .t-callout-info ul { margin: 0; padding-left: 20px; font-size: 14px; color: #075985; line-height: 1.9; }
        .t-callout-info.is-pro ul { color: #7c2d12; }

        /* 注釈 */
        .t-annos { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }
        .t-anno { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #334155; line-height: 1.7; }
        .t-anno-num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: #ff4500; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 900; flex-shrink: 0; }
        .t-anno-note { font-size: 13px; color: #475569; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 12px 16px; margin-top: 8px; line-height: 1.7; }

        /* 関連 */
        .t-related { margin-top: 64px; padding-top: 32px; border-top: 2px solid #e2e8f0; }
        .t-related h3 { font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #64748b; margin: 0 0 20px; }
        .t-related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .t-related-card { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .t-related-card:hover { border-color: #ff4500; transform: translateX(4px); }
        .t-related-card .ico { font-size: 24px; flex-shrink: 0; }
        .t-related-card .title { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.3; }
        .t-related-card .sub { font-size: 11.5px; color: #64748b; margin-top: 2px; }
        .t-related-card .arrow { color: #ff4500; font-size: 16px; font-weight: 900; margin-left: auto; }

        /* CTA */
        .t-cta { margin-top: 48px; padding: 40px 32px; background: linear-gradient(160deg, #0f172a, #1e293b); color: #fff; border-radius: 20px; text-align: center; }
        .t-cta.is-pro { background: linear-gradient(160deg, #7c2d12, #1e293b); }
        .t-cta h3 { font-size: 20px; font-weight: 900; margin: 0 0 10px; }
        .t-cta p { font-size: 14px; color: #94a3b8; margin: 0 0 20px; }
        .t-cta-btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none; box-shadow: 0 6px 20px rgba(255,69,0,0.3); }

        @media (max-width: 640px) {
          .t-main { padding: 24px 16px 60px; }
          .t-sec-head h2 { font-size: 20px; }
          .t-cta { padding: 32px 24px; }
          .t-section-pro { padding: 24px 16px; }
          .t-feature-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
