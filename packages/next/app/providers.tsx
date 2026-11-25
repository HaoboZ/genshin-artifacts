'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { onIdTokenChanged } from 'firebase/auth';
import { type ReactNode, useEffect } from 'react';

import { auth } from '@/firebase';
import ComponentComposer, { component } from '@/helpers/componentComposer';
import EventsProvider from '@/providers/eventsProvider';
import ModalProvider from '@/providers/modal';
import ClientSnackbarProvider from '@/providers/snackbar';
import ThemeProvider from '@/providers/theme';
import StoreProvider from '@/store/storeProvider';

import { saveAuthToken } from './settings/authActions';

export default function Providers({ children }: { children: ReactNode }) {
	useEffect(
		() =>
			onIdTokenChanged(auth, async (user) => {
				await saveAuthToken(user ? await user.getIdToken() : null);
			}),
		[],
	);

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
