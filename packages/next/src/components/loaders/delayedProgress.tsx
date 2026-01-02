import { Box, CircularProgress } from '@mui/material';
import { useNProgress } from '@tanem/react-nprogress';
import { type ReactNode } from 'react';
import { useDebouncedValue } from 'rooks';

export default function DelayedProgress({
	isLoading,
	delay = 250,
	children,
}: {
	isLoading: boolean;
	delay?: number;
	children?: (progress: number) => ReactNode;
}) {
	const [isAnimating] = useDebouncedValue(isLoading, delay);
	const { isFinished, progress } = useNProgress({ isAnimating });

	return (
		<Box sx={{ opacity: isFinished ? 0 : 1, transition: 'opacity 0.3s' }}>
			{children(progress) ?? (
				<Box sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
					<CircularProgress value={progress} />
				</Box>
			)}
		</Box>
	);
}
