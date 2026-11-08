import { fetchMap } from '../../routes/fetchRouteData';
import Map from './index';

export const dynamic = 'force-dynamic';

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const mapData = await fetchMap(id);
	return <Map mapData={mapData} />;
}
