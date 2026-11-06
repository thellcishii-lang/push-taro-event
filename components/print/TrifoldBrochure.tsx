import type { PartnerPrintData } from '@/lib/print/types';
import QRBlock from './QRBlock';

interface Props { data: PartnerPrintData; }

export default function TrifoldBrochure({ data }: Props) {
  const {
    companyName, ownerName, phone, email,
    referralCode, referralUrl, role,
  } = data;

  const roleLabel = role === 'agency' ? 'AUTHORIZED AGENCY' : 'AFFILISHOP PARTNER';

  return (
    <div className="tf-print-wrapper">
      {/* ============================================================
          1ページ目（外側）
          ============================================================ */}
      <section className="tf-page tf-page-outer">

        {/* 左：紹介制度 + 価格 */}
        <div className="tf-panel tf-featprice">
          <span className="tf-fp-tag">REWARD PROGRAM</span>
          <h3 className="tf-fp-h">
            紹介するほど、<br />
            <span className="accent">お得になる仕組み。</span>
          </h3>
          <p className="tf-fp-sub">
            PROプランには<strong>紹介報酬制度</strong>があります。<br />
            他店舗を紹介すると、その店舗が契約中は毎月還元。
          </p>

          <div className="tf-refbox">
            <div className="tf-refbox-title">
              紹介した店舗の月額の<br />
              <span className="accent">10%</span> を、毎月還元。
            </div>
            <div className="tf-refbox-row">
              <span className="tf-refbox-label">PRO月額（税込）</span>
              <span className="tf-refbox-value">¥11,000<span className="small"> /月</span></span>
            </div>
            <div className="tf-refbox-row">
              <span className="tf-refbox-label">紹介1件あたり</span>
              <span className="tf-refbox-value">¥1,100<span className="small"> /月</span></span>
            </div>
            <div className="tf-refbox-row">
              <span className="tf-refbox-label">10件紹介すると</span>
              <span className="tf-refbox-value accent">¥11,000<span className="small"> /月</span></span>
            </div>
            <div className="tf-refbox-conclusion">
              <strong>PROプランが、実質無料に。</strong>
              11件目以降は、プラス収益に。
            </div>
          </div>

          <div className="tf-fp-divider">PLANS &amp; PRICING</div>

          <div className="tf-fp-plans">
            <div className="tf-fp-plan is-pro">
              <span className="tf-fp-recommend">おすすめ</span>
              <div className="tf-fp-plan-head">
                <span className="tf-fp-plan-name">PRO</span>
                <span className="tf-fp-plan-price">¥10,000<span>/月（税別）</span></span>
              </div>
              <div className="tf-fp-plan-desc">
                配信無制限・全機能解放。<br />
                <strong>仕組みを本気で作るなら、こちら。</strong>
              </div>
            </div>

            <div className="tf-fp-plan">
              <div className="tf-fp-plan-head">
                <span className="tf-fp-plan-name">STANDARD</span>
                <span className="tf-fp-plan-price">¥3,800<span>/月（税別）</span></span>
              </div>
              <div className="tf-fp-plan-desc">
                月間15,000通。通常・特別達成クーポン搭載。
              </div>
            </div>

            <div className="tf-fp-plan">
              <div className="tf-fp-plan-head">
                <span className="tf-fp-plan-name">LIGHT</span>
                <span className="tf-fp-plan-price">¥1,980<span>/月（税別）</span></span>
              </div>
              <div className="tf-fp-plan-desc">
                <strong>既存クーポンアプリがあるなら</strong>、こちらから。
              </div>
            </div>
          </div>

          <div className="tf-free">
            <div className="tf-free-item">
              <div className="tf-free-ico">💰</div>
              <div className="tf-free-text">導入費用<br />0円</div>
            </div>
            <div className="tf-free-item">
              <div className="tf-free-ico">🔓</div>
              <div className="tf-free-text">いつでも<br />解約OK</div>
            </div>
          </div>
        </div>

        {/* 中：会社情報 + QR */}
        <div className="tf-panel tf-back">
          <div>
            <div className="tf-back-logo-row">
              <svg className="tf-back-logo-mark" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="tfBackLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="100%" stopColor="#ff4500" />
                  </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="23" fill="url(#tfBackLogoGrad)" />
                <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
                <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
                <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
                <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
                <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
              </svg>
              <div className="tf-back-logo">Push-taro<span>.</span></div>
            </div>
            <div className="tf-back-tagline">実店舗向けプッシュ通知・クーポンアプリ</div>
          </div>

          <div className="tf-back-spacer" />

          {/* SPECIAL OFFER */}
          <div className="tf-offer">
            <div className="tf-offer-badge">SPECIAL OFFER</div>
            <div className="tf-offer-title">
              このコードで<br />
              <span className="accent">限定特典</span>を<br />
              受け取れます
            </div>
            <div className="tf-offer-code">{referralCode || '—'}</div>
            <div className="tf-offer-qr">
              <QRBlock value={referralUrl} size={58} />
            </div>
            <div className="tf-offer-note">QRを読み取って<br />今すぐお申し込み</div>
          </div>

          {/* 会社情報 */}
          <div className="tf-contact">
            <div className="tf-back-message">
              <strong>お気軽にご相談ください。</strong>
              貴店の業種・規模に合わせたPush-taroの活用方法などをご提案いたします。
            </div>

            <div className="tf-back-contact-label">CONTACT</div>
            <div className="tf-back-company">{companyName}</div>
            <div className="tf-back-owner">{ownerName} 様</div>

            <div className="tf-back-info">
              <div className="tf-back-row">
                <span className="tf-back-key">TEL</span>
                <span className="tf-back-val">{phone || '—'}</span>
              </div>
              <div className="tf-back-row">
                <span className="tf-back-key">MAIL</span>
                <span className="tf-back-val">{email}</span>
              </div>
            </div>

            <div className="tf-back-url">https://push-taro.com</div>
          </div>

          <div className="tf-back-foot">© 2026 Push-taro All Rights Reserved.</div>
        </div>

        {/* 右：表紙 */}
        <div className="tf-panel tf-cover">
          <div className="tf-cover-glow" />
          <div className="tf-cover-top">
            <div className="tf-cover-logo-row">
              <svg className="tf-cover-logo-mark" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="tfCoverLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="100%" stopColor="#ff4500" />
                  </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="23" fill="url(#tfCoverLogoGrad)" />
                <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
                <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
                <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
                <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
                <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
              </svg>
              <div className="tf-cover-logo">Push-taro<span>.</span></div>
            </div>
            <div className="tf-cover-badge">2026年9月 正式リリース</div>
          </div>

          <div className="tf-cover-mid">
            <div className="tf-cover-lead">実店舗向けプッシュ通知・クーポンアプリ</div>
            <h1 className="tf-cover-catch">
              お客様に<br />
              喜んで頂ける<br />
              <span className="accent">お店づくりの<br />お手伝い。</span>
            </h1>
            <p className="tf-cover-sub">
              良いサービス、良い商品。<br />
              それだけでは、お客様には伝わりません。<br />
              <strong style={{ color: '#fff', fontWeight: 900 }}>「喜んで頂ける仕組み」</strong>が、<br />
              お店とお客様を、もっと強く繋ぎます。
            </p>
          </div>

          <div className="tf-cover-foot">
            <span className="tf-cover-role">{roleLabel}</span>
            <span className="tf-cover-year">2026</span>
          </div>
        </div>

      </section>

      {/* ============================================================
          2ページ目（内側）
          ============================================================ */}
      <section className="tf-page tf-page-inner">

        {/* 左：喜んで頂ける */}
        <div className="tf-panel tf-philosophy">
          <h3 className="tf-philosophy-h">
            「喜んで頂ける」を、<br />
            <span className="accent">仕組み</span>にする。
          </h3>
          <p className="tf-philosophy-text">
            提供するサービス、取り扱う商品——<br />
            それらが基本として軸にあるのは、もちろん大前提です。
          </p>
          <p className="tf-philosophy-text">
            しかし、<strong>それらをお客様に喜んで頂けるようにする「仕組み」があるかないか</strong>で、結果は大きく変わります。
          </p>
          <p className="tf-philosophy-text">
            どんなに素晴らしいサービスや商品があっても、仕組みがなければ既存のお客様には伝わりません。逆に、喜んで頂ける仕組みがあれば、お客様は<strong>もっと利用してくれる</strong>ようになります。
          </p>
          <div className="tf-philosophy-quote">
            <p className="tf-philosophy-quote-text">
              そして、それこそが<br />
              <span style={{ color: '#ff4500' }}>口コミ</span>となり、<br />
              新規のお客様へと繋がっていく。
            </p>
          </div>
          <ul className="tf-philosophy-list">
            <li>良いサービス・商品がある</li>
            <li>それを伝える「仕組み」がある</li>
            <li>既存客がもっと利用してくれる</li>
            <li>口コミが生まれ、新規へ繋がる</li>
          </ul>
        </div>

        {/* 中：雨の日 + Push-taro */}
        <div className="tf-panel tf-rain">
          <h3 className="tf-rain-h">
            「雨の日」に、<br />
            <span className="accent">プッシュ通知は効きません。</span>
          </h3>
          <p className="tf-rain-text">
            よく聞く「雨の日に来店が減る」「今日は暇だから」——。<br />
            この状況でプッシュ通知を送っても、<strong>ほぼ効きません。</strong>
          </p>
          <div className="tf-rain-compare">
            <div className="tf-rain-card is-bad">
              <span className="tf-rain-card-label">NG例</span>
              <p className="tf-rain-card-text">「本日は20%オフです！」<br />雨の日は流動数が少ない。行く理由にならない。</p>
            </div>
            <div className="tf-rain-arrow">↓</div>
            <div className="tf-rain-card is-good">
              <span className="tf-rain-card-label">OK例</span>
              <p className="tf-rain-card-text">「クーポンの期日が今日まで」<br />得する理由・楽しみがあると、人は雨でも動く。</p>
            </div>
          </div>
          <p className="tf-rain-text">
            日頃から<strong>仕組みを作る</strong>ことで、「行く理由」ができるんです。
          </p>
          <div className="tf-rain-conclusion">
            <p className="tf-rain-conclusion-text">
              クーポンなどを組み合わせ、<br />
              <strong>「喜ばれる仕組み」を作る。</strong><br />
              いつの間にか「雨なのに客足が<br />途絶えない店」が、できあがります。
            </p>
          </div>

          <div className="tf-mid-divider">SOLUTION</div>

          <div className="tf-solution">
            <h3 className="tf-solution-h">
              だから、<span className="accent">Push-taro</span> です。
            </h3>
            <p className="tf-solution-text">
              「クーポンだけでいいのでは？」と、思われるかもしれません。<br />
              しかしクーポンは<strong>受け身</strong>。サイトや来店で知ってもらうしか、伝える手段がないのです。
            </p>
            <p className="tf-solution-text">
              それを、<strong>メルマガの10倍の開封率</strong>を持つプッシュ通知で、<strong>動的に仕組み化</strong>する。
            </p>
            <div className="tf-solution-push">
              <div className="tf-solution-push-title">Push-taro ができること</div>
              <p className="tf-solution-push-text">
                喜んで頂ける仕組みに欠かせない機能を、<strong>満載</strong>。<br />
                しかも、<strong>すべてオンオフ可能</strong>。<br />
                お店に必要な機能だけを、自由に組み合わせて使えます。
              </p>
            </div>
          </div>
        </div>

        {/* 右：機能一覧 */}
        <div className="tf-panel tf-detail">
          <span className="tf-detail-tag">ALL FEATURES</span>
          <h3 className="tf-detail-h">
            <span className="accent">すべてオンオフ可能。</span><br />
            必要な機能だけを、選べる。
          </h3>
          <p className="tf-detail-sub">お店に必要な分だけ、組み合わせて使えます。</p>

          <div className="tf-detail-list">
            {[
              { ico: '📢', name: 'プッシュ通知', badges: ['all'], desc: 'お客様全員へ一斉配信。メルマガの約3倍の開封率。' },
              { ico: '📱', name: 'QRコード登録', badges: ['all'], desc: 'お客様はQRを読み取るだけ。アプリ不要で通知登録。' },
              { ico: '🎫', name: '初回クーポン', badges: ['all'], desc: '登録と同時に自動配布。二重利用は自動ブロック。' },
              { ico: '🎟️', name: '通常クーポン', badges: ['std', 'pro'], desc: '登録者が何度でも使える、常設クーポン。' },
              { ico: '🏆', name: '特別達成クーポン', badges: ['std', 'pro'], desc: '指定回数クーポンを使うと、特別クーポンが出現。' },
              { ico: '📊', name: '開封率の確認', badges: ['std', 'pro'], desc: '配信ごとの開封率を数値で確認。PDCAを回せる。' },
              { ico: '🐾', name: 'ステップアップクーポン', badges: ['pro'], desc: '来店ごとに、段階的に特典アップ。最大10段階まで。' },
              { ico: '🔄', name: '連続クーポン', badges: ['pro'], desc: '消込と同時に、次回分のクーポンを自動発行。' },
              { ico: '🎂', name: '記念日・誕生日クーポン', badges: ['pro'], desc: '年1回の特別な日に、自動でお祝いクーポンを配信。' },
              { ico: '💤', name: '休眠復活クーポン', badges: ['pro'], desc: '最終来店からN日経過した顧客に、自動で復帰クーポン。' },
              { ico: '📅', name: '予約配信・定期配信', badges: ['pro'], desc: '毎週金曜18時、毎月1日など、指定日時に自動送信。' },
            ].map((f) => {
              const cls = f.badges.includes('pro') ? 'is-pro' : f.badges.includes('std') ? 'is-std' : 'is-all';
              return (
                <div key={f.name} className={`tf-detail-item ${cls}`}>
                  <span className="tf-detail-ico">{f.ico}</span>
                  <div className="tf-detail-body">
                    <div className="tf-detail-name">
                      {f.name}
                      {f.badges.includes('all') && <span className="badge is-all">全プラン</span>}
                      {f.badges.includes('std') && <span className="badge is-std">STANDARD</span>}
                      {f.badges.includes('pro') && <span className="badge is-pro">PRO</span>}
                    </div>
                    <div className="tf-detail-desc">{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      <style jsx global>{`
        /* 全体初期化 */
        /* 全体初期化 */
　　　　　　　　　　　　　*, *::before, *::after {
              box-sizing: border-box !important;
　　　　　　　　　　　　　　　　　　　　　　　　　　}

　　　　　　　　　　　　　　　html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #e2e8f0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
　　　　　　　　　　　　　　　　　　}

　　　　　　　　　　　　　　　.tf-print-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
　　　　　　　　　　　　　　　　　　}

        .tf-page {
          width: 297mm;
          min-height: 205mm;
          display: flex;
          flex-direction: row;
          background: #fff;
          margin-bottom: 10mm;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .tf-panel {
          width: 33.333%;
          padding: 8mm 6mm;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* ========== 外側左：紹介制度 ========== */
        .tf-featprice {
          background: linear-gradient(180deg, #fffbf5 0%, #fff 100%);
          border-right: 1px dashed #e2e8f0;
        }
        .tf-fp-tag {
          display: inline-block;
          font-size: 7pt; font-weight: 900; letter-spacing: 1.5px;
          padding: 1.5mm 3mm; border-radius: 10px;
          background: linear-gradient(135deg, #ff4500, #f97316);
          color: #fff; margin-bottom: 2mm; align-self: flex-start;
        }
        .tf-fp-h {
          font-size: 12pt; font-weight: 900;
          line-height: 1.35; letter-spacing: -0.4px;
          margin: 0 0 2mm;
        }
        .tf-fp-h .accent { color: #ff4500; }
        .tf-fp-sub {
          font-size: 7.5pt; color: #64748b;
          line-height: 1.6; margin: 0 0 3mm;
        }
        .tf-fp-sub strong { color: #0f172a; font-weight: 900; }

        .tf-refbox {
          background: linear-gradient(160deg, #0f172a, #1e293b);
          border-radius: 8px; padding: 3mm 3mm;
          color: #fff; margin-bottom: 3mm;
        }
        .tf-refbox-title {
          font-size: 9.5pt; font-weight: 900;
          line-height: 1.35; margin-bottom: 2mm;
        }
        .tf-refbox-title .accent { color: #fd7e5a; }
        .tf-refbox-row {
          display: flex; justify-content: space-between;
          align-items: baseline; padding: 1mm 0;
          border-bottom: 1px dashed rgba(255,255,255,0.15);
          font-size: 7.5pt;
        }
        .tf-refbox-row:last-of-type { border-bottom: none; }
        .tf-refbox-label { color: #cbd5e1; }
        .tf-refbox-value {
          font-size: 9.5pt; font-weight: 900;
          color: #fff; letter-spacing: -0.3px;
        }
        .tf-refbox-value .small { font-size: 6.5pt; font-weight: 600; color: #94a3b8; }
        .tf-refbox-value.accent { color: #fd7e5a; }
        .tf-refbox-conclusion {
          margin-top: 2mm; padding: 2mm 2.5mm;
          background: linear-gradient(135deg, #ff4500, #f97316);
          border-radius: 5px; text-align: center;
          font-size: 7.5pt; font-weight: 900; line-height: 1.4;
        }
        .tf-refbox-conclusion strong { display: block; font-size: 9pt; margin-bottom: 0.5mm; }

        .tf-fp-divider {
          text-align: center; font-size: 6.5pt; font-weight: 900;
          letter-spacing: 1.5px; color: #ff4500;
          margin-bottom: 2.5mm; padding-top: 2mm;
          border-top: 1px solid #e2e8f0;
        }
        .tf-fp-plans { display: flex; flex-direction: column; gap: 1.5mm; flex: 1; }
        .tf-fp-plan {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 6px; padding: 2mm 2.5mm;
        }
        .tf-fp-plan.is-pro { border: 2px solid #ff4500; background: #fffbf5; position: relative; }
        .tf-fp-recommend {
          position: absolute; top: -2mm; right: 3mm;
          font-size: 5.5pt; font-weight: 900; letter-spacing: 0.5px;
          padding: 0.5mm 1.8mm; background: #ff4500; color: #fff;
          border-radius: 6px;
        }
        .tf-fp-plan-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.8mm; }
        .tf-fp-plan-name { font-size: 8.5pt; font-weight: 900; letter-spacing: 0.5px; color: #64748b; }
        .tf-fp-plan.is-pro .tf-fp-plan-name { color: #ff4500; }
        .tf-fp-plan-price { font-size: 11pt; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; }
        .tf-fp-plan-price span { font-size: 6.5pt; font-weight: 600; color: #64748b; margin-left: 0.5mm; }
        .tf-fp-plan-desc { font-size: 6pt; color: #64748b; line-height: 1.4; }
        .tf-fp-plan-desc strong { color: #0f172a; font-weight: 900; }

        .tf-free {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1.5mm; margin-top: 2.5mm; padding-top: 2mm;
          border-top: 1px solid #e2e8f0;
        }
        .tf-free-item {
          background: #fff7ed; border: 1px solid #fed7aa;
          border-radius: 6px; padding: 2mm 1.5mm; text-align: center;
        }
        .tf-free-ico { font-size: 12pt; line-height: 1; margin-bottom: 0.5mm; }
        .tf-free-text { font-size: 6.5pt; font-weight: 900; color: #7c2d12; line-height: 1.3; }

         /* ========== 外側中：会社情報 ========== */
        .tf-back {
          background: #fafafa;
          border-right: 1px dashed #e2e8f0;
        }
        .tf-back-logo-row { display: flex; align-items: center; gap: 2mm; }
        .tf-back-logo-mark { width: 9mm; height: 9mm; flex-shrink: 0; }
        .tf-back-logo {
          font-size: 17pt; font-weight: 900; letter-spacing: -0.5px; line-height: 1;
        }
        .tf-back-logo span { color: #ff4500; }
        .tf-back-tagline {
          font-size: 7.5pt; color: #64748b; font-weight: 700;
          margin-top: 1.5mm; letter-spacing: 0.3px;
        }
        .tf-back-spacer { flex: 1; }

        .tf-offer {
          background: #fff;
          border: 2px dashed #ff4500;
          border-radius: 10px;
          padding: 3mm 2.5mm;
          text-align: center;
          margin-bottom: 4mm;
        }
        .tf-offer-badge {
          display: inline-block;
          font-size: 6pt; font-weight: 900; letter-spacing: 1.2px;
          padding: 0.7mm 2.5mm; border-radius: 8px;
          background: linear-gradient(135deg, #ff4500, #f97316);
          color: #fff; margin-bottom: 2mm;
        }
        .tf-offer-title {
          font-size: 8.5pt; font-weight: 900;
          color: #0f172a; line-height: 1.45;
          margin-bottom: 2.5mm;
        }
        .tf-offer-title .accent { color: #ff4500; }
        .tf-offer-code {
          font-family: 'Courier New', monospace;
          font-size: 14pt; font-weight: 900;
          letter-spacing: 2.5px;
          color: #0f172a;
          background: #fff7ed;
          border: 2px dashed #ff4500;
          border-radius: 6px;
          padding: 2mm 2.5mm;
          margin: 0 auto 2.5mm;
          display: inline-block;
          min-width: 70%;
        }
        .tf-offer-qr {
          display: flex; justify-content: center;
          margin-bottom: 1.5mm;
        }
        .tf-offer-note {
          font-size: 6.5pt; font-weight: 700;
          color: #64748b; line-height: 1.4;
        }

        .tf-contact {
          padding-top: 3mm;
          border-top: 2px solid #0f172a;
        }
        .tf-back-message {
          font-size: 8pt; color: #334155;
          line-height: 1.8;
          padding-bottom: 3mm; margin-bottom: 3mm;
          border-bottom: 1px solid #e2e8f0;
        }
        .tf-back-message strong {
          display: block;
          font-size: 9.5pt; font-weight: 900;
          color: #0f172a; margin-bottom: 1.5mm;
        }
        .tf-back-contact-label {
          font-size: 6.5pt; font-weight: 900; letter-spacing: 2px;
          color: #ff4500; margin-bottom: 2mm;
        }
        .tf-back-company { font-size: 11pt; font-weight: 900; line-height: 1.35; }
        .tf-back-owner { font-size: 8.5pt; color: #475569; margin: 0.8mm 0 3mm; }
        .tf-back-info { border-top: 1px solid #e2e8f0; padding-top: 2.5mm; }
        .tf-back-row {
          display: grid; grid-template-columns: 12mm 1fr;
          gap: 2mm; font-size: 8pt; padding: 1mm 0; align-items: baseline;
        }
        .tf-back-key { font-weight: 900; color: #94a3b8; letter-spacing: 0.5px; }
        .tf-back-val { color: #334155; overflow-wrap: anywhere; line-height: 1.5; }
        .tf-back-url {
          margin-top: 3mm;
          font-size: 7.5pt;
          font-family: 'Courier New', monospace;
          font-weight: 900;
          color: #ff4500;
          text-align: center;
          padding: 1.8mm;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }
        .tf-back-foot { margin-top: 3mm; font-size: 6pt; color: #94a3b8; letter-spacing: 0.3px; text-align: center; }

        /* ========== 外側右：表紙 ========== */
        .tf-cover {
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          color: #fff; padding: 10mm 8mm;
        }
        .tf-cover-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 75% 15%, rgba(255,69,0,0.4), transparent 55%);
          pointer-events: none;
        }
        .tf-cover > * { position: relative; z-index: 1; }
        .tf-cover-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8mm; }
        .tf-cover-logo-row { display: flex; align-items: center; gap: 2mm; }
        .tf-cover-logo-mark { width: 9mm; height: 9mm; flex-shrink: 0; }
        .tf-cover-logo { font-size: 16pt; font-weight: 900; letter-spacing: -0.5px; line-height: 1; }
        .tf-cover-logo span { color: #ff4500; }
        .tf-cover-badge {
          font-size: 5.5pt; font-weight: 900; letter-spacing: 0.8px;
          padding: 0.8mm 2mm; border-radius: 6px;
          background: rgba(255,69,0,0.2); border: 1px solid rgba(255,69,0,0.5);
          color: #fd7e5a;
        }
        .tf-cover-mid { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .tf-cover-lead {
          font-size: 9pt; color: #fd7e5a; font-weight: 900;
          letter-spacing: 0.5px; margin-bottom: 3mm;
          display: flex; align-items: center; gap: 2mm;
        }
        .tf-cover-lead::before { content: ''; width: 5mm; height: 1.5px; background: #ff4500; display: inline-block; }
        .tf-cover-catch { font-size: 20pt; font-weight: 900; line-height: 1.3; letter-spacing: -1px; margin: 0 0 5mm; }
        .tf-cover-catch .accent { color: #fd7e5a; }
        .tf-cover-sub {
          font-size: 8.5pt; color: #cbd5e1; line-height: 1.75; margin: 0;
          padding-top: 4mm; border-top: 1px solid rgba(255,255,255,0.15);
        }
        .tf-cover-foot {
          margin-top: auto; padding-top: 4mm;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex; justify-content: space-between; align-items: baseline;
        }
        .tf-cover-role { font-size: 6.5pt; font-weight: 900; letter-spacing: 1.2px; color: #fd7e5a; }
        .tf-cover-year { font-size: 6.5pt; color: #64748b; font-weight: 700; }

        /* ========== 内側左：喜んで頂ける ========== */
        .tf-philosophy { background: #fff; border-right: 1px dashed #e2e8f0; }
        .tf-philosophy-h {
          font-size: 15pt; font-weight: 900;
          line-height: 1.45; letter-spacing: -0.5px;
          margin: 0 0 7mm; color: #0f172a;
        }
        .tf-philosophy-h .accent { color: #ff4500; }
        .tf-philosophy-text { font-size: 9pt; color: #334155; line-height: 2.1; margin: 0 0 5mm; }
        .tf-philosophy-text strong {
          color: #0f172a; font-weight: 900;
          background: linear-gradient(transparent 60%, #fed7aa 60%);
          padding: 0 1mm;
        }
        .tf-philosophy-quote {
          margin: 6mm 0; padding: 5mm;
          background: #fff7ed;
          border-left: 3px solid #ff4500;
          border-radius: 0 8px 8px 0;
        }
        .tf-philosophy-quote-text { font-size: 11pt; font-weight: 900; color: #7c2d12; line-height: 1.6; margin: 0; }
        .tf-philosophy-list {
          list-style: none; padding: 0; margin: 7mm 0 0;
          display: flex; flex-direction: column; gap: 3mm;
        }
        .tf-philosophy-list li {
          display: grid; grid-template-columns: 5mm 1fr;
          gap: 3mm; align-items: flex-start;
          font-size: 9pt; color: #334155; line-height: 1.8;
        }
        .tf-philosophy-list li::before {
          content: '✓'; color: #16a34a; font-weight: 900;
          font-size: 11pt; text-align: center;
        }

        /* ========== 内側中：雨の日 + Push-taro（圧縮版） ========== */
        .tf-rain {
          background: linear-gradient(180deg, #f0f9ff 0%, #fff 40%, #fffbf5 100%);
          border-right: 1px dashed #e2e8f0;
          padding: 8mm 7mm;
        }
        .tf-rain-h {
          font-size: 11pt; font-weight: 900;
          line-height: 1.35; letter-spacing: -0.4px;
          margin: 0 0 2.5mm;
        }
        .tf-rain-h .accent { color: #0284c7; }
        .tf-rain-text {
          font-size: 7.5pt; color: #334155;
          line-height: 1.7; margin: 0 0 2mm;
        }
        .tf-rain-text strong { color: #0f172a; font-weight: 900; }
        .tf-rain-compare {
          display: flex; flex-direction: column;
          gap: 1.5mm; margin: 2mm 0;
        }
        .tf-rain-card { padding: 2mm 2.5mm; border-radius: 5px; }
        .tf-rain-card.is-bad { background: #fef2f2; border: 1px solid #fecaca; }
        .tf-rain-card.is-good { background: #f0fdf4; border: 1px solid #86efac; }
        .tf-rain-card-label {
          font-size: 5.5pt; font-weight: 900; letter-spacing: 0.8px;
          margin-bottom: 0.8mm; display: inline-block;
          padding: 0.5mm 1.8mm; border-radius: 6px; color: #fff;
        }
        .tf-rain-card.is-bad .tf-rain-card-label { background: #dc2626; }
        .tf-rain-card.is-good .tf-rain-card-label { background: #16a34a; }
        .tf-rain-card-text {
          font-size: 7pt; font-weight: 700;
          line-height: 1.5; margin: 0;
        }
        .tf-rain-card.is-bad .tf-rain-card-text { color: #7f1d1d; }
        .tf-rain-card.is-good .tf-rain-card-text { color: #14532d; }
        .tf-rain-arrow {
          text-align: center; color: #0284c7;
          font-size: 9pt; font-weight: 900;
          line-height: 1; margin: 0;
        }
        .tf-rain-conclusion {
          margin-top: 1.5mm; padding: 2.5mm;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff; border-radius: 6px;
        }
        .tf-rain-conclusion-text {
          font-size: 7pt; color: #e0f2fe;
          line-height: 1.55; margin: 0; font-weight: 700;
        }
        .tf-rain-conclusion-text strong { color: #fff; font-weight: 900; }

        .tf-mid-divider {
          margin: 3mm 0 2mm; padding-top: 2mm;
          border-top: 1.5px dashed #fdba74;
          font-size: 6.5pt; font-weight: 900;
          letter-spacing: 1.5px; color: #ff4500; text-align: center;
        }

        .tf-solution { flex: 1; display: flex; flex-direction: column; }
        .tf-solution-h {
          font-size: 11pt; font-weight: 900;
          line-height: 1.35; letter-spacing: -0.4px;
          margin: 0 0 2mm;
        }
        .tf-solution-h .accent { color: #ff4500; }
        .tf-solution-text {
          font-size: 7.5pt; color: #334155;
          line-height: 1.65; margin: 0 0 2mm;
        }
        .tf-solution-text strong { color: #0f172a; font-weight: 900; }
        .tf-solution-push {
          background: #0f172a; border-radius: 6px; padding: 2.5mm;
          color: #fff; margin-top: auto;
        }
        .tf-solution-push-title {
          font-size: 7.5pt; font-weight: 900;
          line-height: 1.35; margin-bottom: 1.2mm;
        }
        .tf-solution-push-text {
          font-size: 6.5pt; color: #cbd5e1;
          line-height: 1.55; margin: 0;
        }
        .tf-solution-push-text strong { color: #fd7e5a; font-weight: 900; }

        /* ========== 内側右：機能一覧 ========== */
        .tf-detail {
          background: linear-gradient(180deg, #fff 0%, #fffbf5 100%);
          padding: 6mm 4.5mm;
          display: flex;
          flex-direction: column;
        }
        .tf-detail-tag {
          display: inline-block;
          font-size: 6.5pt; font-weight: 900; letter-spacing: 1px;
          padding: 0.8mm 2.5mm; border-radius: 8px;
          background: linear-gradient(135deg, #ff4500, #f97316);
          color: #fff; margin-bottom: 1.5mm; align-self: flex-start;
        }
        .tf-detail-h {
          font-size: 11pt; font-weight: 900;
          line-height: 1.25; letter-spacing: -0.4px;
          margin: 0 0 0.8mm;
        }
        .tf-detail-h .accent { color: #ff4500; }
        .tf-detail-sub {
          font-size: 7pt; color: #64748b;
          line-height: 1.4; margin: 0 0 2.5mm;
        }

        .tf-detail-list {
          display: flex;
          flex-direction: column;
          gap: 1mm;
          flex: 1;
          justify-content: space-between;
        }
        .tf-detail-item {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 5px;
          padding: 1.2mm 1.8mm;
          display: grid;
          grid-template-columns: 5mm 1fr;
          gap: 1.5mm;
          align-items: center;
          flex: 1;
          min-height: 0;
        }
        .tf-detail-item.is-pro { border-left: 2.5px solid #ff4500; }
        .tf-detail-item.is-std { border-left: 2.5px solid #0284c7; }
        .tf-detail-item.is-all { border-left: 2.5px solid #64748b; }
        .tf-detail-ico {
          font-size: 10pt;
          line-height: 1;
          text-align: center;
        }
        .tf-detail-body { min-width: 0; }
        .tf-detail-name {
          font-size: 7.5pt; font-weight: 900;
          color: #0f172a; margin-bottom: 0.2mm;
          line-height: 1.15;
          display: flex; align-items: center; gap: 1mm; flex-wrap: wrap;
        }
        .tf-detail-name .badge {
          font-size: 4.5pt; font-weight: 900;
          padding: 0.2mm 1mm; border-radius: 3px;
          color: #fff; letter-spacing: 0.2px;
        }
        .tf-detail-name .badge.is-all { background: #64748b; }
        .tf-detail-name .badge.is-std { background: #0284c7; }
        .tf-detail-name .badge.is-pro { background: linear-gradient(135deg, #ff4500, #f97316); }
        .tf-detail-desc {
          font-size: 6pt; color: #64748b;
          line-height: 1.25;
        }

        /* 印刷（PDF出力）専用設定 */
        @media print {
          @page page-a4h {
    size: 297mm 210mm;
    margin: 0;
  }

          .tf-page {
            width: 297mm !important;
            height: 209.8mm !important; /* 縦幅に余裕（安全域）を持たせて絶対溢れさせない */
            max-height: 209.8mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: row !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page: page-a4h !important;    
            overflow: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
