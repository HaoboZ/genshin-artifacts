import axios from 'axios';
import MapVideo from './index';

export default async function MapVideoPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const { data } = await axios.get(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}.json`);

	return <MapVideo mapData={data} />;
}
