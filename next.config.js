/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        port: '',
        pathname: '/covers/**',
      },
      {
        protocol: 'https',
        hostname: 'mangadex.org',
        port: '',
        pathname: '/covers/**',
      },
      {
        protocol: 'https',
        hostname: 'mangadex.network',
        port: '',
        pathname: '/covers/**',
      },
      {
        protocol: 'https',
        hostname: 'manga-db-api.onrender.com',
        port: '',
        pathname: '/proxy/image/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
        pathname: '/proxy/image/**',
      },
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004',
    NEXT_PUBLIC_FRONT_END_URL: process.env.NEXT_PUBLIC_FRONT_END_URL || 'http://localhost:3000',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

module.exports = nextConfig;
