import { Box, LinearProgress, linearProgressClasses, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function combinePercents(...vals: { percent: number; weight: number }[]) {
	return vals.reduce((total, { percent, weight }) => {
		if (percent === -1) return total;
		return total + weight * percent;
	}, 0);
}

export default function PercentBar({ p, children }: { p: number; children?: ReactNode }) {
	const rounded = Math.round(p * 100);

	const text = typeof children === 'string' ? children.replaceAll('%p', `${rounded}%`) : children;

	return (
		<Box sx={{ position: 'relative' }}>
			<Typography
				sx={{ zIndex: 1000, position: 'absolute', color: 'text.primary', ml: 1, fontSize: 11 }}>
				{text ?? `${rounded}%`}
			</Typography>
			<LinearProgress
				variant='determinate'
				value={rounded}
				sx={{
					height: 18,
					borderRadius: 1,
					[`& .${linearProgressClasses.bar}`]: {
						borderRadius: 1,
						backgroundColor: `hsl(${p * 120}, 50%, 50%)`,
					},
					backgroundColor: 'initial',
					border: 1,
					borderColor: 'divider',
				}}
			/>
		</Box>
	);
}
