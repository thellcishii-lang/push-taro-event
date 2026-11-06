// app/torisetsu/event/page.tsx
import type { Metadata } from 'next';
import TorisetsuEventClient from './TorisetsuEventClient';

export const metadata: Metadata = {
  title: 'Push-taro EVENT 取扱説明書｜データのリセットと消去について',
  description:
    'Push-taro EVENT のデータ取り扱い仕様。毎日リセットの方式A（フルリセット）と方式B（期間中は電話番号を保持）の違い、リセット時刻、イベント終了時の消去手順、消去前に主催者へ届く集計レポートについて詳しく説明します。',
  alternates: { canonical: '/torisetsu/event' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    title: 'Push-taro EVENT 取扱説明書｜データのリセットと消去について',
    description: 'リセット方式A/Bの違いと、終了時の消去手順・集計レポートを説明します。',
    url: '/torisetsu/event',
    siteName: 'Push-taro',
  },
};

export default function TorisetsuEventPage() {
  return <TorisetsuEventClient />;
}
