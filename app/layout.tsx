import Providers from '@/src/providers';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { PackageJson } from 'type-fest';
import _packageJson from '../package.json';
import Header from './header';

const packageJson = _packageJson as PackageJson;

export const metadata: Metadata = {
	title: 'Genshin Artifacts',
	themeColor: '#ffffff',
	description: packageJson.description,
	keywords: packageJson.keywords?.join(', '),
	authors: packageJson.author as any,
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<body>
				{process.env.NEXT_PUBLIC_VERCEL && <Analytics />}
				<Providers>
					<Header />
					{children}
				</Providers>
			</body>
		</html>
	);
}
