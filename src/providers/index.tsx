'use client';
import { SnackbarProvider } from 'notistack';
import type { ReactNode } from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ComponentComposer, { component } from '../helpers/componentComposer';
import { persistor, store } from '../store';
import EventsProvider from './events';
import ModalProvider from './modal';
import SnackbarAction from './snackbar/action';
import ThemeProvider from './theme';

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<ComponentComposer
			components={[
				// data
				component(StoreProvider, { store }),
				component(PersistGate, { loading: null, persistor }),
				component(EventsProvider),
				// styling
				component(ThemeProvider),
				// visual
				component(SnackbarProvider, {
					preventDuplicate: true,
					action: SnackbarAction,
				}),
				component(ModalProvider),
			]}>
			{children}
		</ComponentComposer>
	);
}
