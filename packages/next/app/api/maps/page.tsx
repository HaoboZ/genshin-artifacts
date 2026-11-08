import { fetchMaps } from '../routes/fetchRouteData';
import MapList from './index';

export const dynamic = 'force-dynamic';

export default async function MapListPage() {
	const mapsData = await fetchMaps();
	return <MapList items={mapsData} />;
}
