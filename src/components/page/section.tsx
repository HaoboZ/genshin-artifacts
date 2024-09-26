import type { BoxProps, TypographyProps } from '@mui/material';
import { Box, Divider, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { ActionProps } from '../actions';
import Actions from '../actions';

export default function PageSection({
	title,
	titleProps,
	actions,
	children,
	max,
	...props
}: {
	title?: ReactNode;
	titleProps?: TypographyProps;
	actions?: ActionProps[] | ReactNode;
	max?: number;
} & Omit<BoxProps, 'title'>) {
	return (
		<Box {...props}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					px: { xs: 1, sm: 0 },
				}}>
				<Typography variant='h4' sx={{ py: 1 }} {...titleProps}>
					{title}
				</Typography>
				{Array.isArray(actions) ? <Actions items={actions} max={max} /> : actions}
			</Box>
			<Divider sx={{ mb: 1 }} />
			{children}
		</Box>
	);
}
