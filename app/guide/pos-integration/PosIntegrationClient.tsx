'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function PosIntegrationClient() {
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
          <span className="current">POSレジ連携</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-pro">🔥 PRO 限定</span>
          <h1>POSレジ連携。<br />クーポン消込を、レジに。</h1>
          <p>
            QRコードをPOSレジで読み取るだけで、<strong>クーポンの消込が自動で記録</strong>されます。<br />
            API仕様は公開しているので、<strong>お使いのPOSベンダーに実装を依頼</strong>できます。
          </p>
        </div>

        <div className="g-content">

          {/* ============================================================
              1. POS連携とは
          ============================================================ */}
          <h2><span className="num">1</span>POS連携とは</h2>

          <p>
            これまで、クーポンの消込は<strong>店舗スタッフがスマホでQRを読み取る</strong>必要がありました。<br />
            POS連携を導入すると、<strong>お会計のレジでQRを読み取るだけ</strong>で消込が完了します。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">⚡</div>
              <h4>会計と同時に消込</h4>
              <p>レジで会計する流れの中で、クーポン消込が自動で記録されます。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">👥</div>
              <h4>複数レジでも対応</h4>
              <p>同じ店舗の複数レジから、同じAPIキーで利用できます。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">👥</div>
              <h4>安全なAPIキー認証</h4>
              <p>店舗ごとに発行されるAPIキーで認証します。</p>
            </div>
          </div>

          {/* ============================================================
              2. 繋ぎ方の流れ
          ============================================================ */}
          <h2><span className="num">2</span>繋ぎ方の流れ</h2>

          <p>POS連携の導入は、<strong>3つのステップ</strong>で完了します。</p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 1：PRO管理画面でAPIキーを発行</h4>
                <p>
                  <Link href="/pro-shop" style={{ color: '#0284c7', fontWeight: 'bold' }}>
                    PROコンソール
                  </Link>
                  の「POS連携」タブから、APIキーを発行します。<br />
                  発行時に<strong>1度だけ</strong>キー全文が表示されるので、安全な場所に保管してください。
                </p>
              </div>
            </div>

            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 2：POSベンダーに仕様書を渡す</h4>
                <p>
                  お使いのPOSベンダーに、
                  <Link href="/developers/pos-api" style={{ color: '#0284c7', fontWeight: 'bold' }}>
                    技術仕様ページ
                  </Link>
                  のURLを共有してください。<br />
                  エンジニアが実装する際に必要な情報（エンドポイント・認証方式・サンプルコード）が全て揃っています。
                </p>
              </div>
            </div>

            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 3：POS側で実装 → 接続テスト</h4>
                <p>
                  POSベンダーが実装完了したら、実際にQRを読み取って消込が記録されるか確認します。<br />
                  問題なく動作すれば、運用開始です。
                </p>
              </div>
            </div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>POSベンダーがAPI連携に対応していない場合は？</strong></p>
              <p>
                POSベンダーが外部API連携に対応していない場合、連携はできません。<br />
                ご契約前に、POSベンダーへ「外部API連携の可否」をご確認ください。
              </p>
            </div>
          </div>

          {/* ============================================================
              3. 複数レジ対応
          ============================================================ */}
          <h2><span className="num">3</span>複数レジへの対応</h2>

          <p>
            1店舗に複数のレジがある場合でも、<strong>APIキーは1つ</strong>で対応できます。<br />
            各レジは、リクエストヘッダに<strong>レジ識別子（任意）</strong>を付けることで、どのレジで消込したかを記録できます。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>用途</th>
                  <th>設定方法</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>APIキー</td>
                  <td>店舗で1つ（PRO管理画面で発行）</td>
                </tr>
                <tr>
                  <td>レジ識別子</td>
                  <td>任意（例: register-01, register-02）</td>
                </tr>
                <tr>
                  <td>認証</td>
                  <td>APIキーのみ（レジ識別子は認証に使わない）</td>
                </tr>
                <tr>
                  <td>記録</td>
                  <td>監査ログにレジ識別子を記録</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>レジごとに個別のAPIキーを発行する必要はありません。</strong></p>
              <p>
                店舗で1つのAPIキーを共有し、各レジは「自分はどのレジか」をヘッダで名乗るだけ。<br />
                シンプルで、管理も簡単です。
              </p>
            </div>
          </div>

          {/* ============================================================
              4. 注意事項
          ============================================================ */}
          <h2><span className="num">4</span>注意事項</h2>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>POS連携は、PROプラン専用の機能です</strong></p>
              <p>
                LIGHT / STANDARDプランでは、POS連携APIは利用できません。<br />
                PROプラン（月額¥10,000・配信無制限）で、全ての機能が使えます。
              </p>
            </div>
          </div>

          <div className="g-callout warn">
            <span className="ico">⚠️</span>
            <div>
              <p><strong>APIキーは厳重に管理してください</strong></p>
              <p>
                APIキーが漏洩すると、第三者がクーポンを不正に消し込む可能性があります。<br />
                万が一漏洩した場合は、PRO管理画面から<strong>即座にキーを失効</strong>し、再発行してください。
              </p>
            </div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>クーポンの種類は、スタッフが手動で適用</strong></p>
              <p>
                POS連携は「消込の記録」を自動化する機能です。<br />
                実際の割引適用（10%OFF、〇〇無料など）は、<strong>レジでスタッフが手動で入力</strong>してください。<br />
                POS画面にクーポン名が表示されるので、それを見て適用する運用になります。
              </p>
            </div>
          </div>

          {/* ============================================================
              5. 技術仕様
          ============================================================ */}
          <h2><span className="num">5</span>技術仕様を見る</h2>

          <p>
            POSベンダーのエンジニア向けに、完全な技術仕様を公開しています。<br />
            エンドポイント一覧、認証方式、リクエスト/レスポンス例、サンプルコードを掲載しています。
          </p>

          <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}>
            <Link
              href="/developers/pos-api"
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(2,132,199,0.3)',
              }}
            >
              📖 技術仕様を見る →
            </Link>
          </div>

          {/* 関連ガイド */}
          <div className="g-related">
            <h3>関連ページ</h3>
            <div className="g-related-grid">
              <Link href="/developers/pos-api" className="g-related-card is-next">
                <span className="ico">📖</span>
                <div>
                  <div className="title">POS連携API 技術仕様</div>
                  <div className="sub">エンドポイント・認証・サンプルコード</div>
                </div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/push-notification" className="g-related-card">
                <span className="ico">📢</span>
                <div>
                  <div className="title">プッシュ通知</div>
                  <div className="sub">機能別ガイド</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="g-cta">
            <h3>POS連携で、消込をもっとシンプルに。</h3>
            <p>PROプランなら、POS連携を含むすべての機能が使えます。</p>
            <Link href="/signup" className="g-cta-btn">PROプランで始める →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
