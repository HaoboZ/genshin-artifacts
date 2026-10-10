'use client';

import { type ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { initialState, rehydrateStore, store, type RootState } from './index';
import { loadState } from './persist';

export default function StoreProvider({ children }: { children: ReactNode }) {
	useEffect(() => {
		const savedState = loadState();
		if (savedState) rehydrateStore(savedState as RootState);
	}, []);

	return (
		<Provider store={store} serverState={initialState}>
			{children}
		</Provider>
	);
}
