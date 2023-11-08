'use client';
import { Box, CircularProgress } from '@mui/joy';
import type { ReactNode } from 'react';
import useLoading from '../../hooks/useLoading';

export default function DelayedLoading({
	isLoading,
	delay,
	children,
}: {
	isLoading?: boolean;
	delay?: number;
	children?: ReactNode;
}) {
	const loading = useLoading(isLoading, delay);

	return (
		<Box sx={{ opacity: loading ? 1 : 0, transition: 'opacity 0.3s' }}>
			{children ?? (
				<Box display='flex' justifyContent='center' pt={5}>
					<CircularProgress />
				</Box>
			)}
		</Box>
	);
}
