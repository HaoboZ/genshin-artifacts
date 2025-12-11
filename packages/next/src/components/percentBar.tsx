import type { SxProps } from '@mui/material';
import { Box, LinearProgress, linearProgressClasses, Typography } from '@mui/material';
import { Children, ReactNode } from 'react';
import { sumBy } from 'remeda';

export function combinePercents(...vals: { percent: number; weight: number }[]) {
	return sumBy(vals, ({ percent, weight }) => {
		if (percent === -1) return 0;
		return weight * percent;
	});
}

export default function PercentBar({
	p,
	children,
	sx,
}: {
	p: number;
	children?: ReactNode;
	sx?: SxProps;
}) {
	const rounded = Math.round(p * 100);

	const childArray = Children.toArray(children);

	return (
		<Box sx={{ position: 'relative' }}>
			<Typography
				sx={{
					zIndex: 1000,
					position: 'absolute',
					color: 'text.primary',
					ml: 1,
					fontSize: 11,
					...sx,
				}}>
				{childArray.length > 0
					? childArray.map((child) =>
							typeof child === 'string' ? child.replaceAll('%p', `${rounded}%`) : child,
						)
					: `${rounded}%`}
			</Typography>
			<LinearProgress
				variant='determinate'
				value={rounded}
				sx={{
					height: 18,
					borderRadius: 1,
					[`& .${linearProgressClasses.bar}`]: {
						borderRadius: 1,
						bgcolor: `hsl(${p * 120}, 50%, 50%)`,
					},
					bgcolor: 'initial',
					border: 1,
					borderColor: 'divider',
				}}
			/>
		</Box>
	);
}
