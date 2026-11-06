// app/signup/confirm/SignupConfirmClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupConfirmClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // sessionStorage からデータを取得
    const stored = sessionStorage.getItem('signup_data');
    if (!stored) {
      // データがない場合は申し込みページに戻す
      router.push('/signup');
      return;
    }
    try {
      setFormData(JSON.parse(stored));
    } catch {
      router.push('/signup');
    }
  }, [router]);

  useEffect(() => {
    if (!formData) return;
    localStorage.setItem('signup_data', JSON.stringify(formData));
  }, [formData]);

  const handleBack = () => {
    sessionStorage.setItem('went_to_confirm', 'true');
    router.push('/signup');
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '登録に失敗しました。');
      }

      // ★ 追加：shopId を localStorage に保存（後で使う）
      if (data.shopId) {
        localStorage.setItem('last_shop_id', data.shopId);
        localStorage.setItem('last_shop_plan', formData.plan || 'light');
      }

      // 決済リンクがあればリダイレクト
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert('申し込みを受け付けました。メールに記載された決済リンクからお手続きください。');
        router.push('/');
      }
    } catch (err: any) {
      alert('エラー: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadApplicationPdf = async () => {
    if (!formData) return;
    try {
      const res = await fetch('/api/generate-application-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'shop', data: formData }),
      });
      if (!res.ok) {
        alert('申込書の生成に失敗しました');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '申込書.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('エラー: ' + err.message);
    }
  };

  if (!formData) {
    return <div style={{ padding: 40, textAlign: 'center' }}>読み込み中...</div>;
  }

  const { companyName, email, phone, address, invoiceNumber, plan, bankAccount } = formData;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '650px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '8px' }}>申し込み内容の確認</h1>
        <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px', marginBottom: '30px' }}>
          ご入力内容に間違いがないかご確認ください。
        </p>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>お申し込み内容</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div><strong>会社名 / 屋号</strong><br />{companyName || '未入力'}</div>
            <div><strong>メールアドレス</strong><br />{email || '未入力'}</div>
            <div><strong>電話番号</strong><br />{phone || '未入力'}</div>
            <div><strong>住所</strong><br />{address || '未入力'}</div>
            <div><strong>選択プラン</strong><br />{plan ? plan.toUpperCase() : '未選択'}</div>
            <div><strong>インボイス番号</strong><br />{invoiceNumber || '未登録'}</div>
            {plan === 'pro' && bankAccount && (
              <>
                <div><strong>金融機関名</strong><br />{bankAccount.bankName || '未入力'}</div>
                <div><strong>支店名</strong><br />{bankAccount.branchName || '未入力'}</div>
                <div><strong>口座種別</strong><br />{bankAccount.accountType === 'savings' ? '普通' : '当座'}</div>
                <div><strong>口座番号</strong><br />{bankAccount.accountNumber || '未入力'}</div>
                <div><strong>口座名義</strong><br />{bankAccount.accountHolder || '未入力'}</div>
              </>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#4a5568' }}>
            <strong>📄 申込書・利用規約</strong><br />
            お申し込み前に内容と利用規約をご確認ください。
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <a
              href={`/print/application?type=${plan === 'pro' ? 'pro-shop' : 'shop'}`}
              style={{ display: 'inline-block', padding: '6px 16px', background: '#e2e8f0', color: '#2d3748', borderRadius: '4px', textDecoration: 'none', fontSize: '13px' }}
            >
              📥 申込書をダウンロード
            </a>
            <a
              href={`/print/terms?type=${plan === 'pro' ? 'pro-shop' : 'shop'}`}
              style={{ display: 'inline-block', padding: '6px 16px', background: '#e2e8f0', color: '#2d3748', borderRadius: '4px', textDecoration: 'none', fontSize: '13px' }}
            >
              📥 利用規約をダウンロード
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleBack}
            style={{ flex: 1, padding: '14px', background: '#e2e8f0', color: '#2d3748', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            ← 戻る（修正する）
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: loading ? '#94a3b8' : '#ff4500',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 69, 0, 0.3)',
            }}
          >
            {loading ? '処理中...' : '申し込む（決済画面へ進む）'}
          </button>
        </div>
      </main>
    </div>
  );
}
