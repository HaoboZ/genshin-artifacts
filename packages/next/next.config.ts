import bundleAnalyzer from '@next/bundle-analyzer';
import { type NextConfig } from 'next';
import { pipe } from 'remeda';

const nextConfig: NextConfig = {
	headers: async () => [
		{ source: '/api/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
	],
	images: {
		unoptimized: true,
		remotePatterns: [
			new URL('https://static.wikia.nocookie.net/gensin-impact/images/**'),
			new URL(`${process.env.NEXT_PUBLIC_STORAGE_URL}/**`),
		],
	},
	serverExternalPackages: ['canvas'],
};

export default pipe(
	nextConfig,
	bundleAnalyzer({
		enabled: !!process.env.ANALYZE && process.env.NODE_ENV !== 'development',
	}),
);
