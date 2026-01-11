import { fetchRouteData } from '../../../fetchRouteData';
import type { MapData } from '../../../types';
import MapVideo from './index';

export const dynamic = 'force-dynamic';

export default async function MapVideoPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const mapData = await fetchRouteData<MapData>(`maps/${id}.json`);
	return <MapVideo mapData={mapData} />;
}
