/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
    ],
  },
  serverExternalPackages: [
    'pdf-parse',
    '@huggingface/transformers',
    'onnxruntime-node',
    'sharp',
    '@img/sharp-libvips-linuxmusl-x64',
    '@img/sharp-libvips-linux-x64',
    'better-sqlite3',
  ],
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/onnxruntime-node/**',
        'node_modules/@img/sharp-libvips-linuxmusl-x64/**',
        'node_modules/@img/sharp-libvips-linux-x64/**',
        'node_modules/@img/sharp-libvips-darwin-arm64/**',
        'node_modules/@img/sharp-libvips-darwin-x64/**',
        'node_modules/@img/sharp-libvips-win32-x64/**',
        'node_modules/@img/sharp-darwin-arm64/**',
        'node_modules/@img/sharp-darwin-x64/**',
        'node_modules/@img/sharp-linux-arm64/**',
        'node_modules/@img/sharp-linux-x64/**',
        'node_modules/@img/sharp-win32-x64/**',
        'node_modules/sharp/**',
        'node_modules/@huggingface/transformers/**',
        'node_modules/better-sqlite3/**',
      ],
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude large native dependencies from server bundle
      config.externals = config.externals || [];
      config.externals.push({
        '@huggingface/transformers': 'commonjs @huggingface/transformers',
        'onnxruntime-node': 'commonjs onnxruntime-node',
        'sharp': 'commonjs sharp',
        '@img/sharp-libvips-linuxmusl-x64': 'commonjs @img/sharp-libvips-linuxmusl-x64',
        '@img/sharp-libvips-linux-x64': 'commonjs @img/sharp-libvips-linux-x64',
        'better-sqlite3': 'commonjs better-sqlite3',
      });
    }
    return config;
  },
};

export default nextConfig;
