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
  async rewrites() {
    return [
      // Bar Rules study app: static PWA living in public/study/ (see public/study/README.md)
      { source: '/study', destination: '/study/index.html' },
    ]
  },
}

module.exports = nextConfig