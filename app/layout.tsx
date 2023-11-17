import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import type { PackageJson } from 'type-fest';
import _packageJson from '../package.json';
import Header from './header';
import Providers from './providers';

const packageJson = _packageJson as PackageJson;

export const metadata: Metadata = {
	title: 'Genshin Artifacts',
	description: packageJson.description,
	keywords: packageJson.keywords,
	authors: packageJson.author as any,
};

export const viewport: Viewport = {
	themeColor: '#ffffff',
	viewportFit: 'cover',
	userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html suppressHydrationWarning lang='en'>
			<body>
				{process.env.NEXT_PUBLIC_VERCEL_ENV && <Analytics />}
				<Providers>
					<Header />
					{children}
				</Providers>
			</body>
		</html>
	);
}
