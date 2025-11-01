/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Fix for MetaMask SDK - ignore React Native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      'react-native-crypto': false,
      'react-native-randombytes': false,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false
    }

    // Fix for pino-pretty - ignore it as external
    if (!isServer) {
      config.externals = config.externals || []
      config.externals.push('pino-pretty')
    }

    // Ignore node-specific modules
    config.resolve.alias = {
      ...config.resolve.alias,
      encoding: false,
      bufferutil: false,
      'utf-8-validate': false
    }

    return config
  }
}

export default nextConfig
