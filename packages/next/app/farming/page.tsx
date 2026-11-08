import { Box } from '@mui/material';
import { prop, sortBy } from 'remeda';

import { fetchRoutes } from '@/api/routes/fetchRouteData';

import WorldMap from './worldMap';

export const dynamic = 'force-dynamic';

export default async function Farming() {
	const routesData = await fetchRoutes();

	return (
		<Box sx={{ width: '100vw', height: '100vh' }}>
			<WorldMap routesData={sortBy(routesData, prop('name'))} />
		</Box>
	);
}
