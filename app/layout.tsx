import '@/src/layout/style.scss';
import { Analytics } from '@vercel/analytics/react';
import dynamic from 'next/dynamic';
import { Roboto } from 'next/font/google';
import type { ReactNode } from 'react';
import type { PackageJson } from 'type-fest';
import _packageJson from '../package.json';

const packageJson = _packageJson as PackageJson;

const roboto = Roboto({
	subsets: [ 'latin' ],
	weight : [ '300', '400', '500', '700' ]
});

const Providers = dynamic(() => import('@/src/providers'), { ssr: false });

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en' className={roboto.className}>
		<head>
			<title>Genshin Artifacts</title>
			<meta charSet='utf-8'/>
			<meta
				name='viewport'
				content='width=device-width, initial-scale=1, viewport-fit=cover'
			/>
			<meta key='theme' name='theme-color' content='#039be5'/>
			{/*seo*/}
			{'description' in packageJson && (
				<meta name='description' content={packageJson.description}/>
			)}
			{'keywords' in packageJson && (
				<meta name='keywords' content={packageJson.keywords.join(', ')}/>
			)}
			{'author' in packageJson && (
				<meta name='author' content={packageJson.author as string}/>
			)}
			{/*pwa*/}
			<meta name='mobile-web-app-capable' content='yes'/>
			<link rel='manifest' href='/app.webmanifest'/>
			<link rel='shortcut icon' href='/favicon.ico'/>
			{/*ios*/}
			<meta name='apple-mobile-web-app-capable' content='yes'/>
			<meta name='apple-mobile-web-app-status-bar-style' content='black-translucent'/>
		</head>
		<body>
			{process.env.NEXT_PUBLIC_VERCEL && <Analytics/>}
			<Providers>{children}</Providers>
		</body>
		</html>
	);
}
