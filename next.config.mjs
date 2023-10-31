import bundleAnalyzer from '@next/bundle-analyzer';
import { pipe } from 'remeda';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	swcMinify: true,
	headers: async () => [
		{ source: '/api/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
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
	experimental: { optimizePackageImports: ['@mui/joy'] },
};

export default pipe(nextConfig, bundleAnalyzer({ enabled: !process.env.VERCEL }));
