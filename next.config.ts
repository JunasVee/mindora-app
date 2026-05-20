import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['@supabase/ssr', '@google/generative-ai'],
  },
};

export default nextConfig;
