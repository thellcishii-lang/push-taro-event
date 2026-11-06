'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function CaseStudiesClient() {
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
          <span className="current">導入事例</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">📈 導入事例</span>
          <h1>実際に成果を出した<br />店舗の事例</h1>
          <p>
            Push-taroを導入し、リピート率・売上を大きく改善した店舗の事例をご紹介します。<br />
            業種・規模・施策内容を参考に、あなたの店舗に合った活用方法を見つけてください。
          </p>
        </div>

        <div className="g-content">

          <div className="g-case">
            <div className="g-case-head">
              <span className="g-case-badge">💇 美容室</span>
              <span className="g-case-location">東京都 / 3店舗展開</span>
            </div>
            <h3>リピート率 45% → 72% に改善</h3>
            <div className="g-case-metrics">
              <div className="g-case-metric">
                <div className="g-metric-label">リピート率</div>
                <div className="g-metric-before">45%</div>
                <div className="g-metric-arrow">→</div>
                <div className="g-metric-after">72%</div>
              </div>
              <div className="g-case-metric">
                <div className="g-metric-label">月商</div>
                <div className="g-metric-before">250万円</div>
                <div className="g-metric-arrow">→</div>
                <div className="g-metric-after">380万円</div>
              </div>
            </div>
            <p>
              連続クーポンと誕生日クーポンの自動配信で、来店サイクルが短縮。
              「次にいつ来ればいいか」が自然に伝わる仕組みができました。
            </p>
            <div className="g-case-tags">
              <span className="g-case-tag">連続クーポン</span>
              <span className="g-case-tag">誕生日クーポン</span>
              <span className="g-case-tag">PROプラン</span>
            </div>
          </div>

          <div className="g-case">
            <div className="g-case-head">
              <span className="g-case-badge">☕ カフェ</span>
              <span className="g-case-location">東京都 / 個人経営</span>
            </div>
            <h3>平日14〜17時の稼働率 30% → 65%</h3>
            <div className="g-case-metrics">
              <div className="g-case-metric">
                <div className="g-metric-label">アイドルタイム稼働率</div>
                <div className="g-metric-before">30%</div>
                <div className="g-metric-arrow">→</div>
                <div className="g-metric-after">65%</div>
              </div>
            </div>
            <p>
              「カフェタイム限定クーポン」を毎日14時に自動配信。
              近隣オフィスのワーカーが来店するようになり、平日昼の売上が大幅アップ。
            </p>
            <div className="g-case-tags">
              <span className="g-case-tag">予約配信</span>
              <span className="g-case-tag">時間帯限定クーポン</span>
              <span className="g-case-tag">PROプラン</span>
            </div>
          </div>

          <div className="g-case">
            <div className="g-case-head">
              <span className="g-case-badge">💆 エステサロン</span>
              <span className="g-case-location">大阪府 / 個人経営</span>
            </div>
            <h3>休眠顧客率 55% → 28%</h3>
            <div className="g-case-metrics">
              <div className="g-case-metric">
                <div className="g-metric-label">休眠顧客率</div>
                <div className="g-metric-before">55%</div>
                <div className="g-metric-arrow">→</div>
                <div className="g-metric-after">28%</div>
              </div>
            </div>
            <p>
              「3ヶ月来ていない顧客」への復活クーポンを自動配信。
              多くの顧客が戻ってきて、月商が安定しました。
            </p>
            <div className="g-case-tags">
              <span className="g-case-tag">休眠復活クーポン</span>
              <span className="g-case-tag">PROプラン</span>
            </div>
          </div>

          <div className="g-case">
            <div className="g-case-head">
              <span className="g-case-badge">👕 セレクトショップ</span>
              <span className="g-case-location">東京都 / 個人経営</span>
            </div>
            <h3>新作売上 月50万円 → 120万円</h3>
            <div className="g-case-metrics">
              <div className="g-case-metric">
                <div className="g-metric-label">新作月商</div>
                <div className="g-metric-before">50万円</div>
                <div className="g-metric-arrow">→</div>
                <div className="g-metric-after">120万円</div>
              </div>
            </div>
            <p>
              新作入荷を画像付き通知で配信することで、発売初週の売上が大幅アップ。
              「欲しかったのに売り切れ」が激減しました。
            </p>
            <div className="g-case-tags">
              <span className="g-case-tag">新商品告知</span>
              <span className="g-case-tag">画像付き通知</span>
              <span className="g-case-tag">STANDARDプラン</span>
            </div>
          </div>

          <div className="g-case">
            <div className="g-case-head">
              <span className="g-case-badge">🍜 居酒屋</span>
              <span className="g-case-location">大阪府 / 個人経営</span>
            </div>
            <h3>リピート率 25% → 58%</h3>
            <div className="g-case-metrics">
              <div className="g-case-metric">
                <div className="g-metric-label">リピート率</div>
                <div className="g-metric-before">25%</div>
                <div className="g-metric-arrow">→</div>
                <div className="g-metric-after">58%</div>
              </div>
            </div>
            <p>
              連続クーポンと誕生日クーポンで常連客が自然と増加。
              スタッフの接客負担も軽減され、良い循環が生まれました。
            </p>
            <div className="g-case-tags">
              <span className="g-case-tag">連続クーポン</span>
              <span className="g-case-tag">誕生日クーポン</span>
              <span className="g-case-tag">PROプラン</span>
            </div>
          </div>

          <div className="g-case">
            <div className="g-case-head">
              <span className="g-case-badge">💇 美容室</span>
              <span className="g-case-location">埼玉県 / 個人経営</span>
            </div>
            <h3>広告費 月5万円 → 月1,980円</h3>
            <div className="g-case-metrics">
              <div className="g-case-metric">
                <div className="g-metric-label">月額コスト</div>
                <div className="g-metric-before">50,000円</div>
                <div className="g-metric-arrow">→</div>
                <div className="g-metric-after">1,980円</div>
              </div>
            </div>
            <p>
              DM・チラシからPush-taroに切り替え。
              コストが大幅に下がりながら、リピート率は逆にアップしました。
            </p>
            <div className="g-case-tags">
              <span className="g-case-tag">コスト削減</span>
              <span className="g-case-tag">LIGHTプラン</span>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>どの店舗にも共通する成功要因</strong></p>
              <p>・QRコードで手軽に顧客獲得<br />・自動配信で「仕組み化」<br />・クーポン設計を目的別に最適化</p>
            </div>
          </div>

          <div className="g-related">
            <h3>関連ガイド</h3>
            <div className="g-related-grid">
              <Link href="/guide/cafe" className="g-related-card">
                <span className="ico">☕</span>
                <div><div className="title">飲食店・カフェ向け</div><div className="sub">業種別ガイド</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>あなたの店舗も、次の成功事例に。</h3>
            <p>Push-taroで、リピート施策の仕組み化を始めませんか？</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>

        </div>
      </main>

      <style jsx global>{`
        .g-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; }
        .g-nav-inner { max-width: 1100px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .g-logo { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none; letter-spacing: -0.5px; }
        .g-logo small { font-size: 11px; font-weight: 600; color: #64748b; }
        .g-nav-cta { background: #ff4500; color: #fff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(255,69,0,0.25); }
        .g-main { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif; }
        .g-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; margin-bottom: 20px; flex-wrap: wrap; }
        .g-breadcrumb a { color: #64748b; text-decoration: none; }
        .g-breadcrumb a:hover { color: #ff4500; }
        .g-breadcrumb .sep { color: #cbd5e1; }
        .g-breadcrumb .current { color: #1e293b; font-weight: 700; }
        .g-hero { padding: 32px 0 40px; border-bottom: 1px solid #e2e8f0; margin-bottom: 40px; }
        .g-badge { display: inline-block; font-size: 11px; font-weight: 800; color: #ff4500; background: #fff7ed; padding: 5px 14px; border-radius: 20px; margin-bottom: 16px; }
        .g-hero h1 { font-size: clamp(26px, 3.4vw, 38px); font-weight: 900; color: #0f172a; letter-spacing: -1px; line-height: 1.25; margin: 0 0 14px; }
        .g-hero p { font-size: 15.5px; color: #64748b; line-height: 1.9; margin: 0; }
        .g-content { line-height: 1.9; color: #334155; font-size: 15px; }
        .g-content p { margin-bottom: 16px; }
        .g-content strong { color: #0f172a; font-weight: 800; }
        .g-case { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px 26px; margin-bottom: 20px; transition: all 0.2s; }
        .g-case:hover { border-color: #ff4500; box-shadow: 0 12px 32px rgba(255,69,0,0.08); transform: translateY(-2px); }
        .g-case-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
        .g-case-badge { font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 12px; background: #fff7ed; color: #ff4500; }
        .g-case-location { font-size: 12px; color: #64748b; }
        .g-case h3 { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0 0 16px; letter-spacing: -0.4px; }
        .g-case-metrics { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 18px; padding: 18px; background: #f8fafc; border-radius: 12px; }
        .g-case-metric { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .g-metric-label { font-size: 11px; font-weight: 700; color: #64748b; width: 100%; }
        .g-metric-before { font-size: 18px; font-weight: 800; color: #94a3b8; }
        .g-metric-arrow { color: #ff4500; font-weight: 900; font-size: 16px; }
        .g-metric-after { font-size: 22px; font-weight: 900; color: #16a34a; letter-spacing: -0.5px; }
        .g-case p { font-size: 14.5px; color: #475569; margin-bottom: 16px; }
        .g-case-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .g-case-tag { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: #ebf8ff; color: #2b6cb0; }
        .g-callout { display: flex; gap: 16px; padding: 20px 24px; border-radius: 14px; margin: 24px 0; align-items: flex-start; }
        .g-callout .ico { flex-shrink: 0; font-size: 22px; line-height: 1; }
        .g-callout p { margin: 0; font-size: 14.5px; line-height: 1.85; }
        .g-callout p + p { margin-top: 8px; }
        .g-callout.success { background: #f0fdf4; border: 1px solid #86efac; color: #14532d; }
        .g-related { margin-top: 64px; padding-top: 32px; border-top: 2px solid #e2e8f0; }
        .g-related > h3 { font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #64748b; margin: 0 0 20px; }
        .g-related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .g-related-card { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .g-related-card:hover { border-color: #ff4500; transform: translateX(4px); }
        .g-related-card .ico { font-size: 24px; flex-shrink: 0; }
        .g-related-card .title { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.3; }
        .g-related-card .sub { font-size: 11.5px; color: #64748b; margin-top: 2px; }
        .g-related-card .arrow { color: #ff4500; font-size: 16px; font-weight: 900; margin-left: auto; }
        .g-cta { margin-top: 56px; padding: 40px 32px; background: linear-gradient(160deg, #0f172a, #1e293b); color: #fff; border-radius: 20px; text-align: center; }
        .g-cta h3 { font-size: 22px; font-weight: 900; margin: 0 0 12px; color: #fff; }
        .g-cta p { font-size: 14.5px; color: #94a3b8; margin-bottom: 24px; line-height: 1.8; }
        .g-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #ff4500, #f97316); color: #fff; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 15px; text-decoration: none; box-shadow: 0 8px 24px rgba(255,69,0,0.35); }
        @media (max-width: 640px) {
          .g-main { padding: 24px 16px 60px; }
          .g-logo { font-size: 17px; }
          .g-nav-cta { padding: 8px 14px; font-size: 12px; }
          .g-case-metrics { gap: 16px; }
        }
      `}</style>
    </>
  );
}
