import { useSnackbar } from 'notistack';
import { useState } from 'react';

import reportError from '@/helpers/reportError';

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
					reportError(e, enqueueSnackbar);
				} finally {
					setLoading(false);
				}
			}) as any,
	];
}
