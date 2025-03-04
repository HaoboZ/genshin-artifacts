import type { TypographyProps } from '@mui/material';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { ActionProps } from '../actions';
import Actions from '../actions';

export type PageTitleProps = {
	actions?: ActionProps[] | ReactNode;
	max?: number;
} & TypographyProps;

export default function PageTitle({ actions, max, ...props }: PageTitleProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				px: { xs: 1, sm: 0 },
			}}>
			<Typography variant='h1' sx={{ py: 1 }} {...props} />
			{Array.isArray(actions) ? <Actions items={actions} max={max} /> : actions}
		</Box>
	);
}
