// components/BrandLogo.tsx
import Link from 'next/link';

interface BrandLogoProps {
  className?: string;
}

export default function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <Link
        href="/"
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans JP', sans-serif",
          fontSize: '22px',
          fontWeight: 900,
          color: '#0f172a',
          letterSpacing: '-0.5px',
          textDecoration: 'none',
          lineHeight: 1,
          paddingTop: '4px',
        }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '34px',
            height: '34px',
            flexShrink: 0,
            marginRight: '8px',
          }}
        >
          <defs>
            <linearGradient
              id="brandLogoGrad"
              x1="0"
              y1="0"
              x2="48"
              y2="48"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#ff4500" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="23" fill="url(#brandLogoGrad)" />
          <path d="M24 8 L33 22 L28 22 L28 30 L20 30 L20 22 L15 22 Z" fill="#ffffff" />
          <circle cx="24" cy="20" r="3" fill="#ff4500" opacity="0.5" />
          <path d="M18 30 L14 38 L20 34 Z" fill="#ffffff" />
          <path d="M30 30 L34 38 L28 34 Z" fill="#ffffff" />
          <path d="M22 30 L24 40 L26 30 Z" fill="#fbbf24" />
        </svg>

        <span style={{ color: '#0f172a' }}>Push-taro</span>
        <span style={{ color: '#ff4500', marginLeft: '1px' }}>.</span>
        <small
  style={{
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: 0,
    lineHeight: 1.3,
    margin: '0 0 0 8px',
  }}
>
  実店舗向けプッシュ通知・クーポンアプリ
</small>
      </Link>
    </>
  );
}
