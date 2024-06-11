/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 120,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploads.mangadex.org",
        port: "",
        pathname: "/covers/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3004",
        pathname: "/dist/images/**",
      },
      {
        protocol: "https",
        hostname: "www.uploads.mangadex.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
