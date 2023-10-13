import type { MenuItemProps } from '@mui/material';
import { MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export default function AsyncMenuItem({ onClick, ...props }: MenuItemProps) {
	const { enqueueSnackbar } = useSnackbar();

	const [loading, setLoading] = useState(false);

	return (
		<MenuItem
			disabled={loading}
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
