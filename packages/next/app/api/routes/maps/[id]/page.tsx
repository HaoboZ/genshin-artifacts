import { fetchRouteData } from '../../fetchRouteData';
import type { MapData } from '../../types';
import Map from './index';

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const mapData = await fetchRouteData<MapData>(`maps/${id}.json`);
	return <Map mapData={mapData} />;
}
