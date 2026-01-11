import { fetchRouteData } from '@/api/routes/fetchRouteData';
import type { RouteData } from '@/api/routes/types.d';
import FarmingRoute from './index';

export default async function FarmingRoutePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const routeData = await fetchRouteData<RouteData>(`routes/${id}.json`);
	return <FarmingRoute routeData={routeData} />;
}
