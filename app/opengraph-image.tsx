// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Push-taro｜実店舗向けプッシュ通知・クーポンアプリ';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#fd7e5a',
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          実店舗向けプッシュ通知・クーポンアプリ
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.2 }}>
          既存客のリピートを、
          <br />
          <span style={{ color: '#ff6b6b' }}>プッシュ通知 × クーポンアプリ</span> で仕組化。
        </div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 32 }}>
          Push-taro｜月額1,980円〜・従量課金なし
        </div>
      </div>
    ),
    { ...size }
  );
}
