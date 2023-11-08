'use client';
import { CssBaseline, CssVarsProvider, getInitColorSchemeScript } from '@mui/joy';
import type { ReactNode } from 'react';
import NextAppDirEmotionCacheProvider from './emotionCache';
import './style.scss';
import theme from './theme';

export default function ThemeRegistry({ children }: { children: ReactNode }) {
	return (
		<NextAppDirEmotionCacheProvider options={{ key: 'joy' }}>
			{getInitColorSchemeScript({ defaultMode: 'system' })}
			<CssVarsProvider theme={theme} defaultMode='system'>
				<CssBaseline />
				{children}
			</CssVarsProvider>
		</NextAppDirEmotionCacheProvider>
	);
}
