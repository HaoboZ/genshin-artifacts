import { fetchRouteData } from '../fetchRouteData';
import type { MapData } from '../types';
import MapList from './index';

export default async function MapListPage() {
	const mapsData = await fetchRouteData<MapData[]>(`maps.json`);
	return <MapList items={mapsData} />;
}
