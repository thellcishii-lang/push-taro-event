// app/signup/confirm/page.tsx
import type { Metadata } from 'next';
import SignupConfirmClient from './SignupConfirmClient';

export const metadata: Metadata = {
  title: 'お申し込み内容の確認｜Push-taro',
  robots: {
    index: false, // ★ 検索エンジンに登録させない
    follow: false, // ★ リンクも辿らせない
  },
};

export default function Page() {
  return <SignupConfirmClient />;
}
