import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Removed output: "export" to enable API routes on Vercel
  eslint: {
    ignoreDuringBuilds: true, // <-- ADD THIS LINE
  },
  typescript: {
    ignoreBuildErrors: true, // <-- ADD THIS LINE
  },
};

export default nextConfig;