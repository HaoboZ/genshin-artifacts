import type { ListItemProps, ListItemTextProps } from '@mui/material';
import { Box, ListItem, ListItemText } from '@mui/material';
import type { ReactNode } from 'react';
import type { ActionProps } from '../actions';
import Actions from '../actions';

export default function PageSection({
	actions,
	listItemProps,
	children,
	max,
	...props
}: {
	actions?: ActionProps[] | ReactNode;
	max?: number;
	listItemProps?: ListItemProps<'div'>;
} & ListItemTextProps) {
	return (
		<Box display='flex' flexDirection='column'>
			<ListItem divider component='div' sx={{ my: 2 }} {...listItemProps}>
				<ListItemText primaryTypographyProps={{ variant: 'h3' }} {...props} />
				{Array.isArray(actions) ? <Actions items={actions} max={max} /> : actions}
			</ListItem>
			{children}
		</Box>
	);
}
