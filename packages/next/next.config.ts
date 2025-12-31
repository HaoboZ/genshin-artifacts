import bundleAnalyzer from '@next/bundle-analyzer';
import { type NextConfig } from 'next';
import { pipe } from 'remeda';

const nextConfig: NextConfig = {
	headers: async () => [
		{ source: '/api/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
	],
	images: { unoptimized: true },
	serverExternalPackages: ['canvas'],
};

export default pipe(
	nextConfig,
	bundleAnalyzer({
		enabled: !!process.env.ANALYZE && process.env.NODE_ENV !== 'development',
	}),
);
