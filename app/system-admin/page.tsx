'use client';

// app/system-admin/page.tsx
// Push-taro EVENT 運営コンソール（運営専用。admin 権限のあるアカウントのみ）。
// 契約者一覧と、本家連携APIキーの管理を行う。運用監視は次段で追加する。
import { useCallback, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import PasswordInput from '@/components/PasswordInput';
import type { Organizer } from '@/lib/organizers';
import type { ApiKeySummary } from '@/lib/api-keys';

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  marginTop: 4,
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 12,
};

export default function SystemAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [keys, setKeys] = useState<ApiKeySummary[]>([]);
  const [keyLabel, setKeyLabel] = useState('');
  const [issuedSecret, setIssuedSecret] = useState<{ keyId: string; secret: string } | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const callApi = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!user) throw new Error('ログインが必要です');
      const idToken = await user.getIdToken();
      const res = await fetch(path, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          ...(init?.headers ?? {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error ?? `エラー (${res.status})`) as Error & { status?: number };
        err.status = res.status;
        throw err;
      }
      return data;
    },
    [user],
  );

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const [orgData, keyData] = await Promise.all([
        callApi('/api/admin/organizers'),
        callApi('/api/admin/api-keys'),
      ]);
      setOrganizers(orgData.organizers ?? []);
      setKeys(keyData.keys ?? []);
      setForbidden(false);
    } catch (e) {
      if ((e as { status?: number }).status === 403) {
        setForbidden(true);
      } else {
        setMessage(e instanceof Error ? e.message : '読み込みに失敗しました');
      }
    }
  }, [user, callApi]);

  useEffect(() => {
    if (user) void loadAll();
  }, [user, loadAll]);

  const handleLogin = async () => {
    setBusy(true);
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setMessage('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setBusy(false);
    }
  };

  const handleIssueKey = async () => {
    setBusy(true);
    setMessage('');
    try {
      const data = await callApi('/api/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({ label: keyLabel }),
      });
      setIssuedSecret({ keyId: data.keyId, secret: data.secret });
      setKeyLabel('');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '発行に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!window.confirm('このキーを失効しますか？ 本家側で使っているキーを失効すると、連携が止まります。')) return;
    setBusy(true);
    setMessage('');
    try {
      await callApi(`/api/admin/api-keys/${keyId}/revoke`, { method: 'POST' });
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '失効に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) {
    return <main style={{ padding: 24 }}>読み込み中…</main>;
  }

  if (!user) {
    return (
      <main style={{ maxWidth: 420, margin: '40px auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Push-taro EVENT 運営コンソール ログイン</h1>
        <label style={labelStyle}>
          メールアドレス
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={labelStyle}>
          パスワード
          <PasswordInput style={inputStyle} value={password} onChange={setPassword} autoComplete="current-password" />
        </label>
        <button onClick={handleLogin} disabled={busy} style={{ padding: '10px 20px', fontWeight: 700 }}>
          ログイン
        </button>
        {message && <p style={{ color: '#b91c1c', marginTop: 12 }}>{message}</p>}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Push-taro EVENT 運営コンソール</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/system-admin/monitoring" style={{ fontSize: 13 }}>
            運用監視 →
          </a>
          <button onClick={() => void signOut(auth)} style={{ padding: '6px 12px' }}>
            ログアウト
          </button>
        </div>
      </div>
      {message && <p style={{ color: '#b91c1c' }}>{message}</p>}

      {forbidden ? (
        <p style={{ color: '#b91c1c', marginTop: 16 }}>
          このアカウントには運営権限（admin）がありません。権限のあるアカウントでログインしてください。
        </p>
      ) : (
        <>
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>契約者一覧</h2>
            {organizers.length === 0 ? (
              <p style={{ fontSize: 14, color: '#64748b' }}>契約者はまだいません（本家決済の自動登録で増えます）。</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {organizers.map((org) => (
                  <li
                    key={org.contractId}
                    style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 8 }}
                  >
                    <a href={`/system-admin/organizers/${encodeURIComponent(org.contractId)}`} style={{ fontWeight: 700 }}>
                      {org.companyName || '（会社名なし）'}
                    </a>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                      {org.email} ／ 使用開始日 {org.startDate} ／ 状態 {org.status === 'active' ? '有効' : '停止中'} ／
                      枠：購読 {org.subscriberCap.toLocaleString('ja-JP')}人・クーポン {org.couponCap}件
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={{ marginTop: 32, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>本家連携APIキー</h2>
            {issuedSecret && (
              <div style={{ border: '1px solid #f59e0b', background: '#fffbeb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
                  発行しました。この鍵は今だけ表示されます（閉じると二度と見られません）。本家のシークレットに設定してください。
                </p>
                <p style={{ fontSize: 13, marginTop: 8 }}>
                  キーID：<code>{issuedSecret.keyId}</code>
                  <br />
                  鍵：<code style={{ wordBreak: 'break-all' }}>{issuedSecret.secret}</code>
                </p>
                <button onClick={() => setIssuedSecret(null)} style={{ padding: '6px 12px' }}>
                  確認したので閉じる
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 0, flex: 1 }}>
                ラベル（任意）
                <input style={inputStyle} value={keyLabel} onChange={(e) => setKeyLabel(e.target.value)} placeholder="例：本家連携 本番" />
              </label>
              <button onClick={handleIssueKey} disabled={busy} style={{ padding: '10px 16px', fontWeight: 700 }}>
                新しいキーを発行
              </button>
            </div>
            {keys.length === 0 ? (
              <p style={{ fontSize: 14, color: '#64748b' }}>キーはまだ発行されていません。</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {keys.map((key) => (
                  <li
                    key={key.id}
                    style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ fontSize: 13 }}>
                      <code>{key.id}</code> {key.label && `／ ${key.label}`}
                      <span style={{ color: '#475569' }}> ／ 発行 {key.createdAt.slice(0, 10)} ／ {key.revoked ? '失効済み' : '有効'}</span>
                    </div>
                    {!key.revoked && (
                      <button onClick={() => void handleRevokeKey(key.id)} disabled={busy} style={{ padding: '6px 12px' }}>
                        失効
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
