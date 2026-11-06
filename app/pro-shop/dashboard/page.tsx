'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import PaymentFailuresSection from '@/components/PaymentFailuresSection';
import PosIntegrationSection from '@/components/PosIntegrationSection';
import { isProReferralPlan, type ProReferralPlan } from '@/lib/pro-referral-policy';

interface ReferralShop {
  id: string;
  shopCode: string;
  name: string;
  plan: string;
  status: string;
  rewardRate: number;
  monthlyReward: number;
  startedAt: string;
}

interface RewardHistory {
  id: string;
  billingMonth: string;
  shopName: string;
  amount: number;
  status: 'unpaid' | 'paid';
}

export default function ProShopDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [proReferralPlan, setProReferralPlan] = useState<ProReferralPlan | null>(null);
  const [selectedReferralPlan, setSelectedReferralPlan] = useState<ProReferralPlan | ''>('');
  const [confirmedReferralPlan, setConfirmedReferralPlan] = useState(false);
  const [savingReferralPlan, setSavingReferralPlan] = useState(false);
  const [referralPlanError, setReferralPlanError] = useState('');

  // ログイン用
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 店舗情報
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('');

  // サマリー
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [unpaidReward, setUnpaidReward] = useState(0);
  const [referralCount, setReferralCount] = useState(0);

  // 紹介コード・URL
  const [referralCode, setReferralCode] = useState('');

  // 振込先口座
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'checking'>('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // 紹介店舗一覧
  const [referrals, setReferrals] = useState<ReferralShop[]>([]);

  // 報酬履歴
  const [rewards, setRewards] = useState<RewardHistory[]>([]);

  // タブ
  const [activeTab, setActiveTab] = useState<'referrals' | 'rewards'>('referrals');

  // 検索
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setAccessError('');
      try {
        const idToken = await u.getIdToken();

        const res = await fetch('/api/pro-shop/dashboard', {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          const shop = data.shop || {};
          const summary = data.summary || {};

          setShopId(shop.id || null);
          setShopName(shop.name || '');
          setProReferralPlan(isProReferralPlan(shop.proReferralPlan) ? shop.proReferralPlan : null);
          setReferralCode(shop.referralCode || '');
          setTotalEarnings(summary.totalEarnings || 0);
          setUnpaidReward(summary.unpaidReward || 0);
          setReferralCount(summary.referralCount || 0);

          if (shop.bankAccount) {
            setBankName(shop.bankAccount.bankName || '');
            setBranchName(shop.bankAccount.branchName || '');
            setAccountType(shop.bankAccount.accountType || 'savings');
            setAccountNumber(shop.bankAccount.accountNumber || '');
            setAccountHolder(shop.bankAccount.accountHolder || '');
          }

          setReferrals(data.referrals || []);
          setRewards(data.rewards || []);
        } else if (res.status === 403) {
          // 本当に権限がない場合のみログアウト
          const data = await res.json().catch(() => ({}));
          await signOut(auth);
          setUser(null);
          setAccessError(
            `このアカウントはPRO紹介・報酬ダッシュボードを利用できません。${data.error ? `（${data.error}）` : ''}`
          );
        } else {
          // 401(トークン切れ)や500エラーではログアウトせず、エラー表示のみ
          const data = await res.json().catch(() => ({}));
          setAccessError(`ダッシュボードの読み込みに失敗しました。時間をおいて再読み込みしてください。${data.error ? `（${data.error}）` : ''}`);
        }
      } catch (err) {
        console.error('ダッシュボード取得エラー:', err);
        setAccessError('ダッシュボードの読み込みに失敗しました。通信環境をご確認のうえ再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAccessError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setLoginError('メールアドレスまたはパスワードが正しくありません。');
    }
  };

  const handleSaveBank = async () => {
    if (!user || !shopId) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/update-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          shopId,
          bankAccount: {
            bankName,
            branchName,
            accountType,
            accountNumber,
            accountHolder,
          },
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
      alert('保存エラー: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmReferralPlan = async () => {
    if (!user || !isProReferralPlan(selectedReferralPlan) || !confirmedReferralPlan) return;
    setSavingReferralPlan(true);
    setReferralPlanError('');
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/pro-shop/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ plan: selectedReferralPlan }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '報酬プランを保存できませんでした');
      setProReferralPlan(selectedReferralPlan);
    } catch (error: any) {
      setReferralPlanError(error.message || '保存に失敗しました');
    } finally {
      setSavingReferralPlan(false);
    }
  };

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      alert('紹介コードをコピーしました！');
    }
  };

  const handleCopyUrl = () => {
    if (referralCode) {
      const url = `${window.location.origin}/signup?ref=${referralCode}`;
      navigator.clipboard.writeText(url);
      alert('紹介URLをコピーしました！');
    }
  };

  const handleDownloadCSV = async () => {
    if (!user || !shopId) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(
        `/api/referrals/export-csv?referrer_id=${shopId}&referrer_type=pro&month=${currentMonth}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (!res.ok) {
        alert('CSVの取得に失敗しました');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `referral_statement_pro_${currentMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('エラー: ' + err.message);
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.shopCode.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <main className="max-w-lg mx-auto mt-16 text-center text-slate-500">
        <p>読み込み中...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-sm mx-auto mt-16 px-5 text-center font-sans">
        <div className="flex justify-center mb-4">
          <img src="/icon-192x192.png" alt="Push-taro" className="w-20 h-20 rounded-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Push-taro</h1>
        <p className="text-gray-500 mb-5">紹介・報酬ダッシュボード</p>
        {accessError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm mb-4">
            {accessError}
          </div>
        )}
        {loginError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm mb-4">
            {loginError}
          </div>
        )}
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="メールアドレス（ログインID）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full box-border pl-3 pr-11 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
            >
              👁
            </button>
          </div>
          <button
            type="submit"
            className="mt-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-lg transition-colors"
          >
            ログイン
          </button>
        </form>
        <div className="mt-4 text-sm">
          <Link href="/reset-password?role=shop&returnTo=/pro-shop/dashboard" className="text-orange-700 hover:underline">
            パスワードをお忘れの方
          </Link>
        </div>
      </main>
    );
  }

  if (!shopId) {
    return (
      <main className="max-w-sm mx-auto mt-16 px-5 text-center font-sans">
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm mb-4">
          {accessError || 'ダッシュボードの読み込みに失敗しました。'}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
          >
            再読み込み
          </button>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200"
          >
            ログアウト
          </button>
        </div>
      </main>
    );
  }

  if (!proReferralPlan) {
    return (
      <main className="max-w-3xl mx-auto mt-10 px-5 font-sans text-slate-800">
        <h1 className="text-2xl font-bold mb-2">PRO紹介報酬プランの設定</h1>
        <p className="text-slate-500 mb-6 leading-relaxed">紹介制度はどちらか一方を選択してください。確定後の変更はできません。</p>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <label className={`block rounded-2xl p-5 cursor-pointer bg-orange-50 border-2 transition-colors ${selectedReferralPlan === 'a' ? 'border-orange-500' : 'border-slate-200'}`}>
            <input type="radio" name="proReferralPlan" value="a" checked={selectedReferralPlan === 'a'} onChange={() => setSelectedReferralPlan('a')} className="accent-orange-500" />
            <strong className="block text-lg my-2">Aプラン</strong>
            <span className="text-sm">どのプランでも何件でも紹介可能。報酬率は一律10%。</span>
            <p className="mt-3 text-sm text-orange-900">紹介を続けると、PROプランの費用を実質無料にでき、さらに収益を得られる可能性があります。</p>
          </label>
          <label className={`block rounded-2xl p-5 cursor-pointer bg-emerald-50 border-2 transition-colors ${selectedReferralPlan === 'b' ? 'border-emerald-600' : 'border-slate-200'}`}>
            <input type="radio" name="proReferralPlan" value="b" checked={selectedReferralPlan === 'b'} onChange={() => setSelectedReferralPlan('b')} className="accent-emerald-600" />
            <strong className="block text-lg my-2">Bプラン</strong>
            <span className="text-sm">PROプランのみ紹介可能。紹介枠は同時に2件まで、報酬率は1件につき20%。</span>
            <p className="mt-3 text-sm text-emerald-900">PROを2件紹介すると、合計で月額費用の実質40%相当の報酬になります。本業の傍らで紹介する方におすすめです。</p>
          </label>
        </div>
        <p className="mt-5 mb-3 text-red-700 font-bold">途中からの変更は受け付けておりませんので、慎重にお選びください。</p>
        <label className="flex gap-2.5 items-start leading-relaxed">
          <input type="checkbox" checked={confirmedReferralPlan} onChange={(event) => setConfirmedReferralPlan(event.target.checked)} className="mt-1" />
          <span>選択した報酬制度の内容に間違いないことを確認しました。</span>
        </label>
        {referralPlanError && <p role="alert" className="text-red-700">{referralPlanError}</p>}
        <button
          type="button"
          onClick={handleConfirmReferralPlan}
          disabled={!selectedReferralPlan || !confirmedReferralPlan || savingReferralPlan}
          className="mt-5 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50"
        >
          {savingReferralPlan ? '確定中...' : '報酬プランを確定する'}
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto mt-10 px-5 font-sans text-slate-800">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 border-b-2 border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold m-0">🤝 紹介・報酬ダッシュボード</h1>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white bg-orange-500">PRO</span>
          </div>
          <p className="text-slate-500 text-sm mt-1.5">
            {shopName} / <strong>{user.email}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="bg-orange-50 p-5 rounded-2xl border-2 border-orange-200">
          <div className="text-xs font-bold text-orange-800 mb-1.5">累計報酬</div>
          <div className="text-3xl font-black text-orange-700">¥{totalEarnings.toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-200">
          <div className="text-xs font-bold text-emerald-800 mb-1.5">未払い報酬</div>
          <div className="text-3xl font-black text-emerald-700">¥{unpaidReward.toLocaleString()}</div>
        </div>
        <div className="bg-sky-50 p-5 rounded-2xl border-2 border-sky-200">
          <div className="text-xs font-bold text-sky-800 mb-1.5">紹介店舗数</div>
          <div className="text-3xl font-black text-sky-700">{referralCount} <span className="text-sm font-normal">店舗</span></div>
        </div>
      </div>

      {shopId && <PaymentFailuresSection referrerId={shopId} referrerType="pro" />}

      {shopId && (
        <div className="mt-6">
          <PosIntegrationSection shopId={shopId} user={user} />
        </div>
      )}

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mt-6 mb-6">
        <h3 className="text-base font-bold text-orange-700 mb-1.5">🎁 あなたの紹介特典コード・専用URL</h3>
        <p className="text-xs text-orange-900 mb-4 leading-relaxed">
          他店舗へご紹介の際、こちらのコードまたは専用URLをご案内ください。新規店舗がご契約すると紹介報酬が発生します。
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-orange-900 mb-1">紹介コード</label>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                readOnly
                value={referralCode || '取得中...'}
                className="flex-1 min-w-[200px] px-3.5 py-2.5 text-base font-bold tracking-wider bg-white border border-slate-300 rounded-md"
              />
              <button onClick={handleCopyCode} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-bold text-sm transition-colors">
                コードをコピー
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-orange-900 mb-1">専用登録URL（紹介コード自動入力）</label>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                readOnly
                value={referralCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}` : '取得中...'}
                className="flex-1 min-w-[200px] px-3.5 py-2.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-md"
              />
              <button onClick={handleCopyUrl} className="px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-md font-bold text-sm transition-colors">
                URLをコピー
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-300 rounded-2xl p-5 mb-6">
        <h3 className="text-base font-bold text-orange-700 mb-1.5">🏦 振込先口座情報（紹介報酬受取用）</h3>
        <p className="text-xs text-orange-900 mb-4">※紹介手数料（PRO特典 10%）をお振り込みする口座を指定してください。</p>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div>
            <label className="block mb-1 font-bold text-xs">金融機関名</label>
            <input type="text" placeholder="例: 〇〇銀行" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 box-border" />
          </div>
          <div>
            <label className="block mb-1 font-bold text-xs">支店名</label>
            <input type="text" placeholder="例: △△支店" value={branchName} onChange={(e) => setBranchName(e.target.value)} className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 box-border" />
          </div>
          <div>
            <label className="block mb-1 font-bold text-xs">預金種目</label>
            <select value={accountType} onChange={(e: any) => setAccountType(e.target.value)} className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 box-border">
              <option value="savings">普通</option>
              <option value="checking">当座</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-bold text-xs">口座番号</label>
            <input type="text" placeholder="1234567" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 box-border" />
          </div>
          <div>
            <label className="block mb-1 font-bold text-xs">口座名義（カナ）</label>
            <input type="text" placeholder="ヤマダ タロウ" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 box-border" />
          </div>
        </div>

        <button
          onClick={handleSaveBank}
          disabled={saving}
          className={`mt-4 px-6 py-3 rounded-md font-bold text-sm text-white transition-colors ${saveSuccess ? 'bg-emerald-600' : saving ? 'bg-gray-300 cursor-wait' : 'bg-orange-600 hover:bg-orange-700'}`}
        >
          {saving ? '保存中...' : saveSuccess ? '✨ 保存しました！' : '💾 口座情報を保存'}
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-slate-200 pb-1 mb-5">
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2.5 border-b-[3px] font-bold text-[15px] whitespace-nowrap transition-colors ${activeTab === 'referrals' ? 'text-orange-500 border-orange-500' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
        >
          🏪 紹介店舗一覧（{referrals.length}）
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2.5 border-b-[3px] font-bold text-[15px] whitespace-nowrap transition-colors ${activeTab === 'rewards' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
        >
          💰 報酬明細（{rewards.length}）
        </button>
      </div>

      {activeTab === 'referrals' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="m-0 text-base font-extrabold">紹介経由の店舗一覧</h3>
            <input
              type="text"
              placeholder="🔍 店舗名・コードで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-sm min-w-[200px]"
            />
          </div>

          {filteredReferrals.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">紹介している店舗はまだありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="p-3 text-left">店舗名</th>
                    <th className="p-3 text-left">店舗コード</th>
                    <th className="p-3 text-center">プラン</th>
                    <th className="p-3 text-center">報酬率</th>
                    <th className="p-3 text-right">月額報酬</th>
                    <th className="p-3 text-center">ステータス</th>
                    <th className="p-3 text-center">利用開始日</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="p-3 font-bold">{r.name}</td>
                      <td className="p-3 font-mono text-xs text-slate-600">{r.shopCode}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${r.plan === 'pro' ? 'bg-amber-100 text-amber-800' : r.plan === 'standard' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                          {r.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-600">{(r.rewardRate * 100).toFixed(0)}%</td>
                      <td className="p-3 text-right font-bold text-slate-900">¥{r.monthlyReward.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${r.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {r.status === 'active' ? '契約中' : '停止'}
                        </span>
                      </td>
                      <td className="p-3 text-center text-xs text-slate-600">{r.startedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="m-0 text-base font-extrabold">今月の報酬明細</h3>
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-bold text-sm transition-colors"
            >
              📥 明細CSVダウンロード
            </button>
          </div>

          {rewards.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">報酬明細はまだありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="p-3 text-left">対象月</th>
                    <th className="p-3 text-left">紹介元店舗</th>
                    <th className="p-3 text-right">報酬額</th>
                    <th className="p-3 text-center">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="p-3 font-mono">{r.billingMonth}</td>
                      <td className="p-3 font-bold">{r.shopName}</td>
                      <td className="p-3 text-right font-bold text-orange-700">¥{r.amount.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${r.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {r.status === 'paid' ? '振込済み' : '未払い'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
