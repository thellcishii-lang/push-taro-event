import type { PartnerPrintData } from '@/lib/print/types';
import QRBlock from './QRBlock';

interface Props { data: PartnerPrintData; }

export default function LeafletA4({ data }: Props) {
  const {
    companyName, ownerName, phone, email,
    referralCode, referralUrl, role,
  } = data;

  const roleLabel = role === 'agency' ? 'AUTHORIZED AGENCY' : 'AFFILISHOP PARTNER';

  return (
    <>
      {/* ========== 表 ========== */}
      <section className="p-page a4-page a4-front page-a4v">
        <div className="a4-front-glow" />
        <div className="a4-front-top">
          <div className="a4-logo-row">
            <svg className="a4-logo-mark" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="a4LogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ff6b6b" />
                  <stop offset="100%" stopColor="#ff4500" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="23" fill="url(#a4LogoGrad)" />
              <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
              <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
              <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
              <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
              <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
            </svg>
            <div className="a4-logo">Push-taro<span>.</span></div>
          </div>
          <div className="a4-badge">2026年9月 正式リリース</div>
        </div>
        <div className="a4-front-mid">
          <div className="a4-lead">実店舗向けプッシュ通知・クーポンアプリ</div>
          <h1 className="a4-catch">
            お客様に<br />喜んで頂ける<br />
            <span className="accent">お店づくりの<br />お手伝い。</span>
          </h1>
          <div className="a4-stats">
            <div className="a4-stat">
              <div className="a4-stat-num">6<span>倍</span></div>
              <div className="a4-stat-label">メルマガ比 開封率</div>
            </div>
            <div className="a4-stat">
              <div className="a4-stat-num">7<span>種</span></div>
              <div className="a4-stat-label">クーポン自動配信</div>
            </div>
            <div className="a4-stat">
              <div className="a4-stat-num">0<span>円</span></div>
              <div className="a4-stat-label">導入費用・追加課金なし</div>
            </div>
          </div>
          <p className="a4-sub">
            良いサービス、良い商品。<br />
            それだけでは、お客様には伝わりません。<br />
            <strong>「喜んで頂ける仕組み」</strong>が、<br />
            お店とお客様を、もっと強く繋ぎます。
          </p>
        </div>
        <div className="a4-front-foot">
          <span className="a4-role">{roleLabel}</span>
          <span className="a4-year">2026</span>
        </div>
      </section>

      {/* ========== 裏 ========== */}
      <section className="p-page a4-page a4-back">
        <div className="a4-back-head">
          <h2>「喜んで頂ける」を、<span className="accent">仕組み</span>にする。</h2>
          <p>良いサービス・商品が軸にあるのは大前提。それを伝える「仕組み」が、お客様との関係を強くします。</p>
        </div>

        <div className="a4-columns">
          {/* 左カラム */}
          <div className="a4-col a4-col-left">
            <div className="a4-sec">
              <h3 className="a4-sec-title"><span className="a4-sec-num">1</span>なぜ、仕組みが必要か。</h3>
              <p className="a4-sec-text">
                どんなに素晴らしいサービスや商品があっても、<strong>仕組みがなければ既存のお客様には伝わりません。</strong>
                逆に、喜んで頂ける仕組みがあれば、お客様はもっと利用してくれます。
              </p>
              <div className="a4-quote">
                そして、それこそが<span style={{ color: '#ff4500' }}>口コミ</span>となり、新規のお客様へ。
              </div>
            </div>

            <div className="a4-divider" />

            <div className="a4-sec">
              <h3 className="a4-sec-title"><span className="a4-sec-num">2</span>Push-taroで仕組みづくり。</h3>
              <p className="a4-sec-text">
                クーポンは<strong>受け身</strong>。サイトや来店で知ってもらうしか、伝える手段がない。
                それを、<strong>メルマガの10倍の開封率</strong>を持つプッシュ通知で、<strong>動的に仕組み化</strong>する。
              </p>
            </div>

            <div className="a4-divider" />

            <div className="a4-sec" style={{ flex: 1 }}>
              <h3 className="a4-sec-title"><span className="a4-sec-num">3</span>お店が欲しい機能満載。</h3>
              <div className="a4-feature-list">
                {[
                  { ico: '📢', name: 'プッシュ通知', badges: ['all'], desc: 'お客様全員へ一斉配信。開封率はメールの約3倍。' },
                  { ico: '📱', name: 'QRコード登録', badges: ['all'], desc: 'QRを読み取るだけ。アプリ不要。' },
                  { ico: '🎫', name: '初回クーポン', badges: ['all'], desc: '登録と同時に自動配布。' },
                  { ico: '🎟️', name: '通常クーポン', badges: ['std', 'pro'], desc: '何度でも使える常設クーポン。' },
                  { ico: '🏆', name: '特別達成クーポン', badges: ['std', 'pro'], desc: '指定回数使うと、特別クーポンが出現。' },
                  { ico: '📊', name: '開封率の確認', badges: ['std', 'pro'], desc: '配信ごとの開封率を数値で確認。' },
                  { ico: '🐾', name: 'ステップアップ', badges: ['pro'], desc: '来店ごとに段階的に特典アップ。' },
                  { ico: '🔄', name: '連続クーポン', badges: ['pro'], desc: '消込と同時に次回分を自動発行。' },
                  { ico: '🎂', name: '記念日・誕生日', badges: ['pro'], desc: '年1回の特別な日にお祝い配信。' },
                  { ico: '💤', name: '休眠復活', badges: ['pro'], desc: '離反客に自動で復帰クーポン。' },
                  { ico: '📅', name: '予約配信・定期配信', badges: ['pro'], desc: '指定日時に自動送信。' },
                ].map((f) => {
                  const cls = f.badges.includes('pro') ? 'is-pro' : f.badges.includes('std') ? 'is-std' : 'is-all';
                  return (
                    <div key={f.name} className={`a4-feature-item ${cls}`}>
                      <div className="a4-feature-head">
                        <span className="a4-feature-ico">{f.ico}</span>
                        <div className="a4-feature-name">
                          {f.name}
                          {f.badges.includes('all') && <span className="badge is-all">全</span>}
                          {f.badges.includes('std') && <span className="badge is-std">STD</span>}
                          {f.badges.includes('pro') && <span className="badge is-pro">PRO</span>}
                        </div>
                      </div>
                      <div className="a4-feature-desc">{f.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 右カラム */}
          <div className="a4-col">
            <div className="a4-sec">
              <h3 className="a4-sec-title"><span className="a4-sec-num">4</span>紹介制度で、実質無料に。</h3>
              <p className="a4-sec-text">
                紹介した店舗の月額の<strong>10%</strong>を、毎月還元。
                <strong>10件紹介すれば、PROプランが実質無料</strong>になります。
              </p>
              <div className="a4-refbox">
                <div className="a4-refbox-title">紹介した店舗の月額の<span className="accent">10%</span>を、毎月還元。</div>
                <div className="a4-refbox-grid">
                  <div className="a4-refbox-item">
                    <div className="a4-refbox-label">PRO月額</div>
                    <div className="a4-refbox-value">¥11,000</div>
                  </div>
                  <div className="a4-refbox-item">
                    <div className="a4-refbox-label">1件あたり</div>
                    <div className="a4-refbox-value">¥1,100</div>
                  </div>
                  <div className="a4-refbox-item">
                    <div className="a4-refbox-label">10件で</div>
                    <div className="a4-refbox-value accent">¥11,000</div>
                  </div>
                </div>
                <div className="a4-refbox-conclusion">
                  <strong>PROプランが、実質無料に。</strong>
                  11件目以降は、プラス収益に。
                </div>
              </div>
            </div>

            <div className="a4-divider" />

            <div className="a4-sec">
              <h3 className="a4-sec-title"><span className="a4-sec-num">5</span>明快な3プラン。</h3>
              <div className="a4-price-list">
                <div className="a4-price-item is-pro">
                  <span className="a4-price-recommend">おすすめ</span>
                  <span className="a4-price-name">PRO</span>
                  <span className="a4-price-value">¥10,000<span>/月</span></span>
                </div>
                <div className="a4-price-item">
                  <span className="a4-price-name">STANDARD</span>
                  <span className="a4-price-value">¥3,800<span>/月</span></span>
                </div>
                <div className="a4-price-item">
                  <span className="a4-price-name">LIGHT</span>
                  <span className="a4-price-value">¥1,980<span>/月</span></span>
                </div>
              </div>
              <div className="a4-perks">
                <div className="a4-perk">
                  <span className="a4-perk-ico">💰</span>
                  <div className="a4-perk-text">導入費用 0円</div>
                </div>
                <div className="a4-perk">
                  <span className="a4-perk-ico">🔓</span>
                  <div className="a4-perk-text">いつでも解約OK</div>
                </div>
              </div>
            </div>

            <div className="a4-divider" />

            {/* SPECIAL OFFER */}
            <div className="a4-offer">
              <div className="a4-offer-badge">SPECIAL OFFER</div>
              <div className="a4-offer-title">
                このコードで<br />
                <span className="accent">限定特典</span>を<br />
                受け取れます
              </div>
              <div className="a4-offer-code">{referralCode || '—'}</div>
              <div className="a4-offer-qr">
                <QRBlock value={referralUrl} size={52} />
              </div>
              <div className="a4-offer-note">QRを読み取って、今すぐお申し込み</div>
            </div>

            {/* 申込の流れ */}
            <div className="a4-flow">
              <div className="a4-flow-title">お申し込みの流れ</div>
              <ol>
                <li>QRコードを読み取る</li>
                <li>必要事項を入力して、アカウント作成</li>
                <li>プランを選択して、決済完了</li>
                <li>管理画面にログインして、利用開始</li>
              </ol>
            </div>

            {/* 会社情報 */}
            <div className="a4-contact">
              <div className="a4-contact-label">CONTACT</div>
              <div className="a4-contact-company">{companyName}</div>
              <div className="a4-contact-owner">{ownerName} 様</div>
              <div className="a4-contact-info">
                TEL　{phone || '—'}<br />
                MAIL　{email}
              </div>
              <div className="a4-contact-url">https://push-taro.com</div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        /* A4 */
        .a4-page {
          width: 210mm;
          height: 297mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        /* 内部のすべての要素にも border-box を強制 */
　　　　　　　　　　　　.a4-page *,
.a4-page *::before,
.a4-page *::after {
  box-sizing: border-box;
}
     page-a4v {
     page: page-a4v;
}
        /* ========== 表 ========== */
        .a4-front {
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          padding: 16mm 18mm;
        }
        .a4-front-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 78% 15%, rgba(255,69,0,0.4), transparent 55%);
          pointer-events: none;
        }
        .a4-front > * { position: relative; z-index: 1; }
        .a4-front-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .a4-logo-row { display: flex; align-items: center; gap: 3mm; }
        .a4-logo-mark { width: 13mm; height: 13mm; flex-shrink: 0; }
        .a4-logo { font-size: 22pt; font-weight: 900; letter-spacing: -0.6px; line-height: 1; }
        .a4-logo span { color: #ff4500; }
        .a4-badge {
          font-size: 8pt; font-weight: 900; letter-spacing: 1px;
          padding: 1.5mm 3.5mm; border-radius: 12px;
          background: rgba(255,69,0,0.2); border: 1px solid rgba(255,69,0,0.5);
          color: #fd7e5a;
        }
        .a4-front-mid { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .a4-lead {
          font-size: 12pt; color: #fd7e5a; font-weight: 900;
          letter-spacing: 0.5px; margin-bottom: 5mm;
          display: flex; align-items: center; gap: 4mm;
        }
        .a4-lead::before { content: ''; width: 10mm; height: 2px; background: #ff4500; display: inline-block; }
        .a4-catch { font-size: 34pt; font-weight: 900; line-height: 1.3; letter-spacing: -1.6px; margin: 0 0 9mm; }
        .a4-catch .accent { color: #fd7e5a; }
        .a4-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-bottom: 9mm; }
        .a4-stat {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 5mm 4mm; text-align: center;
        }
        .a4-stat-num {
          font-size: 32pt; font-weight: 900; line-height: 0.9; letter-spacing: -1.5px;
          background: linear-gradient(135deg, #ff4500, #fb923c);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .a4-stat-num span { font-size: 15pt; margin-left: 1mm; -webkit-text-fill-color: #fd7e5a; }
        .a4-stat-label { font-size: 9pt; color: #94a3b8; font-weight: 700; margin-top: 2mm; line-height: 1.4; }
        .a4-sub {
          font-size: 13pt; color: #cbd5e1; line-height: 2; margin: 0;
          padding-top: 8mm; border-top: 1px solid rgba(255,255,255,0.15);
        }
        .a4-sub strong { color: #fff; font-weight: 900; }
        .a4-front-foot {
          margin-top: auto; padding-top: 5mm;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex; justify-content: space-between; align-items: baseline;
        }
        .a4-role { font-size: 9pt; font-weight: 900; letter-spacing: 2px; color: #fd7e5a; }
        .a4-year { font-size: 9pt; color: #64748b; font-weight: 700; }

        /* ========== 裏 ========== */
        .a4-back {
          background: #fff;
          padding: 9mm 13mm;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .a4-back-head {
          padding-bottom: 2.5mm;
          border-bottom: 2px solid #0f172a;
          margin-bottom: 3mm;
          flex-shrink: 0;
        }
        .a4-back-head h2 {
          font-size: 15pt; font-weight: 900;
          line-height: 1.35; letter-spacing: -0.5px;
        }
        .a4-back-head h2 .accent { color: #ff4500; }
        .a4-back-head p {
          font-size: 8.5pt; color: #64748b;
          line-height: 1.6; margin-top: 1.8mm;
        }
        .a4-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5mm;
          flex: 1;
        }
        .a4-col { display: flex; flex-direction: column; gap: 2mm; }
        .a4-col-left {
          padding-right: 5mm;
          border-right: 1px dashed #e2e8f0;
        }
        .a4-sec { display: flex; flex-direction: column; }
        .a4-sec-title {
          font-size: 10.5pt; font-weight: 900;
          line-height: 1.35; letter-spacing: -0.4px;
          margin-bottom: 1.6mm;
          display: flex; align-items: center; gap: 2.2mm;
        }
        .a4-sec-num {
          display: inline-flex; align-items: center; justify-content: center;
          width: 6mm; height: 6mm;
          background: linear-gradient(135deg, #ff4500, #f97316);
          color: #fff; border-radius: 5px;
          font-size: 8pt; font-weight: 900;
          flex-shrink: 0;
        }
        .a4-sec-text {
          font-size: 8pt; color: #334155;
          line-height: 1.65; margin: 0 0 1.4mm;
        }
        .a4-sec-text strong { color: #0f172a; font-weight: 900; }
        .a4-quote {
          background: #fff7ed; border-left: 3px solid #ff4500;
          border-radius: 0 6px 6px 0; padding: 2mm 2.5mm;
          font-size: 9.5pt; font-weight: 900; color: #7c2d12;
          line-height: 1.5; margin: 2mm 0 0;
        }
        .a4-divider { height: 1px; background: #e2e8f0; }

        /* 機能リスト */
        .a4-feature-list { display: flex; flex-direction: column; gap: 0.9mm; }
        .a4-feature-item {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 5px; padding: 1.2mm 2mm;
          border-left: 3px solid #64748b;
        }
        .a4-feature-item.is-std { border-left-color: #0284c7; }
        .a4-feature-item.is-pro { border-left-color: #ff4500; }
        .a4-feature-item.is-all { border-left-color: #64748b; }
        .a4-feature-head { display: flex; align-items: center; gap: 1.6mm; }
        .a4-feature-ico { font-size: 10.5pt; line-height: 1; }
        .a4-feature-name {
          font-size: 7.8pt; font-weight: 900; color: #0f172a;
          line-height: 1.25;
          display: flex; align-items: center; gap: 1.2mm; flex-wrap: wrap;
        }
        .a4-feature-name .badge {
          font-size: 4.8pt; font-weight: 900;
          padding: 0.3mm 1.2mm; border-radius: 4px;
          color: #fff; letter-spacing: 0.3px;
        }
        .a4-feature-name .badge.is-all { background: #64748b; }
        .a4-feature-name .badge.is-std { background: #0284c7; }
        .a4-feature-name .badge.is-pro { background: linear-gradient(135deg, #ff4500, #f97316); }
        .a4-feature-desc {
          font-size: 6.3pt; color: #64748b;
          line-height: 1.3; margin-left: 5.5mm;
        }

        /* 紹介制度 */
        .a4-refbox {
          background: linear-gradient(160deg, #0f172a, #1e293b);
          border-radius: 6px; padding: 2.2mm;
          color: #fff; margin: 1.5mm 0 0;
        }
        .a4-refbox-title {
          font-size: 8.2pt; font-weight: 900;
          line-height: 1.3; margin-bottom: 1.6mm;
        }
        .a4-refbox-title .accent { color: #fd7e5a; }
        .a4-refbox-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.2mm; margin-bottom: 1.6mm;
        }
        .a4-refbox-item {
          text-align: center; padding: 1.2mm 1mm;
          background: rgba(255,255,255,0.05); border-radius: 5px;
        }
        .a4-refbox-label { font-size: 5.2pt; color: #cbd5e1; font-weight: 700; margin-bottom: 0.5mm; }
        .a4-refbox-value { font-size: 9pt; font-weight: 900; color: #fff; letter-spacing: -0.2px; }
        .a4-refbox-value.accent { color: #fd7e5a; }
        .a4-refbox-conclusion {
          padding: 1.3mm;
          background: linear-gradient(135deg, #ff4500, #f97316);
          border-radius: 5px; text-align: center;
          font-size: 6.8pt; font-weight: 900; line-height: 1.4;
        }
        .a4-refbox-conclusion strong { display: block; font-size: 8.8pt; margin-bottom: 0.2mm; }

        /* 価格 */
        .a4-price-list { display: flex; flex-direction: column; gap: 1mm; margin: 0.8mm 0 1.4mm; }
        .a4-price-item {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 5px; padding: 1.4mm 2mm;
          display: flex; justify-content: space-between; align-items: baseline;
          position: relative;
        }
        .a4-price-item.is-pro { border: 2px solid #ff4500; background: #fffbf5; }
        .a4-price-recommend {
          position: absolute; top: -1.6mm; right: 2.2mm;
          font-size: 4.8pt; font-weight: 900;
          padding: 0.4mm 1.4mm;
          background: #ff4500; color: #fff;
          border-radius: 7px; letter-spacing: 0.3px;
        }
        .a4-price-name { font-size: 8pt; font-weight: 900; letter-spacing: 0.5px; color: #64748b; }
        .a4-price-item.is-pro .a4-price-name { color: #ff4500; }
        .a4-price-value { font-size: 10.5pt; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; }
        .a4-price-value span { font-size: 5.8pt; font-weight: 600; color: #64748b; margin-left: 0.4mm; }
        .a4-perks { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm; }
        .a4-perk {
          background: #fff7ed; border: 1px solid #fed7aa;
          border-radius: 5px; padding: 1.5mm;
          display: flex; align-items: center; gap: 1.5mm;
        }
        .a4-perk-ico { font-size: 10pt; line-height: 1; }
        .a4-perk-text { font-size: 6.5pt; font-weight: 900; color: #7c2d12; line-height: 1.3; }

        /* SPECIAL OFFER */
        .a4-offer {
          background: #fff;
          border: 2px dashed #ff4500;
          border-radius: 8px;
          padding: 2mm 2mm;
          text-align: center;
          margin-top: 1mm;
        }
        .a4-offer-badge {
          display: inline-block;
          font-size: 5.5pt; font-weight: 900; letter-spacing: 1px;
          padding: 0.5mm 2mm; border-radius: 8px;
          background: linear-gradient(135deg, #ff4500, #f97316);
          color: #fff; margin-bottom: 1.2mm;
        }
        .a4-offer-title {
          font-size: 9pt; font-weight: 900;
          margin-bottom: 2mm;
          color: #0f172a; line-height: 1.3;
        }
        .a4-offer-title .accent { color: #ff4500; }
        .a4-offer-code {
          font-family: 'Courier New', monospace;
          letter-spacing: 2.5px;
          font-size: 13pt; font-weight: 900;
          color: #0f172a;
          background: #fff7ed;
          border: 2px dashed #ff4500;
          border-radius: 6px;
          padding: 1.3mm 2mm;
          margin: 0 auto 2mm;
          display: inline-block;
          min-width: 60%;
        }
        .a4-offer-qr {
          display: flex; justify-content: center;
          margin-bottom: 1.5mm;
        }
        .a4-offer-note {
          font-size: 6pt; font-weight: 700;
          color: #64748b; line-height: 1.4;
        }

        /* 申込の流れ */
        .a4-flow {
          margin-top: 1mm;
          padding: 2.5mm 3mm;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid #0f172a;
        }
        .a4-flow-title {
          font-size: 7pt; font-weight: 900;
          color: #0f172a; letter-spacing: 0.5px;
          margin-bottom: 1mm;
        }
        .a4-flow ol {
          list-style: none;
          padding: 0; margin: 0;
          display: flex; flex-direction: column;
          gap: 0.5mm;
          counter-reset: item;
        }
        .a4-flow ol li {
          display: flex;
          align-items: baseline;
          gap: 1.8mm;
          font-size: 6.8pt;
          font-weight: 700;
          color: #334155;
          line-height: 1.4;
        }
        .a4-flow ol li::before {
          content: counter(item);
          counter-increment: item;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3.5mm; height: 3.5mm;
          background: linear-gradient(135deg, #ff4500, #f97316);
          color: #fff;
          border-radius: 50%;
          font-size: 5.5pt;
          font-weight: 900;
          flex-shrink: 0;
        }

        /* 会社情報 */
        .a4-contact {
          margin-top: auto;
          padding-top: 2mm;
          border-top: 2px solid #0f172a;
        }
        .a4-contact-label {
          font-size: 6pt; font-weight: 900; letter-spacing: 2px;
          color: #ff4500; margin-bottom: 1.2mm;
        }
        .a4-contact-company {
          font-size: 9.5pt; font-weight: 900;
          color: #0f172a; line-height: 1.3;
          margin-bottom: 0.6mm;
        }
        .a4-contact-owner {
          font-size: 7.5pt; color: #475569;
          margin-bottom: 1.5mm;
        }
        .a4-contact-info {
          font-size: 6.5pt; color: #334155;
          line-height: 1.6;
        }
        .a4-contact-url {
          margin-top: 1mm;
          font-family: 'Courier New', monospace;
          font-weight: 900;
          font-size: 7pt;
          color: #ff4500;
          letter-spacing: 0.3px;
        }
      `}</style>
    </>
  );
}
