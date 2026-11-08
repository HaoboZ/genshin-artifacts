import { fetchRoute } from '@/api/routes/fetchRouteData';

import FarmingRoute from './index';

export default async function FarmingRoutePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const routeData = await fetchRoute(id);
	return <FarmingRoute routeData={routeData} />;
}
