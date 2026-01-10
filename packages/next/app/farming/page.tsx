import { type RouteData } from '@/api/routes/types';
import { Box } from '@mui/material';
import axios from 'axios';
import { prop, sortBy } from 'remeda';
import WorldMap from './worldMap';

export default async function Farming() {
	const { data } = await axios.get<RouteData[]>(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes.json`,
	);

	return (
		<Box sx={{ width: '100vw', height: '100vh' }}>
			<WorldMap routesData={sortBy(data, prop('name'))} />
		</Box>
	);
}
