'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function PwaClient() {
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
          <span className="current">PWA入門</span>
        </div>

        <div className="g-hero">
          <span className="g-badge">📱 基礎知識</span>
          <h1>実店舗のためのPWA入門。<br />なぜiPhoneで「ホーム画面に追加」が必要なのか？</h1>
          <p>
            「アプリのダウンロードは面倒だけど、プッシュ通知は届けたい」<br />
            そのジレンマを解決するのが<strong>PWA（Webアプリ）</strong>です。<br />
            2023年のiPhoneのアップデートで、Webプッシュ通知の常識は大きく変わりました。
          </p>
        </div>

        <div className="g-content">

          {/* 1 */}
          <h2><span className="num">1</span>PWA（ピーダブリューエー）とは？</h2>

          <p>
            PWA（Progressive Web Apps）とは、簡単に言うと<strong>「Webサイトを、スマホアプリのように使える技術」</strong>です。
          </p>

          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>ネイティブアプリ</th>
                  <th className="col-pushtaro">PWA（Webアプリ）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ダウンロード</td>
                  <td className="no">App Store等から必要</td>
                  <td className="col-pushtaro yes">不要（ブラウザから追加）</td>
                </tr>
                <tr>
                  <td>容量</td>
                  <td className="no">数十〜数百MB</td>
                  <td className="col-pushtaro yes">ほぼゼロ（数十KB）</td>
                </tr>
                <tr>
                  <td>アップデート</td>
                  <td className="no">手動・自動で更新</td>
                  <td className="col-pushtaro yes">不要（常に最新）</td>
                </tr>
                <tr>
                  <td>プッシュ通知</td>
                  <td className="yes">可能</td>
                  <td className="col-pushtaro yes">可能</td>
                </tr>
                <tr>
                  <td>ホーム画面のアイコン</td>
                  <td className="yes">あり</td>
                  <td className="col-pushtaro yes">あり</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            お客様は、QRコードを読み取って「ホーム画面に追加」をタップするだけ。<br />
            面倒なインストール作業なしで、<strong>「自店専用のアプリ」</strong>が手に入ります。
          </p>

          {/* 2 */}
          <h2><span className="num">2</span>2023年、iPhoneがついにPWAのプッシュ通知に対応</h2>

          <p>
            これまで、Webからのプッシュ通知はAndroidだけの特権でした。<br />
            しかし、<strong>2023年のiOS 16.4アップデート</strong>により、iPhoneでもPWAのプッシュ通知が可能になりました。
          </p>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>これで国内のスマホ全般で、プッシュ通知が可能に</strong></p>
              <p>
                iPhone・Android、どちらのユーザーにも、Webアプリから直接お得を届けられる時代になりました。<br />
                実店舗にとって、これは巨大なビジネスチャンスです。
              </p>
            </div>
          </div>

          {/* 3 */}
          <h2><span className="num">3</span>なぜiPhoneだけ「ホーム画面に追加」が必要なのか？</h2>

          <p>
            ここが、一番の疑問ポイントだと思います。<br />
            iPhoneの場合、Safariの通常タブでサイトを開いているだけでは、<strong>プッシュ通知を受け取ることができません</strong>。
          </p>

          <h3 className="g-h3">Appleのセキュリティとプライバシーの思想</h3>

          <p>
            Appleは、ユーザーのプライバシー保護に非常に厳格です。<br />
            「ただサイトを閲覧しただけの状態」で通知を許可してしまうと、スパム通知が増えるリスクがあります。
          </p>

          <p>
            そこで、「<strong>ホーム画面に追加した（＝ユーザーがそのサイトを明確に気に入った）Webアプリ</strong>」に限定して、プッシュ通知を許可する仕様にしました。
          </p>

          <div className="g-quote is-orange">
            ホーム画面に追加する ＝ <br />
            「このお店の情報を受け取りたい」<br /><br />
            という、お客様の明確な意思表示になる。
          </div>

          {/* 4 */}
          <h2><span className="num">4</span>AndroidとiPhoneの違い</h2>

          <p>
            お客様の登録ハードルは、OSによって異なります。
          </p>

          <div className="g-grid">
            <div className="g-card-simple">
              <div className="g-icon-big">🤖</div>
              <h4>Androidの場合</h4>
              <p>ブラウザ上で直接「通知を許可」が可能。<br />ホーム画面追加は必須ではありません（シニア層にも簡単）。</p>
            </div>
            <div className="g-card-simple">
              <div className="g-icon-big">🍎</div>
              <h4>iPhoneの場合</h4>
              <p>Safariの共有ボタンから「ホーム画面に追加」を選択。<br />追加したアイコンから開いて、通知を許可します。</p>
            </div>
          </div>

          <div className="g-callout success">
            <span className="ico">✅</span>
            <div>
              <p><strong>Push-taroは、この手順を自動で案内します</strong></p>
              <p>
                iPhoneでQRを読み取ったお客様には、画面に「ホーム画面に追加」の手順が表示されます。<br />
                専門知識がなくても、お客様自身で登録を完了できます。
              </p>
            </div>
          </div>

          {/* 5 */}
          <h2><span className="num">5</span>Push-taroがPWAを採用している理由</h2>

          <p>
            私たちが、ネイティブアプリではなくPWAを採用しているのには、明確な理由があります。
          </p>

          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>① 顧客の登録ハードルを、極限まで下げる</h4>
                <p>「アプリをダウンロードして」と言われると、9割の人は離脱します。QRを読み取って30秒で終わるから、登録率が上がります。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>② 店舗側の開発・維持コストがかからない</h4>
                <p>App StoreやGoogle Playの審査は不要。Webの管理画面から更新するだけで、全顧客のアプリが最新になります。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>③ アプリストアの手数料がかからない</h4>
                <p>アプリ内課金の手数料（15〜30%）は一切かかりません。</p>
              </div>
            </div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <p><strong>「アプリっぽさ」と「Webの手軽さ」のいいとこ取り</strong></p>
              <p>
                お客様にとっては「アプリ」。店舗にとっては「Webサイト」。<br />
                お互いのメリットを最大化するのが、PWAです。
              </p>
            </div>
          </div>

          {/* FAQ */}
          <h2><span className="num">6</span>よくあるご質問</h2>

          <div className="g-faq">
            <details className="g-faq-item">
              <summary>PWAとは何ですか？</summary>
              <p>PWA（Progressive Web Apps）とは、Webサイトをスマホのアプリのように動作させる技術です。アプリストアからダウンロードする必要がなく、ホーム画面にアイコンを追加するだけで、プッシュ通知の受信やオフラインでの閲覧が可能になります。</p>
            </details>

            <details className="g-faq-item">
              <summary>iPhoneでプッシュ通知を受け取るにはどうすればいいですか？</summary>
              <p>iOS 16.4以降の場合、Safariでサイトを開き、共有ボタンから「ホーム画面に追加」を選択してください。ホーム画面のアイコンから開いた状態でのみ、プッシュ通知を許可することができます。</p>
            </details>

            <details className="g-faq-item">
              <summary>Androidでもホーム画面に追加は必要ですか？</summary>
              <p>AndroidのChromeブラウザの場合、ホーム画面に追加しなくても、ブラウザ上で直接プッシュ通知を許可することが可能です。ただし、アプリのようにアイコンを置くことで、よりスムーズに開けるようになります。</p>
            </details>

            <details className="g-faq-item">
              <summary>アプリストアからダウンロードする必要はありますか？</summary>
              <p>いいえ、必要ありません。App StoreやGoogle Playを経由せず、ブラウザから直接ホーム画面に追加するだけです。顧客にとって、ダウンロードの手間がないことが最大のメリットです。</p>
            </details>
          </div>

          {/* 関連ガイド */}
          <div className="g-related">
            <h3>次に読む</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/qr-acquisition" className="g-related-card is-next">
                <span className="ico">📱</span>
                <div>
                  <div className="title">QRコード顧客獲得</div>
                  <div className="sub">登録の入り口</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-related" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <h3>あわせて読みたい</h3>
            <div className="g-related-grid">
              <Link href="/guide/line-comparison" className="g-related-card">
                <span className="ico">📊</span>
                <div>
                  <div className="title">LINE公式アカウントとの比較</div>
                  <div className="sub">配信上限という壁を、数字で解説</div>
                </div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/store-marketing" className="g-related-card">
                <span className="ico">📖</span>
                <div>
                  <div className="title">実店舗の集客、オススメの施策</div>
                  <div className="sub">店舗マーケティングの理論</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>面倒なインストールなしで、通知を。</h3>
            <p>QRコードを読み取ってホーム画面に追加するだけ。Push-taroで、今日から始められます。</p>
            <Link href="/signup" className="g-cta-btn">無料相談 →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
