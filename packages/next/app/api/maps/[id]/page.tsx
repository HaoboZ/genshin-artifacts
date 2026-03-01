import { fetchRouteData } from '../../routes/fetchRouteData';
import type { MapData } from '../../routes/types';
import Map from './index';

export const dynamic = 'force-dynamic';

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const mapData = await fetchRouteData<MapData>(`maps/${id}`);
	return <Map mapData={mapData} />;
}
