import type { TypographyProps } from '@mui/joy';
import { Box, Typography } from '@mui/joy';
import type { ReactNode } from 'react';
import type { ActionProps } from '../actions';
import Actions from '../actions';

export type PageTitleProps = {
	actions?: ActionProps[] | ReactNode;
	max?: number;
} & TypographyProps;

export default function PageTitle({ actions, max, ...props }: PageTitleProps) {
	return (
		<Box display='flex' justifyContent='space-between' alignItems='center' px={{ xs: 1, sm: 0 }}>
			<Typography level='h1' py={1} {...props} />
			{Array.isArray(actions) ? <Actions items={actions} max={max} /> : actions}
		</Box>
	);
}
