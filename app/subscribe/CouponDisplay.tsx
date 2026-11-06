'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { couponDay } from '../../lib/coupon-day';

const DAY_MS = 24 * 60 * 60 * 1000;

export function couponExpiry(
  coupon: { expireType?: string; expireDate?: string; expireDays?: number },
  appearedAt: string | null,
  defaultDays = 1,
): number | null {
  if (coupon.expireType === 'date' && coupon.expireDate) {
    return new Date(`${coupon.expireDate}T23:59:59.999+09:00`).getTime();
  }
  if (coupon.expireType === 'days' && appearedAt) {
    return new Date(appearedAt).getTime() + Math.max(1, Number(coupon.expireDays) || defaultDays) * DAY_MS;
  }
  return null;
}

interface CouponDisplayProps {
  storageKey: string;
  legacyHiddenKey?: string;
  shopId: string;
  title: string;
  now: number;
  expiresAt?: number | null;
  used?: boolean;
  usedAt?: string | null;
  children: ReactNode;
}

export default function CouponDisplay({
  storageKey, legacyHiddenKey, shopId, title, now, expiresAt, used = false, usedAt, children,
}: CouponDisplayProps) {
  const [dismissed, setDismissed] = useState(false);
  const [storageError, setStorageError] = useState('');
  const expired = expiresAt != null && expiresAt < now;
  const terminal = used || expired;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      const legacy: string[] = JSON.parse(localStorage.getItem(`push_taro_hidden_coupons_${shopId}`) || '[]');
      setDismissed(saved?.dismissed === true || Boolean(legacyHiddenKey && legacy.includes(legacyHiddenKey)));
    } catch (error) {
      console.error('クーポン表示設定の読み込みエラー:', error);
      setStorageError('表示設定を保存できません。ブラウザの保存設定を確認してください。');
    }
  }, [storageKey, shopId, legacyHiddenKey]);

  const terminalDates = [
    ...(used && usedAt ? [new Date(usedAt).getTime()] : []),
    ...(expired && expiresAt != null ? [expiresAt] : []),
  ].filter(Number.isFinite);
  const endedDay = terminalDates.length
    ? couponDay(new Date(Math.min(...terminalDates)))
    : null;

  if (dismissed || (used && !usedAt) || (terminal && endedDay && couponDay(new Date(now)) > endedDay)) return null;
  if (!terminal) return children;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ dismissed: true }));
    } catch (error) {
      console.error('クーポン表示設定の保存エラー:', error);
      setDismissed(false);
      setStorageError('削除状態を保存できませんでした。ブラウザの保存設定を確認してください。');
    }
  };

  return (
    <section aria-label={title} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#475569', overflowWrap: 'anywhere' }}>{title}</h3>
      <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#475569' }}>{used ? 'こちらのクーポンは使用済みです' : 'こちらのクーポンは有効期限切れです'}</p>
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>翌日には自動で非表示になります。</p>
      <button type="button" onClick={dismiss} style={{ padding: '8px 18px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>削除</button>
      {storageError && <p role="alert" style={{ color: '#dc2626', fontSize: '13px' }}>{storageError}</p>}
    </section>
  );
}
