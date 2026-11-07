// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Push-taro.EVENT｜展示会向けプッシュ通知 × クーポン';
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
          展示会・大型イベント向けプッシュ通知 × クーポン基盤
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.2 }}>
          来場者との接点を、
          <br />
          <span style={{ color: '#ff6b6b' }}>プッシュ通知 × クーポン</span> でつくる。
        </div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 32 }}>
          Push-taro.EVENT
        </div>
      </div>
    ),
    { ...size }
  );
}
