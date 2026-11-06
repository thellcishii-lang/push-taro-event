// app/agency/page.tsx
import type { Metadata } from 'next';
import AgencyClient from './AgencyClient';

export const metadata: Metadata = {
  title: '代理店パートナーお申し込み｜Push-taro',
  description: '実店舗向けプッシュ通知＆クーポン配信SaaS「Push-taro」の販売代理店パートナーお申し込みフォームです。加盟金30万円（税別）、月額3万円（税別）から、在庫ゼロ・ノルマなしでストックビジネスを始められます。',
  robots: {
    index: false, // ★ 申し込みフォームは検索結果に出さない（重複・低品質回避）
    follow: true,
  },
};

export default function Page() {
  return <AgencyClient />;
}
