'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase-client';

interface Template {
  id: string;
  target: string;
  name: string;
  subject: string;
  body: string;
}

export default function EmailsPage() {
  const [target, setTarget] = useState<'shop' | 'agency' | 'affiliate'>('shop');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const fetchTemplates = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const idToken = await user.getIdToken();
    const res = await fetch(`/api/admin/email-templates?target=${target}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      setTemplates(data.templates || []);
    }
  };

  useEffect(() => {
    fetchTemplates();
    setSelectedTemplateId('');
    setSubject('');
    setBody('');
  }, [target]);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  };

  const handleSend = async (testOnly: boolean) => {
    if (!subject || !body) {
      alert('件名と本文を入力してください');
      return;
    }

    const label = testOnly ? 'テスト送信' : '本番送信';
    const targetLabel = target === 'shop' ? '全店舗' : target === 'agency' ? '全代理店' : '全アフィリエイター';
    if (!confirm(`${targetLabel}へ${label}しますか？`)) return;

    setSending(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/send-mass-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ target, subject, body, testOnly }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}`);
      } else {
        alert('エラー: ' + data.error);
      }
    } catch (err: any) {
      alert('通信エラー: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName || !subject || !body) {
      alert('テンプレート名・件名・本文を入力してください');
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    const idToken = await user.getIdToken();

    const res = await fetch('/api/admin/email-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ target, name: newTemplateName, subject, body }),
    });

    if (res.ok) {
      alert('✅ テンプレートを保存しました');
      setNewTemplateName('');
      setShowTemplateForm(false);
      fetchTemplates();
    } else {
      const data = await res.json();
      alert('保存失敗: ' + data.error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return;
    const user = auth.currentUser;
    if (!user) return;
    const idToken = await user.getIdToken();
    const res = await fetch(`/api/admin/email-templates?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) {
      fetchTemplates();
      if (selectedTemplateId === id) {
        setSelectedTemplateId('');
        setSubject('');
        setBody('');
      }
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a202c', margin: '0 0 6px 0' }}>
            📧 メール一斉配信
          </h1>
          <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
            店舗・代理店・アフィリエイターへ一斉メールを送信できます。
          </p>
        </div>

        {/* 対象選択 */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>送信対象</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['shop', 'agency', 'affiliate'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  border: target === t ? '2px solid #3182ce' : '1px solid #cbd5e0',
                  background: target === t ? '#ebf8ff' : '#fff',
                  fontWeight: target === t ? 'bold' : 'normal',
                  color: target === t ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {t === 'shop' ? '🏪 店舗' : t === 'agency' ? '🏢 代理店' : '📢 アフィリエイター'}
              </button>
            ))}
          </div>
        </div>

        {/* テンプレート選択 */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>テンプレート</label>
          {templates.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>テンプレートがありません。新規作成してください。</p>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {templates.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => handleSelectTemplate(t.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: selectedTemplateId === t.id ? '2px solid #3182ce' : '1px solid #cbd5e0',
                      background: selectedTemplateId === t.id ? '#ebf8ff' : '#fff',
                      color: selectedTemplateId === t.id ? '#1d4ed8' : '#475569',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {t.name}
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(t.id)}
                    style={{ padding: '4px 8px', background: '#fecaca', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 件名・本文 */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>件名</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="【Push-taro】お知らせ"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>本文</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder={'お客様各位\n\n平素よりPush-taroをご利用いただき...'}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.7 }}
            />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              ※ 改行はそのまま反映されます
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            onClick={() => setShowTemplateForm(!showTemplateForm)}
            style={{ padding: '12px 20px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e0', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            💾 テンプレートとして保存
          </button>
          <button
            onClick={() => handleSend(true)}
            disabled={sending}
            style={{ padding: '12px 20px', background: '#fbbf24', color: '#78350f', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: sending ? 'wait' : 'pointer', fontSize: '14px' }}
          >
            テスト送信
          </button>
          <button
            onClick={() => handleSend(false)}
            disabled={sending}
            style={{ flex: 1, minWidth: '200px', padding: '12px 20px', background: sending ? '#94a3b8' : '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: sending ? 'wait' : 'pointer', fontSize: '14px' }}
          >
            {sending ? '送信中...' : `🚀 ${target === 'shop' ? '全店舗' : target === 'agency' ? '全代理店' : '全アフィリエイター'}へ一斉送信`}
          </button>
        </div>

        {/* テンプレート保存フォーム */}
        {showTemplateForm && (
          <div style={{ background: '#ebf8ff', padding: '20px', borderRadius: '12px', border: '1px solid #90cdf4', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>テンプレート名</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="例: 障害復旧報告"
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
              />
              <button
                onClick={handleSaveTemplate}
                style={{ padding: '10px 20px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                保存
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/system-admin" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
            ← 全体管理画面に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
