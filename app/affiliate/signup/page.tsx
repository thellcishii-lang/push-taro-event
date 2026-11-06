'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateSignupPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessType, setBusinessType] = useState<'individual' | 'corporation'>('individual');
  const [companyName, setCompanyName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [rewardType, setRewardType] = useState<'recurring' | 'one-time'>('recurring');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // URLクエリパラメータから success をチェック
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);

  // 初回ロード時に success パラメータをチェック
    // 初回ロード時に success パラメータをチェック
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const storedEmail = sessionStorage.getItem('affiliate_sent_email') || '';
      setSentEmail(storedEmail);
      setShowSuccess(true);
      sessionStorage.removeItem('affiliate_sent_email');
    }

    // 確認画面から戻ってきた場合の復元
    if (sessionStorage.getItem('affiliate_went_to_confirm') === 'true') {
      const stored = sessionStorage.getItem('affiliate_signup_data');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setName(data.name || '');
          setEmail(data.email || '');
          setEmailConfirm(data.emailConfirm || data.email || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setBusinessType(data.businessType || 'individual');
          setCompanyName(data.companyName || '');
          setInvoiceNumber(data.invoiceNumber || '');
          setRewardType(data.rewardType || 'recurring');
          setTermsAgreed(data.termsAgreed === true);
          if (data.bankAccount) {
            setBankName(data.bankAccount.bankName || '');
            setBranchName(data.bankAccount.branchName || '');
            setAccountType(data.bankAccount.accountType || 'savings');
            setAccountNumber(data.bankAccount.accountNumber || '');
            setAccountHolder(data.bankAccount.accountHolder || '');
          }
        } catch {}
      }
      sessionStorage.removeItem('affiliate_went_to_confirm');
    }
  }, []);

  useEffect(() => {
    if (!error) return;
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errorRef.current?.focus({ preventScroll: true });
    });
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!termsAgreed) {
      setError('利用規約に同意してください。');
      return;
    }

    if (email !== emailConfirm) {
      setError('メールアドレスが一致しません。もう一度入力してください。');
      return;
    }

    if (!address) {
      setError('住所を入力してください。');
      return;
    }

    if (businessType === 'corporation' && !companyName) {
      setError('法人の場合は会社名を入力してください。');
      return;
    }

    if (!bankName || !branchName || !accountNumber || !accountHolder) {
      setError('振込先口座情報はすべて必須です。');
      return;
    }

    const kanaRegex = /^[ァ-ヶー]+$/;
    if (!kanaRegex.test(accountHolder)) {
      setError('口座名義は全角カナで入力してください。');
      return;
    }

    // ✅ sessionStorage に保存して確認画面へ
    sessionStorage.setItem('affiliate_signup_data', JSON.stringify({
      name,
      email,
      emailConfirm,
      phone,
      address,
      businessType,
      companyName: businessType === 'corporation' ? companyName : null,
      invoiceNumber: invoiceNumber || null,
      rewardType,
      bankAccount: { bankName, branchName, accountType, accountNumber, accountHolder },
      termsAgreed,
    }));

    sessionStorage.setItem('affiliate_went_to_confirm', 'true');

    router.push('/affiliate/confirm');
  };

  // ============================================================
  // 登録完了画面（successパラメータで表示）
  // ============================================================
  if (showSuccess) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '60px 20px', fontFamily: 'sans-serif' }}>
        <main style={{ maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a202c', marginBottom: '8px' }}>登録完了しました</h2>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
            <strong>{sentEmail}</strong> に<br />
            ログイン情報（パスワード）を送信しました。
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px' }}>
            メールをご確認の上、ダッシュボードにログインしてください。
          </p>
          <Link href="/affiliate/dashboard" style={{ display: 'inline-block', marginTop: '24px', padding: '12px 32px', background: '#ff4500', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            ダッシュボードへログイン
          </Link>
        </main>
      </div>
    );
  }

  // ============================================================
  // 申し込みフォーム
  // ============================================================
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '560px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a202c', margin: '0 0 8px 0' }}>📢 アフィリエイト登録</h1>
          <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>誰でも無料で始められる！収益化プログラム</p>
        </div>

        {error && (
          <div ref={errorRef} role="alert" tabIndex={-1} style={{ background: '#fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', outline: 'none' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 基本情報 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#1a202c', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              基本情報
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>氏名 <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="text" required placeholder="山田 太郎" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>メールアドレス <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="email" required placeholder="taro@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>メールアドレス（確認） <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="email" required placeholder="確認のためもう一度入力してください" value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)} autoComplete="off" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>電話番号</label>
              <input type="tel" placeholder="090-1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>住所（請求書送付先） <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="text" required placeholder="東京都渋谷区○○1-2-3" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>事業形態 <span style={{ color: '#e53e3e' }}>*</span></label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="businessType" value="individual" checked={businessType === 'individual'} onChange={() => setBusinessType('individual')} />
                  個人
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="businessType" value="corporation" checked={businessType === 'corporation'} onChange={() => setBusinessType('corporation')} />
                  法人
                </label>
              </div>
            </div>

            {businessType === 'corporation' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>会社名 <span style={{ color: '#e53e3e' }}>*</span></label>
                <input type="text" required placeholder="株式会社〇〇" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>インボイス登録番号（任意）</label>
              <input type="text" placeholder="T1234567890123" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: '8px 12px', borderRadius: '6px', marginTop: '8px', fontSize: '12px', color: '#92400e' }}>
                ⚠️ インボイス番号がない場合、報酬支払い時に <strong>10%</strong> が源泉徴収（または手数料）として差し引かれます。
              </div>
            </div>
          </div>

          {/* 報酬タイプ */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#1a202c', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              報酬タイプ
            </h3>

            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', color: '#92400e' }}>
              ⚠️ 報酬タイプは登録後に変更することはできません。慎重に選択してください。
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="rewardType" value="recurring" checked={rewardType === 'recurring'} onChange={() => setRewardType('recurring')} />
                <span>
                  <strong>継続課金型</strong>
                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px' }}>（初年度8%・13ヶ月目以降5%継続還元）</span>
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="rewardType" value="one-time" checked={rewardType === 'one-time'} onChange={() => setRewardType('one-time')} />
                <span>
                  <strong>一括報酬型</strong>
                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px' }}>
                    （PRO:¥5,000 / Standard:¥2,000 / Light:¥1,000）
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* 銀行口座 */}
          <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1a202c' }}>
              💰 振込先口座情報 <span style={{ color: '#e53e3e' }}>*</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              報酬をお振り込みする口座を登録してください（全項目必須）
            </p>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>金融機関名 <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="text" required placeholder="〇〇銀行" value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>支店名 <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="text" required placeholder="△△支店" value={branchName} onChange={(e) => setBranchName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>預金種目 <span style={{ color: '#e53e3e' }}>*</span></label>
              <select required value={accountType} onChange={(e) => setAccountType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}>
                <option value="savings">普通</option>
                <option value="checking">当座</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座番号 <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="text" required placeholder="1234567" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座名義（カナ） <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="text" required placeholder="ヤマダ タロウ" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* 利用規約 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 16px', maxHeight: '150px', overflowY: 'auto', fontSize: '12px', color: '#475569', lineHeight: '1.7' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>📄 アフィリエイト利用規約</p>
              <p>1. アフィリエイトプログラムはPush-taroの収益化プログラムの一部です。</p>
              <p>2. 報酬は紹介した店舗のプランに応じて計算されます。</p>
              <p>3. 不正な紹介行為が発覚した場合、報酬は無効となりアカウントは停止されます。</p>
              <p>4. 報酬は月末締め・翌月払いです。</p>
              <p>5. 報酬タイプの変更はできません。</p>
              <p>6. 本規約は予告なく変更されることがあります。</p>
              <p style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>詳細は <Link href="/terms" style={{ color: '#2563eb' }}>利用規約</Link> をご確認ください。</p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '12px', fontSize: '14px', fontWeight: 'bold' }}>
              <input type="checkbox" required checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} />
              アフィリエイト利用規約に同意する
            </label>
          </div>

          <button
            type="submit"
            disabled={!termsAgreed}
            style={{
              width: '100%',
              padding: '16px',
              background: !termsAgreed ? '#94a3b8' : '#ff4500',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: !termsAgreed ? 'not-allowed' : 'pointer',
            }}
          >
            確認画面へ進む
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>トップページに戻る</Link>
        </div>
      </main>
    </div>
  );
}
