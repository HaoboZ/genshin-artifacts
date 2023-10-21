import { extendTheme } from '@mui/joy';
import { Inter, Source_Code_Pro } from 'next/font/google';

const inter = Inter({
	subsets: ['latin'],
	adjustFontFallback: false,
	fallback: ['var(--joy-fontFamily-fallback)'],
	display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
	subsets: ['latin'],
	adjustFontFallback: false,
	fallback: [
		'ui-monospace',
		'SFMono-Regular',
		'Menlo',
		'Monaco',
		'Consolas',
		'Liberation Mono',
		'Courier New',
		'monospace',
	],
	display: 'swap',
});

export default extendTheme({
	fontFamily: {
		body: inter.style.fontFamily,
		display: inter.style.fontFamily,
		code: sourceCodePro.style.fontFamily,
	},
});
