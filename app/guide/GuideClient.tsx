'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './guide.css';

export default function GuideClient() {
  return (
    <>
      <nav className="g-nav">
        <div className="g-nav-inner">
          <BrandLogo />
          <Link href="/signup" className="g-nav-cta">今すぐ申し込む →</Link>
        </div>
      </nav>

      <main className="g-main">
        <div className="g-hero">
          <span className="g-badge">Guide</span>
          <h1>活用ガイド</h1>
          <p>
            Push-taroの機能を「どう使うか」から、業種ごとの「具体的な運用」まで、
            実店舗のリピート施策に必要なノウハウを徹底解説します。
          </p>
        </div>

        {/* ============================================================
            ① 店舗マーケティングの本質
        ============================================================ */}
        <section className="g-sec">
          <div className="g-sec-head">
            <span className="g-sec-num">1</span>
            <div>
              <h2>🎓 店舗マーケティングの本質</h2>
              <p>「なぜ、そうなのか」を理解する</p>
            </div>
          </div>

          <div className="g-grid">
            <Link href="/guide/store-marketing" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">📖</span>
              <h4>実店舗の集客、オススメの施策</h4>
              <p>広告・ポータル・LP・SNS・LINE。全部やる時代に、抜けているもの</p>
            </Link>
            <Link href="/guide/line-comparison" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">📊</span>
              <h4>LINE公式アカウントとの比較</h4>
              <p>配信上限という壁を、数字で解説</p>
            </Link>
            <Link href="/guide/push-notification-metrics" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">📊</span>
              <h4>プッシュ通知のCVRは、何%あればいいのか</h4>
              <p>CTRとCVRのベンチマークを、データで解説</p>
            </Link>
            <Link href="/guide/ctr-to-cvr" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">🎯</span>
              <h4>CTRを、CVRに繋げる方法</h4>
              <p>衝動タップを、来店に変える3つの設計</p>
            </Link>
            <Link href="/guide/segmentation" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">📊</span>
              <h4>セグメント配信とは</h4>
              <p>実店舗では「使えない」理由を、数字で解説</p>
            </Link>
            <Link href="/guide/industry-fit" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">🏪</span>
              <h4>【業種別】プッシュ通知が効く店舗・向いていない店舗</h4>
              <p>チラシを撒く業種は相性抜群。あなたの業種は？</p>
            </Link>
            <Link href="/guide/push-notification-roi" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">📈</span>
              <h4>プッシュ通知のCVRを最大化する配信頻度</h4>
              <p>登録者数と配信頻度の黄金律。LINEの上限との比較も。</p>
            </Link>
            <Link href="/guide/security" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">🔒</span>
              <h4>なぜ、顧客情報を取らないのか</h4>
              <p>情報流出の時代に、漏れるリスクを最小化する</p>
            </Link>
            <Link href="/guide/what-is-pwa" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">📱</span>
              <h4>実店舗のためのPWA入門</h4>
              <p>なぜiPhoneで「ホーム画面に追加」が必要なのか？</p>
            </Link>
          </div>
        </section>

        {/* ============================================================
            ② 機能別ガイド
        ============================================================ */}
        <section className="g-sec">
          <div className="g-sec-head">
            <span className="g-sec-num">2</span>
            <div>
              <h2>🔧 機能別ガイド</h2>
              <p>「この機能は何ができるの？」から始める</p>
            </div>
          </div>

          <div className="g-feature-grid">
            <Link href="/guide/features/push-notification" className="g-feature-card">
              <span className="g-feature-icon">📢</span>
              <div className="g-feature-info"><h4>プッシュ通知</h4><p>一斉配信・画像付き通知・リンク遷移</p></div>
              <span className="g-feature-tag is-all">全プラン</span>
            </Link>
            <Link href="/guide/features/coupon-first" className="g-feature-card">
              <span className="g-feature-icon">🎫</span>
              <div className="g-feature-info"><h4>初回クーポン</h4><p>新規顧客の獲得と来店動機</p></div>
              <span className="g-feature-tag is-all">全プラン</span>
            </Link>
            <Link href="/guide/features/qr-acquisition" className="g-feature-card">
              <span className="g-feature-icon">📱</span>
              <div className="g-feature-info"><h4>QRコード顧客獲得</h4><p>店頭POPから顧客リストを自動構築</p></div>
              <span className="g-feature-tag is-all">全プラン</span>
            </Link>
            <Link href="/guide/features/coupon-normal" className="g-feature-card">
              <span className="g-feature-icon">🎟️</span>
              <div className="g-feature-info"><h4>通常クーポン</h4><p>何度でも使える常設クーポン</p></div>
              <span className="g-feature-tag is-std">STANDARD+</span>
            </Link>
            <Link href="/guide/features/coupon-loyalty" className="g-feature-card">
              <span className="g-feature-icon">🏆</span>
              <div className="g-feature-info"><h4>特別達成クーポン</h4><p>N回来店で解放、常連化を促進</p></div>
              <span className="g-feature-tag is-std">STANDARD+</span>
            </Link>
            <Link href="/guide/features/store-pop" className="g-feature-card">
              <span className="g-feature-icon">🖨️</span>
              <div className="g-feature-info"><h4>店頭POP印刷</h4><p>A4/B5のQRポップを管理画面から印刷</p></div>
              <span className="g-feature-tag is-std">STANDARD+</span>
            </Link>
            <Link href="/guide/features/coupon-stepup" className="g-feature-card">
              <span className="g-feature-icon">🐾</span>
              <div className="g-feature-info"><h4>ステップアップクーポン</h4><p>段階的に特典アップ</p></div>
              <span className="g-feature-tag is-pro">PRO</span>
            </Link>
            <Link href="/guide/features/coupon-repeat" className="g-feature-card">
              <span className="g-feature-icon">🔄</span>
              <div className="g-feature-info"><h4>連続クーポン</h4><p>消込と同時に次回分を即時発行</p></div>
              <span className="g-feature-tag is-pro">PRO</span>
            </Link>
            <Link href="/guide/features/coupon-birthday" className="g-feature-card">
              <span className="g-feature-icon">🎂</span>
              <div className="g-feature-info"><h4>記念日・誕生日クーポン</h4><p>年1回の特別クーポンを自動配信</p></div>
              <span className="g-feature-tag is-pro">PRO</span>
            </Link>
            <Link href="/guide/features/coupon-dormant" className="g-feature-card">
              <span className="g-feature-icon">💤</span>
              <div className="g-feature-info"><h4>休眠復活クーポン</h4><p>離反顧客を自動で呼び戻す</p></div>
              <span className="g-feature-tag is-pro">PRO</span>
            </Link>
            <Link href="/guide/features/scheduled-push" className="g-feature-card">
              <span className="g-feature-icon">📅</span>
              <div className="g-feature-info"><h4>予約配信・定期配信</h4><p>日時指定で自動配信</p></div>
              <span className="g-feature-tag is-pro">PRO</span>
            </Link>
            <Link href="/guide/features/login-streak" className="g-feature-card">
              <span className="g-feature-icon">🔥</span>
              <div className="g-feature-info"><h4>連続ログイン特典</h4><p>アプリを開く習慣化と達成クーポン</p></div>
              <span className="g-feature-tag is-pro">PRO</span>
            </Link>
            <Link href="/guide/pos-integration" className="g-feature-card">
              <span className="g-feature-icon">🔗</span>
              <div className="g-feature-info"><h4>POS連携</h4><p>レジと連携して消込を自動化</p></div>
              <span className="g-feature-tag is-pro">PRO</span>
            </Link>
            <Link href="/guide/features/referral" className="g-feature-card">
              <span className="g-feature-icon">🤝</span>
              <div className="g-feature-info"><h4>紹介報酬</h4><p>他店舗を紹介で毎月10%還元</p></div>
              <span className="g-feature-tag is-pro">PRO</span>
            </Link>
          </div>
        </section>

        {/* ============================================================
            ③ 業種別ガイド
        ============================================================ */}
        <section className="g-sec">
          <div className="g-sec-head">
            <span className="g-sec-num">3</span>
            <div><h2>🏪 業種別ガイド</h2><p>あなたの業種に合わせた活用方法</p></div>
          </div>
          <div className="g-grid">
            <Link href="/guide/super" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">🛒</span>
              <h4>スーパー・小売店</h4>
              <p>チラシを、プッシュ通知に置き換える</p>
            </Link>
            <Link href="/guide/bakery" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">🥐</span>
              <h4>パン屋・ベーカリー</h4>
              <p>数量限定告知・焼き立て配信・テスト販売</p>
            </Link>
            <Link href="/guide/cafe" className="g-card">
              <span className="g-card-icon">☕</span>
              <h4>飲食店・カフェ</h4>
              <p>雨の日割引・常連客のファン化</p>
            </Link>
            <Link href="/guide/apparel" className="g-card">
              <span className="g-card-icon">👕</span>
              <h4>アパレル・雑貨</h4>
              <p>新商品入荷・セール告知</p>
            </Link>
            <Link href="/guide/apparel-ai-video" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">🎬</span>
              <h4>AIで着用動画の作り方</h4>
              <p>マネキンの写真1枚から、リール動画を作る</p>
            </Link>
            <Link href="/guide/snack" className="g-card">
              <span className="g-card-icon">🍸</span>
              <h4>スナック・パブ</h4>
              <p>常連客と紹介の仕組み</p>
            </Link>
            <Link href="/guide/food-loss" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">♻️</span>
              <h4>フードロス削減</h4>
              <p>廃棄ロスを売上に変える、通知とmottECOの活用</p>
            </Link>
          </div>
        </section>

        {/* ============================================================
            ④ 運用ノウハウ
        ============================================================ */}
        <section className="g-sec">
          <div className="g-sec-head">
            <span className="g-sec-num">4</span>
            <div><h2>📚 運用ノウハウ</h2><p>安全な運用のために</p></div>
          </div>
          <div className="g-grid">
            <Link href="/guide/event-marketing" className="g-card is-new">
              <span className="g-card-new">NEW</span>
              <span className="g-card-icon">🎪</span>
              <h4>イベント・展示会の活用</h4>
              <p>短期催事での人件費削減と広告収益の作り方</p>
            </Link>
            <Link href="/guide/ng-actions" className="g-card">
              <span className="g-card-icon">⚠️</span>
              <h4>NG行為集</h4>
              <p>炎上・離反を招く行為</p>
            </Link>
          </div>
        </section>

        <div className="g-cta">
          <h3>あなたの店舗でも、はじめてみませんか？</h3>
          <p>配信無制限・7種のクーポン自動配信。<br />Push-taroなら、リピート施策のすべてが1つに。</p>
          <Link href="/contact" className="g-cta-btn">無料相談 →</Link>
        </div>
      </main>
    </>
  );
}
