import ComponentComposer, { component } from '@/helpers/componentComposer';
import EventsProvider from '@/providers/eventsProvider';
import ModalProvider from '@/providers/modal';
import ClientSnackbarProvider from '@/providers/snackbar';
import ThemeProvider from '@/providers/theme';
import StoreProvider from '@/store/storeProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { type ReactNode } from 'react';

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
