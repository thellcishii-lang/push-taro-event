'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function PushNotificationRoiClient() {
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
          <Link href="/guide/industry-fit">効く業種・向いていない業種</Link>
          <span className="sep">/</span>
          <span className="current">配信頻度と登録者数</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">ROI Guide</span>
          <h1>プッシュ通知のCVR（コンバージョン率）を<br />最大化する配信頻度</h1>
          <p>
            せっかく導入するなら、確実に成果を出したい。<br />
            プッシュ通知の費用対効果（ROI）を最大化するための「登録者数」と「配信頻度」の黄金律を解説します。
          </p>
        </div>

        <div className="g-content">

          <h2><span className="num">1</span>結論：CVR 4%がボーダーライン。登録者1000人超えで「体感」できる</h2>
          <p>
            プッシュ通知の成果指標として最も重要なのが<strong>CVR（コンバージョン率）</strong>です。店舗への来店やクーポン利用などの成果が、通知を見た人の何%に発生したかを示します。<br />
            一般的に、<strong>CVRが4%を超えてくると「効果が出ている」</strong>と言われます。
          </p>
          <div className="g-card-simple">
            <h4>登録者数の目安</h4>
            <ul>
              <li><strong>600人以下</strong>：母数が少なく、費用対効果が分かりづらい。</li>
              <li><strong>1000人超え</strong>：売上への貢献を体感できるようになる。</li>
            </ul>
          </div>

          <h2><span className="num">2</span>業種別・最適な「配信頻度」</h2>
          <p>配信しすぎると解除され、少なすぎると忘れられます。業種に合わせた最適な頻度を設定しましょう。</p>
          <div className="g-grid">
            <div className="g-card-simple">
              <h4>週2回 〜 週1回</h4>
              <p>小売、アパレル、美容室など。頻繁すぎると「うざい」と思われ、ブロックや削除に繋がります。</p>
            </div>
            <div className="g-card-simple">
              <h4>毎日配信</h4>
              <p>ランチ営業の日替わり、スーパーのタイムセールなど。毎日のルーティンに組み込める業種は毎日配信が効果的です。</p>
            </div>
          </div>

          <h2><span className="num">3</span>LINE公式の「配信上限」という壁</h2>
          <p>
            プッシュ通知の代替としてLINE公式を検討する方も多いですが、実は<strong>「配信通数の上限」</strong>という見えない壁があります。
          </p>
          <ul className="g-flow-list">
            <li>LINE公式のLITEプランは<strong>月5,000通</strong>まで。</li>
            <li>登録者600人を超え、週2回（月8回）配信すると<strong>月4,800通</strong>。</li>
            <li>LITEプランでは<strong>ギリギリ足りなくなり、上のプランへ移行が必要</strong>になる。</li>
          </ul>

          <h2><span className="num">4</span>Push-taroの料金体系が「コスパ最強」である理由</h2>
          <p>
            Push-taroなら、この「配信上限」の壁を気にする必要がありません。登録者が増えても、毎日配信しても、<strong>定額</strong>です。
          </p>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>プラン</th><th>月額</th><th>登録者数</th><th>月間配信数</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>LIGHT</strong></td><td>¥1,980</td><td>無制限</td><td>5,000通</td></tr>
                <tr><td><strong>STANDARD</strong></td><td>¥3,800</td><td>無制限</td><td>15,000通</td></tr>
                <tr><td><strong>PRO</strong></td><td>¥10,000</td><td>50,000人</td><td><strong>配信無制限</strong></td></tr>
              </tbody>
            </table>
          </div>
          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>登録者が何人になっても、配信数を気にせず毎日配信できる</strong></p>
              <p>それがPush-taroの強みです。LINEの「配信上限」で悩む必要はありません。</p>
            </div>
          </div>

          <h2><span className="num">5</span>Push-taroで「1000人」を目指すための3つのステップ</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 1：店頭QRの設置場所を工夫する</h4>
                <p>レジ横、テーブル、入口など、お客様の目に留まる場所にPOPを設置しましょう。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 2：初回クーポンで登録のインセンティブを作る</h4>
                <p>「登録すると今すぐ使える10%OFF」など、その場で得をする仕組みが登録率を上げます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>STEP 3：配信内容（タイトル）を磨く</h4>
                <p>開封率を上げるためには、タイトルの一工夫が欠かせません。数字や緊急性を入れるのがコツです。</p>
              </div>
            </div>
          </div>

          {/* 相互リンク：記事①へ */}
          <div className="g-related" style={{ marginTop: '40px', padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ marginTop: 0, color: '#166534' }}>🤔 そもそも、あなたの店舗はプッシュ通知が効く業種ですか？</h3>
            <p style={{ fontSize: '14px', color: '#14532d', marginBottom: '16px' }}>
              チラシを撒く業種や日常利用の業種には劇的に効きますが、予約制のサロンや購入サイクルの長い業種には向いていません。<br />
              導入前に、まずはあなたの業種との相性をチェックしましょう。
            </p>
            <Link href="/guide/industry-fit" style={{ display: 'inline-block', padding: '12px 24px', background: '#16a34a', color: '#fff', fontWeight: 'bold', borderRadius: '8px', textDecoration: 'none' }}>
              プッシュ通知が効く業種・向いていない業種はこちら →
            </Link>
          </div>

          <div className="g-cta">
            <h3>配信上限を気にせず、毎日届けよう。</h3>
            <p>Push-taroなら、登録者が増えても定額で使えます。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
