// app/privacy/PrivacyClient.tsx
'use client';

import Link from 'next/link';

export default function PrivacyClient() {
  return (
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#2d3748', background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', lineHeight: '1.8' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        
        <p style={{ marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 'bold' }}>← トップページに戻る</Link>
        </p>
        
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#1a202c', borderBottom: '3px solid #3182ce', paddingBottom: '10px' }}>
          プライバシーポリシー
        </h1>
        
        <p style={{ marginBottom: '24px', fontSize: '14px', color: '#4a5568' }}>
          the合同会社（以下、「当社」といいます。）は、当社が提供するPush-taro（以下、「本サービス」といいます。）におけるお客様の個人情報の取扱いについて、以下の通りプライバシーポリシー（以下、「本ポリシー」といいます。）を定め、適切な保護に努めます。
        </p>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>1. 取得する情報</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>当社は、本サービスの提供にあたり以下の情報を取得します。</p>
          <ul style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>契約者情報（会社名・屋号、氏名、住所、電話番号、メールアドレス、インボイス登録番号）</li>
            <li>決済および成果報酬振込用情報（クレジットカード情報、銀行口座情報）</li>
            <li>サービス利用ログ（ブラウザ Push通知トークン、利用環境、アクセスログ等）</li>
          </ul>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>2. 利用目的</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>取得した個人情報は、以下の目的のためにのみ利用します。</p>
          <ul style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>本サービスの提供・運用・管理（アカウント作成、Push通知配信処理等）</li>
            <li>利用料金の請求および紹介成果報酬の決済・お振込み</li>
            <li>サービスに関するお知らせ・アップデート情報・サポート対応</li>
            <li>不正利用の防止および規約違反対応</li>
            <li>本サービスの品質向上および利用状況の分析</li>
          </ul>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>3. アクセス解析ツールについて</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            当サービスでは、サービス向上および利用状況の把握のため、
            <strong>Google Analytics 4（以下、GA4）</strong>を使用しています。
          </p>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            GA4 は Cookie を使用して、個人を特定しない形で
            アクセス情報（閲覧ページ、滞在時間、流入元、お使いのブラウザやデバイス情報など）を収集します。
            収集されたデータは Google のプライバシーポリシーに基づいて管理されます。
          </p>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            なお、GA4 によるデータ収集は、以下の方法で無効化することが可能です。
          </p>
          <ul style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>ブラウザの Cookie 設定から Cookie を無効化する</li>
            <li>Google アナリティクス オプトアウト アドオンをインストールする</li>
          </ul>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '10px', fontSize: '13px', color: '#4a5568' }}>
            <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>関連リンク</p>
            <p style={{ margin: '0 0 4px 0' }}>
              Google プライバシーポリシー：
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce', textDecoration: 'underline', marginLeft: '4px' }}>
                https://policies.google.com/privacy
              </a>
            </p>
            <p style={{ margin: 0 }}>
              Google アナリティクス オプトアウト アドオン：
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce', textDecoration: 'underline', marginLeft: '4px' }}>
                https://tools.google.com/dlpage/gaoptout
              </a>
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>4. 第三者提供の制限</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            当社は、法令に基づく場合を除き、あらかじめご本人の同意を得ることなく第三者に個人情報を提供することはありません。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>5. 安全管理措置</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            当社は、個人情報の漏洩・改ざん・紛失・不正アクセス等を防止するため、技術的・組織的な安全管理措置を実施いたします。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>6. 本ポリシーの変更</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            当社は、法令の改正やサービス内容の変更等に応じて、本ポリシーを予告なく変更することがあります。
            変更後の本ポリシーは、本サービス上に掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>7. お問い合わせ窓口</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            個人情報の開示・訂正・削除のご請求、その他お問い合わせは下記窓口までご連絡ください。
          </p>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '10px', fontSize: '13px', color: '#4a5568' }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>the合同会社 個人情報問合せ窓口</p>
            <p style={{ margin: '0 0 2px 0' }}>住所：〒357-0123 埼玉県飯能市中藤下郷２３−２１</p>
            <p style={{ margin: 0 }}>E-mail：info@push-taro.com</p>
          </div>
        </section>

      </div>
    </main>
  );
}
