import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 120,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.mangadex.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mangadex.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.mangadex.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mangadex.network',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.mangadex.network',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
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
