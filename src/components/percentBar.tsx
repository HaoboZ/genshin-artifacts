import { LinearProgress, Typography } from '@mui/joy';
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
		<LinearProgress
			determinate
			value={rounded}
			thickness={20}
			variant='outlined'
			sx={{
				'--LinearProgress-radius': '5px',
				'--variant-outlinedColor': `hsl(${p * 120}, 50%, 50%)`,
			}}>
			<Typography sx={{ mixBlendMode: 'difference' }} fontSize={11}>
				{text ?? `${rounded}%`}
			</Typography>
		</LinearProgress>
	);
}
