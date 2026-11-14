// app/api/manifest/event/[eventId]/route.ts
/**
 * 来場者ページ専用の Web App Manifest。
 *
 * iPhone で「ホーム画面に追加」したときに Safari のブックマークでは
 * なく Web アプリ（スタンドアローン）として開かれるために必要。
 * start_url / scope をそのイベントの来場者ページに絞り、名前には
 * イベント名を使う（複数のイベントを追加しても見分けられる）。
 * イベントが取れない場合は汎用名で返す（追加自体はできるようにする）。
 */

import { NextResponse } from 'next/server';
import { getEvent } from '@/lib/event-store';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  let eventName = '';
  try {
    const event = await getEvent(eventId);
    if (event) eventName = event.name;
  } catch {
    // 名前が取れなくても manifest 自体は返す
  }

  const pagePath = `/e/${eventId}`;
  const manifest = {
    name: eventName ? `${eventName}｜Push-taro EVENT` : 'Push-taro EVENT',
    short_name: eventName || 'EVENT',
    id: pagePath,
    start_url: pagePath,
    scope: pagePath,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6D28D9',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
