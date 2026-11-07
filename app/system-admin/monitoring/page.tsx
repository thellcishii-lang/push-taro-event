'use client';

// app/system-admin/monitoring/page.tsx
// 運営コンソール：運用監視。スケジューラの状態、失敗した配信、滞留、
// 終了処理の遅れ、未送信レポート、自動登録の失敗をまとめて確認する。
import { useCallback, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import type { MonitoringSnapshot } from '@/lib/monitoring';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ fontSize: 14, color: '#0f766e' }}>{text}</p>;
}

function formatAt(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

export default function SystemAdminMonitoringPage() {
  const [user, setUser] = useState<User | null>(null);
  const [snapshot, setSnapshot] = useState<MonitoringSnapshot | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/monitoring', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `エラー (${res.status})`);
      setSnapshot(data as MonitoringSnapshot);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '読み込みに失敗しました');
    }
  }, [user]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  if (!user) {
    return (
      <main style={{ padding: 24 }}>
        <p>ログインが必要です。<a href="/system-admin">運営コンソールへ</a></p>
      </main>
    );
  }
  if (!snapshot) {
    return (
      <main style={{ padding: 24 }}>
        {message ? <p style={{ color: '#b91c1c' }}>{message}</p> : <p>読み込み中…</p>}
      </main>
    );
  }

  const { tick } = snapshot;

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: 24 }}>
      <a href="/system-admin" style={{ fontSize: 13 }}>← 運営コンソールへ</a>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>運用監視</h1>
      {message && <p style={{ color: '#b91c1c' }}>{message}</p>}
      <button onClick={() => void load()} style={{ padding: '6px 12px', marginTop: 8 }}>
        再読み込み
      </button>

      <Section title="スケジューラ（15分間隔）">
        <div style={{ fontSize: 14, lineHeight: 1.9 }}>
          <div>最終実行：{formatAt(tick.lastRunAt)}{tick.lastOk === false ? '（失敗）' : ''}</div>
          <div>
            状態：
            {tick.lastRunAt === null ? (
              'まだ実行記録がありません'
            ) : tick.stalled ? (
              <span style={{ color: '#b91c1c', fontWeight: 700 }}>
                停止の疑い（最終実行から{tick.minutesSinceLastRun}分）
              </span>
            ) : (
              <span style={{ color: '#0f766e' }}>稼働中（最終実行から{tick.minutesSinceLastRun}分）</span>
            )}
          </div>
          <div>連続失敗：{tick.consecutiveFailures}回</div>
        </div>
        {snapshot.recentRuns.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, color: '#475569' }}>
            {snapshot.recentRuns.map((run) => (
              <li key={run.id}>
                {formatAt(run.at)} ／ {run.ok ? '成功' : '失敗'} ／ 処理イベント {run.eventsProcessed} ／
                配信 {run.campaignsSent} ／ エラー {run.errorsCount}
                {run.error ? ` ／ ${run.error}` : ''}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="失敗した配信">
        {snapshot.failedCampaigns.length === 0 ? (
          <Empty text="失敗した配信はありません" />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {snapshot.failedCampaigns.map((c) => (
              <li key={`${c.eventId}:${c.campaignId}`} style={{ fontSize: 14, marginBottom: 8 }}>
                <strong>{c.title}</strong>（{c.eventName}）
                <div style={{ fontSize: 13, color: '#b91c1c' }}>{c.error ?? '理由不明'}</div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="滞留している配信（送信中のまま30分超）">
        {snapshot.stuckCampaigns.length === 0 ? (
          <Empty text="滞留している配信はありません" />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {snapshot.stuckCampaigns.map((c) => (
              <li key={`${c.eventId}:${c.campaignId}`} style={{ fontSize: 14, marginBottom: 8 }}>
                <strong>{c.title}</strong>（{c.eventName}）／ 送信開始 {formatAt(c.at)}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="終了処理が遅れているイベント">
        {snapshot.unfinalizedEvents.length === 0 ? (
          <Empty text="遅れているイベントはありません" />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {snapshot.unfinalizedEvents.map((e) => (
              <li key={e.eventId} style={{ fontSize: 14, marginBottom: 8 }}>
                <strong>{e.name}</strong> ／ 終了日 {e.endDate}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="未送信の最終レポートメール">
        {snapshot.unsentReports.length === 0 ? (
          <Empty text="未送信のレポートはありません" />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {snapshot.unsentReports.map((r) => (
              <li key={r.eventId} style={{ fontSize: 14, marginBottom: 8 }}>
                <strong>{r.eventName}</strong> ／ 状態 {r.emailStatus} ／ 作成 {formatAt(r.createdAt)}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="契約者の自動登録">
        {snapshot.provisioningFailures24h === 0 ? (
          <Empty text="直近24時間の失敗はありません" />
        ) : (
          <p style={{ fontSize: 14, color: '#b91c1c' }}>
            直近24時間で {snapshot.provisioningFailures24h} 件の失敗がありました
          </p>
        )}
      </Section>
    </main>
  );
}
