'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import './pos-api.css';

export default function PosApiClient() {
  return (
    <div className="dev-main">
      <nav className="dev-nav">
        <div className="dev-nav-inner">
          <Link href="/">
            <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px', color: '#fff' }}>
              Push-taro<span style={{ color: '#ff4500' }}>.</span> <span style={{ fontSize: '12px', color: '#38bdf8', marginLeft: '8px' }}>Developers</span>
            </span>
          </Link>
          <Link href="/guide/pos-integration">← POS連携ガイドに戻る</Link>
        </div>
      </nav>

      <main className="dev-container">
        <div className="dev-breadcrumb">
          <Link href="/">ホーム</Link> / Developers / POS連携 API
        </div>

        <div className="dev-hero">
          <span style={{ display: 'inline-block', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '16px' }}>
            API REFERENCE v1
          </span>
          <h1>POS連携 API</h1>
          <p>
            お使いのPOSレジとPush-taroを連携させるためのAPI仕様です。<br />
            クーポンの有効性確認、消込確定、クーポン一覧の取得が可能です。
          </p>
        </div>

        {/* 1. 認証 */}
        <section className="dev-section">
          <h2>1. 認証</h2>
          <p className="dev-text">
            すべてのAPIリクエストには、HTTPヘッダに<code>Authorization</code>を含める必要があります。<br />
            APIキーは、Push-taroの<strong>PRO管理画面</strong>から発行できます。
          </p>
          <div className="code-block">
            <pre><span className="keyword">Authorization</span>: <span className="string">Bearer pt_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</span></pre>
          </div>
          <div className="dev-callout">
            <p>
              <strong>APIキーの再表示はできません</strong>
              発行時に一度だけ表示されます。安全な場所に保管してください。漏洩した場合は、PRO管理画面から即座に失効させてください。
            </p>
          </div>
        </section>

        {/* 2. 共通ヘッダ */}
        <section className="dev-section">
          <h2>2. 共通ヘッダ</h2>
          <div className="dev-table-wrap">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>ヘッダ名</th>
                  <th>必須</th>
                  <th>説明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Authorization</code></td>
                  <td>必須</td>
                  <td><code>Bearer pt_live_...</code> 形式のAPIキー</td>
                </tr>
                <tr>
                  <td><code>X-POS-Terminal-Id</code></td>
                  <td>任意</td>
                  <td>レジ識別子（例: <code>register-01</code>）。監査ログに記録されます。</td>
                </tr>
                <tr>
                  <td><code>Idempotency-Key</code></td>
                  <td>redeemのみ必須</td>
                  <td>UUID形式の冪等キー。同じクーポン・同じキーの再送は、保存済みの成功結果を返します。別のクーポンに同じキーを使うと409になります。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. クーポン一覧 */}
        <section className="dev-section">
          <h2>3. クーポン一覧の取得</h2>
          <div className="endpoint">
            <span className="method get">GET</span>
            <span className="path">/api/pos/v1/coupons</span>
          </div>
          <p className="dev-text">
            店舗で現在有効なクーポンの一覧を取得します。POSのマスタ同期などに利用できます。
            これは店舗の設定一覧で、顧客ごとの使用可否は検証APIで確認してください。期限切れは除外され、予約クーポンにはcouponIdが付きます。
            連続ログイン達成クーポンはcouponTypeにstreakを指定して検証・消し込みできます。
          </p>
          <h3>レスポンス</h3>
          <div className="code-block">
            <pre>
{`{
  "coupons": [
    { "couponType": "first", "title": "初回限定 10%OFF" },
    { "couponType": "normal", "title": "会員様 5%OFF" },
    { "couponType": "loyalty", "title": "3回達成 20%OFF" },
    { "couponType": "streak", "title": "連続ログイン達成クーポン" },
    { "couponType": "scheduled", "couponId": "scheduled-123", "title": "週末特典" }
  ]
}`}
            </pre>
          </div>
        </section>

        {/* 4. 検証 */}
        <section className="dev-section">
          <h2>4. クーポンの検証（消込なし）</h2>
          <div className="endpoint">
            <span className="method post">POST</span>
            <span className="path">/api/pos/v1/verify</span>
          </div>
          <p className="dev-text">
            QRコードの内容を送信し、そのクーポンが有効かどうかを確認します。<br />
            <strong>消込は行わない</strong>ため、会計前の確認に利用できます。
            確認後に別のレジで使用される場合もあるため、会計時には消込APIの成功を必ず確認してください。
          </p>
          <h3>リクエストボディ</h3>
          <div className="code-block">
            <pre>
{`{
  "qrPayload": "{\\"shopId\\":\\"xxx\\",\\"couponType\\":\\"first\\",\\"token\\":\\"yyy\\"}"
}`}
            </pre>
          </div>
          <h3>レスポンス（成功）</h3>
          <div className="code-block">
            <pre>
{`{
  "valid": true,
  "couponTitle": "初回限定 10%OFF",
  "couponType": "first"
}`}
            </pre>
          </div>
          <h3>レスポンス（失敗）</h3>
          <div className="code-block">
            <pre>
{`{
  "valid": false,
  "error": "⚠️ この初回限定クーポンはすでに使用済みです！"
}`}
            </pre>
          </div>
        </section>

        {/* 5. 消込確定 */}
        <section className="dev-section">
          <h2>5. クーポンの消込確定</h2>
          <div className="endpoint">
            <span className="method post">POST</span>
            <span className="path">/api/pos/v1/redeem</span>
          </div>
          <p className="dev-text">
            QRコードの内容を送信し、クーポンの消込を確定します。<br />
            このエンドポイントには、<strong><code>Idempotency-Key</code> ヘッダが必須</strong>です。
            1回の消込操作ごとにUUIDを作り、通信切断や500エラー時の再送には同じUUIDとQRデータを使ってください。
            消込・利用履歴・成功結果は一括保存されます。同じキーでの再送時はidempotent: trueが返ります。
          </p>
          <h3>リクエストヘッダ</h3>
          <div className="code-block">
            <pre><span className="keyword">Idempotency-Key</span>: <span className="string">550e8400-e29b-41d4-a716-446655440000</span></pre>
          </div>
          <h3>リクエストボディ</h3>
          <div className="code-block">
            <pre>
{`{
  "qrPayload": "{\\"shopId\\":\\"xxx\\",\\"couponType\\":\\"first\\",\\"token\\":\\"yyy\\"}"
}`}
            </pre>
          </div>
          <h3>レスポンス（成功）</h3>
          <div className="code-block">
            <pre>
{`{
  "success": true,
  "couponTitle": "初回限定 10%OFF",
  "redeemedAt": "2026-10-25T12:34:56.000Z"
}`}
            </pre>
          </div>
        </section>

        {/* 6. エラーコード */}
        <section className="dev-section">
          <h2>6. エラーコード一覧</h2>
          <div className="dev-table-wrap">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>HTTPステータス</th>
                  <th>説明</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>400</code></td><td>形式不正、必須パラメータ不足、クーポン無効、未達成・未配布など</td></tr>
                <tr><td><code>401</code></td><td>APIキーが無効、または認証ヘッダがない</td></tr>
                <tr><td><code>403</code></td><td>店舗不一致、顧客の店舗登録なし、または許可されていないレジ</td></tr>
                <tr><td><code>404</code></td><td>店舗・顧客・予約クーポンが見つからない</td></tr>
                <tr><td><code>409</code></td><td>使用済み、当日併用不可、または別のQRデータで同じ冪等キーを使用（同じQRの成功再送は200）</td></tr>
                <tr><td><code>410</code></td><td>クーポンの有効期限切れ</td></tr>
                <tr><td><code>500</code></td><td>サーバー内部エラー</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. サンプルコード */}
        <section className="dev-section">
          <h2>7. サンプルコード（Node.js）</h2>
          <p className="dev-text">axiosを使用した実装例です。</p>
          <div className="code-block">
            <pre>
{`import axios from 'axios';
import { randomUUID } from 'crypto';

const API_KEY = 'pt_live_xxxxxxxxxxxxxxxx';
const SHOP_ID = 'shop_xxxxx';
const qrPayload = JSON.stringify({
  shopId: SHOP_ID,
  couponType: 'first',
  token: 'fcm_token_xxxxx'
});

// 1. 検証
const verify = await axios.post(
  'https://push-taro.com/api/pos/v1/verify',
  { qrPayload },
  {
    headers: { Authorization: \`Bearer \${API_KEY}\` },
    validateStatus: (status) => status < 500
  }
);

if (!verify.data.valid) {
  throw new Error(verify.data.error || 'クーポンが無効です');
}

// 2. 消込
// 通信失敗時は、このキーを変えずに同じリクエストを再送する。
const idempotencyKey = randomUUID();
const redeem = await axios.post(
  'https://push-taro.com/api/pos/v1/redeem',
  { qrPayload },
  {
    headers: {
      Authorization: \`Bearer \${API_KEY}\`,
      'Idempotency-Key': idempotencyKey,
      'X-POS-Terminal-Id': 'register-01'
    }
  }
);

console.log('消込完了:', redeem.data.couponTitle);`}
            </pre>
          </div>
        </section>

        <section className="dev-section">
          <h2>運用前の確認</h2>
          <p className="dev-text">
            このAPIはクーポンの確認・消込を行います。割引率・値引額の計算や会計への適用はPOS側で設定してください。
            会計を確定する際に消込を行い、成功するまで特典適用を確定しないでください。
            確定後の消込取消APIはありません。通信失敗時は新しいキーでやり直さず、保存した冪等キーで結果を確認してください。
          </p>
          <p className="dev-text">
            本番運用前にテスト用顧客で、検証だけでは使用済みにならないこと、消込後の顧客画面・使用履歴への反映、
            同じキーでの再送、別レジからの重複利用、キー失効後の401を確認してください。
            顧客画面は表示中なら通常10秒ごと、または画面復帰時に使用状況を更新します。
          </p>
        </section>

        {/* フッターリンク */}
        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #1e293b', textAlign: 'center' }}>
          <Link href="/guide/pos-integration" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>
            ← POS連携ガイドに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
