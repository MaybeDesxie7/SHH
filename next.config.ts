import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.cache = false;  // disable build cache temporarily
    return config;
  },
  // add other config options here if needed
};

export default nextConfig;
