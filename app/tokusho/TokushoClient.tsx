// app/tokusho/TokushoClient.tsx
'use client';

import Link from 'next/link';

export default function TokushoClient() {
  return (
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#2d3748', background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', lineHeight: '1.8' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        
        <p style={{ marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 'bold' }}>← トップページに戻る</Link>
        </p>
        
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: '#1a202c', borderBottom: '3px solid #3182ce', paddingBottom: '10px' }}>
          特定商取引法に基づく表記
        </h1>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', border: '1px solid #e2e8f0' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ background: '#f8fafc', padding: '14px', width: '30%', textAlign: 'left', color: '#2d3748' }}>事業者名</th>
              <td style={{ padding: '14px', color: '#4a5568' }}>the合同会社</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ background: '#f8fafc', padding: '14px', textAlign: 'left', color: '#2d3748' }}>所在地</th>
              <td style={{ padding: '14px', color: '#4a5568' }}>〒357-0123 埼玉県飯能市中藤下郷２３−２１</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ background: '#f8fafc', padding: '14px', textAlign: 'left', color: '#2d3748' }}>メールアドレス</th>
              <td style={{ padding: '14px', color: '#4a5568' }}>info@push-taro.com</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ background: '#f8fafc', padding: '14px', textAlign: 'left', color: '#2d3748' }}>販売価格</th>
              <td style={{ padding: '14px', color: '#4a5568' }}>
                各プラン詳細ページ（料金表）に表示する通り。<br />
                ・ライトプラン: 1,980円/月（税別）<br />
                ・スタンダードプラン: 3,800円/月（税別）<br />
                ・プロプラン: 10,000円/月（税別）
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ background: '#f8fafc', padding: '14px', textAlign: 'left', color: '#2d3748' }}>商品以外の必要料金</th>
              <td style={{ padding: '14px', color: '#4a5568' }}>インターネット接続に伴う通信料（お客様負担）</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ background: '#f8fafc', padding: '14px', textAlign: 'left', color: '#2d3748' }}>お支払い方法</th>
              <td style={{ padding: '14px', color: '#4a5568' }}>クレジットカード決済（Square決済等）</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ background: '#f8fafc', padding: '14px', textAlign: 'left', color: '#2d3748' }}>引き渡し時期</th>
              <td style={{ padding: '14px', color: '#4a5568' }}>お申込みおよび決済手続き完了後、即時ご利用いただけます。</td>
            </tr>
            <tr>
              <th style={{ background: '#f8fafc', padding: '14px', textAlign: 'left', color: '#2d3748' }}>返品・中途解約について</th>
              <td style={{ padding: '14px', color: '#4a5568' }}>
                デジタルコンテンツおよびサービスの性質上、決済完了後の返品・返金には応じられません。<br />
                中途解約は管理画面よりいつでも可能ですが、契約満了日までサービスが維持され、日割り計算での返金は行われません。
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </main>
  );
}
