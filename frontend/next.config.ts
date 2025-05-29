import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: { and: [/\.(js|ts)x?$/] },
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
