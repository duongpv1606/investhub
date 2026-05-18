import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.coingecko.com" },
      { protocol: "https", hostname: "**.alphavantage.co" },
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "coinicons-api.vercel.app" },
    ],
  },
  experimental: { typedRoutes: false },
};

export default nextConfig;
