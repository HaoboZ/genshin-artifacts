'use client';
import { Box, Button, Typography } from '@mui/material';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset?: () => void;
}) {
	return (
		<Box textAlign='center' pt={10}>
			<Typography variant='h2'>{error.message}</Typography>
			{error.digest && <Typography variant='h4'>digest: {error.digest}</Typography>}
			<Button onClick={reset}>Retry</Button>
		</Box>
	);
}
