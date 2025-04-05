import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
        pathname: '/api/proxy/image/**',
      },
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_API_URL
          ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
          : 'localhost',
        port: process.env.NEXT_PUBLIC_API_URL
          ? new URL(process.env.NEXT_PUBLIC_API_URL).port
          : '3004',
        pathname: '/api/proxy/image/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
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

export default withBundleAnalyzer(nextConfig);
