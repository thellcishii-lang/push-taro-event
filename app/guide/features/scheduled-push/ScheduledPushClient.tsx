'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../../industry.css'; // ★ 共通CSSを読み込み

export default function ScheduledPushClient() {
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
          <Link href="/guide/features">機能別</Link>
          <span className="sep">/</span>
          <span className="current">予約配信</span>
        </div>

        <div className="g-hero">
          <span className="g-badge is-pro">🔥 PRO 限定</span>
          <h1>📅 予約配信・定期配信</h1>
          <p>
            「毎週金曜18時」「毎月1日」など、<strong>任意のスケジュールで自動配信</strong>できる機能です。
            一度設定すれば、あとはずっと自動で動き続けます。
          </p>
        </div>

        <div className="g-content">

          <h2 className="g-h2"><span className="num">1</span>この機能でできること</h2>
          <div className="g-feature-list">
            <div className="g-feature-item"><span className="ico">📅</span><div><strong>3種類のスケジュール</strong><p>「1回のみ」「毎月指定日」「毎週指定曜日」から選べます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🤖</span><div><strong>全自動で配信</strong><p>一度設定すれば、あとは毎日Cronが自動でチェックして送信。</p></div></div>
            <div className="g-feature-item"><span className="ico">🎫</span><div><strong>クーポン付き配信も可能</strong><p>「通常通知」または「クーポン付き通知」を選べます。</p></div></div>
            <div className="g-feature-item"><span className="ico">🔄</span><div><strong>失敗時は翌日リトライ</strong><p>送信失敗した予約は、翌日自動で再試行されます（1回のみ）。</p></div></div>
          </div>

          <h2 className="g-h2"><span className="num">2</span>スケジュールの種類</h2>
          <div className="g-schedule-grid">
            <div className="g-schedule-card">
              <div className="g-schedule-icon">📌</div>
              <div className="g-schedule-name">日付指定（1回のみ）</div>
              <p>例：「2026年12月25日」にクリスマスセール告知を配信</p>
              <div className="g-schedule-tag">1回限り</div>
            </div>
            <div className="g-schedule-card">
              <div className="g-schedule-icon">🔄</div>
              <div className="g-schedule-name">毎月指定日</div>
              <p>例：「毎月1日」に月初クーポンを配信</p>
              <div className="g-schedule-tag">定期</div>
            </div>
            <div className="g-schedule-card">
              <div className="g-schedule-icon">🗓️</div>
              <div className="g-schedule-name">毎週指定曜日</div>
              <p>例：「毎週金曜18時」に週末告知を配信</p>
              <div className="g-schedule-tag">定期</div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">3</span>設定手順</h2>
          <div className="g-steps">
            <div className="g-step">
              <div className="g-step-body">
                <h4>「📅 予約配信」タブを開く</h4>
                <p>新規予約フォームが表示されます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>配信の種別を選択</h4>
                <p>「📢 通常通知」または「🎫 クーポン付き通知」を選びます。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>スケジュール形式を選択</h4>
                <p>「1回のみ」「毎月」「毎週」から選び、日付・曜日を指定。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>タイトル・本文・リンク先URLを入力</h4>
                <p>クーポン付きの場合は、有効日数も設定します。</p>
              </div>
            </div>
            <div className="g-step">
              <div className="g-step-body">
                <h4>「➕ 予約をセット」をタップ</h4>
                <p>予約一覧に追加され、指定日時に自動配信されます。</p>
              </div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">4</span>画面イメージ</h2>
          <div className="g-mockup">
            <div className="g-mockup-tabs">
              <span>📢 即時通知</span>
              <span>🏪 店舗設定</span>
              <span>🔥 PRO機能</span>
              <span className="is-active-amber">📅 予約</span>
            </div>
            <div className="g-mockup-card">
              <div className="g-mockup-h3">📅 新規配信予約をセット</div>
              <div className="g-mockup-label">配信の種別</div>
              <div className="g-mockup-input">📢 通常通知メッセージ</div>
              <div className="g-mockup-label">スケジュール</div>
              <div className="g-mockup-input">毎週 金曜日 18:00</div>
              <div className="g-mockup-label">タイトル</div>
              <div className="g-mockup-input">週末限定セールのお知らせ</div>
              <div className="g-mockup-label">本文</div>
              <div className="g-mockup-textarea">今週末は全品10%OFF！ご来店お待ちしております。</div>
              <div className="g-mockup-btn is-amber">➕ この内容で予約をセットする</div>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">5</span>予約一覧の管理</h2>
          <p className="g-desc">設定した予約はタブ下部の一覧で確認でき、不要になったら削除できます。</p>
          <div className="g-mockup">
            <div className="g-mockup-h3">📋 現在設定されている予約配信一覧（3件）</div>
            <div className="g-reservation-item">
              <div>
                <span className="g-res-badge is-coupon">🎫 クーポン予約</span>
                <span className="g-res-schedule">毎週 金曜日</span>
                <div className="g-res-title">週末限定クーポン</div>
                <div className="g-res-body">金曜18時配信・土日限定10%OFF</div>
              </div>
              <button className="g-res-delete">🗑️ 予約を取り消す</button>
            </div>
            <div className="g-reservation-item">
              <div>
                <span className="g-res-badge">📢 通知予約</span>
                <span className="g-res-schedule">毎月 1日</span>
                <div className="g-res-title">今月のおすすめ</div>
                <div className="g-res-body">月初の新メニュー情報をお届け</div>
              </div>
              <button className="g-res-delete">🗑️ 予約を取り消す</button>
            </div>
          </div>

          <h2 className="g-h2"><span className="num">6</span>おすすめの使い方</h2>
          <div className="g-grid">
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">🗓️</span><h4>毎週金曜の週末告知</h4><p>週末の集客を毎週自動で後押し。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">📌</span><h4>月初の新メニュー</h4><p>毎月1日に新メニュー情報を配信。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">🎄</span><h4>季節イベント</h4><p>クリスマス・お正月など、1回限りの予約配信。</p></div>
            <div className="g-card" style={{ cursor: 'default' }}><span className="g-card-icon">💤</span><h4>アイドルタイム対策</h4><p>平日14時に「今空いてます」を定期配信。</p></div>
          </div>

          <div className="g-callout info">
            <span className="ico">💡</span>
            <div>
              <strong>予約配信は「仕込み」が命</strong>
              <p>忙しい日に慌てて通知を考えるのではなく、<strong>余裕のある時にまとめて仕込む</strong>のがプロの運用です。
              月末に翌月分の予約をまとめてセットしておくと、運用が楽になります。</p>
            </div>
          </div>

          <div className="g-related">
            <h3>関連機能</h3>
            <div className="g-related-grid">
              <Link href="/guide/features/push-notification" className="g-related-card">
                <span className="ico">📢</span>
                <div><div className="title">プッシュ通知</div><div className="sub">即時配信の基本</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/features/coupon-normal" className="g-related-card">
                <span className="ico">🎟️</span>
                <div><div className="title">通常クーポン</div><div className="sub">常設クーポン</div></div>
                <span className="arrow">→</span>
              </Link>
              <Link href="/guide/ng-actions" className="g-related-card">
                <span className="ico">⚠️</span>
                <div><div className="title">NG行為集</div><div className="sub">深夜配信はNG</div></div>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="g-cta">
            <h3>予約配信で、仕込みを自動化</h3>
            <p>一度設定すれば、あとは自動で動き続けます。</p>
            <Link href="/signup" className="g-cta-btn">無料相談・資料請求 →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
