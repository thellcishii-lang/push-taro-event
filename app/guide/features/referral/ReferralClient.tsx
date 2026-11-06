'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css'; // ★ 共通CSSを読み込み

export default function ReferralClient() {
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
          <Link href="/guide/features">機能別</Link>
          <span className="sep">/</span>
          <span className="current">紹介報酬</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-pro">🔥 PRO 限定</span>
          <h1>🤝 紹介報酬</h1>
          <p>
            登録時にA・Bの報酬プランを選択できます。Aは全プラン10%、BはPROのみ2件まで20%。
            確定後のプラン変更はできません。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">💰</span><div><strong>Aプラン：紹介件数無制限</strong><p>紹介先のプランを問わず、毎月一律10%の報酬が発生します。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎁</span><div><strong>Bプラン：PRO紹介を2件まで</strong><p>PROプラン1件につき20%。紹介先が解約すると枠が空き、再び紹介できます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🏦</span><div><strong>口座振込で受け取り</strong><p>累計1万円を超えると、指定の銀行口座に振込申請ができます。</p></div></div>
            <div className="g-feature-item"><span className="ico">📊</span><div><strong>専用ダッシュボード</strong><p>紹介店舗数・累計報酬・未払い報酬が一目で確認できます。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>報酬の仕組み</h2>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>制度</th><th>紹介対象</th><th>上限</th><th>報酬率</th></tr>
              </thead>
              <tbody>
                <tr><td>Aプラン</td><td>全プラン</td><td>なし</td><td className="yes">一律10%</td></tr>
                <tr><td>Bプラン</td><td>PROのみ</td><td>同時に2件</td><td className="yes">1件20%</td></tr>
              </tbody>
            </table>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>Aは紹介数を伸ばして収益化、BはPROを2件紹介して40%相当</strong>
              <p>Aは紹介数に上限がなく、紹介先の月額の10%が報酬になります。BはPROを2件紹介すると合計20%×2件で、PRO月額の40%相当です。</p>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>紹介の流れ</h2>
          <div className="g-flow">
            <div className="g-flow-item"><div className="g-flow-circle">1</div><p>紹介コード<br />を共有</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">2</div><p>相手が<br />登録</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-highlight">3</div><p>決済<br />完了</p></div>
            <div className="g-flow-arrow">→</div>
            <div className="g-flow-item"><div className="g-flow-circle is-success">💰</div><p>毎月<br />報酬発生</p></div>
          </div>

          <h2 className="g-h2"><span className="num">4</span>確認手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>PROコンソールのヘッダー「🤝 紹介・報酬」をタップ</h4>
                <p>紹介・報酬ダッシュボードに移動します。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>紹介コード・専用URLを確認</h4>
                <p>「コードをコピー」「URLをコピー」ボタンで簡単に共有できます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>累計報酬・未払い報酬・紹介店舗数を確認</h4>
                <p>サマリーカードで一目で状況がわかります。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>振込先口座を登録</h4>
                <p>未登録の場合は、口座情報を入力して保存してください。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>毎月末に自動で振込処理</h4>
                <p>未払い報酬が1万円を超えていれば、翌月末に振込されます。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-header">
              <div className="g-mockup-hm-left">
                <span className="g-mockup-hm-name">Patisserie Taro</span>
                <span className="g-mockup-hm-badge">PRO</span>
              </div>
              <span className="g-mockup-hm-btn">🤝 紹介・報酬</span>
            </div>
            <div className="g-ref-summary">
              <div className="g-ref-card"><div className="g-ref-label">累計報酬</div><div className="g-ref-value">¥24,500</div></div>
              <div className="g-ref-card is-green"><div className="g-ref-label">未払い報酬</div><div className="g-ref-value is-green">¥8,200</div></div>
              <div className="g-ref-card is-blue"><div className="g-ref-label">紹介店舗数</div><div className="g-ref-value is-blue">12 店舗</div></div>
            </div>
            <div className="g-ref-code">
              <div className="g-ref-code-label">あなたの紹介コード</div>
              <div className="g-ref-code-value">UBGIEKEK</div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">6</span>紹介のコツ</h2>
          <div className="g-grid">
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">👥</span><h4>異業種の知人へ</h4><p>飲食・美容・アパレルなど、業種を問わず紹介可能。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">💬</span><h4>実体験を伝える</h4><p>「実際に使ってリピート率が上がった」など、実感を伝える。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">🔗</span><h4>専用URLを活用</h4><p>コード入力の手間を省き、ワンクリックで登録できる。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">📊</span><h4>定期的に確認</h4><p>ダッシュボードで誰が登録したかを随時チェック。</p></div>
          </div>

          <div className="g-related">
            <h3>関連ページ</h3>
            <div className="g-related-grid">
              <Link href="/torisetsu/pro" className="g-related-card">
                <span className="ico">📘</span>
                <div><div className="title">PROプラン取扱説明書</div><div className="sub">全機能の使い方</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/case-studies" className="g-related-card">
                <span className="ico">📈</span>
                <div><div className="title">導入事例</div><div className="sub">成果を出した店舗</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>紹介するほど、お得になる</h3>
            <p>登録時に報酬プランを選択し、紹介実績に応じた報酬を受け取れます。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
