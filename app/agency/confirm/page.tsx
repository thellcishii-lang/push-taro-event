'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgencyConfirmPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('agency_signup_data');
    if (!stored) {
      router.push('/agency');
      return;
    }
    try {
      setFormData(JSON.parse(stored));
    } catch {
      router.push('/agency');
    }
  }, [router]);

  const handleBack = () => {
    sessionStorage.setItem('agency_went_to_confirm', 'true');
    router.push('/agency');
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/agency/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '申込処理に失敗しました');
      }

      // メールアドレスを保存して完了画面へ
      sessionStorage.setItem('agency_sent_email', formData.email);
      sessionStorage.removeItem('agency_signup_data');
      router.push('/agency?success=true');

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDownloadApplicationPdf = async () => {
    if (!formData) return;
    try {
      const res = await fetch('/api/generate-application-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'agency', data: formData }),
      });
      if (!res.ok) {
        alert('申込書の生成に失敗しました');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '代理店申込書.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('エラー: ' + err.message);
    }
  };

  if (!formData) {
    return <div style={{ padding: 40, textAlign: 'center' }}>読み込み中...</div>;
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '8px' }}>代理店申し込み内容の確認</h1>
        <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px', marginBottom: '30px' }}>
          ご入力内容に間違いがないかご確認ください。
        </p>

        {error && (
          <div style={{ background: '#fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>代理店申し込み内容</h3>
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

        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#4a5568' }}>
            <strong>📄 申込書・利用規約</strong><br />
            お申し込み前に内容と利用規約をご確認ください。
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button
              onClick={handleDownloadApplicationPdf}
              style={{ padding: '6px 16px', background: '#e2e8f0', color: '#2d3748', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
            >
              📥 申込書をダウンロード
            </button>
            <a
              href="/api/generate-terms-pdf?type=agency"
              download="代理店利用規約.pdf"
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
            }}
          >
            {loading ? '処理中...' : '申し込む'}
          </button>
        </div>
      </main>
    </div>
  );
}
