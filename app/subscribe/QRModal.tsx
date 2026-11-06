'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

type Props = {
  open: boolean;
  title: string;
  qrValue: string;
  onClose: () => void;
};

export default function QRModal({ open, title, qrValue, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-gray-800 text-base mb-1">{title}</h3>
        <p className="text-[11px] text-gray-500 mb-4">
          会計時にこちらのQRコードを<br />スタッフにご提示ください
        </p>
        <div className="bg-orange-50 p-4 rounded-2xl inline-block mb-4">
          <QRCodeSVG value={qrValue} size={192} />
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
