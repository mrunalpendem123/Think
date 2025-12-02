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
    serverComponentsExternalPackages: [
      '@huggingface/transformers',
      'onnxruntime-node',
      'sharp',
      'better-sqlite3',
    ],
  },
};

export default nextConfig;
