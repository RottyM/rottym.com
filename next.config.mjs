/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        turbopack: {
            root: '.',
        },
    },
};

export default nextConfig;
