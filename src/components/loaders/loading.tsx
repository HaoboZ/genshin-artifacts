import { Box, CircularProgress } from '@mui/material';
import type { ReactNode } from 'react';
import useLoading from '../../hooks/useLoading';

export default function Loading({
	isLoading,
	delay,
	children = (
		<Box display='flex' justifyContent='center' pt={5}>
			<CircularProgress />
		</Box>
	),
}: {
	isLoading?: boolean;
	delay?: number;
	children?: ReactNode;
}) {
	const loading = useLoading(isLoading, delay);

	return (
		<Box
			sx={{
				opacity: loading ? 0 : 1,
				transition: ({ transitions }) => transitions.create('opacity'),
			}}>
			{children}
		</Box>
	);
}
