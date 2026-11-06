// app/apple-icon.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4500 100%)',
          borderRadius: 40,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 9 L34 24 L28 24 L28 32 L20 32 L20 24 L14 24 Z"
            fill="#ffffff"
          />
          <path d="M20 32 L24 40 L28 32 Z" fill="#fbbf24" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
