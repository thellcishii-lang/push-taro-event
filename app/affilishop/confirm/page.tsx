'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AffilishopConfirmPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('affilishop_signup_data');
    if (!stored) {
      router.push('/affilishop');
      return;
    }
    try {
      setFormData(JSON.parse(stored));
    } catch {
      router.push('/affilishop');
    }
  }, [router]);

  const handleBack = () => {
    sessionStorage.setItem('affilishop_went_to_confirm', 'true');
    router.push('/affilishop');
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/affilishop/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '申込処理に失敗しました');
      }

      sessionStorage.setItem('affilishop_sent_email', formData.email);
      sessionStorage.removeItem('affilishop_signup_data');
      router.push('/affilishop?success=true');

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!formData) {
    return <div style={{ padding: 40, textAlign: 'center' }}>読み込み中...</div>;
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '8px' }}>affilishop申し込み内容の確認</h1>
        <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px', marginBottom: '30px' }}>
          ご入力内容に間違いがないかご確認ください。
        </p>

        {error && (
          <div style={{ background: '#fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>affilishop申し込み内容</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div><strong>事業形態</strong><br />{formData.businessType === 'corporation' ? '法人' : '個人事業主'}</div>
            <div><strong>会社名 / 屋号</strong><br />{formData.companyName || '未入力'}</div>
            <div><strong>ご担当者様</strong><br />{formData.ownerName || '未入力'}</div>
            <div><strong>メールアドレス</strong><br />{formData.email || '未入力'}</div>
            <div><strong>電話番号</strong><br />{formData.phone || '未入力'}</div>
            <div><strong>住所</strong><br />{formData.address || '未入力'}</div>
            <div><strong>インボイス番号</strong><br />{formData.invoiceNumber || '未登録'}</div>
            <div><strong>金融機関名</strong><br />{formData.bankAccount?.bankName || '未入力'}</div>
            <div><strong>支店名</strong><br />{formData.bankAccount?.branchName || '未入力'}</div>
            <div><strong>口座種別</strong><br />{formData.bankAccount?.accountType === 'savings' ? '普通' : '当座'}</div>
            <div><strong>口座番号</strong><br />{formData.bankAccount?.accountNumber || '未入力'}</div>
            <div><strong>口座名義</strong><br />{formData.bankAccount?.accountHolder || '未入力'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleBack}
            disabled={loading}
            style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e0', background: '#fff', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}
          >
            戻って修正する
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ flex: 2, padding: '14px', borderRadius: '8px', border: 'none', background: loading ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? '送信中...' : 'この内容で申し込む'}
          </button>
        </div>
      </main>
    </div>
  );
}
