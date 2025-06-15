/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Optimize output for Docker
    outputFileTracingRoot: process.env.NODE_ENV === 'production' ? '/app' : undefined,
    // Remove optimizeCss to avoid critters dependency
  },
  // Reduce bundle size
  swcMinify: true,
  // Exclude API routes from static generation
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig;