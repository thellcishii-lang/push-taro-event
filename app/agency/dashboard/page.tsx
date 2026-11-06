'use client';

import { useState, useEffect, useMemo } from 'react';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import Link from 'next/link';
import PaymentFailuresSection from '@/components/PaymentFailuresSection';
import PromotionalToolsSection from '@/components/PromotionalToolsSection';

interface DetailedShop {
  id: string;
  shopCode: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  subscriberCount: number;
  createdAt: string;
  status: string;
  canceledAt: string | null;
  validUntil: string | null;
  plan: string;
}

interface SummaryData {
  totalShops: number;
  monthlyNewCount: number;
  monthlyCanceledCount: number;
  planCounts: {
    light: number;
    standard: number;
    pro: number;
    other: number;
  };
}

export default function AgencyDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [summary, setSummary] = useState<SummaryData>({
    totalShops: 0,
    monthlyNewCount: 0,
    monthlyCanceledCount: 0,
    planCounts: { light: 0, standard: 0, pro: 0, other: 0 },
  });
  const [shops, setShops] = useState<DetailedShop[]>([]);

  // 🆕 紹介情報・報酬
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [statements, setStatements] = useState<any[]>([]);
  const [salesFrom, setSalesFrom] = useState('');
  const [salesTo, setSalesTo] = useState('');
  const [activeTab, setActiveTab] = useState<'shops' | 'sales' | 'details'>('shops');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 口座情報
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanTab, setSelectedPlanTab] = useState<'all' | 'light' | 'standard' | 'pro'>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          const res = await fetch(`/api/agency/stats?agencyId=${currentUser.uid}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.summary) setSummary(data.summary);
            if (data.shops) setShops(data.shops);
          } else if (res.status === 401 || res.status === 403) {
            await signOut(auth);
            setUser(null);
            setLoginError('このアカウントは代理店管理画面を利用できません。');
            setLoading(false);
            return;
          } else {
            console.error('代理店データ取得エラー:', res.status);
          }
        } catch (err) {
          console.error('代理店データ取得エラー:', err);
        }
      } else {
        setShops([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🆕 ダッシュボードデータ取得
  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashboard = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`/api/agency/dashboard?agencyId=${user.uid}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);

          if (data.agency?.bankAccount) {
            setBankName(data.agency.bankAccount.bankName || '');
            setBranchName(data.agency.bankAccount.branchName || '');
            setAccountType(data.agency.bankAccount.accountType || 'savings');
            setAccountNumber(data.agency.bankAccount.accountNumber || '');
            setAccountHolder(data.agency.bankAccount.accountHolder || '');
          }
        } else if (res.status === 401 || res.status === 403) {
          setDashboardData(null);
          await signOut(auth);
          setUser(null);
          setLoginError('このアカウントは代理店管理画面を利用できません。');
        } else {
          console.error('代理店ダッシュボード取得エラー:', res.status);
        }
      } catch (err) {
        console.error('代理店ダッシュボード取得エラー:', err);
      }
    };
    fetchDashboard();
  }, [user]);

  
  // 月次明細（statements）取得
  useEffect(() => {
    if (!user?.uid) return;

    const fetchStatements = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`/api/agency/statements?agencyId=${user.uid}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStatements(data.statements || []);
        }
      } catch (err) {
        console.error('statements取得エラー:', err);
      }
    };
    fetchStatements();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err: any) {
      console.error('ログインエラー:', err);
      setLoginError('メールアドレスまたはパスワードが正しくありません。');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // 🆕 口座保存
  const handleSaveBankAccount = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/agency/update-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          agencyId: user.uid,
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

  // 🆕 コピー
  const handleCopyCode = () => {
    const code = dashboardData?.agency?.referralCode;
    if (code) {
      navigator.clipboard.writeText(code);
      alert('紹介コードをコピーしました！');
    }
  };

  const handleCopyUrl = () => {
    const code = dashboardData?.agency?.referralCode;
    if (code && typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${code}`);
      alert('紹介URLをコピーしました！');
    }
  };

  // 期間フィルタ用ヘルパー
  const filterStatementsByPeriod = (list: any[], from: string, to: string) => {
    return list.filter((s) => {
      if (from && s.scheduledPayoutMonth < from) return false;
      if (to && s.scheduledPayoutMonth > to) return false;
      return true;
    });
  };

  
  // 売上一覧CSVダウンロード
  const handleDownloadSalesCsv = () => {
    const filtered = filterStatementsByPeriod(statements, salesFrom, salesTo);
    if (filtered.length === 0) {
      alert('対象データがありません');
      return;
    }

    let csv = '\uFEFF支払い予定月,紹介報酬(税込),源泉徴収,支払総額,ステータス\n';
    filtered.forEach((s) => {
      const statusLabel = s.status === 'paid' ? '振込済' : '未払い';
      csv += `${s.scheduledPayoutMonth},${s.totalBaseReward},${s.withholding},${s.totalReward},${statusLabel}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 月別明細CSVダウンロード
  const handleDownloadDetailCsv = (statement: any) => {
    if (!statement) return;

    let csv = `\uFEFF支払い予定月,${statement.scheduledPayoutMonth}\n`;
    csv += `紹介報酬(税込),${statement.totalBaseReward}\n`;
    csv += `源泉徴収,${statement.withholding}\n`;
    csv += `支払総額,${statement.totalReward}\n\n`;
    csv += '店舗名,プラン,報酬率,決済額,基本報酬,報酬額\n';
    (statement.shops || []).forEach((s: any) => {
      csv += `"${s.shopName}",${s.plan.toUpperCase()},${s.rate == null ? '30% / 36% / 45%' : `${(s.rate * 100).toFixed(0)}%`},${s.payment},${s.baseReward},${s.reward}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement_${statement.scheduledPayoutMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      if (selectedPlanTab !== 'all' && shop.plan.toLowerCase() !== selectedPlanTab) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        shop.name.toLowerCase().includes(q) ||
        shop.shopCode.toLowerCase().includes(q) ||
        shop.phone.replace(/[-–—]/g, '').includes(q.replace(/[-–—]/g, '')) ||
        shop.email.toLowerCase().includes(q) ||
        shop.address.toLowerCase().includes(q)
      );
    });
  }, [shops, searchQuery, selectedPlanTab]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', color: '#718096' }}>
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a202c', margin: '0 0 8px 0' }}>代理店コンソール</h1>
            <p style={{ color: '#718096', fontSize: '13px', margin: 0 }}>ご登録の代理店アカウントでログインしてください</p>
          </div>

          {loginError && (
            <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '6px' }}>メールアドレス</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="agency@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '6px' }}>パスワード</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 42px 10px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} aria-label={showLoginPassword ? 'パスワードを隠す' : 'パスワードを表示'} title={showLoginPassword ? 'パスワードを隠す' : 'パスワードを表示'} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}>👁</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '12px',
                background: '#3182ce',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: isLoggingIn ? 'wait' : 'pointer',
              }}
            >
              {isLoggingIn ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            <Link href="/reset-password?role=agency&returnTo=/agency/dashboard" style={{ color: '#3182ce', textDecoration: 'none' }}>
              パスワードをお忘れの方
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a202c', margin: '0 0 6px 0' }}>
              代理店コンソール
            </h1>
            <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
              ログイン中: <strong>{user.email}</strong>
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', background: '#edf2f7', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
          >
            ログアウト
          </button>
        </div>

        {/* サマリーカード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '30px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>全累計店舗数</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1a202c' }}>
              {summary.totalShops} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>店舗</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#38a169', marginBottom: '6px' }}>当月新規登録数</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#38a169' }}>
              +{summary.monthlyNewCount} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>店舗</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#e53e3e', marginBottom: '6px' }}>当月退会件数</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#e53e3e' }}>
              {summary.monthlyCanceledCount} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>店舗</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3182ce', marginBottom: '6px' }}>プラン別内訳</div>
            <div style={{ fontSize: '13px', color: '#2d3748', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <span>ライト: <strong>{summary.planCounts.light}</strong>件</span>
              <span>スタンダード: <strong>{summary.planCounts.standard}</strong>件</span>
              <span>プロ: <strong>{summary.planCounts.pro}</strong>件</span>
            </div>
          </div>
        </div>

        {/* 決済不履行セクション */}
        {user?.uid && (
          <PaymentFailuresSection referrerId={user.uid} referrerType="agency" />
        )}

        {/* 🆕 紹介コード & URL */}
        {dashboardData?.agency?.referralCode && (
          <div style={{ background: '#ebf8ff', border: '1px solid #90cdf4', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#2c5282' }}>
              🎁 あなたの紹介コード・専用URL
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#2c5282', lineHeight: '1.5' }}>
              他店舗へご紹介の際、こちらのコードまたは専用URLをご案内ください。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#2c5282', marginBottom: '4px' }}>紹介コード</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    readOnly
                    value={dashboardData.agency.referralCode}
                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px', background: '#fff', border: '1px solid #cbd5e0', borderRadius: '6px' }}
                  />
                  <button onClick={handleCopyCode} style={{ padding: '10px 18px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                    コードをコピー
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#2c5282', marginBottom: '4px' }}>専用登録URL</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${dashboardData.agency.referralCode}` : ''}
                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', fontSize: '12px', color: '#475569', background: '#fff', border: '1px solid #cbd5e0', borderRadius: '6px' }}
                  />
                  <button onClick={handleCopyUrl} style={{ padding: '10px 18px', background: '#475569', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                    URLをコピー
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <PromotionalToolsSection />

        {/* 🆕 振込先口座情報 */}
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#166534' }}>
            🏦 振込先口座情報
          </h3>
          <p style={{ fontSize: '12px', color: '#166534', marginBottom: '16px' }}>
            紹介報酬のお振込先口座を指定してください。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>金融機関名</label>
              <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="〇〇銀行" style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>支店名</label>
              <input type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="△△支店" style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>預金種目</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }}>
                <option value="savings">普通</option>
                <option value="checking">当座</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座番号</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="1234567" style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>口座名義（カナ）</label>
              <input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="ヤマダ タロウ" style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: '#fff' }} />
            </div>
          </div>

          <button onClick={handleSaveBankAccount} disabled={saving} style={{ marginTop: '16px', padding: '12px 24px', background: saveSuccess ? '#4CAF50' : saving ? '#ccc' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: saving ? 'wait' : 'pointer', fontSize: '14px' }}>
            {saving ? '保存中...' : saveSuccess ? '✨ 保存しました！' : '💾 口座情報を保存'}
          </button>
        </div>

        {/* 🆕 タブ切替 */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '4px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('shops')}
            style={{
              padding: '10px 16px', border: 'none',
              borderBottom: activeTab === 'shops' ? '3px solid #3182ce' : '3px solid transparent',
              background: 'none', fontWeight: 'bold',
              color: activeTab === 'shops' ? '#3182ce' : '#64748b',
              cursor: 'pointer', fontSize: '15px', whiteSpace: 'nowrap'
            }}
          >
            🏪 傘下店舗一覧
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            style={{
              padding: '10px 16px', border: 'none',
              borderBottom: activeTab === 'sales' ? '3px solid #16a34a' : '3px solid transparent',
              background: 'none', fontWeight: 'bold',
              color: activeTab === 'sales' ? '#16a34a' : '#64748b',
              cursor: 'pointer', fontSize: '15px', whiteSpace: 'nowrap'
            }}
          >
            📊 売上一覧
          </button>
          <button
            onClick={() => setActiveTab('details')}
            style={{
              padding: '10px 16px', border: 'none',
              borderBottom: activeTab === 'details' ? '3px solid #d97706' : '3px solid transparent',
              background: 'none', fontWeight: 'bold',
              color: activeTab === 'details' ? '#d97706' : '#64748b',
              cursor: 'pointer', fontSize: '15px', whiteSpace: 'nowrap'
            }}
          >
            📋 月別明細
          </button>
        </div>

                {/* 📊 売上一覧タブ */}
        {activeTab === 'sales' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>月別 売上一覧</h3>
              <button
                onClick={handleDownloadSalesCsv}
                style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                CSVダウンロード
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                期間:
              </label>
              <input
                type="month"
                value={salesFrom}
                onChange={(e) => setSalesFrom(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }}
              />
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>〜</span>
              <input
                type="month"
                value={salesTo}
                onChange={(e) => setSalesTo(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }}
              />
              {(salesFrom || salesTo) && (
                <button
                  onClick={() => { setSalesFrom(''); setSalesTo(''); }}
                  style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                >
                  クリア
                </button>
              )}
            </div>

            {(() => {
              const filtered = filterStatementsByPeriod(statements, salesFrom, salesTo);
              if (filtered.length === 0) {
                return <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>データがありません</p>;
              }
              const grandTotalBase = filtered.reduce((sum, s) => sum + s.totalBaseReward, 0);
              const grandTotalWithholding = filtered.reduce((sum, s) => sum + s.withholding, 0);
              const grandTotalReward = filtered.reduce((sum, s) => sum + s.totalReward, 0);

              return (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>支払い予定月</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>紹介報酬（税込）</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>源泉徴収</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>支払総額</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>ステータス</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                          <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}>{s.scheduledPayoutMonth}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>¥{s.totalBaseReward.toLocaleString()}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: s.withholding > 0 ? '#dc2626' : '#94a3b8' }}>
                            {s.withholding > 0 ? `-¥${s.withholding.toLocaleString()}` : '—'}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#c2410c' }}>¥{s.totalReward.toLocaleString()}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                              background: s.status === 'paid' ? '#c6f6d5' : '#fef3c7',
                              color: s.status === 'paid' ? '#22543d' : '#92400e',
                            }}>
                              {s.status === 'paid' ? '振込済' : '未払い'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: '#f0f9ff', fontWeight: 'bold', borderTop: '2px solid #3182ce' }}>
                        <td style={{ padding: '12px' }}>合計</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>¥{grandTotalBase.toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>
                          {grandTotalWithholding > 0 ? `-¥${grandTotalWithholding.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#c2410c', fontSize: '15px' }}>¥{grandTotalReward.toLocaleString()}</td>
                        <td style={{ padding: '12px' }}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* 📋 月別明細タブ */}
        {activeTab === 'details' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800' }}>月別 明細</h3>

            {statements.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>明細がありません</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {statements.map((statement) => (
                  <div key={statement.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#1a202c' }}>
                          {statement.scheduledPayoutMonth} 支払い分
                        </span>
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                          background: statement.status === 'paid' ? '#c6f6d5' : '#fef3c7',
                          color: statement.status === 'paid' ? '#22543d' : '#92400e',
                        }}>
                          {statement.status === 'paid' ? '振込済' : '未払い'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadDetailCsv(statement)}
                        style={{ padding: '6px 14px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        CSVダウンロード
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '8px 10px', textAlign: 'left' }}>店舗名</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center' }}>プラン</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center' }}>報酬率</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>決済額</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>基本報酬</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>報酬額</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(statement.shops || []).map((s: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                              <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>{s.shopName}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                                  background: s.plan === 'pro' ? '#fef3c7' : s.plan === 'standard' ? '#dbeafe' : '#f1f5f9',
                                  color: s.plan === 'pro' ? '#b45309' : s.plan === 'standard' ? '#1d4ed8' : '#475569',
                                }}>
                                  {s.plan.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'center', color: '#16a34a', fontWeight: 'bold' }}>
                                {s.rate == null ? '30% / 36% / 45%' : `${(s.rate * 100).toFixed(0)}%`}
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'right' }}>¥{s.payment.toLocaleString()}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right' }}>¥{s.baseReward.toLocaleString()}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold', color: '#c2410c' }}>¥{s.reward.toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr style={{ background: '#f0f9ff', fontWeight: 'bold', borderTop: '2px solid #3182ce' }}>
                            <td style={{ padding: '10px' }} colSpan={3}>合計</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>¥{statement.totalPayment.toLocaleString()}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>¥{statement.totalBaseReward.toLocaleString()}</td>
                            <td style={{ padding: '10px', textAlign: 'right', color: '#c2410c' }}>¥{statement.totalReward.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {statement.withholding > 0 && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                          源泉徴収（インボイス未登録 -10%）: -¥{statement.withholding.toLocaleString()}
                        </span>
                        <span style={{ marginLeft: '16px', color: '#c2410c', fontWeight: 'bold' }}>
                          支払総額: ¥{statement.totalReward.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🏪 傘下店舗一覧タブ（activeTab === 'shops' の時のみ） */}
        {activeTab === 'shops' && (
          <>
            {/* 検索バー & プランタブ */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <input
                    type="text"
                    placeholder="🔍 店舗名・コード・電話・メール・住所で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['all', 'light', 'standard', 'pro'] as const).map((tab) => {
                    const labels: Record<string, string> = {
                      all: 'すべて',
                      light: 'ライト',
                      standard: 'スタンダード',
                      pro: 'プロ',
                    };
                    const active = selectedPlanTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSelectedPlanTab(tab)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          cursor: 'pointer',
                          background: active ? '#3182ce' : '#edf2f7',
                          color: active ? '#ffffff' : '#4a5568',
                        }}
                      >
                        {labels[tab]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 傘下店舗詳細テーブル */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1a202c', margin: 0 }}>
                  傘下店舗一覧 ({filteredShops.length}件)
                </h2>
              </div>

              {filteredShops.length === 0 ? (
                <p style={{ color: '#a0aec0', fontSize: '14px', textAlign: 'center', padding: '40px 0', margin: 0 }}>
                  条件に一致する店舗が見つかりません。
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f7fafc', borderBottom: '2px solid #edf2f7', color: '#4a5568' }}>
                        <th style={{ padding: '10px' }}>店舗名</th>
                        <th style={{ padding: '10px' }}>店舗コード</th>
                        <th style={{ padding: '10px' }}>プラン</th>
                        <th style={{ padding: '10px' }}>メールアドレス</th>
                        <th style={{ padding: '10px' }}>電話番号</th>
                        <th style={{ padding: '10px' }}>住所</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>配信許可人数</th>
                        <th style={{ padding: '10px' }}>利用開始日</th>
                        <th style={{ padding: '10px' }}>退会申請状況</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShops.map((shop) => (
                        <tr key={shop.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#2d3748' }}>
                            {shop.name}
                          </td>
                          <td style={{ padding: '10px', fontFamily: 'monospace', color: '#4a5568' }}>
                            {shop.shopCode}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '2px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              background: shop.plan === 'pro' ? '#fef3c7' : shop.plan === 'standard' ? '#ebf8ff' : '#edf2f7',
                              color: shop.plan === 'pro' ? '#c05621' : shop.plan === 'standard' ? '#2b6cb0' : '#4a5568',
                            }}>
                              {shop.plan.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '10px', fontSize: '12px' }}>{shop.email}</td>
                          <td style={{ padding: '10px', fontSize: '12px' }}>{shop.phone}</td>
                          <td style={{ padding: '10px', fontSize: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={shop.address}>
                            {shop.address}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#3182ce', fontSize: '15px' }}>
                            {shop.subscriberCount.toLocaleString()} 人
                          </td>
                          <td style={{ padding: '10px', color: '#4a5568' }}>
                            {shop.createdAt}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {shop.status === 'canceled' ? (
                              <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: '#fed7d7', color: '#9b2c2c' }}>
                                退会済み ({shop.canceledAt || '日時不詳'})
                              </span>
                            ) : shop.status === 'payment_warning' ? (
                              <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: '#feebc8', color: '#c05621' }}>
                                決済未完了 (警告)
                              </span>
                            ) : (
                              <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: '#c6f6d5', color: '#22543d' }}>
                                契約中 (正常)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
