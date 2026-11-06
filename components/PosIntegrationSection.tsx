'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import Link from 'next/link';

interface KeyInfo {
  hasKey: boolean;
  keyPrefix: string | null;
  createdAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export default function PosIntegrationSection({ shopId, user }: { shopId: string; user: Pick<User, 'getIdToken'> }) {
  const [info, setInfo] = useState<KeyInfo | null>(null);
  const [plainKey, setPlainKey] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const endpoint = `/api/pro-shop/pos-api-key?shopId=${encodeURIComponent(shopId)}`;

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError('');
    void (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'キー情報を取得できませんでした');
        if (!cancelled) setInfo(data);
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'キー情報を取得できませんでした');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, [endpoint, user, revision]);

  const mutateKey = async (method: 'POST' | 'DELETE') => {
    const prompt = method === 'DELETE' ? 'APIキーを失効します。接続中のPOSは利用できなくなります。続けますか？'
      : info?.hasKey ? 'APIキーを再発行すると、現在のキーは即時失効します。すべてのPOSでキーの更新が必要です。続けますか？' : '';
    if (prompt && !window.confirm(prompt)) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const token = await user.getIdToken();
      const response = await fetch(endpoint, { method, headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'APIキーの更新に失敗しました');
      setPlainKey(method === 'POST' ? data.key : '');
      setMessage(data.message);
      setRevision((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'APIキーの更新に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(plainKey);
      setMessage('APIキーをコピーしました。安全な場所に保管してください。');
    } catch (reason) {
      console.error('APIキーのコピー失敗:', reason);
      setError('コピーできませんでした。表示されているキーを選択して手動でコピーしてください。');
    }
  };
  const date = (value: string | null) => value ? new Date(value).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : 'なし';

  return (
    <section className="space-y-3.5">

      {/* 説明カード */}
      <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center text-base shadow-sm">🔗</div>
          <div>
            <h2 className="text-sm font-bold">POS連携</h2>
            <p className="text-[11px] text-slate-500">店舗共通のAPIキーでクーポン確認・消し込みを連携</p>
          </div>
        </div>
        <p className="text-[12px] text-slate-600 leading-relaxed mb-3">
          店舗共通のAPIキーをPOS側に設定して、クーポンの確認と消し込みを連携します。POS側でのAPI接続開発・設定が必要です。
        </p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Link href="/developers/pos-api" className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 font-bold hover:bg-sky-100 transition-colors">
            📘 API仕様・接続サンプル
          </Link>
          <Link href="/guide/pos-integration" className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-bold hover:bg-slate-100 transition-colors">
            📖 導入ガイド
          </Link>
        </div>
      </div>

      {/* エラー */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-[12px] font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* 成功メッセージ */}
      {message && (
        <div role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2.5 rounded-xl text-[12px] font-bold">
          ✓ {message}
        </div>
      )}

      {/* キー状態 */}
      {info && (
        <div className="bg-white rounded-[18px] border border-slate-900/5 shadow-sm p-5">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[12px]">
            <span className="font-bold text-slate-600">状態</span>
            <span>
              {info.hasKey ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">有効</span>
              ) : info.revokedAt ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">失効済み</span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">未発行</span>
              )}
            </span>
            <span className="font-bold text-slate-600">キー識別子</span>
            <span className="font-mono text-[11px] text-slate-800">{info.keyPrefix ? `${info.keyPrefix}…` : 'なし'}</span>
            <span className="font-bold text-slate-600">発行日時（JST）</span>
            <span className="text-slate-700">{date(info.createdAt)}</span>
            <span className="font-bold text-slate-600">最終利用（JST）</span>
            <span className="text-slate-700">{date(info.lastUsedAt)}</span>
          </div>
        </div>
      )}

      {/* 平文キー表示 */}
      {plainKey && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-[18px] p-5">
          <p className="text-[12px] font-bold text-amber-800 mb-2">
            ⚠️ このキーは今回だけ表示されます。タブを閉じる前に保存してください。
          </p>
          <label htmlFor="pos-api-key" className="block text-[10px] font-bold text-amber-800 mb-1">APIキー</label>
          <input
            id="pos-api-key"
            readOnly
            value={plainKey}
            autoComplete="off"
            spellCheck={false}
            className="block w-full box-border px-3 py-2.5 bg-white border border-amber-200 rounded-lg font-mono text-[11px] text-slate-800 focus:outline-none"
          />
          <button
            type="button"
            onClick={copyKey}
            className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition-colors"
          >
            📋 キーをコピー
          </button>
        </div>
      )}

      {/* アクション */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          disabled={busy || !info}
          onClick={() => void mutateKey('POST')}
          className="px-3 py-2 rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-[11px] font-bold shadow-md shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {info?.hasKey ? 'APIキーを再発行' : 'APIキーを発行'}
        </button>
        <button
          type="button"
          disabled={busy || !info?.hasKey}
          onClick={() => void mutateKey('DELETE')}
          className="px-3 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 text-[11px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          APIキーを失効
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setRevision((value) => value + 1)}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-all disabled:opacity-60"
        >
          状態を更新
        </button>
      </div>

      {busy && (
        <p className="text-[11px] text-slate-500 animate-pulse">処理中...</p>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed">
        平文キーは画面の表示中だけ保持し、ブラウザの保存領域には記録しません。再発行すると以前のキーは使えなくなります。
      </p>
    </section>
  );
}
