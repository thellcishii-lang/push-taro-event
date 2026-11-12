'use client';

// app/event-admin/[eventId]/coupons/print/page.tsx
// 主催者向け「出店者・クーポン一覧」シート（印刷用ページ）。
//
// クーポン管理画面の出店者一覧とクーポン一覧は、別々に書き出すと
// 紛らわしいため、1枚の表に統合して出す（Ishii 指示）:
//   左 = 出店者（会社名＋メール）、右 = その出店者のクーポン。
// 左だけ読めば出店者一覧、右だけ読めばクーポン一覧になる。
// クーポンが無い出店者も左側に載る（右側は空欄）。
//
// 本家の /print（申込書）と同じ方式で、ブラウザ印刷から PDF 保存する。
// データは管理 API（requireEventOwner）から主催者本人のトークンで取得する。
// このシートは主催者向けの印刷物のため、文言は日本語固定。
import { Fragment, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import {
  buildExhibitorCouponGroups,
  type SheetCoupon,
  type SheetExhibitor,
} from '@/lib/coupon-list-sheet';

interface Exhibitor extends SheetExhibitor {
  hasAccessCode: boolean;
}

interface Coupon extends SheetCoupon {
  description: string;
  keywords: string[];
}

const sheetCss = `
.sheet-root { background: #e2e8f0; min-height: 100vh; padding: 0 0 48px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif;
  color: #0f172a; box-sizing: border-box; }
.sheet-toolbar { position: sticky; top: 0; z-index: 10; background: #ffffff;
  border-bottom: 1px solid #cbd5e1; padding: 12px 20px; display: flex;
  justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.sheet-toolbar-title { font-size: 14px; font-weight: 700; }
.sheet-toolbar-actions { display: flex; gap: 8px; }
.sheet-back { padding: 9px 16px; border: 1px solid #cbd5e1; background: #ffffff;
  border-radius: 8px; font-weight: 700; font-size: 13px; color: #0f172a;
  text-decoration: none; cursor: pointer; }
.sheet-print { padding: 9px 18px; border: none; background: #6d28d9;
  border-radius: 8px; font-weight: 700; font-size: 13px; color: #ffffff; cursor: pointer; }
.sheet-paper { background: #ffffff; max-width: 960px; margin: 20px auto 0;
  padding: 32px 36px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); }
.sheet-heading { font-size: 20px; font-weight: 800; margin: 0; }
.sheet-meta { font-size: 12px; color: #475569; margin: 8px 0 16px; }
.sheet-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sheet-table th, .sheet-table td { border: 1px solid #94a3b8; padding: 8px 10px;
  vertical-align: top; text-align: left; }
.sheet-table th { background: #f1f5f9; font-size: 12.5px; }
.sheet-exhibitor-name { font-weight: 700; font-size: 13.5px; display: block; }
.sheet-exhibitor-email { font-size: 11.5px; color: #475569; display: block;
  margin-top: 2px; word-break: break-all; }
.sheet-coupon-inactive { font-size: 11.5px; color: #64748b; margin-left: 6px; }
.sheet-note { font-size: 12.5px; color: #475569; }
@media print {
  .sheet-root { background: #ffffff; padding: 0; }
  .sheet-toolbar { display: none; }
  .sheet-paper { box-shadow: none; margin: 0; max-width: none; padding: 0; }
  .sheet-table tr { break-inside: avoid; }
}
@page { margin: 12mm; }
`;

export default function EventCouponListPrintPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [eventName, setEventName] = useState('');
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [printedAt, setPrintedAt] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      const [evRes, exRes, cpRes] = await Promise.all([
        fetch(`/api/events/${eventId}`, { headers }),
        fetch(`/api/events/${eventId}/exhibitors`, { headers }),
        fetch(`/api/events/${eventId}/coupons`, { headers }),
      ]);
      for (const res of [evRes, exRes, cpRes]) {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? '読み込みに失敗しました');
        }
      }
      const evData = await evRes.json();
      const exData = await exRes.json();
      const cpData = await cpRes.json();
      setEventName(typeof evData.event?.name === 'string' ? evData.event.name : '');
      setExhibitors(exData.exhibitors ?? []);
      setCoupons(cpData.coupons ?? []);
      setPrintedAt(
        new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
      );
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoaded(true);
    }
  }, [user, eventId]);

  useEffect(() => {
    if (user) void loadAll();
  }, [user, loadAll]);

  const backHref = `/event-admin/${eventId}/coupons`;

  if (!authReady || (user && !loaded)) {
    return (
      <main className="sheet-root">
        <style>{sheetCss}</style>
        <p style={{ padding: 24, fontSize: 14 }}>読み込み中…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="sheet-root">
        <style>{sheetCss}</style>
        <div className="sheet-paper">
          <p style={{ fontSize: 14 }}>
            ログインが必要です。クーポン管理画面でログインしてから開き直してください。
          </p>
          <p style={{ marginTop: 12 }}>
            <Link href={backHref}>クーポン管理画面に戻る</Link>
          </p>
        </div>
      </main>
    );
  }

  const groups = buildExhibitorCouponGroups(exhibitors, coupons);

  return (
    <main className="sheet-root">
      <style>{sheetCss}</style>
      <div className="sheet-toolbar">
        <span className="sheet-toolbar-title">出店者・クーポン一覧（印刷用）</span>
        <span className="sheet-toolbar-actions">
          <Link className="sheet-back" href={backHref}>
            クーポン管理に戻る
          </Link>
          <button
            type="button"
            className="sheet-print"
            onClick={() => window.print()}
          >
            印刷する
          </button>
        </span>
      </div>
      <div className="sheet-paper">
        <h1 className="sheet-heading">
          {eventName} 出店者・クーポン一覧
        </h1>
        <p className="sheet-meta">
          出店者 {exhibitors.length} 社・クーポン {coupons.length} 件／出力日時: {printedAt}
        </p>
        {error && (
          <p style={{ color: '#b91c1c', fontSize: 14 }}>{error}</p>
        )}
        {groups.length === 0 ? (
          <p className="sheet-note">出店者がまだ登録されていません。</p>
        ) : (
          <table className="sheet-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>出店者</th>
                <th>クーポン</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => {
                const rowSpan = Math.max(group.coupons.length, 1);
                const exhibitorCell = (
                  <td rowSpan={rowSpan}>
                    <span className="sheet-exhibitor-name">
                      {group.exhibitor.name}
                    </span>
                    {group.exhibitor.email && (
                      <span className="sheet-exhibitor-email">
                        {group.exhibitor.email}
                      </span>
                    )}
                  </td>
                );
                if (group.coupons.length === 0) {
                  return (
                    <tr key={group.exhibitor.id}>
                      {exhibitorCell}
                      <td />
                    </tr>
                  );
                }
                return (
                  <Fragment key={group.exhibitor.id}>
                    {group.coupons.map((coupon, i) => (
                      <tr key={coupon.id}>
                        {i === 0 ? exhibitorCell : null}
                        <td>
                          {coupon.title}
                          {!coupon.active && (
                            <span className="sheet-coupon-inactive">
                              （現在無効）
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
