const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@all-club/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias['react'] = path.resolve(__dirname, '../../node_modules/react')
    config.resolve.alias['react-dom'] = path.resolve(__dirname, '../../node_modules/react-dom')
    return config
  },
}

module.exports = nextConfig
