import axios from 'axios';
import Map from './index';

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const { data } = await axios.get(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}.json`);

	return <Map mapData={data} />;
}
