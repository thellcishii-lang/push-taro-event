'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function IndustryFitClient() {
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
          <span className="current">プッシュ通知が効く業種・向いていない業種</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">Industry Guide</span>
          <h1>【業種別】集客にプッシュ通知が<br />効く店舗・向いていない店舗の特徴</h1>
          <p>
            「プッシュ通知を導入したいけど、うちの業種でも効果はあるの？」<br />
            実店舗の集客において、プッシュ通知が劇的にハマる業種と、そうでない業種には明確な違いがあります。
          </p>
        </div>

        <div className="g-content">

          <h2><span className="num">1</span>結論：プッシュ通知が効くのは「チラシを撒く業種」と「日常利用の業種」</h2>
          <p>
            プッシュ通知の本質は「今すぐ使えるお得な情報を、スマホに直接届ける」ことです。<br />
            そのため、<strong>「頻繁にチラシを配っている業種」</strong>や、<strong>「日常的に使われる業種」</strong>と最も相性が良いと言えます。
          </p>

          <h2><span className="num">2</span>【プッシュ通知が劇的に効く業種】</h2>
          <div className="g-feature-list">
            <div className="g-feature-item">
              <span className="ico">🛒</span>
              <div>
                <strong>スーパー・小売・カー用品店</strong>
                <p>今だにチラシを撒いている業種は、プッシュ通知への置き換えが最も効果的です。「本日のタイムセール」「新商品入荷」をリアルタイムに配信でき、印刷代と配布の人件費を削減できます。</p>
              </div>
            </div>
            <div className="g-feature-item">
              <span className="ico">☕</span>
              <div>
                <strong>飲食店・カフェ</strong>
                <p>「日替わりランチの告知」「雨の日の割引」「今空いてます」など、当日の来店動機を直接作れます。</p>
              </div>
            </div>
            <div className="g-feature-item">
              <span className="ico">🥐</span>
              <div>
                <strong>パン屋・ベーカリー</strong>
                <p>「焼き立てクロワッサンができました」など、時間帯に合わせた通知が衝動買いを誘発します。</p>
              </div>
            </div>
            <div className="g-feature-item">
              <span className="ico">👕</span>
              <div>
                <strong>アパレル・雑貨</strong>
                <p>「新作入荷」「セール開始」など、来店のきっかけを定期的に作れます。</p>
              </div>
            </div>
            <div className="g-feature-item">
              <span className="ico">🎪</span>
              <div>
                <strong>イベント・展示会</strong>
                <p>「ステージ開始」「混雑状況」をリアルタイムで配信し、人流をコントロールできます。</p>
              </div>
            </div>
          </div>

          <h2><span className="num">3</span>【プッシュ通知が効きづらい業種】</h2>
          <div className="g-feature-list">
            <div className="g-feature-item">
              <span className="ico">🏠</span>
              <div>
                <strong>不動産・車関係（BtoC）</strong>
                <p>購入サイクルが数年単位と長く、日常的にプッシュ通知を送る頻度と合いません。</p>
              </div>
            </div>
            <div className="g-feature-item">
              <span className="ico">💇</span>
              <div>
                <strong>美容室・エステ・クリニック・ネイル</strong>
                <p>顧客情報を取得して「予約制」で運営しているのが普通です。LINEや予約システムで個別連絡ができるため、一斉配信のプッシュ通知の出番が少なくなります。</p>
              </div>
            </div>
          </div>
          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>向いていない業種は、導入しなくていい</strong></p>
              <p>無理に使ってもコストと手間がかかるだけです。「チラシを配る代わりにスマホに届ける」という文脈がハマる業種だけが導入すれば十分です。</p>
            </div>
          </div>

          {/* 相互リンク：記事②へ */}
          <div className="g-related" style={{ marginTop: '40px', padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
            <h3 style={{ marginTop: 0, color: '#0369a1' }}>📊 あなたの業種で、最大限の効果を出すには？</h3>
            <p style={{ fontSize: '14px', color: '#0c4a6e', marginBottom: '16px' }}>
              「自分の業種は効くのは分かった。でも、どうやって運用すればいい？」<br />
              プッシュ通知の費用対効果（ROI）を最大化するための、最適な配信頻度と登録者数の目安を解説しています。
            </p>
            <Link href="/guide/push-notification-roi" style={{ display: 'inline-block', padding: '12px 24px', background: '#0284c7', color: '#fff', fontWeight: 'bold', borderRadius: '8px', textDecoration: 'none' }}>
              プッシュ通知のCVRを最大化する配信頻度はこちら →
            </Link>
          </div>

          <div className="g-cta">
            <h3>あなたの店舗でも、はじめてみませんか？</h3>
            <p>初期費用0円。まずはお気軽にご相談ください。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
