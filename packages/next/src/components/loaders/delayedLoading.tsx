import { Box, CircularProgress } from '@mui/material';
import { type ReactNode } from 'react';
import { useDebouncedValue } from 'rooks';

export default function DelayedLoading({
	isLoading,
	delay = 250,
	children,
}: {
	isLoading?: boolean;
	delay?: number;
	children?: ReactNode;
}) {
	const [loading] = useDebouncedValue(isLoading, delay);

	return (
		<Box sx={{ opacity: loading ? 1 : 0, transition: 'opacity 0.3s' }}>
			{children ?? (
				<Box sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
					<CircularProgress />
				</Box>
			)}
		</Box>
	);
}
