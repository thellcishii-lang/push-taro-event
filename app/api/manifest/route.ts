import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shopId = url.searchParams.get('s') || '';

  const manifest = {
    name: 'プッシュ太郎',
    short_name: 'Push太郎',
    start_url: shopId ? `/?s=${shopId}` : '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff6b6b',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
