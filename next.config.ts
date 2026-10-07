import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from 'next';
if (process.env.NODE_ENV === 'development') void initOpenNextCloudflareForDev();
const nextConfig: NextConfig = {
  async redirects() {
    const conditions = [
      [{ type: 'host' as const, value: '^www\\.corstack\\.dev$' }],
      [
        { type: 'host' as const, value: '^corstack\\.dev$' },
        { type: 'header' as const, key: 'x-forwarded-proto', value: '^http$' },
      ],
    ];
    // OpenNext matches header patterns without implicit anchors and does not
    // substitute a wildcard when the root path has no captured parameters.
    return conditions.flatMap(has => [
      { source: '/', has, destination: 'https://corstack.dev/', permanent: true },
      { source: '/:path+', has, destination: 'https://corstack.dev/:path+', permanent: true },
    ]);
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};
export default nextConfig;
