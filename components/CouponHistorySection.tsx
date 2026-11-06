'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase-client';
import { couponDay } from '@/lib/coupon-day';

type Entry = { id: string; title: string; phone: string; usedAt: string | null };

export default function CouponHistorySection({ shopId, refreshKey }: { shopId: string | null; refreshKey: string | null }) {
  const [date, setDate] = useState(() => couponDay(new Date()));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!shopId || !date) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    auth.currentUser?.getIdToken().then((idToken) => fetch(`/api/coupon-history?shopId=${encodeURIComponent(shopId)}&date=${encodeURIComponent(date)}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    })).then(async (response) => {
      if (!response) throw new Error('認証が必要です');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '履歴の取得に失敗しました');
      if (!cancelled) setEntries(data.histories);
    }).catch((reason) => {
      if (!cancelled) { setEntries([]); setError(reason.message); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [shopId, date, refreshKey, revision]);

  const download = () => {
    const cell = (value: string) => `"${(/^[\s\u0000-\u001f]*[=+@-]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
    const rows = [['クーポン名', '顧客の電話番号', '消し込み日時'], ...entries.map((entry) => [
      entry.title, entry.phone, entry.usedAt ? new Date(entry.usedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : '',
    ])];
    const csv = '\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `coupon-history-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <section style={{ borderTop: '2px solid #eee', padding: '20px 0' }}>
    <h2 style={{ fontSize: '20px', margin: '0 0 12px' }}>クーポン消し込み履歴</h2>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <label>日付 <input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <button type="button" onClick={() => setRevision((value) => value + 1)} disabled={loading}>更新</button>
      <button type="button" onClick={download} disabled={loading || !!error || entries.length === 0}>CSVをダウンロード</button>
    </div>
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    {loading ? <p>読み込み中...</p> : !error && (entries.length === 0 ? <p>この日の消し込みはありません。</p> :
      <div style={{ overflowX: 'auto', marginTop: '12px' }}><table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead><tr><th>クーポン名</th><th>顧客の電話番号</th><th>消し込み日時</th></tr></thead>
        <tbody>{entries.map((entry) => <tr key={entry.id}>
          <td>{entry.title}</td><td>{entry.phone || '未登録'}</td><td>{entry.usedAt ? new Date(entry.usedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : '-'}</td>
        </tr>)}</tbody>
      </table></div>)}
  </section>;
}