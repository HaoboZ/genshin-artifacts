import ComponentComposer, { component } from '@/src/helpers/componentComposer';
import ModalProvider from '@/src/providers/modal';
import ClientSnackbarProvider from '@/src/providers/snackbar';
import ThemeProvider from '@/src/providers/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { type ReactNode } from 'react';
import EventsProvider from '../src/providers/eventsProvider';
import StoreProvider from '../src/store/storeProvider';

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<ComponentComposer
			components={[
				// data
				component(EventsProvider),
				component(StoreProvider),
				// theme
				component(AppRouterCacheProvider),
				component(ThemeProvider),
				// components
				component(ClientSnackbarProvider),
				component(ModalProvider),
			]}>
			{children}
		</ComponentComposer>
	);
}
