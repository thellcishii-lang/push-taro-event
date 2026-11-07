// app/torisetsu/page.tsx
import type { Metadata } from 'next';
import TorisetsuIndexClient from './TorisetsuIndexClient';

export const metadata: Metadata = {
  title: 'Push-taro.EVENT 取扱説明書｜展示会向けプッシュ通知 × クーポン',
  description:
    '展示会・大型イベント向け Push-taro.EVENT の取扱説明書。データのリセット方式、イベント終了時の消去手順、集計レポート、消込の権限について解説します。',
  alternates: { canonical: '/torisetsu' },
};

export default function Page() {
  return <TorisetsuIndexClient />;
}
