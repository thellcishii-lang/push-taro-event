'use client';

// components/VisitorQr.tsx
// 来場者登録用 QR コードの表示と PNG ダウンロード（主催者向け）。
// QR は 1024px のキャンバスで描画し、表示だけ size に縮小する。
// ダウンロードはそのキャンバスをそのまま書き出すため、印刷に耐える
// 解像度になる（印刷は主催者側で行う前提で、印刷画面は作らない）。
// イベント設定画面（大きく表示）とイベント一覧のカード（小さく表示）
// の両方から使う。飛び先は lib/app-origin の eventVisitorUrl。
import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { eventVisitorUrl } from '@/lib/app-origin';
import { adminText } from '@/lib/ui-text';
import type { Locale } from '@/lib/i18n';

interface VisitorQrProps {
  eventId: string;
  locale: Locale;
  /** 表示サイズ（px）。描画自体は 1024px で行う。 */
  size?: number;
  /** QR の下に URL テキストも出す（設定画面用）。 */
  showUrl?: boolean;
  /** ダウンロードボタンのスタイル（呼び出し側の見た目に合わせる）。 */
  buttonStyle?: React.CSSProperties;
}

export function VisitorQr({
  eventId,
  locale,
  size = 220,
  showUrl = false,
  buttonStyle,
}: VisitorQrProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const visitorUrl = eventVisitorUrl(eventId);

  // 表示中の QR キャンバス（1024px で描画）からそのまま PNG を書き出す。
  const handleDownload = () => {
    const canvas = wrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `visitor-qr-${eventId}.png`;
    a.click();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div ref={wrapRef} style={{ display: 'inline-block', lineHeight: 0 }}>
        <QRCodeCanvas
          value={visitorUrl}
          size={1024}
          level="M"
          marginSize={4}
          style={{ width: size, height: size }}
        />
      </div>
      {showUrl && (
        <p
          style={{
            fontSize: 13,
            color: '#334155',
            margin: '14px 0 0',
            wordBreak: 'break-all',
            textAlign: 'center',
          }}
        >
          {visitorUrl}
        </p>
      )}
      <button
        onClick={handleDownload}
        style={{ marginTop: 14, ...buttonStyle }}
      >
        {adminText(locale, 'visitorQrDownloadButton')}
      </button>
    </div>
  );
}
