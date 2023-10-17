import { Box, Typography } from '@mui/material';
import { round } from 'lodash';

export default function PercentBar({
	vals,
	children,
}: {
	vals: {
		reverse?: boolean;
		max: number;
		current: number;
		weight?: number;
	}[];
	children?: string;
}) {
	const p = vals.reduce((total, { reverse, weight, current, max }) => {
		if (current === undefined || current === -1 || isNaN(current)) return total;
		return total + (weight ?? 1) * (reverse ? 1 - current / max : current / max);
	}, 0);

	const rounded = round(p * 100);

	return (
		<Box>
			<Typography fontSize={11} width={`${rounded}%`} bgcolor={`hsl(${p * 120}, 50%, 50%)`}>
				&nbsp;{children ?? `${rounded}%`}
			</Typography>
		</Box>
	);
}
