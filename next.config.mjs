import bundleAnalyzer from '@next/bundle-analyzer';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	swcMinify: true,
	headers: async () => [
		{
			// matching all API routes
			source: '/api/:path*',
			headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
		},
	],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'static.wikia.nocookie.net',
				port: '',
				pathname: '/gensin-impact/images/**',
			},
		],
	},
	experimental: { optimizePackageImports: ['@mui/joy', 'rambdax'] },
};

const plugins = [bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })];

// noinspection JSUnusedGlobalSymbols
export default plugins.reduceRight((acc, plugin) => plugin(acc), nextConfig);
