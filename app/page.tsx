// app/page.tsx
import type { Metadata } from 'next';
import HomeClient from './components/HomeClient';
import { faqs } from './data/faq';
import './lp.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export const metadata: Metadata = {
  title: '店舗・テナント向け プッシュ通知 × クーポンアプリ｜Push-taro',
  description:
    'LINE公式アカウントの配信上限や従量課金に悩む実店舗のための、店舗向けプッシュ通知アプリ。Push-taroは、プッシュ通知とクーポンで実店舗のリピーターづくりを支援します。QRコード登録やクーポン自動配信に対応し、月額1,980円から。',
  keywords: [
    '店舗向けプッシュ通知アプリ',
    '店舗 プッシュ通知',
    'テナント プッシュ通知',
    '店舗クーポンアプリ',
    '店舗プッシュ通知アプリ',
    'LINE 配信上限 対策',
    'LINE公式 代わり',
    'LINE クーポン 配信 制限',
    'プッシュ通知アプリ 無制限',
    '店舗リピーター',
    '店舗リピート',
    'プッシュ通知 クーポンアプリ',
    '実店舗 集客',
    'Push-taro',
  ],
  alternates: { canonical: appUrl }, // 相対パスから環境変数を使った絶対URLへ変更
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: '店舗・テナント向け プッシュ通知 × クーポンアプリ｜Push-taro',
    description:
      'LINE公式アカウントの配信上限や従量課金に悩む実店舗のための、店舗向けプッシュ通知アプリ。プッシュ通知とクーポンでリピーターづくりを支援。月額1,980円から。',
    url: appUrl,
    siteName: 'Push-taro',
  },
  twitter: {
    card: 'summary_large_image',
    title: '店舗・テナント向け プッシュ通知 × クーポンアプリ｜Push-taro',
    description:
      'プッシュ通知とクーポンで実店舗のリピーターづくりを支援。QRコード登録やクーポン自動配信に対応し、月額1,980円から。',
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

/* ============================================================
   LP 固有の構造化データ
   ============================================================ */

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${appUrl}/#organization`,
  name: 'the合同会社',
  url: appUrl,
  logo: `${appUrl}/icon-512x512.png`,
  address: {
    '@type': 'PostalAddress',
    postalCode: '357-0123',
    addressRegion: '埼玉県',
    addressLocality: '飯能市',
    streetAddress: '中藤下郷23-21',
    addressCountry: 'JP',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@push-taro.com',
    contactType: 'customer support',
    availableLanguage: ['ja'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${appUrl}/#website`,
  url: appUrl,
  name: 'Push-taro',
  inLanguage: 'ja-JP',
  publisher: { '@id': `${appUrl}/#organization` },
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Push-taro',
  alternateName: 'プッシュタロー',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: appUrl,
  inLanguage: 'ja-JP',
  description:
    '実店舗のリピート施策を「プッシュ通知 × クーポンアプリ」で自動化するSaaS。集めるのは電話番号だけ。QRコード一つで始められる。全7種類のクーポン自動配信、QR消込、休眠復活、誕生日配信を標準搭載。',
  provider: { '@id': `${appUrl}/#organization` },
  featureList: [
    'プッシュ通知（全デバイス対応）',
    'QRコード登録',
    '初回クーポン',
    '通常クーポン',
    '特別達成クーポン',
    '開封率の確認',
    'ステップアップクーポン',
    '連続クーポン',
    '記念日・誕生日クーポン',
    '休眠復活クーポン',
    '予約配信・定期配信',
  ],
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'JPY',
    lowPrice: 1980,  // 数値型に変更
    highPrice: 10000, // 数値型に変更
    offerCount: 3,    // 数値型に変更
    offers: [
      {
        '@type': 'Offer',
        name: 'LIGHT',
        price: 1980,  // 数値型に変更
        priceCurrency: 'JPY',
        valueAddedTaxIncluded: false, // 税別であることを明記
        description: '月間5,000通まで配信可能。初回クーポン、QRコード登録などの基本機能。',
        url: `${appUrl}/#pricing`,
      },
      {
        '@type': 'Offer',
        name: 'STANDARD',
        price: 3800,  // 数値型に変更
        priceCurrency: 'JPY',
        valueAddedTaxIncluded: false,
        description: '月間15,000通まで配信可能。通常クーポン、特別達成クーポン、店頭ポップ印刷機能。',
        url: `${appUrl}/#pricing`,
      },
      {
        '@type': 'Offer',
        name: 'PRO',
        price: 10000, // 数値型に変更
        priceCurrency: 'JPY',
        valueAddedTaxIncluded: false,
        description: '配信無制限。全7種類のクーポン機能、予約配信、紹介報酬制度。',
        url: `${appUrl}/#pricing`,
      },
    ],
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Push-taroの導入方法',
  totalTime: 'PT10M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'アカウント作成',
      text: 'メールアドレスと店舗情報を入力して申し込み。決済完了で即時利用開始。',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'クーポン設定',
      text: '管理画面でクーポンのタイトル・説明・有効期限を設定。',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '店頭にQR設置',
      text: '管理画面で生成されたQRコードをPOPに印刷して店頭に設置。',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '通知を送信',
      text: 'タイミングに合わせてプッシュ通知を送信。',
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ホーム',
      item: appUrl,
    },
  ],
};

export default function Page() {
  return (
    <>
      <HomeClient />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
