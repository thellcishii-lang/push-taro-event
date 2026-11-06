// app/guide/pos-integration/page.tsx
import type { Metadata } from 'next';
import PosIntegrationClient from './PosIntegrationClient';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: 'POSレジ連携｜クーポン消込をレジに自動反映｜Push-taro',
  description:
    'Push-taroのPROプランで利用できるPOSレジ連携機能。QRコードをPOSで読み取るだけで、クーポン消込が自動記録されます。複数レジにも対応。API仕様を公開しているので、お使いのPOSベンダーに実装を依頼できます。',
  keywords: [
    'POSレジ 連携',
    'POS クーポン 消込',
    'レジ QRコード 読み取り',
    '実店舗 POS API',
    'Square 連携',
    'スマレジ 連携',
    'Push-taro POS',
  ],
  alternates: { canonical: '/guide/pos-integration' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'POSレジ連携｜クーポン消込をレジに自動反映｜Push-taro',
    description:
      'QRコードをPOSで読み取るだけで、クーポン消込が自動記録されます。複数レジにも対応。',
    url: '/guide/pos-integration',
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POSレジ連携｜Push-taro',
    description: 'QRコードをPOSで読み取るだけで、クーポン消込が自動記録されます。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'POSレジ連携｜クーポン消込をレジに自動反映',
  description:
    'Push-taroのPROプランで利用できるPOSレジ連携機能。QRコードをPOSで読み取るだけで、クーポン消込が自動記録されます。',
  author: { '@id': `${appUrl}/#organization` },
  publisher: { '@id': `${appUrl}/#organization` },
  datePublished: '2026-10-25',
  dateModified: '2026-10-25',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/guide/pos-integration` },
  inLanguage: 'ja-JP',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: appUrl },
    { '@type': 'ListItem', position: 2, name: '活用ガイド', item: `${appUrl}/guide` },
    { '@type': 'ListItem', position: 3, name: 'POSレジ連携', item: `${appUrl}/guide/pos-integration` },
  ],
};

export default function Page() {
  return (
    <>
      <PosIntegrationClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
