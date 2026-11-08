import type { ProviderContext } from 'notistack';

type EnqueueSnackbar = ProviderContext['enqueueSnackbar'];

export default function reportError(error: any, enqueueSnackbar: EnqueueSnackbar) {
	console.error(error);
	const message = error?.response?.data?.error ?? error?.message ?? error ?? 'Unknown error';
	enqueueSnackbar(String(message), { variant: 'error' });
}
