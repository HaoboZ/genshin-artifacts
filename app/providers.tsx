import ComponentComposer, { component } from '@/src/helpers/componentComposer';
import EventsProvider from '@/src/providers/events';
import ModalProvider from '@/src/providers/modal';
import ClientSnackbarProvider from '@/src/providers/snackbar';
import theme from '@/src/providers/theme';
import StoreProvider from '@/src/store/provider';
import { ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Loading from './loading';

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<ComponentComposer
			components={[
				// data
				component(EventsProvider),
				component(StoreProvider),
				// theme
				component(AppRouterCacheProvider),
				component(ThemeProvider, { theme }),
				// components
				component(Suspense, { fallback: <Loading /> }),
				component(ClientSnackbarProvider),
				component(ModalProvider),
			]}>
			{children}
		</ComponentComposer>
	);
}
