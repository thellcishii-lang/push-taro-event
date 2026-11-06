'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../../lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';

function ProUpgradeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shopId = searchParams.get('shopId');

  const [user, setUser] = useState<any>(null);

  // 会社・契約情報
  const [companyName, setCompanyName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // 振込口座情報
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // 利用規約
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const normalizeDigits = (value: string) => value.replace(/[０-９]/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) - 0xfee0)
  );

  const validateBankAccount = () => {
    const normalizedAccountNumber = normalizeDigits(accountNumber).trim();
    if (!/^\d{7}$/.test(normalizedAccountNumber)) {
      alert('口座番号は半角数字7桁で入力してください。数字以外の文字は使用できません。');
      return false;
    }

    if (!/^[ァ-ヶー]+$/.test(accountHolder.trim())) {
      alert('口座名義は全角カナで入力してください。');
      return false;
    }

    setAccountNumber(normalizedAccountNumber);
    return true;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) {
      alert('店舗IDが確認できません。管理画面から再度やり直してください。');
      return;
    }

    if (!termsAgreed) {
      alert('利用規約への同意が必要です。');
      return;
    }

    if (!validateBankAccount()) return;

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const idToken = user ? await user.getIdToken() : '';
      const res = await fetch('/api/upgrade-request/pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          shopId,
          companyName,
          invoiceNumber,
          address,
          phone,
          bankAccount: {
            bankName,
            branchName,
            accountType,
            accountNumber: normalizeDigits(accountNumber).trim(),
            accountHolder,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'お申し込みに失敗しました。');
      }

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      alert('エラー: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '650px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff7ed', padding: '40px 30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #fed7aa' }}>
          <h2 style={{ color: '#c2410c', marginBottom: '16px', fontSize: '24px' }}>🔥 PROプランお申し込みを受け付けました</h2>
          <p style={{ lineHeight: '1.8', color: '#374151', marginBottom: '24px', fontSize: '15px' }}>
            ご登録ありがとうございます。手続き完了のご案内をメールにてお送りいたしました。<br />
            既存の顧客データ（Push登録）はすべてそのままPROプランへ引き継がれます。
          </p>
          <Link
            href="/admin"
            style={{
              display: 'inline-block',
              background: '#ea580c',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            店舗管理画面へ戻る
          </Link>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
        <main style={{ maxWidth: '650px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '8px' }}>PROアップグレード内容の確認</h1>
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px', marginBottom: '30px' }}>
            ご入力内容をご確認のうえ、決済画面へお進みください。
          </p>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>アップグレード申込内容</h3>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              <div><strong>店舗ID</strong><br />{shopId}</div>
              <div><strong>会社名 / 屋号</strong><br />{companyName || '未入力'}</div>
              <div><strong>インボイス登録番号</strong><br />{invoiceNumber || '未登録'}</div>
              <div><strong>所在地 / 住所</strong><br />{address || '未入力'}</div>
              <div><strong>電話番号</strong><br />{phone || '未入力'}</div>
              <div><strong>金融機関名</strong><br />{bankName || '未入力'}</div>
              <div><strong>支店名</strong><br />{branchName || '未入力'}</div>
              <div><strong>預金種目</strong><br />{accountType === 'savings' ? '普通' : '当座'}</div>
              <div><strong>口座番号</strong><br />{accountNumber || '未入力'}</div>
              <div><strong>口座名義</strong><br />{accountHolder || '未入力'}</div>
              <div><strong>アップグレード先</strong><br />PROプラン（月額10,000円・税別）</div>
            </div>
          </div>

          <p style={{ padding: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', color: '#9a3412', fontSize: '13px', lineHeight: 1.6 }}>
            「決済画面へ進む」を押すと、Squareの決済ページへ移動します。
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
              style={{ flex: 1, padding: '14px', background: '#e2e8f0', color: '#2d3748', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
            >
              ← 戻って修正
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={loading}
              style={{ flex: 1, padding: '14px', background: loading ? '#94a3b8' : '#ff4500', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '処理中...' : '申し込みする（決済画面へ）'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ background: '#ffffff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ background: '#fff7ed', color: '#ea580c', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            PRO PLAN UPGRADE
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '16px 0 8px 0', color: '#1a202c' }}>
            PROプランへのアップグレードお申し込み
          </h1>
          <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
            既存の店舗データ（店舗ID: <code>{shopId || '未引き継ぎ'}</code>）および顧客登録数はすべて引き継がれます。
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* 1. 会社・契約情報 */}
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#2d3748' }}>
            1. ご契約者（請求書・インボイス発行）情報
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
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>インボイス登録番号（任意）</label>
              <input
                type="text"
                placeholder="T1234567890123"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
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
                placeholder="○○県〇〇市〇〇１２３−４"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>電話番号</label>
              <input
                type="tel"
                required
                placeholder="03-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* 2. 口座情報 */}
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#2d3748' }}>
            2. 10%紹介報酬 受取用 口座情報
          </h3>

          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  placeholder="1234567"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(normalizeDigits(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座名義（カナ）</label>
                <input
                  type="text"
                  placeholder="ヤマダ タロウ"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* 3. 利用規約 (全12条の正式全文を搭載) */}
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#2d3748' }}>
            3. 利用規約への同意
          </h3>

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
            <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '13px', color: '#1a202c' }}>利用規約</p>
            <p style={{ margin: '0 0 10px 0' }}>
              この利用規約（以下、「本規約」といいます。）は、the合同会社（以下、「当社」といいます。）が提供するPush-taro（以下、「当サービス」といいます。）の利用条件を定めるものです。ご利用者様（以下、「ユーザー」といいます。）には、本規約に従って当サービスをご利用いただきます。
            </p>
            
            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第1条（適用）</p>
            <p style={{ margin: '0 0 8px 0' }}>本規約は、ユーザーと当社との間の当サービスの利用に関わる一切の関係に適用されるものとします。ユーザーが本サービスのお申し込みまたはご利用を開始した時点で、本規約の全条項に同意したものとみなします。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第2条（アカウント登録と管理）</p>
            <p style={{ margin: '0 0 8px 0' }}>1. ユーザーは、真実かつ正確な情報をもってアカウント登録を行うものとします。<br />2. ユーザーは、自己の責任においてアカウントIDおよびパスワードを厳重に管理するものとし、第三者への譲渡・貸与等はできません。<br />3. アカウント情報の管理不十分による損害の責任はユーザーが負うものとします。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第3条（利用料金および支払い方法）</p>
            <p style={{ margin: '0 0 8px 0' }}>1. ユーザーは、当サービスが定める各プラン（ライトプラン: 1,980円/月、スタンダードプラン: 3,800円/月、プロプラン: 10,000円/月、いずれも税別）の利用料金を、当社指定の決済手段（Square等）により支払うものとします。<br />2. 月の途中でアカウントの開通または解約が行われた場合であっても、日割り計算による返金・精算は行いません。<br />3. ユーザーが利用料金の支払いを遅延した場合、年14.6%の割合による遅延損害金を支払うものとします。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第4条（送信メッセージおよびコンテンツの責任）</p>
            <p style={{ margin: '0 0 8px 0' }}>1. 当サービスを通じてエンドユーザー（通知購読者）へ配信されるメッセージの内容に関する責任は、一切ユーザー自身に帰属します。<br />2. ユーザーは、特定電子メール法等の関連法令を遵守し、承諾を得ていない不特定多数への迷惑通知（スパム配信）を行ってはなりません。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第5条（禁止事項）</p>
            <p style={{ margin: '0 0 8px 0' }}>ユーザーは、法令違反行為、知的財産権の侵害、サーバーへの過度な負荷行為、虚偽情報の配信、反社会的勢力への利益供与行為等を行ってはならないものとします。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第6条（サービスの提供停止・変更・終了）</p>
            <p style={{ margin: '0 0 8px 0' }}>当社は、保守点検・障害復旧・天災地変等により事前に通知することなくサービス提供を中断・停止することがあります。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第7条（紹介成果報酬制度・PRO特典）</p>
            <p style={{ margin: '0 0 8px 0' }}>1. プロプランユーザーが他店舗を紹介した場合、所定のロジックに基づき10%相当の成果報酬権利が発生します。<br />2. 発生した成果報酬は毎月の請求精算時に自動控除・相殺にて精算されます。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第8条（契約解除および利用制限）</p>
            <p style={{ margin: '0 0 8px 0' }}>ユーザーが本規約に違反した場合、または利用料金の支払いを怠った場合、当社は即座にサービス利用の停止、あるいは契約を解除することができます。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第9条（免責事項）</p>
            <p style={{ margin: '0 0 8px 0' }}>1. 当社は、当サービスが特定の目的に適合することや期待する売上向上成果が得られることを保証するものではありません。<br />2. 当社が損害賠償責任を負う場合であっても、過去1ヶ月間にユーザーが支払った利用料相当額を上限とします。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第10条（秘密保持および個人情報の取扱い）</p>
            <p style={{ margin: '0 0 8px 0' }}>個人情報の取扱いについては、別途定める「プライバシーポリシー」に従うものとします。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第11条（規約の変更）</p>
            <p style={{ margin: '0 0 8px 0' }}>当社は、必要と判断した場合には、事前に適切な方法で通知することにより、いつでも本規約を変更することができるものとします。</p>

            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#2d3748' }}>第12条（準拠法および裁判管轄）</p>
            <p style={{ margin: '0 0 8px 0' }}>本規約の解釈にあたっては日本法を準拠法とし、当社の本社所在地を管轄する裁判所を専属的合意管轄とします。</p>

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
            利用規約に同意してPROプランへ申し込む
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: '#ff4500',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 69, 0, 0.3)'
            }}
          >
            {loading ? '処理中...' : 'PROプランへアップグレード申し込み確認画面へ'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function ProUpgradePage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>読み込み中...</div>}>
      <ProUpgradeContent />
    </Suspense>
  );
}
