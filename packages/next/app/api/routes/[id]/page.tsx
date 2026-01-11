import { fetchRouteData } from '../fetchRouteData';
import type { RouteData } from '../types';
import Route from './index';

export default async function RoutePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const routeData = await fetchRouteData<RouteData>(`routes/${id}.json`);
	return <Route routeData={routeData} />;
}
