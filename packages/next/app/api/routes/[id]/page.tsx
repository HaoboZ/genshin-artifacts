import { fetchRouteData } from '../fetchRouteData';
import type { MapData, RouteData } from '../types';
import Route from './index';

export const dynamic = 'force-dynamic';

export default async function RoutePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const [routeData, mapsData] = await Promise.all([
		fetchRouteData<RouteData>(`routes/${id}`),
		fetchRouteData<MapData[]>('maps'),
	]);
	return <Route routeData={routeData} mapsData={mapsData} />;
}
