'use client';

import { useState } from 'react';

export type StreakInfo = {
  enabled: boolean;
  targetDays: number;
  currentCount: number;
  lastStampDate: string; // 'YYYY-MM-DD'
  achieved: boolean;
  achievedAt: string | null;
};

type Props = {
  streak: StreakInfo | null;
  shopId: string;
  token: string;
  onStamped?: () => void;
};

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function StreakCard({ streak, shopId, token, onStamped }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!streak || !streak.enabled) return null;

  const { targetDays, currentCount, achieved } = streak;
  const remaining = Math.max(0, targetDays - currentCount);
  const alreadyToday = streak.lastStampDate === todayStr();

  const handleStamp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/streak/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'スタンプに失敗しました');
        return;
      }
      onStamped?.();
    } catch (e: any) {
      setError(e.message || '通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-5 mb-6 shadow-lg relative overflow-hidden text-white">
      <div className="absolute -right-6 -bottom-6 text-8xl opacity-20 transform rotate-12">🎁</div>

      <div className="flex justify-between items-center mb-1 relative z-10">
        <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold">
          アプリを開いてスタンプGET
        </span>
        <span className="text-xs font-bold bg-white text-orange-600 px-2 py-0.5 rounded-full">
          {currentCount}日目
        </span>
      </div>
      <h2 className="text-lg font-black mb-3 relative z-10">連続ログインキャンペーン</h2>

      {/* スタンプ */}
      <div className="flex justify-between mb-4 relative z-10">
        {Array.from({ length: targetDays }).map((_, i) => {
          const done = i < currentCount;
          return (
            <div
              key={i}
              className={
                done
                  ? 'w-8 h-8 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold text-sm shadow-inner'
                  : 'w-8 h-8 rounded-full bg-orange-300/50 border-2 border-white/50 flex items-center justify-center font-bold text-sm text-white/50'
              }
            >
              {done ? '✓' : i + 1}
            </div>
          );
        })}
      </div>

      <div className="relative z-10">
        {achieved ? (
          <>
            <p className="text-xs text-white/90 mb-3">
              🎉 達成！クーポンが利用可能です
            </p>
            <button
              type="button"
              onClick={() => window.location.href = `/coupons?shopId=${shopId}`}
              className="w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-sm flex justify-center items-center gap-2"
            >
              🎫 クーポンを確認する
            </button>
          </>
        ) : alreadyToday ? (
          <>
            <p className="text-xs text-white/90 mb-3">
              今日のスタンプは押しました ✓ あと<span className="font-black text-white text-sm mx-1">{remaining}日</span>でクーポンGET！
            </p>
            <button
              type="button"
              disabled
              className="w-full bg-white/70 text-orange-600 font-black py-3 rounded-xl text-sm cursor-not-allowed"
            >
              ✓ 本日はスタンプ済み
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-white/90 mb-3">
              あと<span className="font-black text-white text-sm mx-1">{remaining}日</span>でクーポンGET！
            </p>
            <button
              type="button"
              onClick={handleStamp}
              disabled={loading}
              className="w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-sm flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? '処理中...' : '🎯 今日のスタンプを押す'}
            </button>
          </>
        )}
        {error && <p className="text-xs mt-2 text-yellow-200 font-bold">{error}</p>}
      </div>
    </div>
  );
}
