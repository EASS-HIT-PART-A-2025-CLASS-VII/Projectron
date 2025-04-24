import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // add this webpack override
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
