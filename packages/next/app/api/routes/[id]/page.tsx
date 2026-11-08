import { fetchMaps, fetchRoute } from '../fetchRouteData';
import Route from './index';

export const dynamic = 'force-dynamic';

export default async function RoutePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const [routeData, mapsData] = await Promise.all([fetchRoute(id), fetchMaps()]);
	return <Route routeData={routeData} mapsData={mapsData} />;
}
