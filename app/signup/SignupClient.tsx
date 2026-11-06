// app/signup/SignupClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// ============================================================
// Firebase 直接初期化
// ============================================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export default function SignupClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // プラン選択
  const [selectedPlan, setSelectedPlan] = useState<'light' | 'standard' | 'pro'>('light');

  // 基本会員情報（パスワードなし）
  const [companyName, setCompanyName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');

  // Proプラン用 口座情報詳細
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // 利用規約同意
  const [termsAgreed, setTermsAgreed] = useState(false);

  // ============================================================
  // 戻ったときに入力値を復元する（確認画面から戻ってきた場合のみ）
  // ============================================================
  useEffect(() => {
    // 1. URLクエリパラメータから紹介コードを自動取得（例: /signup?ref=UBGIEXEK）
    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get('ref') || params.get('code');
    if (refFromUrl) {
      setReferralCode(refFromUrl.toUpperCase());
    }

    // 2. 確認画面から戻ってきた場合のみデータを復元
    if (sessionStorage.getItem('went_to_confirm') === 'true') {
      const stored = sessionStorage.getItem('signup_data');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setEmail(data.email || '');
          setEmailConfirm(data.emailConfirm || data.email || '');
          setCompanyName(data.companyName || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setInvoiceNumber(data.invoiceNumber || '');
          setSelectedPlan(data.plan || 'light');
          setTermsAgreed(data.termsAgreed === true);
          
          // 🔑 URLに紹介コードがなかった場合のみ、セッションの紹介コードを復元
          if (data.referralCode && !refFromUrl) {
            setReferralCode(data.referralCode);
          }

          if (data.bankAccount) {
            setBankName(data.bankAccount.bankName || '');
            setBranchName(data.bankAccount.branchName || '');
            setAccountType(data.bankAccount.accountType || 'savings');
            setAccountNumber(data.bankAccount.accountNumber || '');
            setAccountHolder(data.bankAccount.accountHolder || '');
          }
        } catch (e) {}
      }
      sessionStorage.removeItem('went_to_confirm');
    }
  }, []);

  // ============================================================
  // 本登録処理（送信）→ 確認画面へ遷移（APIは呼ばない）
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAgreed) {
      alert('利用規約への同意が必要です。');
      return;
    }

    // ============================================================
    // 送信前バリデーション
    // ============================================================
    
    // ① メールアドレス確認（2回入力チェック）
    if (email !== emailConfirm) {
      alert('メールアドレスが一致しません。もう一度入力してください。');
      return;
    }

    // ② 電話番号の簡易チェック（ハイフン除去後10〜11桁）
    const phoneClean = phone.replace(/-/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      alert('電話番号が正しくありません（10〜11桁の数字で入力してください）。');
      return;
    }

        // ③ PROプラン時は銀行口座が必須
    if (selectedPlan === 'pro') {
      if (!bankName || !branchName || !accountNumber || !accountHolder) {
        alert('PROプランでは銀行口座情報が必須です。すべて入力してください。');
        return;
      }
      const normalizedAccountNumber = accountNumber.replace(/[０-９]/g, (digit) =>
        String.fromCharCode(digit.charCodeAt(0) - 0xfee0)
      ).trim();
      if (!/^\d{7}$/.test(normalizedAccountNumber)) {
        alert('口座番号は半角数字7桁で入力してください。数字以外の文字は使用できません。');
        return;
      }
      const kanaRegex = /^[ァ-ヶー]+$/;
      if (!kanaRegex.test(accountHolder)) {
        alert('口座名義は全角カナで入力してください。');
        return;
      }
      setAccountNumber(normalizedAccountNumber);
    }

    // ============================================================
    // 🔥 メールアドレス重複チェック（確認画面に進む前に）
    // ============================================================
    try {
      const checkRes = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, checkOnly: true }),
      });
      const checkData = await checkRes.json();

      if (checkRes.status === 409) {
        if (checkData.alreadyPaid) {
          alert('このメールアドレスはすでに登録済みです。\n管理画面からログインしてください。');
          router.push('/admin');
        } else {
          alert('このメールアドレスはすでに申し込み中です。\n決済を完了させるか、別のメールアドレスをご使用ください。');
        }
        return; // 確認画面に行かない
      }
      if (!checkRes.ok) {
        throw new Error(checkData.error || 'メールアドレスの確認に失敗しました。');
      }
    } catch (err: any) {
      alert('メールアドレスの確認中にエラーが発生しました: ' + err.message);
      return;
    }

    // ============================================================
    // 確認画面へ遷移（APIは呼ばない）
    // ============================================================
   const formData = {
      email,
      emailConfirm,
      plan: selectedPlan,
      companyName,
      invoiceNumber,
      address,
      phone: phone.replace(/-/g, ''),
      referralCode: referralCode.trim().toUpperCase(), // 🔑 この1行だけ追加
      bankAccount: selectedPlan === 'pro' ? {
        bankName,
        branchName,
        accountType,
        accountNumber,
        accountHolder,
      } : null,
      termsAgreed,
    };

    sessionStorage.setItem('went_to_confirm', 'true');
    sessionStorage.setItem('signup_data', JSON.stringify(formData));
    router.push('/signup/confirm');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <main style={{ maxWidth: '650px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a202c', margin: '0 0 8px 0' }}>
            Push-taro 新規アカウント登録
          </h1>
          <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
            Web Push通知配信サービスを今すぐ始めましょう。
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. プラン選択 */}
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#2d3748' }}>
            1. ご契約プランを選択
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '30px' }}>
            
            <div
              onClick={() => setSelectedPlan('light')}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: selectedPlan === 'light' ? '2px solid #64748b' : '1px solid #cbd5e0',
                background: selectedPlan === 'light' ? '#f8fafc' : '#fff',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#475569' }}>LIGHT</div>
              <div style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0' }}>¥1,980<span style={{ fontSize: '10px', fontWeight: 'normal' }}>/月（税別）</span></div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>手軽に試せる基本プラン</div>
            </div>

            <div
              onClick={() => setSelectedPlan('standard')}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: selectedPlan === 'standard' ? '2px solid #0284c7' : '1px solid #cbd5e0',
                background: selectedPlan === 'standard' ? '#f0f9ff' : '#fff',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0284c7' }}>STANDARD</div>
              <div style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0' }}>¥3,800<span style={{ fontSize: '10px', fontWeight: 'normal' }}>/月（税別）</span></div>
              <div style={{ fontSize: '11px', color: '#0369a1' }}>月間１万5千配信。LIGHTプランの３倍の配信量</div>
            </div>

            <div
              onClick={() => setSelectedPlan('pro')}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: selectedPlan === 'pro' ? '2px solid #ff4500' : '1px solid #cbd5e0',
                background: selectedPlan === 'pro' ? '#fff7ed' : '#fff',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ff4500' }}>PRO</div>
              <div style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0' }}>¥10,000<span style={{ fontSize: '10px', fontWeight: 'normal' }}>/月（税別）</span></div>
              <div style={{ fontSize: '11px', color: '#c2410c' }}>配信無制限　全機能 ＋ 10%紹介報酬還元</div>
            </div>

          </div>

          {/* 2. 会社・店舗基本情報 */}
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#2d3748' }}>
            2. ご契約者様（会社・店舗）情報
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>会社名 / 屋号</label>
              <input
                type="text"
                required
                placeholder="株式会社〇〇 または 店舗屋号"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>


            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold', fontSize: '13px' }}>所在地 / 住所</label>
              <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#e11d48', fontWeight: 'bold' }}>
                ※住所などは正式な登録住所で書いてください。
              </p>
              <input
                type="text"
                required
                placeholder="〇〇県〇〇市〇〇１２３−４５"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            {/* 電話番号（SMS認証は任意になったのでラベル変更） */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                電話番号
              </label>
              <input
                type="tel"
                required
                placeholder="09012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>ご登録メールアドレス</label>
              <input
                type="email"
                required
                placeholder="owner@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            {/* メール確認用 */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>メールアドレス（確認）</label>
              <input
                type="email"
                required
                placeholder="もう一度入力してください"
                value={emailConfirm}
                onChange={(e) => setEmailConfirm(e.target.value)}
                autoComplete="off"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            {/* 🔑 追加: 紹介コード入力欄（任意） */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                紹介コード（任意）
              </label>
              <input
                type="text"
                placeholder="例: UBGIEXEK（お持ちの方のみ）"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                onBlur={() => setReferralCode((code) => code.trim().toUpperCase())}
                maxLength={8}
                autoCapitalize="characters"
                spellCheck={false}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '11px', color: '#718096', margin: '4px 0 0 0' }}>
                ※紹介者から案内された8桁のコードがある場合はご入力ください。
              </p>
            </div>

            {/* ❌ パスワード入力欄は削除（システム自動発行） */}
          </div>

          {/* 3. PROプラン選択時限定：受取用口座情報入力欄 */}
          {selectedPlan === 'pro' && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '6px', color: '#c2410c' }}>
                🏦 10%紹介報酬 受取口座の登録
              </h3>
              <p style={{ fontSize: '12px', color: '#78350f', margin: '0 0 16px 0' }}>
                PROプラン特典として、他店舗をご紹介いただいた際の成果報酬（10%）をお振り込みする口座を指定してください。
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>
          適格請求書発行事業者登録番号（インボイス番号）
        </label>
        <input
          type="text"
          placeholder="T1234567890123（任意）"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}
        />
        <p style={{ fontSize: '11px', color: '#78350f', marginTop: '4px' }}>
          ※ インボイス番号がない場合、紹介報酬の還元率が <strong>10% → 9%</strong> となります。
        </p>
      </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>金融機関名</label>
                  <input
                    type="text"
                    required
                    placeholder="例: 〇〇銀行"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>支店名</label>
                  <input
                    type="text"
                    required
                    placeholder="例: △△支店"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>預金種目</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="savings">普通</option>
                    <option value="checking">当座</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座番号</label>
                  <input
                    type="text"
                    required
                    placeholder="1234567"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0)))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座名義（カナ）</label>
                  <input
                    type="text"
                    required
                    placeholder="ヤマダ タロウ"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}
                  />
                </div>
              </div>
            </div>
          )}

                    {/* 4. 利用規約（全文掲載） */}
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#2d3748' }}>
            4. 利用規約への同意
          </h3>

          {/* 📄 PDFダウンロードリンク */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 700 }}>
              📄 利用規約をPDFで確認できます
            </span>
            <a
              href={`/print/terms?type=${selectedPlan === 'pro' ? 'pro-shop' : 'shop'}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: '#0ea5e9',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              規約を開く →
            </a>
          </div>

          {/* 規約全文 */}
          <div style={{
            height: '180px',
            overflowY: 'scroll',
            background: '#f8fafc',
            border: '1px solid #cbd5e0',
            padding: '14px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#475569',
            lineHeight: '1.7',
            marginBottom: '15px'
          }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '13px', color: '#1a202c' }}>
              {selectedPlan === 'pro' ? '店舗利用規約（プロプラン）' : '店舗利用規約'}
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              この利用規約（以下「本規約」）は、the合同会社（以下「当社」）が提供するPush-taro（以下「本サービス」）の利用条件を定めるものです。ユーザーは、本規約に従って本サービスをご利用いただきます。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第1条（適用）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。ユーザーが本サービスのお申し込みまたはご利用を開始した時点で、本規約の全条項に同意したものとみなします。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第2条（アカウント登録と管理）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              1. ユーザーは、真実かつ正確な情報をもってアカウント登録を行うものとします。登録内容に変更が生じた場合、速やかに変更手続きを行う必要があります。<br />
              2. ユーザーは、自己の責任においてアカウントIDおよびパスワードを厳重に管理するものとし、第三者への譲渡・貸与・売買等はできません。<br />
              3. アカウント情報の管理不十分による損害の責任はユーザーが負うものとします。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第3条（料金および支払い方法）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              1. ユーザーは、当社が定める料金を、当社指定の決済手段（Square等）により支払うものとします。<br />
              2. 月の途中でアカウントの開通または解約が行われた場合であっても、日割り計算による返金・精算は行いません。<br />
              3. ユーザーが料金の支払いを遅延した場合、年14.6%の割合による遅延損害金を支払うものとします。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第4条（送信メッセージおよびコンテンツの責任）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              1. 本サービスを通じてエンドユーザー（通知購読者）へ配信されるメッセージの内容（テキスト、画像、URL等）に関する責任は、一切ユーザー自身に帰属します。<br />
              2. ユーザーは、特定電子メール法等の関連法令、消費者庁ガイドラインおよびプライバシー関連法規を遵守し、承諾を得ていない不特定多数への迷惑通知（スパム配信）を行ってはなりません。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第5条（禁止事項）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              ユーザーは、本サービスの利用にあたり、以下の行為を行ってはならないものとします。<br />
              ・法令または公序良俗に違反する行為、あるいは犯罪行為に関連する行為<br />
              ・当社、他のユーザー、または第三者の知的財産権、名誉、プライバシーを侵害する行為<br />
              ・本サービスのサーバーやネットワークに過度な負荷をかける行為、リバースエンジニアリング等の解析行為<br />
              ・虚偽の情報または第三者の情報を騙って配信を行う行為<br />
              ・反社会的勢力への利益供与行為
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第6条（サービスの提供停止・変更・終了）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              1. 当社は、システムの定期保守・障害復旧・天災地変等の不可抗力により、事前に通知することなく本サービスの全部または一部の提供を中断・停止することがあります。<br />
              2. 当社は、事前にユーザーへ通知（Webサイト上での告知等）を行うことにより、本サービスの内容を変更し、または提供を終了することができるものとします。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第7条（契約解除および利用制限）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              ユーザーが本規約のいずれかの条項に違反した場合、または料金の支払いを怠った場合、当社は事前の催告なく即座に本サービス利用の停止、あるいは契約を解除することができます。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第8条（免責事項）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              1. 当社は、本サービスがユーザーの特定の目的に適合すること、期待する成果（集客数・売上向上等）が得られることを保証するものではありません。<br />
              2. ブラウザ端末（iOS/Android/Chrome等）の仕様変更、通信事業者の障害等によりプッシュ通知が正常に不着となった場合、当社はそれにより生じた損害について責任を負いません。<br />
              3. 当社が損害賠償責任を負う場合であっても、過去1ヶ月間にユーザーが支払った利用料相当額を上限とします。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第9条（秘密保持および個人情報の取扱い）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              ユーザーおよび当社は、本サービスの提供・利用に関して知り得た相手方の非公表の情報を秘密に保持するものとします。個人情報の取扱いについては、別途定める「プライバシーポリシー」に従うものとします。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第10条（反社会的勢力の排除）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              ユーザーおよび当社は、自らまたはその役員が暴力団、暴力団関係企業、総会屋等の反社会的勢力に該当しないことを表明し、保証するものとします。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第11条（規約の変更）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              当社は、必要と判断した場合には、ユーザーに事前に適切な方法（Webサイト上の掲示等）で通知することにより、いつでも本規約を変更することができるものとします。変更後の規約は掲載された時点で効力を生じます。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第12条（準拠法および裁判管轄）</p>
            <p style={{ margin: '0 0 8px 0' }}>
              本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合、当社の本社所在地を管轄する裁判所を専属的合意管轄とします。
            </p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第13条（店舗プラン特約）</p>
            {selectedPlan === 'pro' ? (
              <p style={{ margin: '0 0 8px 0' }}>
                1. プロプランをご契約中のユーザーが他店舗を紹介した場合、紹介した店舗の契約プランにかかわらず、月額料金の10%相当の成果報酬権利が発生します。<br />
                2. 発生した成果報酬は、原則として毎月の請求精算時における自動控除・相殺にて精算されます。<br />
                3. 紹介店舗が契約を継続する限り、報酬は毎月発生します。10件の紹介でプロプランの月額（税別10,000円）が実質無料となります。<br />
                4. 累計1万円以上でご指定の銀行口座への振込申請が可能です。<br />
                5. 不正な自己紹介、虚偽アカウントの作成、その他不当な方法による成果報酬の発生が発覚した場合、当社は即時に報酬支払いを取消し、アカウントを停止することができます。
              </p>
            ) : (
              <p style={{ margin: '0 0 8px 0' }}>
                1. 本サービスは、ライトプラン（1,980円/月・税別）、スタンダードプラン（3,800円/月・税別）、プロプラン（10,000円/月・税別）の3プランを提供します。<br />
                2. ライトプランおよびスタンダードプランには、月間の配信数上限があります（ライト: 5,000通、スタンダード: 15,000通）。上限を超過した場合、翌月まで送信が制限されますが、追加課金は発生しません。<br />
                3. プロプランは配信無制限です。追加の従量課金は一切ありません。<br />
                4. 月額費用は税別表示であり、別途消費税が加算されます。
              </p>
            )}

            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #cbd5e0', fontSize: '11px', color: '#64748b' }}>
              【事業者名】the合同会社<br />
              【所在地】〒357-0123 埼玉県飯能市中藤下郷２３−２１<br />
              【連絡先】info@push-taro.com
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '25px', fontSize: '14px', fontWeight: 'bold', color: '#1a202c' }}>
            <input
              type="checkbox"
              required
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
            />
            利用規約に同意して申込む
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{width: '100%', padding: '16px', backgroundColor: loading ? '#94a3b8' : '#ff4500', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 69, 0, 0.3)' }}
          >
            {loading ? '処理中...' : '申し込む（決済画面へ進む）'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
  <Link href="/shop" style={{ color: '#0284c7', textDecoration: 'none' }}>すでにアカウントをお持ちの方（ログイン）</Link>
</div>

      </main>
    </div>
  );
}
