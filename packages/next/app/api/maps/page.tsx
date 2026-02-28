import { fetchRouteData } from '../routes/fetchRouteData';
import type { MapData } from '../routes/types';
import MapList from './index';

export const dynamic = 'force-dynamic';

export default async function MapListPage() {
	const mapsData = await fetchRouteData<MapData[]>(`maps.json`);
	return <MapList items={mapsData} />;
}
