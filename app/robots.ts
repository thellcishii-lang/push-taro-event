// app/robots.ts
import type { MetadataRoute } from 'next';

// EVENT は会場のQRコードからアクセスするアプリ専用デプロイのため、
// 検索エンジンのインデックス対象外とする（公開向けページは本家 push-taro.com に集約）。
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/',
      },
    ],
  };
}
