import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const { shopId } = await params;
  const mode = new URL(request.url).searchParams.get('mode');
  
  let shopName = 'プッシュ通知';
  let iconUrl = '/icon-192x192.png';

  try {
    const doc = await db.collection('shops').doc(shopId).get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.name) shopName = data.name;
      if (data?.iconUrl) iconUrl = data.iconUrl;
    }
  } catch (e) {
    console.error('Manifest店舗取得エラー:', e);
  }

  const manifest = {
    name: shopName,
    short_name: shopName,
    description: `${shopName} の公式通知アプリ`,
    start_url: mode === 'pro' ? '/pro-shop' : mode === 'shop' ? '/shop' : `/subscribe?s=${shopId}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff4500',
    icons: [
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/manifest+json',
    },
  });
}
