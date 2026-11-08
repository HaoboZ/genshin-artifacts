import { fetchRoutes } from './fetchRouteData';
import RouteList from './index';

export const dynamic = 'force-dynamic';

export default async function RouteListPage() {
	const routesData = await fetchRoutes();
	return <RouteList items={routesData} />;
}
