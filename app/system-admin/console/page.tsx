'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, User } from 'firebase/auth';

interface ErrorLog {
  id: string;
  source: string;
  message: string;
  stack: string;
  userId: string | null;
  shopId: string | null;
  details: any;
  createdAt: string | null;
}

export default function ErrorConsolePage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async (authenticatedUser: User | null = auth.currentUser) => {
    try {
      if (!authenticatedUser) {
        throw new Error('管理者としてログインしてください');
      }
      setLoadError('');
      const idToken = await authenticatedUser.getIdToken();
      const res = await fetch('/api/admin/error-logs', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `エラーログを取得できませんでした（HTTP ${res.status}）`);
      }
      setLogs(data.logs || []);
    } catch (err: any) {
      console.error('エラーログ取得失敗:', err);
      setLoadError(err.message || 'エラーログを取得できませんでした');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      void fetchLogs(user);
    });
  }, []);

  // 自動更新（10秒ごと）
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleClearLogs = async () => {
    if (!confirm('全てのエラーログを削除しますか？')) return;
    const user = auth.currentUser;
    if (!user) return;
    const idToken = await user.getIdToken();
    const res = await fetch('/api/admin/error-logs', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) {
      setLogs([]);
      alert('削除しました');
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '----';
    return new Date(iso).toLocaleTimeString('ja-JP', { hour12: false });
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', fontFamily: 'monospace', color: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', margin: '0 0 4px 0', color: '#38bdf8' }}>🖥️ Error Console</h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Push-taro エラーログ（最新100件）
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              自動更新（10秒）
            </label>
            <button
              onClick={() => void fetchLogs()}
              style={{ padding: '6px 14px', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace' }}
            >
              🔄 更新
            </button>
            <button
              onClick={handleClearLogs}
              style={{ padding: '6px 14px', background: '#1e293b', color: '#ef4444', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace' }}
            >
              🗑️ クリア
            </button>
            <Link
              href="/system-admin"
              style={{ padding: '6px 14px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', textDecoration: 'none' }}
            >
              ← 戻る
            </Link>
          </div>
        </div>

        {/* ターミナル */}
        <div
          ref={scrollRef}
          style={{
            background: '#000',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '16px',
            minHeight: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          {loading ? (
            <div style={{ color: '#64748b' }}>$ loading error logs...</div>
          ) : loadError ? (
            <div style={{ color: '#ef4444' }}>$ error: {loadError}</div>
          ) : logs.length === 0 ? (
            <div style={{ color: '#22c55e' }}>$ no errors detected. system is healthy ✅</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} style={{ marginBottom: '16px', borderBottom: '1px dashed #1e293b', paddingBottom: '12px' }}>
                <div style={{ color: '#64748b', fontSize: '11px' }}>
                  [{formatTime(log.createdAt)}] <span style={{ color: '#ef4444' }}>ERROR</span> <span style={{ color: '#38bdf8' }}>[{log.source}]</span>
                  {log.userId && <span style={{ color: '#94a3b8' }}> uid={log.userId.slice(0, 12)}...</span>}
                  {log.shopId && <span style={{ color: '#94a3b8' }}> shop={log.shopId.slice(0, 12)}...</span>}
                </div>
                <div style={{ color: '#fbbf24', marginTop: '4px', fontWeight: 'bold' }}>
                  ❌ {log.message}
                </div>
                {log.details && (
                  <div style={{ color: '#a78bfa', marginTop: '4px', fontSize: '12px' }}>
                    📋 {JSON.stringify(log.details)}
                  </div>
                )}
                {log.stack && (
                  <pre style={{ color: '#64748b', fontSize: '11px', marginTop: '6px', whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'hidden' }}>
                    {log.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            ))
          )}
          <div style={{ color: '#22c55e', marginTop: '8px' }}>$ _</div>
        </div>
      </div>
    </div>
  );
}
