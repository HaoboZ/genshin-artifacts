'use client';

import { Box, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';

export default function CodeSnippet({ children, sx }: { children: ReactNode; sx?: SxProps }) {
	return (
		<Box
			component='pre'
			sx={{
				bgcolor: 'grey.900',
				color: 'grey.100',
				p: 2,
				borderRadius: 2,
				overflowX: 'auto',
				fontFamily: 'Consolas, "SFMono-Regular", Menlo, Monaco, "Courier New", monospace',
				fontSize: '0.85rem',
				tabSize: 2,
				...sx,
			}}>
			{children}
		</Box>
	);
}
