'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import Link from 'next/link';
import PaymentFailuresSection from '@/components/PaymentFailuresSection';

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ログイン用
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ダッシュボードデータ
  const [data, setData] = useState<any>(null);
  const [statements, setStatements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'referrals' | 'sales' | 'details'>('referrals');

  // 検索・フィルタ
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanTab, setSelectedPlanTab] = useState<'all' | 'light' | 'standard' | 'pro'>('all');
  const [salesFrom, setSalesFrom] = useState('');
  const [salesTo, setSalesTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 口座情報
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const idToken = await u.getIdToken();

          // 1. アフィリエイト情報取得
          const res = await fetch('/api/affiliate/stats', {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!res.ok) {
            await signOut(auth);
            setUser(null);
            setLoginError('このアカウントはアフィリエイト管理画面を利用できません。');
            setLoading(false);
            return;
          }
          const result = await res.json();
          setData(result);

          // 口座情報を反映
          if (result.affiliate?.bankAccount) {
            setBankName(result.affiliate.bankAccount.bankName || '');
            setBranchName(result.affiliate.bankAccount.branchName || '');
            setAccountType(result.affiliate.bankAccount.accountType || 'savings');
            setAccountNumber(result.affiliate.bankAccount.accountNumber || '');
            setAccountHolder(result.affiliate.bankAccount.accountHolder || '');
          }

          // 2. 月次明細取得
          if (result.affiliate?.id) {
            const stRes = await fetch(`/api/affiliate/statements?affiliateId=${result.affiliate.id}`, {
              headers: { Authorization: `Bearer ${idToken}` },
            });
            if (stRes.ok) {
              const stData = await stRes.json();
              setStatements(stData.statements || []);
            }
          }
        } catch (err) {
          console.error('データ取得エラー:', err);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch {
      setLoginError('メールアドレスまたはパスワードが正しくありません。');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleSaveBank = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/affiliate/update-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          bankAccount: { bankName, branchName, accountType, accountNumber, accountHolder },
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const d = await res.json();
        alert('保存失敗: ' + d.error);
      }
    } catch (err: any) {
      alert('通信エラー: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCode = () => {
    const code = data?.affiliate?.referralCode;
    if (code) {
      navigator.clipboard.writeText(code);
      alert('紹介コードをコピーしました！');
    }
  };

  const handleCopyUrl = () => {
    const code = data?.affiliate?.referralCode;
    if (code && typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${code}`);
      alert('紹介URLをコピーしました！');
    }
  };

  const filteredReferrals = useMemo(() => {
    const list = data?.referrals || [];
    return list.filter((r: any) => {
      if (selectedPlanTab !== 'all' && r.plan !== selectedPlanTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        (r.shopName || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q)
      );
    });
  }, [data, searchQuery, selectedPlanTab]);

  const filterStatementsByPeriod = (list: any[], from: string, to: string) => {
    return list.filter((s) => {
      if (from && s.scheduledPayoutMonth < from) return false;
      if (to && s.scheduledPayoutMonth > to) return false;
      return true;
    });
  };

  const handleDownloadSalesCsv = () => {
    const filtered = filterStatementsByPeriod(statements, salesFrom, salesTo);
    if (filtered.length === 0) {
      alert('対象データがありません');
      return;
    }
    let csv = '\uFEFF支払い予定月,紹介報酬(税込),源泉徴収,支払総額,ステータス\n';
    filtered.forEach((s) => {
      csv += `${s.scheduledPayoutMonth},${s.totalBaseReward},${s.withholding},${s.totalReward},${s.status === 'paid' ? '振込済' : '未払い'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDetailCsv = (statement: any) => {
    let csv = `\uFEFF支払い予定月,${statement.scheduledPayoutMonth}\n`;
    csv += `紹介報酬(税込),${statement.totalBaseReward}\n`;
    csv += `源泉徴収,${statement.withholding}\n`;
    csv += `支払総額,${statement.totalReward}\n\n`;
    csv += '店舗名,プラン,報酬率,決済額,基本報酬,報酬額\n';
    (statement.shops || []).forEach((s: any) => {
      csv += `"${s.shopName}",${s.plan.toUpperCase()},${(s.rate * 100).toFixed(0)}%,${s.payment},${s.baseReward},${s.reward}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement_${statement.scheduledPayoutMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', color: '#718096' }}>
        読み込み中...
      </div>
    );
  }

  // ============================================================
  // 未ログイン：ログイン画面
  // ============================================================
  if (!user) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a202c', margin: '0 0 8px 0' }}>📢 アフィリエイトダッシュボード</h1>
            <p style={{ color: '#718096', fontSize: '13px', margin: 0 }}>ログインしてダッシュボードを表示</p>
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
                placeholder="affiliate@example.com"
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
                marginTop: '8px', width: '100%', padding: '12px',
                background: '#3182ce', color: '#ffffff', border: 'none',
                borderRadius: '6px', fontWeight: 'bold', fontSize: '14px',
                cursor: isLoggingIn ? 'wait' : 'pointer',
              }}
            >
              {isLoggingIn ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            <Link href="/reset-password?role=affiliate" style={{ color: '#3182ce', textDecoration: 'none' }}>
              パスワードをお忘れの方
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
            まだ登録していませんか？{' '}
            <Link href="/affiliate/signup" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
              今すぐ申し込む
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>トップページに戻る</Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ログイン済み：ダッシュボード
  // ============================================================
  const isRecurring = data?.affiliate?.rewardType === 'recurring';

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a202c', margin: '0 0 6px 0' }}>
              📢 アフィリエイトダッシュボード
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
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>累計報酬</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1a202c' }}>
              ¥{(data?.summary?.totalEarnings || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>未払い報酬</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#15803d' }}>
              ¥{(data?.summary?.unpaidReward || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>紹介店舗数</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#2563eb' }}>
              {data?.summary?.referralCount || 0} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>店舗</span>
            </div>
          </div>
          <div style={{ background: isRecurring ? '#eff6ff' : '#f0fdf4', padding: '20px', borderRadius: '12px', border: isRecurring ? '1px solid #bfdbfe' : '1px solid #86efac' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '6px' }}>報酬タイプ</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: isRecurring ? '#1d4ed8' : '#15803d' }}>
              {isRecurring ? 'ストック型（初年度8%）' : '単発型（固定額）'}
            </div>
          </div>
        </div>

        {/* 決済不履行 */}
        {data?.affiliate?.id && (
          <PaymentFailuresSection referrerId={data.affiliate.id} referrerType="affiliate" />
        )}

        {/* 紹介コード & URL */}
        {data?.affiliate?.referralCode && (
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
                    value={data.affiliate.referralCode}
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
                    value={typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${data.affiliate.referralCode}` : ''}
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

        {/* 振込先口座情報 */}
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#166534' }}>
            🏦 振込先口座情報
          </h3>
          <p style={{ fontSize: '12px', color: '#166534', marginBottom: '16px' }}>
            報酬のお振込先口座を指定してください。
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

          <button onClick={handleSaveBank} disabled={saving} style={{ marginTop: '16px', padding: '12px 24px', background: saveSuccess ? '#4CAF50' : saving ? '#ccc' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: saving ? 'wait' : 'pointer', fontSize: '14px' }}>
            {saving ? '保存中...' : saveSuccess ? '✨ 保存しました！' : '💾 口座情報を保存'}
          </button>
        </div>

        {/* タブ切替 */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '4px', marginBottom: '20px', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('referrals')}
            style={{
              padding: '10px 16px', border: 'none',
              borderBottom: activeTab === 'referrals' ? '3px solid #3182ce' : '3px solid transparent',
              background: 'none', fontWeight: 'bold',
              color: activeTab === 'referrals' ? '#3182ce' : '#64748b',
              cursor: 'pointer', fontSize: '15px', whiteSpace: 'nowrap'
            }}
          >
            🏪 紹介店舗一覧
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
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>期間:</label>
              <input type="month" value={salesFrom} onChange={(e) => setSalesFrom(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }} />
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>〜</span>
              <input type="month" value={salesTo} onChange={(e) => setSalesTo(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }} />
              {(salesFrom || salesTo) && (
                <button onClick={() => { setSalesFrom(''); setSalesTo(''); }} style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
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
                                {s.rate > 0 ? `${(s.rate * 100).toFixed(0)}%` : '固定額'}
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

        {/* 🏪 紹介店舗一覧タブ */}
        {activeTab === 'referrals' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                紹介店舗一覧 ({filteredReferrals.length}件)
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['all', 'light', 'standard', 'pro'] as const).map((tab) => {
                  const labels: Record<string, string> = { all: 'すべて', light: 'ライト', standard: 'スタンダード', pro: 'プロ' };
                  const active = selectedPlanTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSelectedPlanTab(tab)}
                      style={{
                        padding: '6px 14px', borderRadius: '6px', border: 'none',
                        fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
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

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="🔍 店舗名・コードで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            {filteredReferrals.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>
                紹介している店舗はまだありません。
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>店舗名</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>プラン</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>報酬率</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>{isRecurring ? '月額報酬' : '報酬額'}</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>ステータス</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>利用開始日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrals.map((r: any) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{r.shopName}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                            background: r.plan === 'pro' ? '#fef3c7' : r.plan === 'standard' ? '#dbeafe' : '#f1f5f9',
                            color: r.plan === 'pro' ? '#b45309' : r.plan === 'standard' ? '#1d4ed8' : '#475569',
                          }}>
                            {r.plan.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#16a34a' }}>
                          {r.rewardRate > 0 ? `${(r.rewardRate * 100).toFixed(1)}%` : '固定額'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#1a202c' }}>
                          ¥{r.monthlyReward.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                            background: r.status === 'active' ? '#c6f6d5' : '#fed7d7',
                            color: r.status === 'active' ? '#22543d' : '#9b2c2c',
                          }}>
                            {r.status === 'active' ? '契約中' : '停止'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#4a5568' }}>
                          {r.startedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* フッター */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link href="/" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
            ← トップページに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
