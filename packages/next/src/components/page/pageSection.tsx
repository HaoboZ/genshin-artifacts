import { Box, type BoxProps, Divider, Typography, type TypographyProps } from '@mui/material';
import { type ReactNode } from 'react';
import PageActions, { type ActionProps } from './pageActions';

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
				{Array.isArray(actions) ? <PageActions items={actions} max={max} /> : actions}
			</Box>
			<Divider sx={{ mb: 1 }} />
			{children}
		</Box>
	);
}
