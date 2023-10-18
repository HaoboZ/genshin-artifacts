import type { LoadingButtonProps } from '@mui/lab';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export default function AsyncButton({ onClick, ...props }: LoadingButtonProps) {
	const { enqueueSnackbar } = useSnackbar();

	const [loading, setLoading] = useState(false);

	return (
		<LoadingButton
			loading={loading}
			onClick={async (arg) => {
				try {
					setLoading(true);
					await onClick?.(arg);
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
			}}
			{...props}
		/>
	);
}
