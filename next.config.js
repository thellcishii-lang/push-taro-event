/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 ビルド時の静的生成を全体的に無効化
  output: 'standalone',
  skipTrailingSlashRedirect: true,

  // 🔥 全てのページを動的に扱う（推奨）
  experimental: {
    // App RouterでのSSGを無効化
  },

  // 🔥 旧URL → 新URL のリダイレクト
  async redirects() {
    return [
      {
        source: '/program',
        destination: '/partners',
        permanent: true, // 301リダイレクト
      },
      {
        source: '/program/:path*',
        destination: '/partners/:path*',
        permanent: true, // サブパスも念のため
      },
    ];
  },
};

module.exports = nextConfig;
