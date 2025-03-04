'use client';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '.';

export default function StoreProvider({ children }: { children: ReactNode }) {
	return <Provider store={store}>{children}</Provider>;
}
