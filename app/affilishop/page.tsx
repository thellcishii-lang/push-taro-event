'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// affilishop（実店舗向けアフィリエイト）申し込みページ
// ※ LP等での公募は行わず、メールで案内されたURLからのみアクセスする想定
export default function AffilishopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [businessType, setBusinessType] = useState<'individual' | 'corporation'>('corporation');
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const [agreed, setAgreed] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const stored = sessionStorage.getItem('affilishop_sent_email') || '';
      setSentEmail(stored);
      setSubmitted(true);
      sessionStorage.removeItem('affilishop_sent_email');
    }

    if (sessionStorage.getItem('affilishop_went_to_confirm') === 'true') {
      const stored = sessionStorage.getItem('affilishop_signup_data');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setBusinessType(data.businessType || 'corporation');
          setCompanyName(data.companyName || '');
          setOwnerName(data.ownerName || '');
          setEmail(data.email || '');
          setEmailConfirm(data.emailConfirm || data.email || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setInvoiceNumber(data.invoiceNumber || '');
          setBankName(data.bankAccount?.bankName || '');
          setBranchName(data.bankAccount?.branchName || '');
          setAccountType(data.bankAccount?.accountType || 'savings');
          setAccountNumber(data.bankAccount?.accountNumber || '');
          setAccountHolder(data.bankAccount?.accountHolder || '');
          setAgreed(data.agreed === true);
        } catch {}
      }
      sessionStorage.removeItem('affilishop_went_to_confirm');
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

    if (!agreed) {
      setError('affilishop利用規約に同意してください。');
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

    sessionStorage.setItem('affilishop_signup_data', JSON.stringify({
      businessType,
      companyName,
      ownerName,
      email,
      emailConfirm,
      phone,
      address,
      invoiceNumber: invoiceNumber || null,
      bankAccount: { bankName, branchName, accountType, accountNumber, accountHolder },
      agreed,
    }));

    router.push('/affilishop/confirm');
  };

  if (submitted) {
    return (
      <main style={{ maxWidth: '650px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#f0f9ff', padding: '40px 30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bae6fd' }}>
          <h2 style={{ color: '#0369a1', marginBottom: '16px', fontSize: '24px' }}>affilishopお申し込みを受け付けました</h2>
          <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '24px', fontSize: '15px' }}>
            ご登録ありがとうございます。ご入力いただいた内容をもとに審査を行わせていただきます。<br />
            審査完了後、ご登録のメールアドレス宛（<strong>{sentEmail}</strong>）に結果をご案内いたします。
          </p>
          <Link href="/" style={{ display: 'inline-block', background: '#0ea5e9', color: '#fff', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>トップページへ戻る</Link>
        </div>
      </main>
    );
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#2d3748', background: '#f8fafc', minHeight: '100vh', margin: 0, padding: 0, lineHeight: 1.7 }}>
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a202c' }}>
          <Link href="/" style={{ color: '#1a202c', textDecoration: 'none' }}>
            Push-taro<span style={{ color: '#0ea5e9', fontSize: '14px', marginLeft: '8px', fontWeight: 'normal' }}>クーポンアプリ</span>
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <span style={{ background: '#f0f9ff', color: '#0ea5e9', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
              affilishop Partner Program
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '16px 0 10px 0', color: '#1a202c' }}>
              affilishop（実店舗向けアフィリエイト）お申し込み
            </h1>
            <p style={{ color: '#718096', fontSize: '15px' }}>
              必要事項をご入力の上、審査へお進みください。加盟金・月額費用は一切発生しません。
            </p>
          </div>

          <div style={{ background: '#f0f9ff', border: '2px solid #bae6fd', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#1a202c' }}>紹介報酬率</h3>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0ea5e9' }}>
              初年度 10% <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#4a5568' }}>（13ヶ月目以降 7%・全プラン一律）</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>加盟金・月額費用なし。3ヶ月間紹介実績が0件の場合は自動退会となります。</p>
          </div>

          {error && (
            <div ref={errorRef} role="alert" tabIndex={-1} style={{ background: '#fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', outline: 'none' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #edf2f7' }}>
              申請者情報入力
            </h2>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>事業形態 <span style={{ color: 'red' }}>*</span></label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="businessType" value="individual" checked={businessType === 'individual'} onChange={() => setBusinessType('individual')} />
                  個人事業主
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="businessType" value="corporation" checked={businessType === 'corporation'} onChange={() => setBusinessType('corporation')} />
                  法人
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                {businessType === 'corporation' ? '会社名' : '屋号'} <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={businessType === 'corporation' ? '例: 株式会社サンプル商店' : '例: サンプル店'}
                style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>ご担当者様のお名前 <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="例: 山田 太郎"
                style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>メールアドレス（連絡用） <span style={{ color: 'red' }}>*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例: shop@example.com"
                style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>メールアドレス（確認） <span style={{ color: 'red' }}>*</span></label>
              <input
                type="email"
                required
                value={emailConfirm}
                onChange={(e) => setEmailConfirm(e.target.value)}
                placeholder="確認のためもう一度入力してください"
                autoComplete="off"
                style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>お電話番号 <span style={{ color: 'red' }}>*</span></label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="例: 03-1234-5678"
                style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>ご住所 <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 東京都渋谷区..."
                style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>適格請求書発行事業者登録番号（インボイス番号）</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="例: T1234567890123"
                style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: '8px 12px', borderRadius: '6px', marginTop: '8px', fontSize: '12px', color: '#92400e' }}>
                ⚠️ インボイス番号がない場合、報酬の支払い時に <strong>10%</strong> が源泉徴収（または手数料）として差し引かれます。
              </div>
            </div>

            <div style={{ marginBottom: '25px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1a202c' }}>
                💰 成果報酬の振込先口座情報 <span style={{ color: 'red' }}>*</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                報酬をお振り込みする口座を登録してください（全項目必須）
              </p>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>金融機関名 <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required placeholder="〇〇銀行" value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>支店名 <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required placeholder="△△支店" value={branchName} onChange={(e) => setBranchName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>預金種目 <span style={{ color: 'red' }}>*</span></label>
                <select required value={accountType} onChange={(e) => setAccountType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}>
                  <option value="savings">普通</option>
                  <option value="checking">当座</option>
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座番号 <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required placeholder="1234567" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座名義（カナ） <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required placeholder="ヤマダ タロウ" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' }}>affilishop利用規約（要旨）</h3>
              <div style={{ height: '180px', overflowY: 'auto', fontSize: '12px', color: '#4a5568', background: '#ffffff', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>第1条（総則）</strong><br />本規約は、Push-taroが提供するaffilishop（実店舗向けアフィリエイト）プログラムの取扱い条件を定めるものです。加盟金・月額費用は発生しません。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第2条（審査）</strong><br />申込み後、当社の審査を経て承認された場合にのみaffilishopとして認定され、専用アカウントが発行されます。審査結果は却下も含め記録として保存されます。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第3条（成果報酬）</strong><br />紹介コード経由での契約に対し、全プラン一律で報酬を支払います（初年度10%・13ヶ月目以降7%）。報酬は月末締め・翌月払いです。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第4条（自動退会）</strong><br />直近3ヶ月間の紹介実績が0件の場合、当社は事前の通知をもって自動的に契約を終了することができます。</p>
                <p style={{ margin: '0 0 5px 0' }}><strong>第5条（禁止事項・秘密保持等）</strong><br />虚偽・誇大な勧誘、紹介コードの譲渡・二次貸与、当社または第三者の信用を毀損する行為を禁止します。</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="agreement" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="agreement" style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', cursor: 'pointer' }}>
                  「affilishop利用規約」の全条項を確認し、同意します。
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!agreed || loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '16px',
                color: '#ffffff',
                border: 'none',
                background: agreed && !loading ? '#0ea5e9' : '#cbd5e0',
                cursor: agreed && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? '送信中...' : '確認画面へ進む'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
