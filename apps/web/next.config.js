const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@all-club/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias['react'] = path.dirname(require.resolve('react/package.json'))
      config.resolve.alias['react-dom'] = path.dirname(require.resolve('react-dom/package.json'))
    }
    return config
  },
}

module.exports = nextConfig
