import bundleAnalyzer from '@next/bundle-analyzer';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	headers: async () => [
		{
			// matching all API routes
			source: '/api/:path*',
			headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
		},
	],
};

const plugins = [bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })];

// noinspection JSUnusedGlobalSymbols
export default plugins.reduceRight((acc, plugin) => plugin(acc), nextConfig);
