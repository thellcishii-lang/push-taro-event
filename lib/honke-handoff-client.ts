// lib/honke-handoff-client.ts
/**
 * 本家の契約ページ / クーポン購入ページを、ハンドオフリンクで開く。
 *
 * サーバー（/api/event-admin/honke-link）から署名付きリンクを取得して
 * 新しいタブで開く。取得できない場合（シークレット未設定・通信失敗など）は
 * 通常リンクをそのまま開き、従来のパスワードログインにフォールバックする。
 * 非同期処理の後に window.open するとポップアップブロックに当たることが
 * あるため、先に空タブを開いてから遷移先を設定する。
 */

import { auth } from '@/lib/firebase-client';
import type { HandoffPurpose } from '@/lib/honke-handoff';

export async function openHonkeLink(options: {
  purpose: HandoffPurpose;
  eventId?: string;
  fallbackUrl: string;
}): Promise<void> {
  const tab = window.open('', '_blank');
  const go = (url: string) => {
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  try {
    const user = auth.currentUser;
    if (!user) {
      go(options.fallbackUrl);
      return;
    }
    const idToken = await user.getIdToken();
    const res = await fetch('/api/event-admin/honke-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ purpose: options.purpose, eventId: options.eventId }),
    });
    if (!res.ok) {
      go(options.fallbackUrl);
      return;
    }
    const data = await res.json().catch(() => ({}));
    go(typeof data.url === 'string' ? data.url : options.fallbackUrl);
  } catch {
    go(options.fallbackUrl);
  }
}
