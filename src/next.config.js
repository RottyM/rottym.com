/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // For static if Bluehost fallback
  images: { unoptimized: true },
  trailingSlash: true,
  // Fixes 404 on Vercel
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;