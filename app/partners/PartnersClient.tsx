'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PromoToolsModal from '@/components/PromoToolsModal';
import './partners.css';
import { faqs } from './data/faq';

/* ============================================================
   スクロール出現フック
============================================================ */
function useScrollReveal() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const selectors = [
      '.reveal', '.reveal-left', '.reveal-right',
      '.tilt-in', '.tilt-in-left', '.tilt-in-right',
    ];
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

/* ============================================================
   カウントアップフック
============================================================ */
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

export default function PartnersClient() {
  useScrollReveal();
  useCountUp();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [promoModalOpen, setPromoModalOpen] = useState(false);

  return (
    <main className="partners-page">
      {/* ナビゲーション */}
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="logo">
            <svg className="logo-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ff6b6b" />
                  <stop offset="100%" stopColor="#ff4500" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="23" fill="url(#logoGrad)" />
              <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
              <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
              <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
              <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
              <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
            </svg>
            Push-taro<span>.</span>
            <small>みんなの<span>プッシュ通知</span></small>
          </Link>
          <a href="#cta-final" className="nav-cta">
            <i className="fas fa-rocket"></i> 今すぐ参加
          </a>
        </div>
      </nav>

      {/* ヒーロー */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-badge reveal">
            <span className="dot"></span>
            2026年9月サービス開始
          </div>
          <h1 className="reveal">
            みんなで広げる、<br />
            <span className="highlight">ストック収益</span>の新時代
          </h1>
          <p className="reveal" style={{ transitionDelay: '0.1s' }}>
            Push-taroの<strong>代理店・紹介・アフィリエイト</strong> – 3つの収益化プログラムで、
            あなたのネットワークを毎月の安定収益に変えませんか？
          </p>
          <div className="hero-cta-group reveal" style={{ transitionDelay: '0.2s' }}>
            <a href="#programs" className="btn-primary">
              <i className="fas fa-arrow-right"></i> プログラムを比較する
            </a>
            <a href="/" className="btn-secondary">
              <i className="fas fa-file-alt"></i> Push-taroを詳しく見る
            </a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat tilt-in">
              <div className="hero-stat-num"><span className="count-up" data-count="3">3</span><small>種</small></div>
              <div className="hero-stat-label">収益化プログラム</div>
            </div>
            <div className="hero-stat tilt-in" style={{ transitionDelay: '0.1s' }}>
              <div className="hero-stat-num"><span className="count-up" data-count="500">500</span><small>店舗獲得</small></div>
              <div className="hero-stat-label">最大年間報酬 約2,650万円</div>
            </div>
            <div className="hero-stat tilt-in" style={{ transitionDelay: '0.2s' }}>
              <div className="hero-stat-num"><span className="count-up" data-count="45">45</span><small>%</small></div>
              <div className="hero-stat-label">PRO紹介報酬（201店舗〜）</div>
            </div>
            <div className="hero-stat tilt-in" style={{ transitionDelay: '0.3s' }}>
              <div className="hero-stat-num">¥0</div>
              <div className="hero-stat-label">アフィリエイト初期費用</div>
            </div>
          </div>
        </div>
      </section>

     {/* ============================================================
    ストックビジネスとは
============================================================ */}
<section className="section stock-basics-section" id="stock-basics">
  <div className="container">
    <div className="section-title reveal">
      <span className="tag">STOCK BUSINESS</span>
      <h2>そもそも、ストックビジネスとは？</h2>
      <p>「ネットワークビジネス？」「怪しい？」——そう誤解されがちですが、まったく別物です。</p>
    </div>

    {/* ブロック1：定義 */}
    <div className="stock-basics-def reveal">
      <div className="stock-basics-def-card">
        <div className="stock-basics-def-icon">📊</div>
        <h3>毎月、解約されるまで永続的に収入が得られるビジネスモデル</h3>
        <p>
          近年よく目にする<strong>「サブスク」</strong>は、まさにストックビジネスです。<br />
          元々は<strong>携帯電話・家賃</strong>などが代表例で、1度契約したら、毎月解約されるまで永続的に収入が続きます。
        </p>
      </div>
    </div>

    {/* ブロック2：積み上がる仕組み */}
    <div className="stock-basics-flow reveal">
      <h3 className="stock-basics-flow-title">増えた分が、毎月積み上がっていく</h3>
      <div className="stock-basics-flow-grid">
        <div className="stock-basics-flow-item">
          <div className="stock-basics-flow-label">初月</div>
          <div className="stock-basics-flow-main">新規 3件</div>
          <div className="stock-basics-flow-result">報酬 3件分</div>
        </div>
        <div className="stock-basics-flow-arrow">→</div>
        <div className="stock-basics-flow-item">
          <div className="stock-basics-flow-label">2ヶ月目</div>
          <div className="stock-basics-flow-main">新規 5件</div>
          <div className="stock-basics-flow-result">3件 + 5件 = <strong>8件分</strong></div>
        </div>
        <div className="stock-basics-flow-arrow">→</div>
        <div className="stock-basics-flow-item is-final">
          <div className="stock-basics-flow-label">3ヶ月目</div>
          <div className="stock-basics-flow-main">新規 7件</div>
          <div className="stock-basics-flow-result">8件 + 7件 = <strong>15件分</strong></div>
        </div>
      </div>
      <p className="stock-basics-flow-note">
        このように、<strong>解約されるまで積み上がっていく</strong>のが、ストックビジネスの素晴らしいところ。
      </p>
    </div>

    {/* ブロック3：最大の強み */}
    <div className="stock-basics-merit reveal">
      <div className="stock-basics-merit-inner">
        <div className="stock-basics-merit-icon">💪</div>
        <h3>最大の強みは、<br />「毎月ゼロスタートではない」こと。</h3>
        <p>
          通常の営業は、常に新規獲得が基本。既存顧客からの紹介を得ても、基本的には<strong>毎月ゼロからのスタート</strong>です。<br /><br />
          一方、ストックビジネスは<strong>積み上げ式</strong>。1件あたりの月額報酬は少なくても、解約されるまで永続的に続き、
          <strong>長くやればやるほど、積み上げが大きくなる</strong>——努力がそのまま残っていくビジネスモデルです。
        </p>
      </div>
    </div>

    {/* ブロック4：落とし穴 */}
    <div className="stock-basics-risk reveal">
      <div className="stock-basics-risk-head">
        <span className="stock-basics-risk-badge">⚠️ 落とし穴</span>
        <h3>拡大するほど、経費が増える</h3>
      </div>
      <p>
        商品を仕入れて使わせる、物理的なサービスを提供する場合——<br />
        <strong>メンテナンス費用、物理的なハードル、会員数増加への対応</strong>など、増える分だけ負担も増えていきます。
      </p>
      <div className="stock-basics-risk-example">
        <div className="stock-basics-risk-row">
          <span>利益が <strong>2倍</strong> に増える</span>
          <span>→</span>
          <span>メンテナンス費用が <strong>3倍</strong> にかかる可能性</span>
        </div>
      </div>
      <p className="stock-basics-risk-note">
        これは、1件あたりの月額収益が少ないストックビジネスにおいて、とても重要な課題です。
      </p>
    </div>

    {/* ブロック5：BtoCの限界 → BtoBの可能性 */}
    <div className="stock-basics-btob reveal">
      <h3 className="stock-basics-btob-title">
        BtoCのサブスクは、<br />
        <span className="accent">流行り廃りが早く、設備投資が重い。</span>
      </h3>
      <div className="stock-basics-btob-compare">
        <div className="stock-basics-btob-card is-btoc">
          <span className="stock-basics-btob-badge">BtoC の難しさ</span>
          <ul>
            <li>ジム・エステなどは<strong>新規設備導入が毎年必要</strong>なケースも</li>
            <li>広告費をかけないと<strong>人が集まらない</strong></li>
            <li>軌道に乗る前に<strong>流行りが変わる</strong></li>
          </ul>
        </div>
        <div className="stock-basics-btob-card is-btob">
          <span className="stock-basics-btob-badge">BtoB の可能性</span>
          <ul>
            <li>商売の目的で使うものを<strong>サブスクで提供</strong></li>
            <li>POSレジ・コピー機のような<strong>業務インフラ</strong></li>
            <li>代理店事業として提供しているサービスは<strong>非常に少ない</strong></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

   {/* ============================================================
    Push-taro代理店の強み
============================================================ */}
<section className="section stock-strength-section" id="strength">
  <div className="container">
    <div className="section-title reveal">
      <span className="tag">STRENGTH</span>
      <h2>
        だから、Push-taroの代理店は、<br />
        <span className="accent">「売りやすい」</span>。
      </h2>
      <p>他のSaaS代理店にはない、明確な強みがあります。</p>
    </div>

    {/* 強み① リスクゼロ */}
    <div className="strength-block reveal">
      <div className="strength-block-head">
        <span className="strength-block-num">01</span>
        <div>
          <h3>在庫ゼロ・ノルマなし・アフターリスクゼロ</h3>
          <p>始めるのも、続けるのも、リスクがありません。</p>
        </div>
      </div>
      <div className="strength-block-grid">
        <div className="strength-item">
          <div className="strength-item-icon">📦</div>
          <h4>在庫ゼロ</h4>
          <p>デジタル商材なので、仕入れも保管も不要</p>
        </div>
        <div className="strength-item">
          <div className="strength-item-icon">🎯</div>
          <h4>ノルマなし</h4>
          <p>販売ノルマは一切なし。1件から始められる</p>
        </div>
        <div className="strength-item">
          <div className="strength-item-icon">🛠️</div>
          <h4>アフターリスクゼロ</h4>
          <p>導入後のサポートは、管理画面の取説と簡単な操作で完結</p>
        </div>
      </div>
      <div className="strength-block-note">
        <strong>導入してもらったら、あとは質問を受けるだけ。</strong><br />
        使い方はシンプルで、取扱説明も管理画面からいつでも確認可能。ほぼアフターの手間がかかりません。
      </div>
    </div>

    {/* 強み② 売りやすい */}
    <div className="strength-block reveal">
      <div className="strength-block-head">
        <span className="strength-block-num">02</span>
        <div>
          <h3>「売りやすい」には、明確な理由がある</h3>
          <p>顧客リピートツールとして、圧倒的な条件が揃っています。</p>
        </div>
      </div>
      <div className="strength-reasons">
        <div className="strength-reason">
          <div className="strength-reason-icon">💡</div>
          <div>
            <h4>店舗の「永遠のテーマ」を解決</h4>
            <p>既存客への告知・リピート施策は、どの店舗も弱い。そこへの解決策として、刺さりやすい。</p>
          </div>
        </div>
        <div className="strength-reason">
          <div className="strength-reason-icon">💰</div>
          <div>
            <h4>リピートツールでは破格の価格</h4>
            <p>導入費用0円、最高でも月額10,000円。しかも縛りなし。他社では考えられない条件。</p>
          </div>
        </div>
        <div className="strength-reason">
          <div className="strength-reason-icon">⚡</div>
          <div>
            <h4>安いだけじゃない</h4>
            <p>プッシュ通知・クーポン機能を本格搭載。価格に見合わない、圧倒的な機能群。</p>
          </div>
        </div>
        <div className="strength-reason">
          <div className="strength-reason-icon">🏆</div>
          <div>
            <h4>この仕様の代理店制度は、他にほぼ存在しない</h4>
            <p>「この価格」「この機能」「この条件」を兼ね備えた代理店制度は、他に探してもありません。</p>
          </div>
        </div>
      </div>
    </div>

    {/* 強み③ やることはシンプル */}
    <div className="strength-block reveal">
      <div className="strength-block-head">
        <span className="strength-block-num">03</span>
        <div>
          <h3>やることは、シンプル。</h3>
          <p>新規顧客を開拓して、積み上げていくだけ。</p>
        </div>
      </div>
      <div className="strength-simple">
        <div className="strength-simple-main">
          <div className="strength-simple-icon">📈</div>
          <p>
            <strong>新規顧客開拓 → 紹介 → 契約 → 積み上げ</strong><br />
            ストック型なので、一度紹介した店舗が契約を続ける限り、毎月報酬が積み上がります。
          </p>
        </div>
        <div className="strength-simple-sub">
          <span className="strength-simple-badge">卸業者様へ</span>
          <p>
            <strong>通常業務に合わせるだけ。</strong><br />
            既存のお取引先に、新サービスとしてPush-taroをご紹介いただくだけで、簡単に顧客獲得が見込めます。
          </p>
        </div>
      </div>
    </div>

    {/* 結論 */}
    <div className="strength-conclusion reveal">
      <h3>
        在庫ゼロ・ノルマなし・アフターリスクゼロ。<br />
        この条件で、<span className="accent">新規顧客を開拓するだけ。</span>
      </h3>
      <p>
        Push-taroの代理店は、<strong>「売りやすさ」と「続けやすさ」</strong>の両方を備えた、稀有なビジネスモデルです。
      </p>
      <div className="strength-conclusion-cta">
        <a href="#cta-final" className="btn-primary">
          代理店パートナーに申し込む
          <i className="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  </div>
</section>

      {/* 市場の成長性 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">WHY NOW</span>
            <h2>なぜ今、Webプッシュ通知なのか？</h2>
            <p>実店舗のDXニーズが高まる中、Webプッシュ通知はメルマガを超える新たな顧客接点として急成長しています。</p>
          </div>
          <div className="market-grid">
            <div className="market-card tilt-in">
              <div className="number">
                ~<span className="count-up num-main" data-count="3">3</span><span className="num-suffix">倍</span>
              </div>
              <p>メルマガ比の開封率</p>
            </div>
            <div className="market-card tilt-in" style={{ transitionDelay: '0.08s' }}>
              <div className="number">
                <span className="count-up num-main" data-count="94">94</span><span className="num-suffix">%</span>
              </div>
              <p>日本のスマートフォン普及率</p>
            </div>
            <div className="market-card tilt-in" style={{ transitionDelay: '0.16s' }}>
              <div className="number">2026.9</div>
              <p>Push-taro サービス開始</p>
            </div>
            <div className="market-card tilt-in" style={{ transitionDelay: '0.24s' }}>
              <div className="number">今</div>
              <p>先行者利益を掴む絶好のチャンス</p>
            </div>
          </div>
        </div>
      </section>

       {/* ============================================================
    緊急告知：加盟金キャンペーン
============================================================ */}
<section className="urgency-section">
  <div className="container">
    <div className="urgency-box reveal">
      <div className="urgency-label">🔥 先着15社限定</div>
      <h2 className="urgency-title">
        加盟金 <span className="urgency-old">¥1,000,000</span>
        <span className="urgency-new">¥300,000</span>
      </h2>
      <p className="urgency-text">
        加盟金は<strong>100万円（税別）</strong>。<br />
        先行パートナー第1期生として、<strong>先着15社に限り30万円（税別）</strong>でご案内中。<br />
        <strong>15社に達し次第、順次価格を引き上げ、最終的に100万円となります。</strong>
      </p>
      <div className="urgency-slots">
        <div className="urgency-slots-label">現在の受付状況</div>
        <div className="urgency-slots-bar">
          {/* 40% から 66% にバーを伸ばす */}
          <div className="urgency-slots-fill" style={{ width: '66%' }}></div>
        </div>
        <div className="urgency-slots-text">
          {/* テキストを 残り5社 (10社申込済み) に変更 */}
          <span>残り <strong>5社</strong>（10社 申込済み）</span>
          <span>※ 2026年10月30日時点</span>
        </div>
      </div>
      <a href="#cta-final" className="urgency-cta">
        👑 30万円で申し込む（先着順）
        <i className="fas fa-arrow-right"></i>
      </a>
      <p className="urgency-note">
        ※ 加盟金は税別です。15社到達後は、順次価格が上昇します。
      </p>
    </div>
  </div>
</section>

      {/* 3つの収益化プログラム */}
      <section className="section" id="programs">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">3 PROGRAMS</span>
            <h2>あなたに合った収益化プログラム</h2>
            <p>事業規模やスタイルに合わせて、最適なプログラムをお選びいただけます。</p>
          </div>

          <div className="program-grid">
            <div className="program-card tilt-in">
              <span className="badge">BEST</span>
              <div className="emoji-big">👑</div>
              <h3>代理店パートナー</h3>
              <div className="sub">法人・事業者向け｜最大級のストック収益</div>
              <div className="price-table">
                <div className="row"><span className="label">加盟金（先着15社限定）</span><span className="value highlight">¥300,000<small style={{ textDecoration: 'line-through', color: '#94a3b8', marginLeft: '6px', fontSize: '12px' }}>¥1,000,000</small></span></div>
                <div className="row"><span className="label">月額費用</span><span className="value">¥30,000</span></div>
                <div className="row"><span className="label">PRO紹介報酬</span><span className="value highlight">30% → 45%</span></div>
                <div className="row"><span className="label">Standard/Light紹介報酬</span><span className="value highlight">18%</span></div>
              </div>
              <ul className="features">
                <li><i className="fas fa-check-circle"></i> 専用ダッシュボード & 優先サポート</li>
                <li><i className="fas fa-check-circle"></i> 販促素材・テンプレート提供</li>
                <li><i className="fas fa-check-circle"></i> 紹介店舗が継続する限り報酬発生</li>
                <li><i className="fas fa-check-circle"></i> 300社紹介で月収 <strong>122万円</strong> 超</li>
              </ul>
              <Link href="/agency" className="cta-link">
                今すぐ申し込み <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="program-card tilt-in" style={{ transitionDelay: '0.12s' }}>
              <span className="badge blue">PRO限定</span>
              <div className="emoji-big">🤝</div>
              <h3>紹介制度</h3>
              <div className="sub">PROプラン契約者向け｜実質無料化が可能</div>
              <div className="price-table">
                <div className="row"><span className="label">参加条件</span><span className="value">PROプラン契約</span></div>
                <div className="row"><span className="label">紹介報酬（全プラン一律）</span><span className="value highlight">10%</span></div>
                <div className="row"><span className="label">換金条件</span><span className="value">累計 ¥10,000</span></div>
              </div>
              <ul className="features">
                <li><i className="fas fa-check-circle"></i> 紹介した店舗が続く限り <strong>毎月継続</strong></li>
                <li><i className="fas fa-check-circle"></i> PRO 10件紹介で <strong>実質無料</strong></li>
                <li><i className="fas fa-check-circle"></i> 20件紹介で月収 <strong>20,000円</strong></li>
                <li><i className="fas fa-check-circle"></i> 管理画面から即時参加可能</li>
              </ul>
              <Link href="/signup" className="cta-link outline">
                PROプランで始める <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="program-card tilt-in" style={{ transitionDelay: '0.24s' }}>
              <span className="badge green">NEW</span>
              <div className="emoji-big">📢</div>
              <h3>アフィリエイト</h3>
              <div className="sub">誰でもOK｜リスクフリーで副収入</div>
              <div className="price-table">
                <div className="row"><span className="label">参加条件</span><span className="value">なし（誰でもOK）</span></div>
                <div className="row"><span className="label">継続課金型（全プラン一律）</span><span className="value highlight">初年度8%（13ヶ月目以降5%）</span></div>
                <div className="row"><span className="label">一時金（PRO/Standard/Light）</span><span className="value">¥5,000 / ¥2,000 / ¥1,000</span></div>
              </div>
              <ul className="features">
                <li><i className="fas fa-check-circle"></i> <strong>初期費用・月額費用 0円</strong></li>
                <li><i className="fas fa-check-circle"></i> 継続課金 or 一時金を選択可能</li>
                <li><i className="fas fa-check-circle"></i> 自分のブログ・SNSで自由に発信</li>
                <li><i className="fas fa-check-circle"></i> PRO 10件で月収 <strong>5,000円</strong> のストック収益</li>
              </ul>
              <Link href="/affiliate/signup" className="cta-link green">
                今すぐ登録する <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 紹介店舗の階段と収益 */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">REWARD STAGES</span>
            <h2>紹介店舗が増えるほど、報酬率も上がる。</h2>
            <p>201件目から45%。紹介した店舗ごとの料率で積み上がるストック収益をご覧ください。</p>
          </div>

          <div className="stages-visual reveal">
            <div className="stage-block is-1">
              <div className="stage-num">〜100店舗</div>
              <div className="stage-rate">30<span>%</span></div>
              <div className="stage-label">PRO紹介報酬</div>
            </div>
            <div className="stage-arrow">→</div>
            <div className="stage-block is-2">
              <div className="stage-num">101〜200店舗</div>
              <div className="stage-rate">36<span>%</span></div>
              <div className="stage-label">PRO紹介報酬</div>
            </div>
            <div className="stage-arrow">→</div>
            <div className="stage-block is-3">
              <div className="stage-num">201店舗〜</div>
              <div className="stage-rate">45<span>%</span></div>
              <div className="stage-label">PRO紹介報酬</div>
            </div>
          </div>

          <div className="section-subtitle reveal">
            <h3>累計店舗数と報酬額の目安</h3>
            <p>LIGHT / STANDARD 契約店舗が加わると、さらに上乗せされます。</p>
          </div>

          <div className="stages-table-wrap reveal">
            <table className="stages-table">
              <thead>
                <tr>
                  <th>累計店舗</th>
                  <th>月額報酬<br /><small>（税抜・インボイスなし）</small></th>
                  <th>月額報酬<br /><small>（税込・インボイスあり）</small></th>
                  <th>年間報酬<br /><small>（税込・インボイスあり）</small></th>
                </tr>
              </thead>
              <tbody>
                <tr><td>50店舗</td><td>¥150,000</td><td>¥165,000</td><td>¥1,980,000</td></tr>
                <tr><td>100店舗</td><td>¥300,000</td><td>¥330,000</td><td>¥3,960,000</td></tr>
                <tr><td>150店舗</td><td>¥480,000</td><td>¥528,000</td><td>¥6,336,000</td></tr>
                <tr className="is-highlight"><td>200店舗</td><td>¥660,000</td><td>¥726,000</td><td>¥8,712,000</td></tr>
                <tr><td>250店舗</td><td>¥885,000</td><td>¥973,500</td><td>¥11,682,000</td></tr>
                <tr className="is-highlight"><td>300店舗</td><td>¥1,110,000</td><td>¥1,221,000</td><td>¥14,652,000</td></tr>
                <tr><td>400店舗</td><td>¥1,560,000</td><td>¥1,716,000</td><td>¥20,592,000</td></tr>
                <tr className="is-highlight"><td>500店舗</td><td>¥2,010,000</td><td>¥2,211,000</td><td>¥26,532,000</td></tr>
              </tbody>
            </table>
          </div>

          <p className="stages-note reveal">
            ※ 上記は PRO プラン契約店舗のみを想定した計算です。LIGHT・STANDARD 契約店舗が加わると、さらに報酬が上乗せされます。<br />
            ※ インボイス番号をお持ちでない場合は、税抜金額でのお支払いとなります。
          </p>

          <div className="section-subtitle reveal" style={{ marginTop: '64px' }}>
            <h3>5年間のロードマップ（例）</h3>
            <p>1年目100店舗、2年目200店舗——積み上がるストック収益のイメージ。</p>
          </div>

          <div className="stages-table-wrap reveal">
            <table className="stages-table">
              <thead>
                <tr>
                  <th>年次</th>
                  <th>累計店舗</th>
                  <th>月額報酬（税込）</th>
                  <th>年間報酬（税込）</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1年目</td><td>100</td><td>¥330,000</td><td>¥3,960,000</td></tr>
                <tr><td>2年目</td><td>200</td><td>¥726,000</td><td>¥8,712,000</td></tr>
                <tr className="is-highlight"><td>3年目</td><td>300</td><td>¥1,221,000</td><td>¥14,652,000</td></tr>
                <tr><td>4年目</td><td>400</td><td>¥1,716,000</td><td>¥20,592,000</td></tr>
                <tr className="is-highlight"><td>5年目</td><td>500</td><td>¥2,211,000</td><td>¥26,532,000</td></tr>
              </tbody>
            </table>
          </div>

          <div className="stages-cta reveal">
            <a href="#cta-final" className="btn-primary">
              代理店パートナーに申し込む
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      {/* 比較表 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">COMPARE</span>
            <h2>3つのプログラム 比較表</h2>
            <p>自分に最適なプログラムを一目で比較できます。</p>
          </div>
          <div className="compare-table-wrap reveal">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>比較項目</th>
                  <th>👑 代理店</th>
                  <th>🤝 紹介制度</th>
                  <th>📢 アフィリエイト</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>参加条件</strong></td><td>審査あり（法人・事業者）</td><td>PROプラン契約者</td><td><strong>誰でもOK</strong></td></tr>
                <tr><td><strong>初期費用</strong></td><td>¥300,000（加盟金）</td><td>¥0（PRO月額¥10,000必要）</td><td><strong>¥0</strong></td></tr>
                <tr><td><strong>PRO紹介報酬</strong></td><td className="highlight-cell">30〜45%（継続）</td><td>10%（継続）</td><td>初年度8%（継続） or ¥5,000（一括）</td></tr>
                <tr><td><strong>Standard/Light紹介報酬</strong></td><td className="highlight-cell">18%（継続）</td><td>10%（継続）</td><td>初年度8%（継続） or ¥2,000/¥1,000（一括）</td></tr>
                <tr><td><strong>収益の特徴</strong></td><td>最大級のストック収益</td><td>実質無料化が可能</td><td>リスクフリーで始められる</td></tr>
                <tr><td><strong>推奨ユーザー</strong></td><td>法人・事業者</td><td>既存PROユーザー</td><td>個人・ブロガー・インフルエンサー</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 競合比較 */}
      <section className="section">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">VS COMPETITORS</span>
            <h2>Push-taro が選ばれる理由</h2>
            <p>主要競合と比較しても、圧倒的な優位性があります。</p>
          </div>

          <div className="competitor-grid">
            <div className="competitor-card tilt-in">
              <div className="name push-taro">🔥 Push-taro</div>
              <div className="tagline">実店舗特化型クーポンアプリ + 収益化プログラム</div>
              <ul className="feature-list">
                <li><span>代理店制度</span><span className="val yes">✅ 充実 (30〜45%/18%)</span></li>
                <li><span>紹介制度</span><span className="val yes">✅ 10%継続</span></li>
                <li><span>アフィリエイト</span><span className="val yes">✅ 初年度8%継続 or 一括</span></li>
                <li><span>収益化プログラム数</span><span className="val best">3つ</span></li>
                <li><span>ターゲット</span><span className="val">実店舗向けクーポンアプリ</span></li>
              </ul>
            </div>

            <div className="competitor-card tilt-in" style={{ transitionDelay: '0.08s' }}>
              <div className="name">📱 Push7</div>
              <div className="tagline">Webサイト・ブログ向け</div>
              <ul className="feature-list">
                <li><span>代理店制度</span><span className="val no">❌ なし</span></li>
                <li><span>紹介制度</span><span className="val no">❌ なし</span></li>
                <li><span>アフィリエイト</span><span className="val no">❌ なし</span></li>
                <li><span>収益化プログラム数</span><span className="val no">0つ</span></li>
                <li><span>ターゲット</span><span className="val">Webサイト・ブログ</span></li>
              </ul>
            </div>

            <div className="competitor-card tilt-in" style={{ transitionDelay: '0.16s' }}>
              <div className="name">📡 OneSignal</div>
              <div className="tagline">Webアプリ・サイト全般</div>
              <ul className="feature-list">
                <li><span>代理店制度</span><span className="val no">❌ なし</span></li>
                <li><span>紹介制度</span><span className="val no">❌ なし</span></li>
                <li><span>アフィリエイト</span><span className="val no">❌ なし</span></li>
                <li><span>収益化プログラム数</span><span className="val no">0つ</span></li>
                <li><span>ターゲット</span><span className="val">Webアプリ全般</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 携帯代理店との比較 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">VS MOBILE SHOP</span>
            <h2>携帯ショップ代理店との比較</h2>
            <p>「代理店ビジネス」と聞いてイメージする携帯ショップ。実は全く異なるビジネスモデルです。</p>
          </div>

          <div className="mobile-compare-wrap reveal">
            <table className="mobile-compare-table">
              <thead>
                <tr>
                  <th>比較項目</th>
                  <th className="col-mobile">📱 携帯ショップ代理店</th>
                  <th className="col-pushtaro">👑 Push-taro代理店</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>収益源</strong></td><td>キャリア手数料＋端末販売</td><td className="col-pushtaro">紹介店舗の月額×30〜45%</td></tr>
                <tr><td><strong>収益の持続性</strong></td><td>契約解除時に返還義務あり</td><td className="col-pushtaro">紹介店舗が契約継続する限り永続</td></tr>
                <tr><td><strong>初期投資</strong></td><td>数千万円規模＋数年毎のリニューアル</td><td className="col-pushtaro"><strong>¥300,000</strong>（キャンペーン）＋月額¥30,000</td></tr>
                <tr><td><strong>在庫リスク</strong></td><td>端末仕入れ・在庫負担あり</td><td className="col-pushtaro"><strong>ゼロ</strong>（デジタル商材）</td></tr>
                <tr><td><strong>人件費</strong></td><td>店舗スタッフ必須</td><td className="col-pushtaro"><strong>不要</strong>（1人で運営可能）</td></tr>
                <tr><td><strong>テナント費</strong></td><td>駅前・モール内の高額賃料</td><td className="col-pushtaro"><strong>不要</strong>（在宅・兼業OK）</td></tr>
                <tr><td><strong>キャリア施策変更リスク</strong></td><td>手数料体系が毎年見直し・業績に影響</td><td className="col-pushtaro"><strong>なし</strong>（自社サービス）</td></tr>
                <tr className="is-highlight"><td><strong>収益水準</strong></td><td>月商300〜400万円で手残り月30万円程度</td><td className="col-pushtaro">300店舗で<strong>月122万円</strong>（経費ほぼゼロ）</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mobile-compare-conclusion reveal">
            <h3>「代理店」でも、リスクとリターンが全く違う。</h3>
            <p>
              携帯ショップは「数千万円の投資」と「キャリア依存」。<br />
              Push-taro代理店は「<strong>30万円の加盟金</strong>」と「<strong>永続ストック収益</strong>」。
            </p>
          </div>

          <div className="mobile-compare-highlight reveal">
            <div className="highlight-card">
              <div className="highlight-icon">🔓</div>
              <h4>お店側が「やめにくい」から、報酬が積み上がる。</h4>
              <p>
                一度Push-taroを導入したお店は、クーポン・顧客データ・QRコード・スタッフの運用が一体化するため、乗り換えコストが非常に高くなります。<br />
                だから<strong>継続率が極めて高い</strong>——代理店にとって、これ以上ない「ストックビジネス」が成立します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ストックビジネス比較 */}
      <section className="section">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">COMPARISON BUSINESS</span>
            <h2>他のストックビジネスとの比較</h2>
            <p>不動産・携帯代理店・サブスク——数あるストックビジネスの中で、Push-taro代理店が選ばれる理由。</p>
          </div>

          <div className="stock-compare-wrap reveal">
            <table className="stock-compare-table">
              <thead>
                <tr>
                  <th>収益モデル</th>
                  <th>初期投資</th>
                  <th>月収目安</th>
                  <th>リスク</th>
                  <th>手離れ</th>
                  <th>収益の永続性</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>🏠 不動産賃貸</strong></td><td>数千万円〜</td><td>家賃収入</td><td>空室・滞納・修繕</td><td>管理会社に委託可</td><td>永続的（物件依存）</td></tr>
                <tr><td><strong>📱 携帯販売代理店</strong></td><td>数千万円</td><td>月30万円程度</td><td>キャリア施策変更・契約解除返還</td><td>店舗・スタッフ必須</td><td>契約継続中のみ</td></tr>
                <tr><td><strong>📹 YouTube/ブログ</strong></td><td>ほぼゼロ</td><td>数千円〜数十万円</td><td>アルゴリズム変動・収益単価下落</td><td>◎ 完全自動</td><td>コンテンツ依存</td></tr>
                <tr><td><strong>🏋️ ジム・スクール</strong></td><td>数百万円〜</td><td>会費収入</td><td>会員離反・競合参入</td><td>運営スタッフ必須</td><td>会員継続中のみ</td></tr>
                <tr><td><strong>📚 オンライン講座</strong></td><td>制作コスト</td><td>販売依存（フロー型）</td><td>陳腐化・模倣</td><td>◎ 完全自動</td><td>一時的</td></tr>
                <tr className="is-pushtaro">
                  <td><strong>👑 Push-taro代理店</strong></td>
                  <td><strong>¥300,000</strong></td>
                  <td><strong>最大45%還元</strong></td>
                  <td><strong>なし（在庫・店舗不要）</strong></td>
                  <td><strong>◎ 完全自動</strong></td>
                  <td><strong>紹介店舗が続く限り永続</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="stock-compare-note reveal">
            <p>
              <strong>ストックビジネスの理想形。</strong><br />
              在庫ゼロ・店舗ゼロ・スタッフゼロ。紹介した店舗が契約を続ける限り、毎月自動で報酬が積み上がります。
            </p>
          </div>
        </div>
      </section>

      {/* 収益シミュレーション */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">SIMULATION</span>
            <h2>具体的な収益シミュレーション</h2>
            <p>あなたのネットワークがどれだけの収益を生み出すか、具体的にイメージできます。</p>
          </div>

          <div className="sim-wrap">
            <div className="sim-card tilt-in">
              <h4>👑 ケース①：代理店（50社PRO紹介）</h4>
              <div className="desc">50社 × PRO月額 ¥10,000 × 30%</div>
              <div className="amount">¥150,000 <span>/ 月</span></div>
              <div className="note"><i className="fas fa-rocket"></i> 加盟金 ¥300,000 は約2ヶ月で回収可能！</div>
            </div>

            <div className="sim-card tilt-in" style={{ transitionDelay: '0.08s' }}>
              <h4>👑 ケース②：代理店（300社PRO紹介）</h4>
              <div className="desc">100社×30% + 100社×36% + 100社×45%</div>
              <div className="amount">¥1,110,000 <span>/ 月</span></div>
              <div className="note"><i className="fas fa-trophy"></i> 201件目から45%！</div>
            </div>

            <div className="sim-card tilt-in" style={{ transitionDelay: '0.16s' }}>
              <h4>🤝 ケース③：紹介制度（10社PRO紹介）</h4>
              <div className="desc">10社 × PRO月額 ¥10,000 × 10%</div>
              <div className="amount">¥10,000 <span>/ 月</span></div>
              <div className="note"><i className="fas fa-gift"></i> PROプラン（¥10,000/月）が <strong>実質無料</strong> に！</div>
            </div>
          </div>
        </div>
      </section>

      {/* 販促ツール */}
      <section className="section" id="promo-tools">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">SALES TOOLS</span>
            <h2>販促ツールが標準装備</h2>
            <p>会社名・紹介コード入りの販促ツールが、管理画面からすぐにダウンロードできます。</p>
          </div>

          <div className="promo-overview reveal">
            <div className="promo-overview-inner">
              <div className="ov-item ov-trifold">
                <div className="ov-tf-panel ov-l">
                  <span className="ov-tag">REWARD PROGRAM</span>
                  <div className="ov-h">
                    紹介するほど、<br />
                    <span>お得になる仕組み。</span>
                  </div>
                  <div className="ov-text">PROプランには紹介報酬制度があります。他店舗を紹介すると、その店舗が契約中は毎月還元。</div>
                  <div className="ov-refbox">
                    <div className="ov-refbox-title">紹介した店舗の月額の<br /><span>10%</span> を、毎月還元。</div>
                    <div className="ov-refbox-row"><span>PRO月額（税込）</span><strong>¥11,000</strong></div>
                    <div className="ov-refbox-row"><span>紹介1件あたり</span><strong>¥1,100</strong></div>
                    <div className="ov-refbox-row"><span>10件紹介すると</span><strong className="hl">¥11,000</strong></div>
                    <div className="ov-refbox-conclusion"><strong>PROプランが、実質無料に。</strong></div>
                  </div>
                </div>
                <div className="ov-tf-panel ov-m">
                  <div className="ov-back-logo">
                    <div className="ov-back-mark"></div>
                    <div className="ov-back-name">Push-taro<span>.</span></div>
                  </div>
                  <div className="ov-back-tag">実店舗向けプッシュ通知・クーポンアプリ</div>
                  <div className="ov-offer">
                    <div className="ov-offer-badge">SPECIAL OFFER</div>
                    <div className="ov-offer-title">このコードで<br /><span>限定特典</span>を<br />受け取れます</div>
                    <div className="ov-offer-code">ABC12345</div>
                    <div className="ov-qr"></div>
                  </div>
                  <div className="ov-contact">
                    <div className="ov-contact-label">CONTACT</div>
                    <div className="ov-contact-company">株式会社サンプル</div>
                    <div className="ov-contact-owner">山田 太郎 様</div>
                    <div className="ov-contact-info">TEL 090-1234-5678<br />MAIL taro@example.com</div>
                  </div>
                </div>
                <div className="ov-tf-panel ov-r">
                  <div className="ov-cover-top">
                    <div className="ov-cover-logo">
                      <div className="ov-cover-mark"></div>
                      <div className="ov-cover-name">Push-taro<span>.</span></div>
                    </div>
                  </div>
                  <div className="ov-cover-mid">
                    <div className="ov-cover-lead">実店舗向けプッシュ通知・クーポンアプリ</div>
                    <div className="ov-cover-catch">お客様に<br />喜んで頂ける<br /><span>お店づくりの<br />お手伝い。</span></div>
                  </div>
                </div>
              </div>

              <div className="ov-item ov-a4">
                <div className="ov-a4-front">
                  <div className="ov-a4-logo"><div className="ov-a4-mark"></div><div className="ov-a4-name">Push-taro<span>.</span></div></div>
                  <div className="ov-a4-lead">実店舗向けプッシュ通知・クーポンアプリ</div>
                  <div className="ov-a4-catch">お客様に<br />喜んで頂ける<br /><span>お店づくりの<br />お手伝い。</span></div>
                  <div className="ov-a4-stats">
                    <div><strong>6<small>倍</small></strong><span>開封率</span></div>
                    <div><strong>7<small>種</small></strong><span>クーポン</span></div>
                    <div><strong>0<small>円</small></strong><span>導入費用</span></div>
                  </div>
                </div>
              </div>

              <div className="ov-item ov-card">
                <div className="ov-card-top">
                  <div className="ov-card-mark"></div>
                  <div className="ov-card-name">Push-taro<span>.</span></div>
                </div>
                <div className="ov-card-catch">お客様に喜んで頂ける<br /><span>お店づくりのお手伝い。</span></div>
                <div className="ov-card-sub">実店舗向けプッシュ通知・クーポンアプリ</div>
              </div>

              <div className="ov-item ov-a5">
                <div className="ov-a5-mark"></div>
                <div className="ov-a5-name">Push-taro<span>.</span></div>
                <div className="ov-a5-catch">お客様に<br />喜んで頂ける<br /><span>お店づくりの<br />お手伝い。</span></div>
              </div>
            </div>

            <p className="promo-caption">
              <strong>三つ折りパンフ／A4チラシ／B5チラシ／名刺／カード</strong><br />
              すべて会社名・紹介コード入りでダウンロード可能
            </p>
          </div>

          <div className="promo-cta reveal">
            <button
              className="btn-primary"
              onClick={() => setPromoModalOpen(true)}
            >
              📄 すべての販促ツールを見てみる
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-title reveal">
            <span className="tag">FAQ</span>
            <h2>よくある質問</h2>
          </div>
          <div className="faq-list reveal">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-item ${activeFaq === idx ? 'active' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span>Q. {faq.q}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="cta-final" id="cta-final">
        <div className="container">
          <h2 className="reveal">今すぐ始めて、<br />ストック収益を手に入れよう</h2>
          <p className="reveal" style={{ transitionDelay: '0.1s' }}>あなたのネットワークが、毎月の安定収益に変わります。まずは無料で情報を入手してください。</p>

          <div className="grid">
            <div className="item tilt-in">
              <div className="icon">👑</div>
              <h4>代理店パートナー</h4>
              <div className="sub">審査あり｜最大収益</div>
              <Link href="/agency" className="btn-small">今すぐ始める</Link>
            </div>
            <div className="item tilt-in" style={{ transitionDelay: '0.1s' }}>
              <div className="icon">🤝</div>
              <h4>紹介制度</h4>
              <div className="sub">PRO限定｜実質無料</div>
              <Link href="/signup" className="btn-small outline">PROプランで始める</Link>
            </div>
            <div className="item tilt-in" style={{ transitionDelay: '0.2s' }}>
              <div className="icon">📢</div>
              <h4>アフィリエイト</h4>
              <div className="sub">誰でもOK｜0円スタート</div>
              <Link href="/affiliate/signup" className="btn-small">今すぐ登録する</Link>
            </div>
          </div>

          <div className="footnote">
            <i className="fas fa-clock"></i> Push-taroは <strong>2026年9月</strong> サービス開始です。<br />
            現在は事前登録を受け付けております。{' '}
            <a href="mailto:info@push-taro.com" style={{ color: '#fb923c', textDecoration: 'underline' }}>お問い合わせ</a>
          </div>
        </div>
      </section>

      {/* フッター */}
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
                代理店パートナーとして、あなたのネットワークを毎月の安定収益に。
              </p>
              <div className="footer-badge">
                <span className="footer-badge-dot"></span>
                2026年9月 サービス開始
              </div>
            </div>

            <div className="footer-links-wrap">
              <div className="footer-col">
                <h4 className="footer-col-title">サービス</h4>
                <ul className="footer-col-list">
                  <li><Link href="/">Push-taro トップ</Link></li>
                  <li><Link href="/partners">代理店パートナー募集</Link></li>
                  <li><Link href="/signup">PROプランで始める</Link></li>
                  <li><Link href="/affiliate/signup">アフィリエイト登録</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4 className="footer-col-title">活用ガイド</h4>
                <ul className="footer-col-list">
                  <li><Link href="/guide">ガイドTOP</Link></li>
                  <li><Link href="/guide/features">機能別ガイド</Link></li>
                  <li><Link href="/guide/case-studies">導入事例</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4 className="footer-col-title">サポート</h4>
                <ul className="footer-col-list">
                  <li><Link href="/terms">利用規約</Link></li>
                  <li><Link href="/privacy">プライバシーポリシー</Link></li>
                  <li><Link href="/tokusho">特定商取引法</Link></li>
                  <li><a href="mailto:info@push-taro.com">お問い合わせ</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              &copy; 2026 Push-taro All Rights Reserved. ｜ 運営：the合同会社
            </p>
            <p className="footer-address">
              〒357-0123 埼玉県飯能市中藤下郷23-21
            </p>
          </div>
        </div>
      </footer>

      <PromoToolsModal
        isOpen={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
      />
    </main>
  );
}
