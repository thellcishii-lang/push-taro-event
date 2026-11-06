'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

type Props = {
  open: boolean;
  title: string;
  message: string;
  emoji?: string;
  buttonLabel?: string;
  onClose: () => void;
};

const COLORS = ['#f97316', '#ef4444', '#fbbf24', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

function fireConfetti() {
  // ① 中央から大爆発
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
    colors: COLORS,
    scalar: 1.1,
  });
  // ② 左右の袖から同時発射
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: COLORS });
    confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: COLORS });
  }, 250);
  // ③ しばらく雨のように降らせる（3秒）
  const end = Date.now() + 3000;
  (function rain() {
    confetti({
      particleCount: 4,
      spread: 360,
      startVelocity: 20,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors: COLORS,
      scalar: 0.9,
      ticks: 120,
    });
    if (Date.now() < end) requestAnimationFrame(rain);
  })();
}

export default function CelebrationModal({
  open,
  title,
  message,
  emoji = '🎁',
  buttonLabel = 'クーポンを見る',
  onClose,
}: Props) {
  useEffect(() => {
    if (open) fireConfetti();
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
        style={{ animation: 'fadeIn .25s ease' }}
      >
        <div
          className="bg-white rounded-3xl p-8 max-w-[340px] w-[90%] text-center shadow-2xl"
          style={{ animation: 'pop .35s cubic-bezier(.34,1.56,.64,1)' }}
        >
          <div className="text-5xl mb-2">{emoji}</div>
          <h2 className="text-xl font-bold text-orange-600 mb-2">{title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-5 whitespace-pre-line">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl active:scale-95 transition-transform"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pop { from { transform: scale(.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </>
  );
}
