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
