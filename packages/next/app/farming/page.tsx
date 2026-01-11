import { fetchRouteData } from '@/api/routes/fetchRouteData';
import { type RouteData } from '@/api/routes/types';
import { Box } from '@mui/material';
import { prop, sortBy } from 'remeda';
import WorldMap from './worldMap';

export const dynamic = 'force-dynamic';

export default async function Farming() {
	const routesData = await fetchRouteData<RouteData[]>(`routes.json`);

	return (
		<Box sx={{ width: '100vw', height: '100vh' }}>
			<WorldMap routesData={sortBy(routesData, prop('name'))} />
		</Box>
	);
}
