/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@all-club/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
