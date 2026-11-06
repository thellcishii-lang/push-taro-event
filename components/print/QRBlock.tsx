'use client';

import { QRCodeSVG } from 'qrcode.react';

interface Props {
  value: string;
  size?: number;
  label?: string;
}

export default function QRBlock({ value, size = 120, label }: Props) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-block',
          padding: 8,
          background: '#fff',
          borderRadius: 8,
        }}
      >
        <QRCodeSVG value={value} size={size} level="M" includeMargin={false} />
      </div>
      {label && (
        <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
          {label}
        </div>
      )}
    </div>
  );
}
