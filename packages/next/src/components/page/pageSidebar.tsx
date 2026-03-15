import { Grid, Paper, Stack } from '@mui/material';
import { type ReactNode } from 'react';
import PageLink from './pageLink';

export default function PageSidebar({
	sideMenuItems,
	children,
}: {
	sideMenuItems: { id: string; label: string }[];
	children: ReactNode;
}) {
	return (
		<Grid container spacing={1}>
			<Grid size={{ xs: 12, md: 3 }}>
				<Paper variant='outlined' sx={{ p: 2, position: 'sticky', top: 80 }}>
					<Stack spacing={2}>
						{sideMenuItems.map((item) => (
							<PageLink
								key={item.id}
								href={`#${item.id}`}
								underline='none'
								color='text.primary'>
								{item.label}
							</PageLink>
						))}
					</Stack>
				</Paper>
			</Grid>
			<Grid size={{ xs: 12, md: 9 }}>{children}</Grid>
		</Grid>
	);
}
