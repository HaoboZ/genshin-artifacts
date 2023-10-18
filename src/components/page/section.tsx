import type { TypographyProps } from '@mui/material';
import { Box, Divider, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { ActionProps } from '../actions';
import Actions from '../actions';

export default function PageSection({
	title,
	actions,
	children,
	max,
	...props
}: {
	title?: string;
	actions?: ActionProps[] | ReactNode;
	max?: number;
} & TypographyProps) {
	return (
		<Box>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				px={{
					xs: 1,
					sm: 0,
				}}>
				<Typography variant='h4' py={1} {...props}>
					{title}
				</Typography>
				{Array.isArray(actions) ? <Actions items={actions} max={max} /> : actions}
			</Box>
			<Divider sx={{ mb: 1 }} />
			{children}
		</Box>
	);
}
