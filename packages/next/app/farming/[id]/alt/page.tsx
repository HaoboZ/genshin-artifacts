import { fetchRouteData } from '@/api/routes/fetchRouteData';
import type { RouteData } from '@/api/routes/types.d';
import FarmingRoute from './index';

export default async function FarmingRouteAltPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const routeData = await fetchRouteData<RouteData>(`routes/${id}`);
	return <FarmingRoute routeData={routeData} />;
}
