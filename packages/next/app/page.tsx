import { fetchRouteData } from '@/api/routes/fetchRouteData';
import type { RouteData } from '@/api/routes/types';
import PageTitle from '@/components/page/pageTitle';
import { Container, Grid } from '@mui/material';
import { prop, sortBy } from 'remeda';
import WorldMap from './farming/worldMap';
import Notifications from './notifications';

export default async function MainPage() {
	const routesData = await fetchRouteData<RouteData[]>(`routes.json`);

	return (
		<Container>
			<PageTitle>Genshin Artifacts</PageTitle>
			<Grid container spacing={1}>
				<Grid
					size={{ xs: 12, md: 8 }}
					sx={{ height: { xs: 'calc(100vw * 9 / 16)', md: 'calc(100vh - 100px)' } }}>
					<WorldMap routesData={sortBy(routesData, prop('name'))} top />
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					<Notifications />
				</Grid>
			</Grid>
		</Container>
	);
}
