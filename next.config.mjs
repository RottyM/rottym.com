/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
