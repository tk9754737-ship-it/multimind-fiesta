// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ESLint errors ignore karega
  },
  typescript: {
    ignoreBuildErrors: true, // TypeScript errors bhi ignore
  },
};

module.exports = nextConfig;