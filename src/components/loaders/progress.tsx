import { Box, CircularProgress } from '@mui/material';
import { useNProgress } from '@tanem/react-nprogress';
import type { ReactNode } from 'react';
import useLoading from '../../hooks/useLoading';

export default function Progress({
	isLoading,
	delay,
	children = (progress) => (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				pt: 5,
			}}>
			<CircularProgress value={progress} />
		</Box>
	),
}: {
	isLoading: boolean;
	delay?: number;
	children: (progress: number) => ReactNode;
}) {
	const isAnimating = useLoading(isLoading, delay);
	const { isFinished, progress } = useNProgress({ isAnimating });

	return (
		<Box
			sx={{
				opacity: isFinished ? 0 : 1,
				transition: ({ transitions }) => transitions.create('opacity'),
			}}>
			{children(progress)}
		</Box>
	);
}
