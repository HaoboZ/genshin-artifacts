import { Typography } from '@mui/material';
import type { ReactNode } from 'react';

export default function OverlayText({
	children,
	size,
	bottom,
	right,
}: {
	children: ReactNode;
	size?: number;
	bottom?: boolean;
	right?: boolean;
}) {
	return (
		<Typography
			fontSize={size}
			sx={{
				position: 'absolute',
				top: bottom ? undefined : 0,
				bottom: bottom ? 1 : undefined,
				left: right ? undefined : 0,
				right: right ? 1 : undefined,
				color: 'black',
				bgcolor: 'white',
				borderRadius: 1,
				opacity: 0.75,
			}}>
			&nbsp;{children}&nbsp;
		</Typography>
	);
}
