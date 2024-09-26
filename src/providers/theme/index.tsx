'use client';
import './style.scss';
import { CssBaseline, ThemeProvider as Provider } from '@mui/material';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import type { ReactNode } from 'react';
import theme from './theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
	return (
		<Provider theme={theme}>
			<CssBaseline />
			<InitColorSchemeScript attribute='class' />
			{children}
		</Provider>
	);
}
