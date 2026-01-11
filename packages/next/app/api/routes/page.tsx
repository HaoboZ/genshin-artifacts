import { fetchRouteData } from './fetchRouteData';
import RouteList from './index';
import type { RouteData } from './types';

export default async function RouteListPage() {
	const routesData = await fetchRouteData<RouteData[]>(`routes.json`);
	return <RouteList items={routesData} />;
}
