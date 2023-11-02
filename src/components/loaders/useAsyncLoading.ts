import { useSnackbar } from 'notistack';
import { useState } from 'react';

export default function useAsyncLoading(): [boolean, <F extends Function>(func: F) => F] {
	const { enqueueSnackbar } = useSnackbar();

	const [loading, setLoading] = useState(false);

	return [
		loading,
		(func) =>
			(async (...args) => {
				try {
					setLoading(true);
					return await func(...args);
				} catch (e) {
					const error = e?.response?.data || e?.message || e;
					if (typeof error === 'string') {
						enqueueSnackbar(error, { variant: 'error' });
					} else {
						console.error(error);
						enqueueSnackbar('An unknown error has occurred', { variant: 'error' });
					}
				} finally {
					setLoading(false);
				}
			}) as any,
	];
}
