// components/AdminBrand.tsx
// 主催者管理画面共通のブランドバー（承認済みモック準拠）。
// バイオレットの角丸スクエア＋吹き出しマークと
// 「Push-taro EVENT / ORGANIZER CONSOLE」の2段表記を全管理画面で揃える。
import type { ReactNode } from 'react';

export const ADMIN_VIOLET = '#6D28D9';
export const ADMIN_PAGE_BG = '#EEECF6';
export const ADMIN_CARD_BORDER = '#EAE7F5';
export const ADMIN_CARD_SHADOW = '0 2px 12px rgba(60, 30, 120, 0.07)';
export const ADMIN_INK = '#17132B';

export function AdminBrandMark({ size = 42 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="2" y="2" width="44" height="44" rx="12" fill={ADMIN_VIOLET} />
      <path
        d="M15.5 13.5h17a4 4 0 0 1 4 4v6.5a4 4 0 0 1-4 4H23l-6.4 5.6c-.7.6-1.9.1-1.9-.8V28h-.2a4 4 0 0 1-4-4v-6.5a4 4 0 0 1 4-4z"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminBrandBar({ right }: { right?: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${ADMIN_CARD_BORDER}`,
        borderRadius: 18,
        boxShadow: ADMIN_CARD_SHADOW,
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AdminBrandMark />
        <div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: ADMIN_INK,
              letterSpacing: -0.3,
              lineHeight: 1.15,
            }}
          >
            Push-taro EVENT
          </div>
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              color: '#8A84A6',
              letterSpacing: 2.6,
              marginTop: 2,
            }}
          >
            ORGANIZER CONSOLE
          </div>
        </div>
      </div>
      {right}
    </div>
  );
}

/** 画面タイトル（ブランドバーの下に置く大きな見出し）。 */
export const adminPageTitleStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  margin: '22px 0 0',
  color: ADMIN_INK,
  letterSpacing: -0.5,
};

/** フォーム直下に出すフィードバック文（成功・失敗共通の置き場所）。 */
export const adminFeedbackStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: 14,
  lineHeight: 1.5,
};

export const adminErrorTextStyle: React.CSSProperties = {
  ...adminFeedbackStyle,
  color: '#b91c1c',
};
