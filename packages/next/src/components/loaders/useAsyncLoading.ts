import { useSnackbar } from 'notistack';
import { useState } from 'react';

export default function useAsyncLoading(): [
	boolean,
	<F extends (...args: any[]) => any>(func: F) => F,
] {
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
					console.error(error);
					enqueueSnackbar(error, { variant: 'error' });
				} finally {
					setLoading(false);
				}
			}) as any,
	];
}
