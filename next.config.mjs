/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async headers() {
        return [
            {
                source: '/r/:path*',
                headers: [
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
                    { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
                    { key: 'Referrer-Policy', value: 'no-referrer' },
                ],
            },
        ];
    },
};

export default nextConfig;
