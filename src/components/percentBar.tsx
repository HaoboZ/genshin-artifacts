import { Box, Typography } from '@mui/material';
import { round } from 'lodash';

export function combinePercents(...vals: { percent: number; weight: number }[]) {
	return vals.reduce((total, { percent, weight }) => {
		if (percent === -1) return total;
		return total + weight * percent;
	}, 0);
}

export default function PercentBar({
	p,
	size = 11,
	children,
}: {
	p: number;
	size?: number;
	children?: string;
}) {
	const rounded = round(p * 100);

	return (
		<Box border={1} borderColor='divider'>
			<Typography
				fontSize={size}
				width={`${rounded}%`}
				sx={{ textWrap: 'nowrap' }}
				bgcolor={`hsl(${p * 120}, 50%, 50%)`}>
				&nbsp;{children ?? `${rounded}%`}
			</Typography>
		</Box>
	);
}
