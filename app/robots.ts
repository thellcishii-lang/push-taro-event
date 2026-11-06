// app/robots.ts
import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 通常の検索エンジン
      // 同名 userAgent グループが複数あると先頭グループだけ採用する
      // クローラーがいるため（RFC 9309）、'*' は1グループに統合する。
      // disallow は sitemap の除外方針と整合させる。
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/pro-shop',
          '/shop',
          '/agency',
          '/affiliate',
          '/affilishop',
          '/subscribe',
          '/notification-link',
          '/payment',
          '/system-admin',
          '/print',
          '/api/',
          '/reset-password',
          '/upgrade',
          '/test',
        ],
      },

      // ★ AI系クローラーを明示的に許可（引用されやすくする）
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
    ],
    sitemap: new URL('/sitemap.xml', appUrl).toString(),
    host: appUrl,
  };
}
