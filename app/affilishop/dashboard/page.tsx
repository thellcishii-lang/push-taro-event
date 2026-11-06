'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import Link from 'next/link';

export default function AffilishopDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashboard = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/affilishop/dashboard', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        if (res.ok) {
          setDashboardData(data);
          if (data.affilishop?.bankAccount) {
            setBankName(data.affilishop.bankAccount.bankName || '');
            setBranchName(data.affilishop.bankAccount.branchName || '');
            setAccountType(data.affilishop.bankAccount.accountType || 'savings');
            setAccountNumber(data.affilishop.bankAccount.accountNumber || '');
            setAccountHolder(data.affilishop.bankAccount.accountHolder || '');
          }
        } else {
          setDashboardData(null);
          await signOut(auth);
          setUser(null);
          setLoginError('このアカウントはaffilishop管理画面を利用できません。');
        }
      } catch (err) {
        console.error('affilishopダッシュボード取得エラー:', err);
        setFetchError('通信エラーが発生しました');
      }
    };
    fetchDashboard();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
    } catch (err: any) {
      setLoginError('メールアドレスまたはパスワードが正しくありません。審査が完了していない場合はログインできません。');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setDashboardData(null);
  };

  const handleSaveBankAccount = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/affilishop/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          bankAccount: { bankName, branchName, accountType, accountNumber, accountHolder },
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        alert('保存失敗: ' + data.error);
      }
    } catch (err: any) {
      alert('通信エラー: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>読み込み中...</main>;
  }

  // ============================================================
  // ログイン画面
  // ============================================================
  if (!user) {
    return (
      <main style={{ maxWidth: '420px', margin: '80px auto', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h1 style={{ fontSize: '20px', textAlign: 'center', marginBottom: '8px' }}>affilishop ログイン</h1>
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '13px', marginBottom: '24px' }}>
            審査が承認されると、ご登録のメールアドレス宛にログイン情報が届きます。
          </p>
          {loginError && (
            <div style={{ background: '#fecaca', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>メールアドレス</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>パスワード</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 42px 10px 10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} aria-label={showLoginPassword ? 'パスワードを隠す' : 'パスワードを表示'} title={showLoginPassword ? 'パスワードを隠す' : 'パスワードを表示'} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}>👁</button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: isLoggingIn ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 'bold', cursor: isLoggingIn ? 'wait' : 'pointer' }}
            >
              {isLoggingIn ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            <Link href="/reset-password?role=affilishop&returnTo=/affilishop/dashboard" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
              パスワードをお忘れの方
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#dc2626' }}>{fetchError}</p>
        <button onClick={handleLogout} style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff', cursor: 'pointer' }}>ログアウト</button>
      </main>
    );
  }

  if (!dashboardData) {
    return <main style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>データを読み込んでいます...</main>;
  }

  const { affilishop, summary, referrals, rewards } = dashboardData;

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', margin: 0 }}>affilishop ダッシュボード</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>ログアウト</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#0369a1' }}>紹介コード</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace' }}>{affilishop.referralCode}</p>
        </div>
        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#166534' }}>紹介中の稼働店舗数</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{summary.referralCount} 件</p>
        </div>
        <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fde68a' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#92400e' }}>未払い報酬</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>¥{summary.unpaidReward.toLocaleString()}</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#475569' }}>累計支払済み報酬</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>¥{summary.totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', marginBottom: '12px' }}>紹介店舗一覧</h2>
        {referrals.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>まだ紹介実績はありません。紹介コードをシェアしましょう。</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>店舗名</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>プラン</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>ステータス</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>報酬率</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>紹介開始日</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{r.name}</td>
                    <td style={{ padding: '8px' }}>{r.plan.toUpperCase()}</td>
                    <td style={{ padding: '8px' }}>{r.status === 'active' ? '稼働中' : '停止中'}</td>
                    <td style={{ padding: '8px' }}>{(r.rewardRate * 100).toFixed(1)}%</td>
                    <td style={{ padding: '8px' }}>{r.startedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', marginBottom: '12px' }}>報酬明細</h2>
        {rewards.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>報酬明細はまだありません。</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>対象月</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>支払予定月</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>店舗名</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>金額</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>状態</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{r.billingMonth}</td>
                    <td style={{ padding: '8px' }}>{r.scheduledPayoutMonth}</td>
                    <td style={{ padding: '8px' }}>{r.sourceShopName}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>¥{r.amount.toLocaleString()}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{r.status === 'paid' ? '支払済み' : '未払い'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '15px', marginBottom: '12px' }}>振込先口座情報</h2>
        <div style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>金融機関名</label>
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>支店名</label>
            <input value={branchName} onChange={(e) => setBranchName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>預金種目</label>
            <select value={accountType} onChange={(e) => setAccountType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}>
              <option value="savings">普通</option>
              <option value="checking">当座</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座番号</label>
            <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座名義（カナ）</label>
            <input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
          </div>
          <button
            onClick={handleSaveBankAccount}
            disabled={saving}
            style={{ padding: '10px', borderRadius: '6px', border: 'none', background: saving ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 'bold', cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? '保存中...' : '口座情報を保存'}
          </button>
          {saveSuccess && <p style={{ color: '#16a34a', fontSize: '13px' }}>✅ 保存しました</p>}
        </div>
      </div>
    </main>
  );
}
