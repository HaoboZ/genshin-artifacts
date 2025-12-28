'use client';
import { SnackbarProvider } from 'notistack';
import { type ReactNode } from 'react';
import SnackbarAction from './snackbarAction';

export default function ClientSnackbarProvider({ children }: { children: ReactNode }) {
	return (
		<SnackbarProvider preventDuplicate action={SnackbarAction}>
			{children}
		</SnackbarProvider>
	);
}
