/** @type {import('next').NextConfig} */
// Force cache invalidation for Docker build - relative imports fix
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig