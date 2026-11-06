// app/agency/AgencyClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AgencyClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 基本情報
  const [businessType, setBusinessType] = useState<'individual' | 'corporation'>('corporation');
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // 銀行口座（詳細）
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const [agreed, setAgreed] = useState(false);

  // success パラメータのチェック（完了画面用）
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const stored = sessionStorage.getItem('agency_sent_email') || '';
      setSentEmail(stored);
      setSubmitted(true);
      sessionStorage.removeItem('agency_sent_email');
    }

    if (sessionStorage.getItem('agency_went_to_confirm') === 'true') {
      const stored = sessionStorage.getItem('agency_signup_data');
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
      sessionStorage.removeItem('agency_went_to_confirm');
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
      setError('代理店利用規約に同意してください。');
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

    if (!/^\d{7}$/.test(accountNumber)) {
      setError('口座番号は7桁の半角数字で入力してください。');
      return;
    }

    const kanaRegex = /^[ァ-ヶー]+$/;
    if (!kanaRegex.test(accountHolder)) {
      setError('口座名義は全角カナで入力してください。');
      return;
    }

    // ✅ sessionStorage に保存して確認画面へ
    sessionStorage.setItem('agency_signup_data', JSON.stringify({
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

    router.push('/agency/confirm');
  };

  // ============================================================
  // 完了画面
  // ============================================================
  if (submitted) {
    return (
      <main style={{ maxWidth: '650px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#f0fdf4', padding: '40px 30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
          <h2 style={{ color: '#166534', marginBottom: '16px', fontSize: '24px' }}>代理店お申し込みを受け付けました</h2>
          <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '24px', fontSize: '15px' }}>
            ご登録ありがとうございます。ご入力いただいた内容をもとに審査を行わせていただきます。<br />
            審査完了後、ご登録のメールアドレス宛（<strong>{sentEmail}</strong>）に<strong>決済手続き用のご案内メール</strong>をお送りいたします。
          </p>
          <Link href="/" style={{ display: 'inline-block', background: '#3182ce', color: '#fff', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>トップページへ戻る</Link>
        </div>
      </main>
    );
  }

  // ============================================================
  // 申し込みフォーム
  // ============================================================
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#2d3748', background: '#f8fafc', minHeight: '100vh', margin: 0, padding: 0, lineHeight: 1.7 }}>
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a202c' }}>
          <Link href="/" style={{ color: '#1a202c', textDecoration: 'none' }}>
            Push-taro<span style={{ color: '#3182ce', fontSize: '14px', marginLeft: '8px', fontWeight: 'normal' }}>クーポンアプリ</span>
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <span style={{ background: '#ebf8ff', color: '#3182ce', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
              Official Partner Program
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '16px 0 10px 0', color: '#1a202c' }}>
              代理店パートナーお申し込み
            </h1>
            <p style={{ color: '#718096', fontSize: '15px' }}>
              必要事項をご入力の上、パートナー登録の審査へお進みください。
            </p>
          </div>

          {error && (
            <div ref={errorRef} role="alert" tabIndex={-1} style={{ background: '#fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', outline: 'none' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ebf8ff 0%, #eef2ff 100%)', border: '2px solid #bee3f8', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#1a202c' }}>加盟金（初期費用）</h3>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#3182ce' }}>
                300,000円 <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#4a5568' }}>(税別)</span>
              </div>
            </div>
            <div style={{ background: '#f7fafc', border: '2px solid #cbd5e0', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#1a202c' }}>代理店月額費用</h3>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#1a202c' }}>
                30,000円 <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#4a5568' }}>/月 (税別)</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #edf2f7' }}>
              申請者情報入力
            </h2>

            {/* 事業形態 */}
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

            {/* 会社名 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                {businessType === 'corporation' ? '会社名' : '屋号'} <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={businessType === 'corporation' ? '例: 株式会社サンプルエージェンシー' : '例: サンプル企画'}
                style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            {/* 担当者名 */}
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

            {/* メールアドレス */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>メールアドレス（連絡用） <span style={{ color: 'red' }}>*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例: agency@example.com"
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

            {/* 電話番号 */}
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

            {/* 住所 */}
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

            {/* インボイス番号 */}
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
                ⚠️ インボイス番号がない場合、代理店報酬の支払い時に <strong>10%</strong> が源泉徴収（または手数料）として差し引かれます。
              </div>
            </div>

            {/* 銀行口座（詳細） */}
            <div style={{ marginBottom: '25px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1a202c' }}>
                💰 成果報酬の振込先口座情報 <span style={{ color: 'red' }}>*</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                代理店報酬をお振り込みする口座を登録してください（全項目必須）
              </p>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>金融機関名 <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="〇〇銀行"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>支店名 <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="△△支店"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>預金種目 <span style={{ color: 'red' }}>*</span></label>
                <select
                  required
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                >
                  <option value="savings">普通</option>
                  <option value="checking">当座</option>
                </select>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座番号 <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="1234567"
                  value={accountNumber}
                  onChange={(e) => {
                    if (/^\d{0,7}$/.test(e.target.value)) setAccountNumber(e.target.value);
                  }}
                  inputMode="numeric"
                  maxLength={7}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座名義（カナ） <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="ヤマダ タロウ"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* 利用規約 */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' }}>代理店利用規約（全文）</h3>
              <div style={{ height: '220px', overflowY: 'auto', fontSize: '12px', color: '#4a5568', background: '#ffffff', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>第1条（総則および目的）</strong><br />本規約は、Push-taro（以下「当社」）が提供するLINE風Web Push通知・クーポンアプリサービス（以下「本サービス」）の販売パートナー（以下「代理店」）との間の権利義務関係および取扱い条件を定めるものです。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第2条（契約の成立）</strong><br />代理店希望者が本申込みフォームより申請を行い、当社の審査を通過した上で、加盟金および初月代理店月額費用の決済を完了した時点で本契約が成立します。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第3条（加盟金および月額費用）</strong><br />1. 代理店は加盟金（初期費用）として 300,000円（税別）を支払うものとします。<br />2. 代理店は月額システム利用・管理費として 30,000円/月（税別）を毎月当社に支払うものとします。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第4条（成果報酬の支払い・相殺管理）</strong><br />1. 当社は、代理店の紹介コードを経由して契約・維持されているアクティブな店舗（顧客）数に応じて、所定の還元率に基づく紹介報酬を算定します。<br />2. 発生した紹介報酬は、毎月末日締め・翌月末日払いとし、代理店が指定する銀行口座へ振込にてお支払いします。<br />3. 代理店月額費用は、当社指定の決済手段（Square等）により別途お支払いいただくものとし、紹介報酬との相殺は行いません。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第5条（返金不能）</strong><br />決済完了後、理由の如何（審査後の自己都合キャンセル、中途解約など）を問わず、既にお支払いいただいた加盟金および月額費用の返金には応じかねます。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第6条（禁止事項）</strong><br />代理店は以下の行為を行ってはなりません。<br />① 当社の事前許可を得ない虚偽・誇大広告による勧誘<br />② 不正な紹介コードの複製、第三者への譲渡または二次貸与<br />③ 当社または第三者の著作権・商標権・信用を毀損する行為</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第7条（秘密保持）</strong><br />代理店は、本事業に関して知り得た当社の営業上・技術上および顧客に関する情報を、事前の書面による承諾なく第三者に漏洩してはなりません。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第8条（反社会的な勢力の排除）</strong><br />代理店は、自らまたはその役員が暴力団、暴力団関係企業、総会屋等の反社会勢力に該当しないことを表明し、保証するものとします。</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>第9条（契約解除）</strong><br />代理店が本規約に違反した場合、または月額費用等の支払いを怠った場合、当社は事前の催告なく即座に代理店契約を解除し、紹介報酬の支払いを停止することができます。</p>
                <p style={{ margin: '0 0 5px 0' }}><strong>第10条（管轄裁判所）</strong><br />本規約に関して紛争が生じた場合、当社の本社所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="agreement" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="agreement" style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', cursor: 'pointer' }}>
                  「代理店利用規約」の全条項を確認し、同意します。
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
                background: agreed && !loading ? '#3182ce' : '#cbd5e0',
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
