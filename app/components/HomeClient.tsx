'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { faqs } from '../data/faq';
import '../lp.css';

function useScrollReveal() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const selectors = ['.reveal', '.reveal-left', '.reveal-right', '.tilt-in', '.tilt-in-left', '.tilt-in-right'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => observer.observe(el));
    });
    return () => observer.disconnect();
  }, []);
}

function useCountUp() {
  useEffect(() => {
    const animate = (el: HTMLElement) => {
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(target * eased);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString() + suffix;
      };
      requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function HomeClient() {
  useScrollReveal();
  useCountUp();

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <Image className="logo-mark" src="/icon-192x192.png" alt="Push-taro ロゴ" width={34} height={34} priority />
            Push-taro<span className="dot">.</span>
            <small>実店舗のためのプッシュ通知 × クーポンアプリ</small>
          </a>
          <div className="nav-links">
            <a href="#features">機能</a>
            <a href="#interface">画面</a>
            <a href="#comparison">他社比較</a>
            <a href="#pricing">料金</a>
            <Link href="/signup" className="nav-cta">今すぐ始める</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-badge reveal">
              <span className="dot-live"></span>
              アプリのダウンロード不要｜個人店・小規模店舗向け
            </div>
            <h1 className="reveal" style={{ transitionDelay: '0.1s' }}>
              一度来たお客さんを、<br />
              <span className="gradient">もう一度来店させる。</span>
            </h1>
            <p className="hero-lead reveal" style={{ transitionDelay: '0.2s' }}>
              Push-taroは、店頭のQRコードから30秒で登録できる<br />
              「プッシュ通知 × クーポン」の仕組みです。<br />
              登録したその場で使える初回クーポンを配り、<br />
              来店回数に応じて「次の理由」を自動で届けます。<br />
              <strong>集めるのは電話番号だけ。</strong><br />
              氏名・住所・購買履歴は集めません。
            </p>
            <div className="hero-cta reveal" style={{ transitionDelay: '0.3s' }}>
              <Link href="/signup" className="btn-primary">
                ¥1,980（税込¥2,178）で始める
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#interface" className="btn-secondary">実際の画面を見る</a>
            </div>
            <p className="reveal" style={{ transitionDelay: '0.35s', marginTop: '14px', fontSize: '0.85rem', color: '#64748b' }}>
              従量課金なし ／ 最短10分で開始 ／ 1ヶ月単位で解約できます
            </p>
            <div className="hero-stats">
              <div className="hero-stat tilt-in float">
                <div className="hero-stat-num">最大<span className="count-up" data-count="10">10</span><small>倍</small></div>
                <div className="hero-stat-label">メルマガ比 クリック率</div>
                <p className="hero-stat-note">開封率はメールの約3倍、クリック率は約10倍。</p>
                <p className="hero-stat-note" style={{ fontSize: '0.7rem' }}>※開封率は通知をタップして開いた割合。数値は業界ベンチマークに基づく目安で、配信内容・業種により異なります。</p>
              </div>
              <div className="hero-stat tilt-in float" style={{ transitionDelay: '0.1s' }}>
                <div className="hero-stat-num"><span className="count-up" data-count="7">7</span><small>種類</small></div>
                <div className="hero-stat-label">クーポン自動配信</div>
              </div>
              <div className="hero-stat tilt-in float" style={{ transitionDelay: '0.2s' }}>
                <div className="hero-stat-num">無制限</div>
                <div className="hero-stat-label">PROプラン配信数</div>
              </div>
              <div className="hero-stat tilt-in float" style={{ transitionDelay: '0.3s' }}>
                <div className="hero-stat-num"><span className="count-up" data-count="3">3</span><small>種</small></div>
                <div className="hero-stat-label">収益化プログラム</div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY NOW */}
        <section className="section" id="why-now">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Why Now</span>
              <h2>なぜ、今、プッシュ通知なのか。</h2>
              <p>2023年、iPhoneがWebアプリのプッシュ通知に対応。<br />これで国内のスマホ全般で使えるようになりました。<br />
                <a href="https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" target="_blank" rel="noopener noreferrer">WebKitによる対応の発表</a>
              </p>
            </div>
            <div className="timeline">
              <div className="timeline-item tilt-in">
                <div className="timeline-year">2015</div>
                <div className="timeline-content">
                  <h4>Android、プッシュ通知に対応</h4>
                  <p>Androidは早くからWebアプリのプッシュ通知をサポートしていました。ただ、iPhoneユーザーには届きませんでした。</p>
                </div>
              </div>
              <div className="timeline-item is-highlight tilt-in" style={{ transitionDelay: '0.1s' }}>
                <div className="timeline-year">2023</div>
                <div className="timeline-content">
                  <h4>iPhone、Webアプリのプッシュ通知に対応</h4>
                  <p>iOS 16.4以降で、ホーム画面に追加したWebアプリがプッシュ通知を受け取れるように。これでiPhoneユーザーにも届けられるようになりました。</p>
                </div>
              </div>
              <div className="timeline-item is-final tilt-in" style={{ transitionDelay: '0.2s' }}>
                <div className="timeline-year">NOW</div>
                <div className="timeline-content">
                  <h4>国内のスマホ全般で、プッシュ通知が可能に</h4>
                  <p>iPhone・Android、どちらのユーザーにも、Webアプリから直接お得を届けられる時代になりました。</p>
                </div>
              </div>
            </div>
            <div className="why-now-compare">
              <div className="why-now-card is-corporate tilt-in-left">
                <h4>🏢 大手企業は、すでに活用中</h4>
                <p>プッシュ通知の開封率の高さをいち早く理解し、Webサイトからの通知をどんどん増やしています。</p>
              </div>
              <div className="why-now-card is-shop tilt-in-right">
                <h4>🏪 実店舗では、まだ普及率が低い</h4>
                <p>この恩恵を、実店舗はまだ上手に使えていません。<br />だからこそ、今がチャンスです。</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY COUPON */}
        <section className="section section-alt" id="why-coupon">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Why Coupon</span>
              <h2>プッシュ通知 × クーポンで、<br />来店の理由を作る。</h2>
              <p>「お知らせ」だけでは、見てもらえない。<br />「お得」とセットで届けるから、来店に繋がる。</p>
            </div>
            <div className="coupon-example-grid reveal">
              <div className="coupon-example is-bad">
                <h4 className="coupon-example-title"><span className="icon">❌</span> お知らせだけ（ダメな例）</h4>
                <div className="coupon-example-text">「本日も元気に営業中！<br />イチゴタルトが焼き上がりました🍓」</div>
                <p className="coupon-example-result">→ 「ふーん」で終わってしまう。</p>
              </div>
              <div className="coupon-example is-good">
                <h4 className="coupon-example-title"><span className="icon">✅</span> お得とセット（Push-taroの例）</h4>
                <div className="coupon-example-text">「【15時まで限定】<br />焼き立てイチゴタルト<strong>50円引きクーポン</strong>が届きました！<br />お会計時に提示してください🍰」</div>
                <p className="coupon-example-result">→ 「じゃあ、15時までに行こうかな」と繋がる。</p>
              </div>
            </div>
            <div className="why-coupon-flow">
              <div className="wc-step tilt-in">
                <div className="wc-num">1</div>
                <div className="wc-icon">📢</div>
                <h4>プッシュ通知が届く</h4>
                <p>ホーム画面に、直接メッセージが届きます。メールやLINEより、圧倒的に見られます。</p>
              </div>
              <div className="wc-arrow">→</div>
              <div className="wc-step is-highlight tilt-in" style={{ transitionDelay: '0.1s' }}>
                <div className="wc-num">2</div>
                <div className="wc-icon">🎁</div>
                <h4>「お得」がないと、削除される</h4>
                <p>ただのお知らせでは、お客様はホーム画面から削除してしまいます。だからクーポンとセットが必要です。</p>
              </div>
              <div className="wc-arrow">→</div>
              <div className="wc-step is-final tilt-in" style={{ transitionDelay: '0.2s' }}>
                <div className="wc-num">3</div>
                <div className="wc-icon">🎯</div>
                <h4>来店・リピートに繋がる</h4>
                <p>「今すぐ使えるクーポン」なら、来店の理由になります。リピートにも自然と繋がります。</p>
              </div>
            </div>
            <div className="before-after">
              <div className="ba-col is-before tilt-in-left">
                <h4>❌ Before</h4>
                <ul>
                  <li>チラシ・DMを打っても、効果が見えない</li>
                  <li>一度来たお客様が、再来店しない</li>
                  <li>クーポンアプリは重くて、登録されない</li>
                </ul>
              </div>
              <div className="ba-col is-after tilt-in-right">
                <h4>✅ After</h4>
                <ul>
                  <li>QRを読み取るだけで、お客様が登録</li>
                  <li>来店回数に応じて、特典クーポンが自動で解放</li>
                  <li>「喜んで頂ける仕組み」が、自然に回り出す</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="section" id="philosophy">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Philosophy</span>
              <h2>実店舗に、<br />本当に必要なものだけ。</h2>
              <p>大手マーケティングツールの真似ではなく、<br />実店舗のリアルに合わせた設計です。</p>
            </div>
            <div className="philosophy-statement reveal">
              <span className="quote-mark">&quot;</span>
              <h3>セグメント配信（顧客を属性ごとに分けて配信すること）・<br />高度な分析・A/Bテスト——<br />それらを実店舗で使いこなすには、<br />専門のマーケティングチームが不可欠です。</h3>
              <p>適当に使っても、効果は限定的。<br />数十万〜数百万の顧客を抱えるECサイトならともかく、<br />数百〜数千人の顧客を相手にする実店舗では、<br /><strong>費用対効果が合いません。</strong></p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/guide/segmentation" className="philosophy-statement-link">📊 セグメント配信が、実店舗では「使えない」理由を詳しく読む</Link>
            </div>
            <div className="philosophy-compare">
              <div className="pc-card is-wrong tilt-in-left">
                <span className="pc-badge">業界の「間違い」</span>
                <h4>大手ツールがやってること</h4>
                <ul className="pc-list">
                  <li><span className="ico">✕</span><span>専門マーケターが何時間もかけて設計</span></li>
                  <li><span className="ico">✕</span><span>年齢・性別・来店頻度で顧客を細かく分類</span></li>
                  <li><span className="ico">✕</span><span>PDCA（計画・実行・確認・改善のサイクル）を毎月回す前提</span></li>
                  <li><span className="ico">✕</span><span>実店舗では「なんであの人だけ？」と差別になりかねない</span></li>
                  <li><span className="ico">✕</span><span>効果のない通知を打ち続けて、ホーム画面から削除される</span></li>
                </ul>
              </div>
              <div className="pc-card is-right tilt-in-right">
                <span className="pc-badge">Push-taroの「正解」</span>
                <h4>実店舗に本当に必要なこと</h4>
                <ul className="pc-list">
                  <li><span className="ico">◎</span><span>まず、<strong>全員に同じ施策</strong>ができること</span></li>
                  <li><span className="ico">◎</span><span>その上で、<strong>来てくれる人への感謝</strong>をカタチに</span></li>
                  <li><span className="ico">◎</span><span>特別な知識も、マーケティング専任チームも、必要ありません</span></li>
                  <li><span className="ico">◎</span><span>シンプルだからこそ、<strong>続けられる</strong></span></li>
                  <li><span className="ico">◎</span><span>「差別」ではなく「お返し」としての仕組み</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="section security-section" id="security">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Security</span>
              <h2>顧客情報を、取らない。<br />という安心。</h2>
              <p>大手企業の情報流出が、日常になっています。<br />顧客情報を取れば取るほど、リスクは増える。<br />Push-taroが保存するのは、<strong>電話番号だけ</strong>です。</p>
            </div>
            <div className="security-compare">
              <div className="security-card is-others tilt-in-left">
                <span className="security-badge">他のツール</span>
                <h4>保存する情報</h4>
                <ul className="security-list">
                  <li>氏名・住所</li>
                  <li>生年月日・性別</li>
                  <li>購買履歴</li>
                  <li>クレジットカード情報</li>
                  <li>電話番号</li>
                </ul>
                <p className="security-note">漏洩時のリスク：<strong>最大</strong></p>
              </div>
              <div className="security-card is-push tilt-in-right">
                <span className="security-badge is-push">Push-taro</span>
                <h4>保存する情報</h4>
                <ul className="security-list">
                  <li className="is-good">電話番号（SMS認証済み）</li>
                  <li className="is-no">氏名・住所</li>
                  <li className="is-no">生年月日・性別</li>
                  <li className="is-no">購買履歴</li>
                  <li className="is-no">クレジットカード情報</li>
                </ul>
                <p className="security-note">漏洩時のリスク：<strong className="is-good">最小</strong></p>
              </div>
            </div>
            <div className="security-cta reveal">
              <Link href="/guide/security" className="security-link">🔒 なぜ、Push-taroは顧客情報を取らないのか</Link>
            </div>
          </div>
        </section>

        {/* GUIDE PROMO */}
        <section className="guide-promo guide-promo-2">
          <div className="container">
            <div className="guide-promo-card is-reverse reveal">
              <div className="guide-promo-left">
                <span className="guide-promo-tag">📖 深く読みたい方へ</span>
                <h2 className="guide-promo-title">実店舗の集客、<br />オススメの施策。<br /><span className="guide-promo-title-accent">これが土台となる。</span></h2>
                <p className="guide-promo-text">広告、ポータル、LP、SNS、LINE。<br />どれも必要で、全部やる時代。<br />でも、1回来店してくれたお客様への施策が、弱いのでは。</p>
                <ul className="guide-promo-list">
                  <li>LINE Businessの配信上限という、見えない壁</li>
                  <li>CVRを上げるには、繰り返しの検証が必要</li>
                  <li>Push-taroは、その壁をどう外したか</li>
                </ul>
                <Link href="/guide/store-marketing" className="guide-promo-btn">
                  詳しく読む
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <div className="guide-promo-right">
                <div className="guide-promo-mock is-alt">
                  <div className="guide-promo-mock-head"></div>
                  <div className="guide-promo-mock-bar" style={{ width: '95%' }}></div>
                  <div className="guide-promo-mock-bar" style={{ width: '70%' }}></div>
                  <div className="guide-promo-mock-bar is-highlight" style={{ width: '88%' }}></div>
                  <div className="guide-promo-mock-bar" style={{ width: '60%' }}></div>
                  <div className="guide-promo-mock-bar" style={{ width: '80%' }}></div>
                  <div className="guide-promo-mock-bar" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SETUP */}
        <section className="section section-alt" id="setup">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Easy Setup</span>
              <h2>導入は、想像よりずっと簡単。</h2>
              <p>専門知識は一切不要。<br />QRコードを印刷して貼るだけで、今日から始められます。</p>
            </div>
            <div className="setup-barrier reveal">
              <div className="setup-barrier-icon">🚪</div>
              <div className="setup-barrier-body">
                <h3>プッシュ通知の最大の難関は、<br />「受け取ってもらう」こと。</h3>
                <p>アプリのダウンロード、LINE登録、ホーム画面への追加——<br />お客様に何らかのアクションをしてもらわないと、通知は届きません。<br /><strong>この最初のハードルを、いかに低くするかが勝負です。</strong></p>
              </div>
            </div>
            <div className="setup-flow-wrap">
              <div className="setup-col is-customer reveal-left">
                <div className="setup-head">
                  <span className="setup-badge">お客様側</span>
                  <h3>QRを読み取って、30秒。</h3>
                  <p>全プランに「QRコード + 初回クーポン」標準搭載</p>
                </div>
                <div className="setup-steps">
                  <div className="setup-step"><div className="setup-num">1</div><div className="setup-text"><strong>QRコードを読み取る</strong><span>店頭POPのQRをカメラで読み取るだけ</span></div></div>
                  <div className="setup-step"><div className="setup-num">2</div><div className="setup-text"><strong>ホーム画面に追加（iPhoneのみ）</strong><span>Androidは自動で完了</span></div></div>
                  <div className="setup-step"><div className="setup-num">3</div><div className="setup-text"><strong>SMS認証</strong><span>電話番号に届くコードを入力</span></div></div>
                  <div className="setup-step is-final"><div className="setup-num">✓</div><div className="setup-text"><strong>登録完了 + 初回クーポンGET</strong><span>その場で「10〜20%OFF」が受け取れる</span></div></div>
                </div>
                <div className="setup-note"><strong>「ホーム画面に追加で10%OFF」</strong><br />これだけで、お客様の登録ハードルは一気に下がります。</div>
              </div>
              <div className="setup-col is-owner reveal-right">
                <div className="setup-head">
                  <span className="setup-badge">店舗オーナー側</span>
                  <h3>登録から運用まで、10分。</h3>
                  <p>専門知識ゼロ。ITが苦手でも大丈夫。</p>
                </div>
                <div className="setup-steps">
                  <div className="setup-step"><div className="setup-num">1</div><div className="setup-text"><strong>アカウント作成</strong><span>メールアドレスと店舗情報を入力</span></div></div>
                  <div className="setup-step"><div className="setup-num">2</div><div className="setup-text"><strong>クーポン設定</strong><span>タイトル・説明・有効期限を管理画面で</span></div></div>
                  <div className="setup-step"><div className="setup-num">3</div><div className="setup-text"><strong>店頭ポップを印刷</strong><span>管理画面から、A4/B5ポップを印刷するだけ</span></div></div>
                  <div className="setup-step is-final"><div className="setup-num">✓</div><div className="setup-text"><strong>通知を送信</strong><span>「本日の日替わりランチ！」を即配信</span></div></div>
                </div>
                <div className="setup-note"><strong>アカウント作成から最短10分。</strong><br />決済完了で、即時利用開始できます。</div>
              </div>
            </div>

            {/* 店頭ポップ */}
            <div className="qr-pop-section reveal">
              <div className="qr-pop-head">
                <span className="tag">NEW FEATURE</span>
                <div className="qr-pop-plan-badges">
                  <span className="qr-pop-plan-badge is-std">STANDARD</span>
                  <span className="qr-pop-plan-badge is-pro">PRO</span>
                </div>
                <h3>店頭ポップを、管理画面から印刷するだけ。</h3>
                <p>レジ横・カウンター・テーブルに置くだけで、お客様が自分から登録してくれます。</p>
              </div>
              <div className="qr-pop-body">
                <div className="qr-pop-visual">
                  <div className="pop-a4">
                    <div className="pop-shop">Patisserie Taro</div>
                    <div className="pop-lead">＼ スマホで読み取るだけ ／</div>
                    <div className="pop-catch">お得な情報を<br /><span className="accent">プッシュ通知</span>で<br />お届けします</div>
                    <div className="pop-qr"></div>
                    <div className="pop-perk"><span className="pop-perk-badge">初回限定</span><div className="pop-perk-title">🎁 初回限定 10%OFF</div></div>
                  </div>
                  <div className="pop-b5">
                    <div className="pop-shop">Patisserie Taro</div>
                    <div className="pop-lead">＼ スマホで読み取るだけ ／</div>
                    <div className="pop-catch">お得な情報を<br /><span className="accent">プッシュ通知</span>で<br />お届けします</div>
                    <div className="pop-qr"></div>
                    <div className="pop-perk"><span className="pop-perk-badge">初回限定</span><div className="pop-perk-title">🎁 初回限定 10%OFF</div></div>
                  </div>
                </div>
                <div className="qr-pop-content">
                  <div className="qr-pop-feature"><div className="qr-pop-feature-icon">🖨️</div><div className="qr-pop-feature-body"><h4>A4 / B5、2サイズから選べる</h4><p>レジ横やカウンターに設置。店舗の状況に合わせて、A4もしくはB5サイズにて印刷できます。</p></div></div>
                  <div className="qr-pop-feature"><div className="qr-pop-feature-icon">✨</div><div className="qr-pop-feature-body"><h4>店舗名とQRコード入り</h4><p>お客様はQRを読み取るだけ。アプリ不要、30秒で通知登録が完了します。</p></div></div>
                  <div className="qr-pop-feature"><div className="qr-pop-feature-icon">🎁</div><div className="qr-pop-feature-body"><h4>初回クーポンが設定されていれば、自動で表示</h4><p>「登録するとお得」ではなく、<strong>「登録すると、今すぐお得」</strong>。その場で特典が得られるから、登録率が爆発的に上がります。</p></div></div>
                  <div className="qr-pop-highlight"><strong>「今日、これ使えます」が最強の登録動機。</strong><p>お会計時に「これ、今日使えるから登録するとお得ですよ」と一言添えるだけ。<br />未来のお得ではなく、<strong>目の前のお得</strong>が、お客様の背中を押します。</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section" id="features">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Features</span>
              <h2>必要な機能から、<br />選べる3つのステップ。</h2>
              <p>「全員に配る」「常連を大切にする」「もっと極める」。<br />お店の状況に合わせて、必要なものから導入できます。</p>
            </div>

            <div className="feature-group">
              <div className="feature-group-head reveal">
                <span className="feature-group-num">1</span>
                <div>
                  <h3>まず、全員に配る機能</h3>
                  <p>最初に使うのはこれだけ。難しく考えず、今日から始められます。</p>
                </div>
                <span className="feature-group-tag is-all">全プラン</span>
              </div>
              <div className="feature-cards">
                <div className="feature-card tilt-in">
                  <div className="feature-card-icon">📢</div>
                  <h4>プッシュ通知</h4>
                  <p>登録したお客様全員に、一斉に通知を配信。クリック率（送った通知が、どれくらいタップされたかの割合）はメルマガの約10倍。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.05s' }}>
                  <div className="feature-card-icon">📱</div>
                  <h4>QRコード登録</h4>
                  <p>店頭ポップのQRを読み取るだけ。アプリ不要、30秒で登録完了。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.1s' }}>
                  <div className="feature-card-icon">🎫</div>
                  <h4>初回クーポン</h4>
                  <p>登録と同時に自動配布。「今すぐ使える」特典で、登録率が上がります。</p>
                </div>
              </div>
            </div>

            <div className="feature-group">
              <div className="feature-group-head reveal">
                <span className="feature-group-num">2</span>
                <div>
                  <h3>来てくれる人を、もっと大切に</h3>
                  <p>「差別」ではなく「お返し」。来店回数に応じた自然な仕組みです。</p>
                </div>
                <span className="feature-group-tag is-std">STANDARD+</span>
              </div>
              <div className="feature-cards">
                <div className="feature-card tilt-in">
                  <div className="feature-card-icon">🎟️</div>
                  <h4>通常クーポン</h4>
                  <p>登録者全員が何度でも使える常設クーポン。「会員様特典」として運用。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.05s' }}>
                  <div className="feature-card-icon">🏆</div>
                  <h4>特別達成クーポン</h4>
                  <p>N回来店で自動解放。「あと1回」の心理が、来店を後押しします。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.1s' }}>
                  <div className="feature-card-icon">📊</div>
                  <h4>開封率の確認</h4>
                  <p>配信ごとの開封率をチェック。何が効いているか、一目でわかります。</p>
                </div>
                {/* 🖨️ 店頭ポップ印刷をSTANDARD+に移動 */}
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.15s' }}>
                  <div className="feature-card-icon">🖨️</div>
                  <h4>店頭ポップ印刷</h4>
                  <p>A4 / B5を管理画面から印刷。レジ横に置くだけで、お客様が自分から登録。</p>
                </div>
              </div>
            </div>

            <div className="feature-group">
              <div className="feature-group-head reveal">
                <span className="feature-group-num">3</span>
                <div>
                  <h3>もっと極めたい人へ</h3>
                  <p>慣れてきたら、ここから。仕組みをさらに強くできます。</p>
                </div>
                <span className="feature-group-tag is-pro">PRO</span>
              </div>
              <div className="feature-cards">
                <div className="feature-card tilt-in">
                  <div className="feature-card-icon">🐾</div>
                  <h4>ステップアップクーポン</h4>
                  <p>来店ごとに段階的に特典アップ。最大10段階まで設計可能。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.05s' }}>
                  <div className="feature-card-icon">🔄</div>
                  <h4>連続クーポン</h4>
                  <p>消込と同時に、次回分のクーポンを自動発行。来店サイクルを短縮。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.1s' }}>
                  <div className="feature-card-icon">🎂</div>
                  <h4>記念日・誕生日クーポン</h4>
                  <p>年1回の特別な日に、自動でお祝いクーポンを配信。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.15s' }}>
                  <div className="feature-card-icon">💤</div>
                  <h4>休眠復活クーポン</h4>
                  <p>離反しかけた顧客に、自動で復帰クーポンを届けます。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.2s' }}>
                  <div className="feature-card-icon">📅</div>
                  <h4>予約配信・定期配信</h4>
                  <p>「毎週金曜18時」など、指定日時に自動送信。</p>
                </div>
                {/* 🔥 連続ログイン特典を追加 */}
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.25s' }}>
                  <div className="feature-card-icon">🔥</div>
                  <h4>連続ログイン特典</h4>
                  <p>アプリを開く習慣をつけ、連続達成でクーポンをプレゼント。</p>
                </div>
                {/* 🔗 POS連携を追加 */}
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.3s' }}>
                  <div className="feature-card-icon">🔗</div>
                  <h4>POS連携</h4>
                  <p>お使いのPOSレジと連携。会計と同時にクーポン消込を自動記録。</p>
                </div>
                <div className="feature-card tilt-in" style={{ transitionDelay: '0.35s' }}>
                  <div className="feature-card-icon">🤝</div>
                  <h4>紹介報酬制度</h4>
                  <p>他店舗を紹介すると、PROプランの月額が割引に。詳細は下に。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERFACE */}
        <section className="section section-alt screen-section" id="interface">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Interface</span>
              <h2>シンプルで使いやすい、2つの画面</h2>
              <p>
                お客様が使うのは、QRコードを読み取るだけ。<br />
                店舗オーナーは、見やすい管理画面で全ての施策をコントロールできます。
              </p>
            </div>
            <div className="screen-grid">
              <div className="screen-item">
                <div className="phone-mock float">
                  <div className="phone-screen">
                    <div className="phone-status-bar">
                      <span>9:41</span>
                      <svg width="46" height="12" viewBox="0 0 46 12" fill="none">
                        <rect x="0" y="4" width="3" height="6" fill="#1a202c" />
                        <rect x="5" y="2" width="3" height="8" fill="#1a202c" />
                        <rect x="10" y="0" width="3" height="10" fill="#1a202c" />
                        <rect x="32" y="1" width="12" height="9" rx="2" stroke="#1a202c" strokeWidth="1" fill="none" />
                        <rect x="33.5" y="2.5" width="8" height="6" fill="#1a202c" />
                      </svg>
                    </div>
                    <div className="phone-shop-header">
                      <div className="phone-shop-icon">🍰</div>
                      <div className="phone-shop-name">Patisserie Taro</div>
                      <div className="phone-link-btn">🌐 サイトはこちらから</div>
                    </div>
                    <div className="phone-coupons-scroll">
                      <div className="phone-coupon phone-coupon-first">
                        <span className="phone-coupon-badge">初回限定</span>
                        <div className="phone-coupon-title">🎁 初回限定クーポン</div>
                        <div className="phone-coupon-desc">次回ご来店時にご利用ください</div>
                        <div className="phone-coupon-btn">📱 QRコードを提示する</div>
                      </div>
                      <div className="phone-coupon phone-coupon-normal">
                        <span className="phone-coupon-badge is-green">通常クーポン</span>
                        <div className="phone-coupon-title">🎟️ 会員様 10%OFF</div>
                        <div className="phone-coupon-desc">いつでもご利用いただけます</div>
                        <div className="phone-coupon-btn is-green">📱 QRコードを提示する</div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="screen-caption">
                  📱 お客様側の画面イメージ<br />
                  QRを読み取って、クーポンを提示するだけ
                </p>
              </div>
              <div className="screen-item">
                <div className="dash-mock float">
                  <div className="dash-topbar">
                    <span className="dash-dot red"></span>
                    <span className="dash-dot yellow"></span>
                    <span className="dash-dot green"></span>
                    <span className="dash-url">push-taro.com/pro-shop</span>
                  </div>
                  <div className="dash-body">
                    <div className="dash-header">
                      <div className="dash-header-left">
                        <div className="dash-shop-icon">🍰</div>
                        <div>
                          <div className="dash-title">
                            Patisserie Taro
                            <span className="dash-badge">PRO</span>
                          </div>
                          <div className="dash-email">owner@patisserie-taro.jp</div>
                        </div>
                      </div>
                      <button className="dash-logout">ログアウト</button>
                    </div>
                    {/* タブを6つに変更 */}
                    <div className="dash-tabs">
                      <div className="dash-tab is-active">📢 即時配信</div>
                      <div className="dash-tab">📋 送信履歴</div>
                      <div className="dash-tab">🎫 消込履歴</div>
                      <div className="dash-tab">🏪 店舗設定</div>
                      <div className="dash-tab">🔥 PRO機能</div>
                      <div className="dash-tab">📅 予約</div>
                    </div>
                    <div className="dash-scan-btn">📷 クーポンQRコードを読み取る（消し込み）</div>
                    <div className="dash-form">
                      <div className="dash-form-title">📢 プッシュ通知を作成・即時送信</div>
                      <div className="dash-form-field">
                        <div className="dash-form-label">タイトル</div>
                        <div className="dash-form-input">例: 新着セールのお知らせ</div>
                      </div>
                      <div className="dash-form-field">
                        <div className="dash-form-label">本文</div>
                        <div className="dash-form-textarea">例: 本日から全品20%OFFセール開催中！</div>
                      </div>
                      <div className="dash-form-btn">🔥 Push 通知送信</div>
                    </div>
                  </div>
                </div>
                <p className="screen-caption">
                  💻 店舗オーナー側の管理画面イメージ<br />
                  すべての施策を1画面でコントロール
                </p>
              </div>
            </div>

            {/* カスタマイズ説明 */}
            <div className="screen-customize reveal">
              <div className="screen-customize-icon">🎨</div>
              <div className="screen-customize-body">
                <h3>アイコンも店舗名も、自分のお店のまま。</h3>
                <p>
                  お客様のホーム画面に表示されるアイコンと店舗名は、管理画面から自由に変更できます。<br />
                  画像は<strong>ドラッグ＆ドロップするだけ</strong>。自動で最適化されるので、面倒なリサイズ作業は不要です。<br />
                  お客様にとっては、まるで自店専用のアプリ。愛着も、登録率も、ぐっと上がります。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="section" id="comparison">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Comparison</span>
              <h2>他社ツールとの、<br />決定的な違い。</h2>
              <p>実店舗に特化しているからこそ、できることがあります。</p>
            </div>
            <div className="compare-table-wrap reveal">
              <table className="tool-compare-table">
                <thead>
                  <tr>
                    <th>機能</th>
                    <th className="col-pushtaro">Push-taro</th>
                    <th>汎用プッシュ通知</th>
                    <th>LINE公式</th>
                    <th>メルマガ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>クリック率</td>
                    <td className="col-pushtaro"><strong>最大10倍</strong></td>
                    <td>△ ツール次第</td>
                    <td>○ 高い</td>
                    <td>× 低い</td>
                  </tr>
                  <tr>
                    <td>店頭QRコード登録</td>
                    <td className="col-pushtaro">○ 標準搭載</td>
                    <td>× なし</td>
                    <td>○ 対応</td>
                    <td>× なし</td>
                  </tr>
                  <tr>
                    <td>クーポン機能</td>
                    <td className="col-pushtaro">○ 7種類</td>
                    <td>× なし</td>
                    <td>○ クーポン発行あり</td>
                    <td>× なし</td>
                  </tr>
                  <tr>
                    <td>店頭ポップ印刷</td>
                    <td className="col-pushtaro">○ STANDARD以上<br /><small style={{ color: '#64748b' }}>LIGHTは対象外</small></td>
                    <td>× なし</td>
                    <td>× なし</td>
                    <td>× なし</td>
                  </tr>
                  <tr>
                    <td>従量課金</td>
                    <td className="col-pushtaro">○ なし</td>
                    <td>△ あり</td>
                    <td>× あり</td>
                    <td>△ あり</td>
                  </tr>
                  <tr>
                    <td>セグメント配信</td>
                    <td className="col-pushtaro"><strong>○ あえて非搭載</strong><br /><small style={{ color: '#64748b' }}>実店舗では不要</small></td>
                    <td>△ 専門知識が不可欠</td>
                    <td>△ 費用対効果が合いにくい</td>
                    <td>△ 設定が複雑</td>
                  </tr>
                  <tr>
                    <td>月額</td>
                    <td className="col-pushtaro"><strong>¥1,980〜</strong></td>
                    <td>¥5,000〜</td>
                    <td>¥0〜<br /><small style={{ color: '#64748b' }}>無料プランは月200通まで</small></td>
                    <td>¥3,000〜</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="compare-note reveal">
              <strong>Push-taroが選ばれる理由：</strong>
              実店舗に本当に必要なものだけを、シンプルに。大手ツールの真似ではなく、現場に寄り添った設計です。来店回数に応じて7種類のクーポンを自動発行し、お客さんのホーム画面に自店のアイコンが残ります。配信数が増えても、料金は固定で読みやすい設計です。
            </div>
          </div>
        </section>

        {/* COUPONS */}
        <section className="section section-alt" id="coupons">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Coupons</span>
              <h2>7つのクーポンを、<br />「誰に配るか」で選ぶ。</h2>
              <p>機能の名前ではなく、目的で選べるようにしました。<br />お店の状況に合わせて、必要なものだけ使えます。</p>
            </div>
            <div className="coupon-groups">
              <div className="coupon-group">
                <div className="coupon-group-head reveal">
                  <span className="coupon-group-label">全員に配る</span>
                  <h3>まずは、ここから。</h3>
                </div>
                <div className="coupon-group-cards">
                  <div className="coupon-card is-all tilt-in-left">
                    <span className="coupon-plan is-all">全プラン</span>
                    <div className="coupon-card-icon">🎫</div>
                    <h4>初回クーポン</h4>
                    <p>通知登録と同時に自動配布。「今すぐ使える」特典で、登録の後押しをします。</p>
                  </div>
                  <div className="coupon-card is-std tilt-in-right">
                    <span className="coupon-plan is-std">STANDARD+</span>
                    <div className="coupon-card-icon">🎟️</div>
                    <h4>通常クーポン</h4>
                    <p>登録者が何度でも使える常設クーポン。「会員様特典」として運用できます。</p>
                  </div>
                </div>
              </div>
              <div className="coupon-group">
                <div className="coupon-group-head reveal">
                  <span className="coupon-group-label is-std">来てくれる人へ</span>
                  <h3>感謝を、カタチに。</h3>
                </div>
                <div className="coupon-group-cards">
                  <div className="coupon-card is-std tilt-in-left">
                    <span className="coupon-plan is-std">STANDARD+</span>
                    <div className="coupon-card-icon">🏆</div>
                    <h4>特別達成クーポン</h4>
                    <p>N回来店で解放。「あと1回」の心理が、自然な来店動機になります。</p>
                  </div>
                  <div className="coupon-card is-pro tilt-in">
                    <span className="coupon-plan is-pro">PRO</span>
                    <div className="coupon-card-icon">🐾</div>
                    <h4>ステップアップクーポン</h4>
                    <p>来店ごとに段階的に特典アップ。習慣化を強力に後押しします。</p>
                  </div>
                  <div className="coupon-card is-pro tilt-in-right">
                    <span className="coupon-plan is-pro">PRO</span>
                    <div className="coupon-card-icon">🔄</div>
                    <h4>連続クーポン</h4>
                    <p>消込と同時に次回分を自動発行。来店サイクルを短縮します。</p>
                  </div>
                </div>
              </div>
              <div className="coupon-group">
                <div className="coupon-group-head reveal">
                  <span className="coupon-group-label is-pro">特別な日に</span>
                  <h3>忘れられない日に。</h3>
                </div>
                <div className="coupon-group-cards">
                  <div className="coupon-card is-pro tilt-in-left">
                    <span className="coupon-plan is-pro">PRO</span>
                    <div className="coupon-card-icon">🎂</div>
                    <h4>記念日・誕生日クーポン</h4>
                    <p>年1回の特別な日に、自動でお祝いを。特別感がファン化を加速させます。</p>
                  </div>
                  <div className="coupon-card is-pro tilt-in-right">
                    <span className="coupon-plan is-pro">PRO</span>
                    <div className="coupon-card-icon">💤</div>
                    <h4>休眠復活クーポン</h4>
                    <p>離反しかけた顧客に、自動で復帰クーポンを。静かな呼び戻しの仕組み。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="section section-alt" id="pricing">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Pricing</span>
              <h2>明快でリーズナブルな料金プラン</h2>
              <p>店舗規模やマーケティング目的に合わせて選べる3つのプラン。<br />追加の従量課金は一切ありません。</p>
            </div>
            <div className="plans">
              <div className="plan is-light tilt-in">
                <div className="plan-name">LIGHT</div>
                <div className="plan-amount">¥1,980<small>/月（税別）</small></div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>税込 ¥2,178/月</div>
                <div className="plan-limit">月間配信上限: 5,000通</div>
                <div className="plan-limit">お試しプラン ― まずはプッシュが届く感覚を確かめたい店舗に</div>
                <ul className="plan-features">
                  <li><span className="maru">○</span><span>プッシュ通知（全デバイス対応）</span></li>
                  <li><span className="maru">○</span><span>QRコード登録</span></li>
                  <li><span className="maru">○</span><span><strong>初回クーポン</strong></span></li>
                  <li><span className="maru">○</span><span>即時配信・履歴管理</span></li>
                  <li><span className="maru">○</span><span>月間上限ゲージ表示</span></li>
                </ul>
                <Link href="/signup" className="plan-cta">LIGHTで始める</Link>
              </div>
              <div className="plan is-standard tilt-in" style={{ transitionDelay: '0.12s' }}>
                <div className="plan-name">STANDARD</div>
                <div className="plan-amount">¥3,800<small>/月（税別）</small></div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>税込 ¥4,180/月</div>
                <div className="plan-limit">月間配信上限: 15,000通</div>
                <div className="plan-limit">予算を抑えて始めるなら</div>
                <ul className="plan-features">
                  <li><span className="maru">○</span><span>LIGHTの全機能</span></li>
                  <li><span className="maru">○</span><span><strong>通常クーポン</strong></span></li>
                  <li><span className="maru">○</span><span><strong>特別達成クーポン</strong></span></li>
                  <li><span className="maru">○</span><span><strong>開封率の確認</strong></span></li>
                  <li><span className="maru">○</span><span><strong>店頭ポップ印刷（A4/B5）</strong><span className="new-badge">NEW</span></span></li>
                  <li><span className="maru">○</span><span>拡大された配信枠（15,000通）</span></li>
                </ul>
                <Link href="/signup" className="plan-cta">STANDARDで始める</Link>
              </div>
              <div className="plan is-pro tilt-in" style={{ transitionDelay: '0.24s' }}>
                <span className="plan-badge best">おすすめ</span>
                <div className="plan-name">PRO</div>
                <div className="plan-amount">¥10,000<small>/月（税別）</small></div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>税込 ¥11,000/月</div>
                <div className="plan-limit">配信無制限</div>
                <div className="plan-limit">基本はこれ ― 店舗リピート対策、ほぼ全部入り</div>
                <ul className="plan-features">
                  <li><span className="maru">○</span><span>STANDARDの全機能</span></li>
                  <li><span className="maru">○</span><span><strong>ステップアップクーポン</strong></span></li>
                  <li><span className="maru">○</span><span><strong>連続クーポン</strong></span></li>
                  <li><span className="maru">○</span><span><strong>記念日・誕生日クーポン</strong></span></li>
                  <li><span className="maru">○</span><span><strong>休眠復活クーポン</strong></span></li>
                  <li><span className="maru">○</span><span><strong>予約配信・定期配信</strong></span></li>
                  <li><span className="maru">○</span><span><strong>連続ログイン特典</strong><span className="new-badge">NEW</span></span></li>
                  <li><span className="maru">○</span><span><strong>POS連携（API連携）</strong><span className="new-badge">NEW</span></span></li>
                  <li><span className="maru">○</span><span><strong>紹介報酬制度（10% or 20%×2件）</strong></span></li>
                </ul>
                <Link href="/signup" className="plan-cta">PROで始める</Link>
              </div>
            </div>

            <div className="compare-wrap reveal">
              <div className="compare-title">
                <h3>プラン別 機能一覧</h3>
                <p>ご契約プランによって使える機能が異なります。</p>
              </div>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>機能</th>
                    <th className="col-light">LIGHT</th>
                    <th className="col-standard">STANDARD</th>
                    <th className="col-pro">PRO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="group"><td colSpan={4}>基本機能</td></tr>
                  <tr>
                    <td>プッシュ通知の配信</td>
                    <td><span className="val-text">月5,000通</span></td>
                    <td className="col-standard"><span className="val-text">月15,000通</span></td>
                    <td className="col-pro"><span className="val-text">配信無制限</span></td>
                  </tr>
                  <tr>
                    <td>QRコード顧客獲得</td>
                    <td><span className="maru">○</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>即時配信・履歴管理</td>
                    <td><span className="maru">○</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>顧客管理ダッシュボード</td>
                    <td><span className="maru">○</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr className="group"><td colSpan={4}>クーポン機能</td></tr>
                  <tr>
                    <td>🎫 初回クーポン</td>
                    <td><span className="maru">○</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>🎟️ 通常クーポン</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>🏆 特別達成クーポン</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>🐾 ステップアップクーポン</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="batsu">×</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>🔄 連続クーポン</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="batsu">×</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>🎂 記念日・誕生日クーポン</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="batsu">×</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>💤 休眠復活クーポン</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="batsu">×</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>🔥 連続ログイン特典 <span className="new-badge">NEW</span></td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="batsu">×</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr className="group"><td colSpan={4}>配信・分析</td></tr>
                  <tr>
                    <td>📊 開封率の確認</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>📅 予約配信・定期配信</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="batsu">×</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr className="group"><td colSpan={4}>販促ツール</td></tr>
                  <tr>
                    <td>🖨️ 店頭ポップ印刷（A4）<span className="new-badge">NEW</span></td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>🖨️ 店頭ポップ印刷（B5）<span className="new-badge">NEW</span></td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="maru">○</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr className="group"><td colSpan={4}>外部連携・収益化</td></tr>
                  <tr>
                    <td>🔗 POS連携（API）<span className="new-badge">NEW</span></td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="batsu">×</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                  <tr>
                    <td>🤝 紹介報酬制度（最大10%）</td>
                    <td><span className="batsu">×</span></td>
                    <td className="col-standard"><span className="batsu">×</span></td>
                    <td className="col-pro"><span className="maru">○</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* POS INTEGRATION */}
        <section className="section multi-store-section" id="multi-store">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">POS Integration</span>
              <h2>スーパーや大型店でも、<br />今お使いのPOSレジに繋いで使える。</h2>
              <p>
                複数レジを運用する店舗向けに、POS連携APIを提供しています。<br />
                API連携に対応したPOSなら、仕様書を渡すだけで実装可能。<br />
                未対応のPOSでも、USB接続のQRリーダーで読み取れます。
              </p>
            </div>
            <div className="multi-store-cta reveal">
              <Link href="/guide/pos-integration" className="btn-primary">
                POS連携の詳細を見る
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

               {/* PRO REFERRAL */}
        <section className="section" id="pro-referral">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">PRO Referral</span>
              <h2>PROプランなら、<br />紹介で、もっとお得に。</h2>
              <p>他店舗を紹介すると、PROプランの月額が割引されます。<br />2つの選択肢から、あなたに合った方を選べます。</p>
            </div>
            <div className="referral-choices">
              <div className="referral-choice tilt-in-left">
                <span className="referral-badge is-a">選択肢 A</span>
                <h3>じっくり型</h3>
                <div className="referral-rate">10%<small>継続還元</small></div>
                <p>紹介した店舗が契約している限り、毎月10%が還元されます。</p>
                <ul>
                  <li>紹介数は無制限</li>
                  <li>10店舗紹介でPROが実質無料</li>
                  <li>11店舗目以降はプラス収益</li>
                </ul>
              </div>
              <div className="referral-choice is-featured tilt-in-right">
                <span className="referral-badge is-b">選択肢 B</span>
                <h3>がっつり型</h3>
                <div className="referral-rate">20%<small>×2件で40%OFF</small></div>
                <p>2件だけ、20%の高還元。2件紹介すれば、PROが6,000円に。</p>
                <ul>
                  <li>1件あたり20%還元</li>
                  <li>2件紹介で、月額6,000円</li>
                  <li>短期集中で大きく割引</li>
                </ul>
              </div>
            </div>
            <div className="referral-note reveal">
              <p>※ 選択肢は登録時に選択してください。登録後の変更はできません。</p>
            </div>
          </div>
        </section>
        {/* PARTNERS */}
        <section className="section section-dark" id="partners">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Revenue Programs</span>
              <h2>3つの収益化プログラムを標準搭載</h2>
              <p>
                Push-taroは、店舗自身が「稼ぐ側」にもなれるプラットフォーム。<br />
                あなたのネットワークが、毎月の安定収益に変わります。
              </p>
            </div>
            <div className="partner-grid">
              <div className="partner-card tilt-in">
                <div className="partner-icon">👑</div>
                <h3>代理店パートナー</h3>
                <div className="partner-rate">最大 45%</div>
                <p>紹介した店舗のプラン・契約数に応じて報酬率がステップアップ。中長期的に安定した収益源になります。</p>
                <ul>
                  <li>PRO 30% / その他 18%（基本）</li>
                  <li>101社紹介で 36%、201社以上で 45%</li>
                  <li>加盟金 ¥300,000 + 月額 ¥30,000</li>
                </ul>
                <Link href="/agency" className="partner-cta">詳細を見る →</Link>
              </div>
              <div className="partner-card tilt-in" style={{ transitionDelay: '0.12s' }}>
                <div className="partner-icon">🤝</div>
                <h3>PRO紹介制度</h3>
                <div className="partner-rate">毎月 10%</div>
                <p>PROプランをご契約中の店舗が他店舗を紹介するだけで、毎月10%の報酬が還元。10店舗紹介でPROプランが実質無料に。</p>
                <ul>
                  <li>紹介店舗が契約中は毎月発生</li>
                  <li>10店舗で実質無料化</li>
                  <li>管理画面から即時参加可能</li>
                </ul>
                <Link href="/signup" className="partner-cta">PROプランで始める →</Link>
              </div>
              <div className="partner-card tilt-in" style={{ transitionDelay: '0.24s' }}>
                <div className="partner-icon">📢</div>
                <h3>アフィリエイト</h3>
                <div className="partner-rate">8% または 単発</div>
                <p>ブログ・SNS・知人紹介など、自由な方法で店舗を紹介。初期費用・月額費用0円で、リスクなく始められます。</p>
                <ul>
                  <li>継続課金型: 初年度8%・13ヶ月目以降5%</li>
                  <li>単発型: PRO¥5,000 / STD¥2,000 / LIGHT¥1,000</li>
                  <li>累計5,000円で振込申請</li>
                </ul>
                <Link href="/affiliate/signup" className="partner-cta">今すぐ登録 →</Link>
              </div>
            </div>
            <div className="partner-cta-row reveal">
              <Link href="/partners" className="partner-main-cta">
                3つの収益化プログラムを、詳しく見る →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">FAQ</span>
              <h2>よくあるご質問</h2>
              <p>その他ご不明な点は、お気軽にお問い合わせください。</p>
            </div>
            <div className="faq-list">
              {faqs.map((f, i) => (
                <details key={f.q} className="faq-item reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                  <summary>
                    {f.q}
                    <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" stroke="#ff4500" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </summary>
                  <div className="faq-answer">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="cta-final" id="cta">
          <div className="cta-final-inner reveal">
            <h2>
              お客様に喜んで頂ける、<br />
              お店づくりを、一緒に。
            </h2>
            <p>
              Push-taroは、実店舗の「喜んで頂ける仕組み」を<br />
              プッシュ通知 × クーポンアプリ で自動化するプラットフォームです。<br />
              まずはお気軽に、無料相談・資料請求から。
            </p>
            <div className="cta-final-actions">
              <Link href="/signup" className="btn-primary">
                👑 今すぐ申し込む
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/contact" className="btn-secondary">
                📩 まずはご相談
              </Link>
            </div>
            <div className="cta-note">※ 2026年9月 正式リリース。</div>
          </div>
        </section>
      </main>

           {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                  <defs>
                    <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ff6b6b" />
                      <stop offset="100%" stopColor="#ff4500" />
                    </linearGradient>
                  </defs>
                  <circle cx="24" cy="24" r="23" fill="url(#footerLogoGrad)" />
                  <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
                  <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
                  <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
                  <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
                  <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
                </svg>
                <span>Push-taro<span className="dot">.</span></span>
              </div>
              <p className="footer-desc">
                実店舗のリピート施策を「プッシュ通知 × クーポンアプリ」で自動化するSaaS。<br />
                集めるのは電話番号だけ。QRコード一つで始められます。
              </p>
              <div className="footer-badge">
                <span className="footer-badge-dot"></span>
                2026年9月 サービス開始
              </div>
            </div>
            <div className="footer-links-wrap">
              {/* 👇 サービスメニューを整理 */}
              <div className="footer-col">
                <h4 className="footer-col-title">サービス</h4>
                <ul className="footer-col-list">
                  <li><Link href="/">Push-taro トップ</Link></li>
                  <li><Link href="/guide/pos-integration">POSレジ連携</Link></li>
                  <li><Link href="/guide/features/store-pop">店頭POP印刷</Link></li>
                  <li><Link href="/partners">収益化プログラム</Link></li>
                </ul>
              </div>
              
              {/* 👇 ガイドメニューはこちらに集約 */}
              <div className="footer-col">
                <h4 className="footer-col-title">活用ガイド</h4>
                <ul className="footer-col-list">
                  <li><Link href="/guide">ガイドTOP</Link></li>
                  <li><Link href="/guide/features">機能別ガイド</Link></li>
                  <li><Link href="/guide/ng-actions">NG行為集</Link></li>
                </ul>
              </div>
              
              <div className="footer-col">
                <h4 className="footer-col-title">サポート</h4>
                <ul className="footer-col-list">
                  <li><Link href="/contact">お問い合わせ</Link></li>
                  <li><Link href="/terms">利用規約</Link></li>
                  <li><Link href="/privacy">プライバシーポリシー</Link></li>
                  <li><Link href="/tokusho">特定商取引法</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">&copy; 2026 Push-taro All Rights Reserved. ｜ 運営：the合同会社</p>
            <p className="footer-address">〒357-0123 埼玉県飯能市中下郷23-21</p>
          </div>
        </div>
      </footer>
    </>
  );
}
