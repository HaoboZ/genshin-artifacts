'use client';
import SnackbarAction from '@/src/providers/snackbar/action';
import { SnackbarProvider } from 'notistack';
import type { ReactNode } from 'react';

export default function ClientSnackbarProvider({ children }: { children: ReactNode }) {
	return (
		<SnackbarProvider preventDuplicate action={SnackbarAction}>
			{children}
		</SnackbarProvider>
	);
}
